import { Metadata } from "next"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { ExpenseTableView } from "@/components/expenses/expense-table-view"
import { getExpensesSummary } from "@/lib/expenses/service"
import { getUserReceiptOptions } from "@/lib/documents/service"

export const metadata: Metadata = {
  title: "Business Expenses & Tax Deductions | Earnix",
  description:
    "Record operational expenses, attach receipt proofs, categorize business expenditures, and substantiate tax-deductible claims.",
}

export default async function ExpensesPage() {
  const [summary, receiptOptions] = await Promise.all([
    getExpensesSummary(),
    getUserReceiptOptions(),
  ])

  return (
    <PageContainer>
      <PageHeader
        title="Business Expenses"
        description="Track operational expenses, maintain substantiating receipt proofs, and isolate tax-deductible costs."
      />

      <ExpenseTableView summary={summary} receiptOptions={receiptOptions} />
    </PageContainer>
  )
}
