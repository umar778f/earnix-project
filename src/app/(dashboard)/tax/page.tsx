import { Metadata } from "next"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { TaxCenterView } from "@/components/tax/tax-center-view"
import { getTaxPreparationSummary } from "@/lib/tax/service"
import { getTransactionsData } from "@/lib/transactions/service"
import { getExpensesSummary } from "@/lib/expenses/service"

export const metadata: Metadata = {
  title: "Tax Center | Earnix",
  description:
    "Configure your tax rate, review estimated tax reserves, and export your tax summary.",
}

export default async function TaxPage() {
  const [taxData, txData, expData] = await Promise.all([
    getTaxPreparationSummary(),
    getTransactionsData(),
    getExpensesSummary(),
  ])

  return (
    <PageContainer>
      <PageHeader
        title="Tax Center"
        description="Configure your tax rate, review estimated tax reserves, and export your tax summary."
      />

      <TaxCenterView
        initialTaxData={taxData}
        transactions={txData.transactions}
        expenses={expData.expenses}
      />
    </PageContainer>
  )
}
