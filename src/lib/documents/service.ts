import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
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

export const DEMO_DOCUMENTS: DocumentVaultItem[] = [
  {
    id: "demo-doc-01",
    fileName: "github-copilot-oct2026.pdf",
    storagePath: "demo/github-copilot-oct2026.pdf",
    mimeType: "application/pdf",
    fileSizeBytes: 45820,
    documentType: "receipt",
    ocrStatus: "completed",
    ocrExtractedData: {
      vendor: "GitHub, Inc.",
      amount: 19.0,
      currency: "USD",
      date: "2026-10-10",
      invoiceNumber: "INV-GH-849204",
    },
    createdAt: "2026-10-10T14:22:00Z",
    signedUrl: null,
  },
  {
    id: "demo-doc-02",
    fileName: "aws-october-invoice.pdf",
    storagePath: "demo/aws-october-invoice.pdf",
    mimeType: "application/pdf",
    fileSizeBytes: 131072,
    documentType: "invoice",
    ocrStatus: "completed",
    ocrExtractedData: {
      vendor: "Amazon Web Services Inc.",
      amount: 145.8,
      currency: "USD",
      date: "2026-11-01",
      accountNumber: "9482-1049-3382",
    },
    createdAt: "2026-11-01T08:00:00Z",
    signedUrl: null,
  },
  {
    id: "demo-doc-03",
    fileName: "jetbrains-annual-license.pdf",
    storagePath: "demo/jetbrains-annual-license.pdf",
    mimeType: "application/pdf",
    fileSizeBytes: 98304,
    documentType: "receipt",
    ocrStatus: "completed",
    ocrExtractedData: {
      vendor: "JetBrains s.r.o.",
      amount: 289.0,
      currency: "USD",
      date: "2026-10-25",
      licenseKey: "JB-ALL-2026-***-***",
    },
    createdAt: "2026-10-25T11:45:00Z",
    signedUrl: null,
  },
  {
    id: "demo-doc-04",
    fileName: "upwork-statement-october-2026.pdf",
    storagePath: "demo/upwork-statement-october-2026.pdf",
    mimeType: "application/pdf",
    fileSizeBytes: 245760,
    documentType: "bank_statement",
    ocrStatus: "completed",
    ocrExtractedData: {
      platform: "Upwork Global Inc.",
      grossEarnings: 2902.5,
      feesDeducted: 145.12,
      netDisbursed: 2757.38,
      currency: "USD",
    },
    createdAt: "2026-11-02T16:00:00Z",
    signedUrl: null,
  },
  {
    id: "demo-doc-05",
    fileName: "fbr-withholding-certificate-tax2026.pdf",
    storagePath: "demo/fbr-withholding-certificate-tax2026.pdf",
    mimeType: "application/pdf",
    fileSizeBytes: 524288,
    documentType: "tax_certificate",
    ocrStatus: "unprocessed",
    ocrExtractedData: {},
    createdAt: "2026-09-30T10:15:00Z",
    signedUrl: null,
  },
]

export async function getDocumentsSummary(): Promise<DocumentsSummary> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: docs, error } = await supabase
          .from("documents")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (!error && docs) {
          // Generate signed download URLs in parallel
          const docsWithUrls: DocumentVaultItem[] = await Promise.all(
            docs.map(async (d) => {
              let signedUrl: string | null = null
              try {
                const { data } = await supabase.storage
                  .from("documents")
                  .createSignedUrl(d.storage_path, 3600) // 1-hour expiry
                signedUrl = data?.signedUrl || null
              } catch {
                signedUrl = null
              }

              return {
                id: d.id,
                fileName: d.file_name,
                storagePath: d.storage_path,
                mimeType: d.mime_type,
                fileSizeBytes: Number(d.file_size_bytes),
                documentType: d.document_type as DocumentType,
                ocrStatus: d.ocr_status as DocumentVaultItem["ocrStatus"],
                ocrExtractedData: (d.ocr_extracted_data as Record<string, unknown>) || {},
                createdAt: d.created_at,
                signedUrl,
              }
            })
          )

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
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
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
