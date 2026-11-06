"use server"

import { revalidatePath } from "next/cache"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import {
  documentUploadSchema,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  type DocumentType,
} from "@/lib/documents/schemas"

export type DocumentActionResult = {
  success: boolean
  error?: string
  id?: string
  fileName?: string
}

export async function uploadDocumentAction(formData: FormData): Promise<DocumentActionResult> {
  const file = formData.get("file") as File | null
  if (!file || file.size === 0) {
    return { success: false, error: "Please select a valid document to upload." }
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      success: false,
      error: `File exceeds maximum allowed limit of 10MB. Selected file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`,
    }
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      success: false,
      error: `Unsupported file type (${file.type}). Allowed formats: PDF, PNG, JPEG, WEBP, CSV.`,
    }
  }

  const documentType = (formData.get("documentType") as DocumentType) || "receipt"
  const customFileName = (formData.get("customFileName") as string) || file.name

  const parseResult = documentUploadSchema.safeParse({
    documentType,
    customFileName,
  })

  if (!parseResult.success) {
    return { success: false, error: "Invalid document upload parameters." }
  }

  const sanitizedFileName = customFileName
    .trim()
    .replace(/\.\./g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 100)

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return { success: false, error: "Authentication required to upload documents." }
      }

      // Storage path pattern matching RLS folder check: {user_id}/{timestamp}_{filename}
      const storagePath = `${user.id}/${Date.now()}_${sanitizedFileName}`

      const fileBuffer = await file.arrayBuffer()
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(storagePath, fileBuffer, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        return { success: false, error: `Storage upload failed: ${uploadError.message}` }
      }

      // Record metadata in documents table
      const { data: record, error: dbError } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          file_name: sanitizedFileName,
          storage_path: storagePath,
          mime_type: file.type,
          file_size_bytes: file.size,
          document_type: documentType,
          ocr_status: "unprocessed",
          ocr_extracted_data: {},
        })
        .select("id")
        .single()

      if (dbError) {
        // Rollback storage file on DB error
        await supabase.storage.from("documents").remove([storagePath])
        return { success: false, error: `Database recording failed: ${dbError.message}` }
      }

      revalidatePath("/documents")
      revalidatePath("/expenses")
      return { success: true, id: record?.id, fileName: sanitizedFileName }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload processing failed"
      return { success: false, error: msg }
    }
  }

  // Guest / Demo mode fallback
  revalidatePath("/documents")
  return {
    success: true,
    id: `demo-doc-${Date.now()}`,
    fileName: sanitizedFileName,
  }
}

export async function deleteDocumentAction(documentId: string): Promise<DocumentActionResult> {
  if (!documentId) {
    return { success: false, error: "Missing document ID." }
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return { success: false, error: "Authentication required." }
      }

      // Find file storage path
      const { data: doc, error: fetchError } = await supabase
        .from("documents")
        .select("id, storage_path")
        .eq("id", documentId)
        .eq("user_id", user.id)
        .single()

      if (fetchError || !doc) {
        return { success: false, error: "Document not found or access denied." }
      }

      // Delete from storage
      if (doc.storage_path) {
        await supabase.storage.from("documents").remove([doc.storage_path])
      }

      // Delete from DB (foreign key on expenses will SET NULL automatically)
      const { error: deleteError } = await supabase
        .from("documents")
        .delete()
        .eq("id", documentId)
        .eq("user_id", user.id)

      if (deleteError) {
        return { success: false, error: deleteError.message }
      }

      revalidatePath("/documents")
      revalidatePath("/expenses")
      return { success: true }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Deletion failed"
      return { success: false, error: msg }
    }
  }

  revalidatePath("/documents")
  return { success: true }
}

