import { Metadata } from "next"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { TaxCenterView } from "@/components/tax/tax-center-view"
import { getTaxPreparationSummary } from "@/lib/tax/service"
import { getTransactionsData } from "@/lib/transactions/service"
import { getExpensesSummary } from "@/lib/expenses/service"

export const metadata: Metadata = {
  title: "Tax Preparation Center | Earnix",
  description:
    "Organize tax-ready financial records, compute configurable liabilities, and export comprehensive accountant audit packs.",
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
        title="Tax Preparation Center"
        description="Organize tax-ready financial records, configure estimation rates, and export substantiated audit packages for your accountant."
      />

      <TaxCenterView
        initialTaxData={taxData}
        transactions={txData.transactions}
        expenses={expData.expenses}
      />
    </PageContainer>
  )
}
