import { z } from "zod"

export const DOCUMENT_TYPES = [
  "receipt",
  "invoice",
  "bank_statement",
  "tax_certificate",
] as const

export type DocumentType = (typeof DOCUMENT_TYPES)[number]

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  receipt: "Expense Receipt",
  invoice: "Client Invoice",
  bank_statement: "Bank Statement",
  tax_certificate: "Tax Certificate / Filing",
}

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/csv",
]

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

export const documentUploadSchema = z.object({
  documentType: z.enum(DOCUMENT_TYPES),
  customFileName: z.string().max(255).optional(),
})

export type DocumentUploadInput = z.infer<typeof documentUploadSchema>
