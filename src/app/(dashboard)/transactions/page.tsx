import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { TransactionTableView } from "@/components/transactions/transaction-table-view"
import { getTransactionsData } from "@/lib/transactions/service"
import { DemoNoticeBanner } from "@/components/dashboard/demo-notice-banner"

export const metadata = {
  title: "Transactions — Earnix Financial Ledger",
  description: "Comprehensive income records, multi-currency ledger, Upwork statement imports, and manual payments.",
}

export default async function TransactionsPage() {
  const data = await getTransactionsData()

  return (
    <PageContainer>
      <PageHeader
        title="Income &amp; Transactions Ledger"
        description="Immutable financial ledger recording payments across platforms with dual-value currency preservation."
      />

      {data.isDemoData && <DemoNoticeBanner />}

      <TransactionTableView
        initialTransactions={data.transactions}
        clients={data.clients}
        platforms={data.platforms}
        baseCurrency={data.baseCurrency}
        isDemoData={data.isDemoData}
      />
    </PageContainer>
  )
}
