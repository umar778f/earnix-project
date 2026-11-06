import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Calculator, Download, AlertCircle } from "lucide-react"

export default function TaxPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Tax Preparation Center"
        description="Organize tax-ready financial records, summarize gross income and expenses, and estimate liabilities."
      >
        <Button variant="outline" size="sm" className="text-xs gap-1.5" disabled>
          <Download className="size-3.5" />
          <span>Tax Report Pack</span>
        </Button>
      </PageHeader>

      {/* Mandatory Disclaimer */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
        <AlertCircle className="size-4 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">Tax Preparation Assistance Notice</p>
          <p>
            Earnix organizes financial records and calculates estimates based on user-configured rules. It does not replace official tax advice or certified accountant review.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-12 text-center shadow-xs space-y-3">
        <div className="flex size-10 mx-auto items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Calculator className="size-5" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">
          Tax Engine &amp; Reporting Workspace
        </h2>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Provides gross income aggregation, allowable expense categorizations, net profit calculations, and exportable accountant summaries. Target: Phase 13.
        </p>
      </div>
    </PageContainer>
  )
}

