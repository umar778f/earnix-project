import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { FolderArchive, Upload } from "lucide-react"

export default function DocumentsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Documents Vault"
        description="Secure storage for invoices, receipts, payment proofs, and tax statements."
      >
        <Button size="sm" className="text-xs gap-1.5" disabled>
          <Upload className="size-3.5" />
          <span>Upload Document</span>
        </Button>
      </PageHeader>

      <div className="rounded-xl border border-border bg-card p-12 text-center shadow-xs space-y-3">
        <div className="flex size-10 mx-auto items-center justify-center rounded-full bg-muted text-muted-foreground">
          <FolderArchive className="size-5" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">
          Document Storage Vault
        </h2>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Private, encrypted document storage backed by Supabase Storage and authenticated signed URLs. Supports OCR extraction review. Target: Phase 9.
        </p>
      </div>
    </PageContainer>
  )
}

