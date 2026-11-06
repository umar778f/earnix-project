import { Metadata } from "next"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { IngestionWizard } from "@/components/transactions/ingestion-wizard"

export const metadata: Metadata = {
  title: "Import Statements | Earnix Financial Ledger",
  description:
    "Batch import Upwork statements and generic CSV transactions with automated deduplication, currency conversion, and fee reconciliation.",
}

export default function ImportTransactionsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Statement Ingestion Wizard"
        description="Batch import Upwork statements and generic CSV files with automatic deduplication, multi-currency conversion, and platform fee separation."
      />

      <IngestionWizard />
    </PageContainer>
  )
}
