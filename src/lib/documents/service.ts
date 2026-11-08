import { createClient, isSupabaseConfigured, getAuthenticatedUser } from "@/lib/supabase/server"
import { type DocumentType } from "@/lib/documents/schemas"
import { formatBytes } from "@/lib/utils"

export { formatBytes }

export interface DocumentVaultItem {
  id: string
  fileName: string
  storagePath: string
  mimeType: string
  fileSizeBytes: number
  documentType: DocumentType
  ocrStatus: "unprocessed" | "processing" | "completed" | "failed"
  ocrExtractedData: Record<string, unknown>
  createdAt: string
  signedUrl: string | null
}

export interface DocumentsSummary {
  isDemoData: boolean
  totalDocuments: number
  totalSizeBytes: number
  formattedTotalSize: string
  typeBreakdown: {
    receipt: number
    invoice: number
    bank_statement: number
    tax_certificate: number
  }
  documents: DocumentVaultItem[]
}

export interface ReceiptOption {
  id: string
  fileName: string
  documentType: DocumentType
}

export async function getDocumentsSummary(): Promise<DocumentsSummary> {
  if (isSupabaseConfigured()) {
    try {
      const user = await getAuthenticatedUser()

      if (user) {
        const supabase = await createClient()
        const { data: docs, error } = await supabase
          .from("documents")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (!error && docs) {
          // Batch fetch signed download URLs in a SINGLE call rather than N sequential network roundtrips
          const signedUrlMap = new Map<string, string>()

          if (docs.length > 0) {
            try {
              const paths = docs.map((d) => d.storage_path)
              const { data: signedData } = await supabase.storage
                .from("documents")
                .createSignedUrls(paths, 3600) // 1-hour expiry

              if (signedData) {
                signedData.forEach((item) => {
                  if (item.signedUrl && item.path) {
                    signedUrlMap.set(item.path, item.signedUrl)
                  }
                })
              }
            } catch {
              // Graceful fallback if storage batch signing is unavailable
            }
          }

          const docsWithUrls: DocumentVaultItem[] = docs.map((d) => ({
            id: d.id,
            fileName: d.file_name,
            storagePath: d.storage_path,
            mimeType: d.mime_type,
            fileSizeBytes: Number(d.file_size_bytes),
            documentType: d.document_type as DocumentType,
            ocrStatus: d.ocr_status as DocumentVaultItem["ocrStatus"],
            ocrExtractedData: (d.ocr_extracted_data as Record<string, unknown>) || {},
            createdAt: d.created_at,
            signedUrl: signedUrlMap.get(d.storage_path) || null,
          }))

          return computeDocumentsSummary(docsWithUrls, false)
        }
      }
    } catch {
      // Fallback on error
    }
  }

  return computeDocumentsSummary([], false)
}

export async function getUserReceiptOptions(): Promise<ReceiptOption[]> {
  if (isSupabaseConfigured()) {
    try {
      const user = await getAuthenticatedUser()

      if (user) {
        const supabase = await createClient()
        const { data, error } = await supabase
          .from("documents")
          .select("id, file_name, document_type")
          .eq("user_id", user.id)
          .in("document_type", ["receipt", "invoice"])
          .order("created_at", { ascending: false })

        if (!error && data) {
          return data.map((d) => ({
            id: d.id,
            fileName: d.file_name,
            documentType: d.document_type as DocumentType,
          }))
        }
      }
    } catch {
      // Fallback
    }
  }

  return []
}

function computeDocumentsSummary(
  docs: DocumentVaultItem[],
  isDemoData: boolean
): DocumentsSummary {
  let totalBytes = 0
  const breakdown = {
    receipt: 0,
    invoice: 0,
    bank_statement: 0,
    tax_certificate: 0,
  }

  for (const d of docs) {
    totalBytes += d.fileSizeBytes
    if (d.documentType in breakdown) {
      breakdown[d.documentType]++
    }
  }

  return {
    isDemoData,
    totalDocuments: docs.length,
    totalSizeBytes: totalBytes,
    formattedTotalSize: formatBytes(totalBytes),
    typeBreakdown: breakdown,
    documents: docs,
  }
}
