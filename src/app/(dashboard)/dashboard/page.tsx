import Link from "next/link"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getDashboardData } from "@/lib/dashboard/service"
import { MetricsGrid } from "@/components/dashboard/metrics-grid"
import { IncomeVelocityChart } from "@/components/dashboard/income-velocity-chart"
import { PlatformDistribution } from "@/components/dashboard/platform-distribution"
import { CurrencyDistribution } from "@/components/dashboard/currency-distribution"
import { RecentTransactionsFeed } from "@/components/dashboard/recent-transactions-feed"
import { TopClientsCard } from "@/components/dashboard/top-clients-card"
import { UploadCloud, FileText, ArrowRight } from "lucide-react"

export const metadata = {
  title: "Dashboard | Earnix",
  description: "Unified financial dashboard, multi-currency ledger velocity, and tax-ready estimates.",
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <PageContainer>
      {/* Header with Quick Actions */}
      <PageHeader
        title="Financial Dashboard"
        description="Unified income tracking, multi-currency records, and tax-ready estimates."
      >
        <Link
          href="/transactions"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs gap-1.5")}
        >
          <UploadCloud className="size-3.5" />
          <span>Import CSV</span>
        </Link>
        <Link
          href="/tax"
          className={cn(buttonVariants({ variant: "default", size: "sm" }), "text-xs gap-1.5")}
        >
          <FileText className="size-3.5" />
          <span>Tax Records</span>
        </Link>
      </PageHeader>

      {/* Primary KPI Metrics Grid */}
      <MetricsGrid
        totalGrossIncome={data.totalGrossIncome}
        monthlyIncome={data.monthlyIncome}
        yearlyIncome={data.yearlyIncome}
        totalExpenses={data.totalExpenses}
        netIncome={data.netIncome}
        estimatedTaxReserve={data.estimatedTaxReserve}
        estimatedTaxRate={data.estimatedTaxRate}
        baseCurrency={data.baseCurrency}
      />

      {/* Main Analytical & Activity Layout Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2/3 width on large displays) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Income Velocity Chart */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Income &amp; Expense Velocity
                </h2>
                <p className="text-xs text-muted-foreground">
                  6-month financial trajectory converted into {data.baseCurrency}
                </p>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border/60 self-start sm:self-auto">
                Deterministic Ledger
              </span>
            </div>
            <IncomeVelocityChart data={data.monthlyTrends} baseCurrency={data.baseCurrency} />
          </div>

          {/* Recent Transactions Feed */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Recent Income Transactions
                </h2>
                <p className="text-xs text-muted-foreground">
                  Latest payments received across platforms with dual-value exchange rates
                </p>
              </div>
              <Link
                href="/transactions"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <span>Full Ledger</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
            <RecentTransactionsFeed
              transactions={data.recentTransactions}
              baseCurrency={data.baseCurrency}
            />
          </div>
        </div>

        {/* Right Column (1/3 width on large displays) */}
        <div className="space-y-6">
          {/* Platform Distribution */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Income by Platform
              </h2>
              <p className="text-xs text-muted-foreground">
                Earnings distribution across Upwork, direct client invoices, and manual logs
              </p>
            </div>
            <PlatformDistribution
              distribution={data.platformDistribution}
              baseCurrency={data.baseCurrency}
            />
          </div>

          {/* Multi-Currency Portfolio */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Multi-Currency Breakdown
              </h2>
              <p className="text-xs text-muted-foreground">
                Original transaction currencies preserved alongside base conversions
              </p>
            </div>
            <CurrencyDistribution
              distribution={data.currencyDistribution}
              baseCurrency={data.baseCurrency}
            />
          </div>

          {/* Top Clients by Value */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Top Client Portfolio
              </h2>
              <p className="text-xs text-muted-foreground">
                Highest lifetime value clients and contract frequencies
              </p>
            </div>
            <TopClientsCard
              clients={data.topClients}
              baseCurrency={data.baseCurrency}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
