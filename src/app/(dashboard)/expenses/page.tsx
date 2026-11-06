import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Receipt, Plus } from "lucide-react"

export default function ExpensesPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Expenses"
        description="Log business expenses, categorize operational costs, and substantiate tax-deductible claims."
      >
        <Button size="sm" className="text-xs gap-1.5" disabled>
          <Plus className="size-3.5" />
          <span>Record Expense</span>
        </Button>
      </PageHeader>

      <div className="rounded-xl border border-border bg-card p-12 text-center shadow-xs space-y-3">
        <div className="flex size-10 mx-auto items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Receipt className="size-5" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">
          Expense Management Module
        </h2>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Record software subscriptions, hardware purchases, and utilities. Link receipt documents and flag tax deductibility. Target: Phase 9.
        </p>
      </div>
    </PageContainer>
  )
}

