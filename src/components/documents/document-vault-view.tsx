"use client"

import * as React from "react"
import { useTransition } from "react"
import { type DocumentVaultItem, type DocumentsSummary } from "@/lib/documents/service"
import { formatBytes } from "@/lib/utils"
import { DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS } from "@/lib/documents/schemas"
import { UploadDialog } from "@/components/documents/upload-dialog"
import { deleteDocumentAction } from "@/lib/documents/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  Upload,
  FolderArchive,
  FileText,
  FileSpreadsheet,
  FileImage,
  Trash2,
  ExternalLink,
  HardDrive,
  Receipt,
  FileCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react"

interface DocumentVaultViewProps {
  summary: DocumentsSummary
}

export function DocumentVaultView({ summary }: DocumentVaultViewProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedType, setSelectedType] = React.useState<string>("all")
  const [isUploadOpen, setIsUploadOpen] = React.useState(false)

  // Delete transition
  const [isDeleting, startDeleteTransition] = useTransition()
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" from your vault?`)) {
      setDeletingId(id)
      startDeleteTransition(async () => {
        await deleteDocumentAction(id)
        setDeletingId(null)
      })
    }
  }

  const handleView = (doc: DocumentVaultItem) => {
    if (doc.signedUrl) {
      window.open(doc.signedUrl, "_blank", "noopener,noreferrer")
    } else {
      alert(`Preview URL is currently unavailable for "${doc.fileName}". Please refresh the page.`)
    }
  }

  // Filtered documents
  const filteredDocuments = React.useMemo(() => {
    return summary.documents.filter((doc) => {
      const matchesSearch =
        searchQuery === "" ||
        doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType =
        selectedType === "all" || doc.documentType === selectedType

      return matchesSearch && matchesType
    })
  }, [summary.documents, searchQuery, selectedType])

  // Get icon by mime type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) {
      return <FileText className="size-5 text-red-500" />
    }
    if (mimeType.includes("image")) {
      return <FileImage className="size-5 text-purple-500" />
    }
    if (mimeType.includes("csv") || mimeType.includes("spreadsheet")) {
      return <FileSpreadsheet className="size-5 text-emerald-500" />
    }
    return <FileText className="size-5 text-muted-foreground" />
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Total Documents</span>
            <FolderArchive className="size-3.5" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground">
            {summary.totalDocuments}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Files stored in encrypted vault
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Storage Consumed</span>
            <HardDrive className="size-3.5" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground">
            {summary.formattedTotalSize}
          </div>
          <p className="text-[11px] text-muted-foreground">
            10 MB quota per file
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Receipts &amp; Invoices</span>
            <Receipt className="size-3.5" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground">
            {summary.typeBreakdown.receipt + summary.typeBreakdown.invoice}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {summary.typeBreakdown.receipt} receipts &bull; {summary.typeBreakdown.invoice} invoices
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Statements &amp; Tax</span>
            <FileCheck className="size-3.5" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground">
            {summary.typeBreakdown.bank_statement + summary.typeBreakdown.tax_certificate}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Bank records &amp; tax filings
          </p>
        </div>
      </div>

      {/* Control Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents by name..."
              className="h-8 pl-8 text-xs"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <option value="all">All File Types</option>
            {DOCUMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {DOCUMENT_TYPE_LABELS[type]} ({summary.typeBreakdown[type] || 0})
              </option>
            ))}
          </select>
        </div>

        <Button size="sm" onClick={() => setIsUploadOpen(true)} className="gap-1.5 shrink-0">
          <Upload className="size-3.5" />
          <span>Upload Document</span>
        </Button>
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center shadow-xs space-y-2">
          <FolderArchive className="size-8 mx-auto text-muted-foreground/60" />
          <p className="text-xs font-medium text-foreground">No documents found</p>
          <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
            Upload expense receipts, client invoices, or platform statements to maintain tax-ready substantiation.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3 hover:border-primary/40 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                {/* Header: Icon, Name & Type */}
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/70">
                    {getFileIcon(doc.mimeType)}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div
                      className="text-xs font-semibold text-foreground truncate cursor-pointer hover:underline"
                      title={doc.fileName}
                      onClick={() => handleView(doc)}
                    >
                      {doc.fileName}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center rounded-md bg-secondary/80 px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                        {DOCUMENT_TYPE_LABELS[doc.documentType]}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {formatBytes(doc.fileSizeBytes)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* OCR & Metadata Status */}
                <div className="rounded-lg bg-muted/40 p-2 space-y-1 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Sparkles className="size-3 text-primary" />
                      <span>OCR Extraction</span>
                    </span>
                    {doc.ocrStatus === "completed" ? (
                      <Badge variant="success" className="text-[9px] px-1.5 py-0 h-4 gap-0.5">
                        <CheckCircle2 className="size-2.5" />
                        <span>Completed</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 text-muted-foreground">
                        Pending OCR
                      </Badge>
                    )}
                  </div>

                  {/* If OCR extracted data present */}
                  {doc.ocrExtractedData && Object.keys(doc.ocrExtractedData).length > 0 && (
                    <div className="text-[10px] text-muted-foreground pt-1 border-t border-border/50 truncate">
                      {Boolean(doc.ocrExtractedData.vendor) ? (
                        <span>Vendor: {String(doc.ocrExtractedData.vendor)} &bull; </span>
                      ) : null}
                      {Boolean(doc.ocrExtractedData.amount) ? (
                        <span>
                          Total: ${String(doc.ocrExtractedData.amount)}{" "}
                          {String(doc.ocrExtractedData.currency || "")}
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer: Date & Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  <span>{doc.createdAt.split("T")[0]}</span>
                </span>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleView(doc)}
                    className="gap-1 text-xs"
                    title="View Document"
                  >
                    <ExternalLink className="size-3" />
                    <span>View</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(doc.id, doc.fileName)}
                    disabled={isDeleting && deletingId === doc.id}
                    title="Delete Document"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <UploadDialog
        key={isUploadOpen ? "open" : "closed"}
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
      />
    </div>
  )
}
