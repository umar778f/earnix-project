import Link from "next/link"
import { formatMoney } from "@/lib/currency/format"
import { type DashboardTransactionItem } from "@/lib/dashboard/demo-data"
import { ArrowUpRight, CheckCircle2, Clock } from "lucide-react"

interface RecentTransactionsFeedProps {
  transactions: DashboardTransactionItem[]
  baseCurrency: string
}

export function RecentTransactionsFeed({
  transactions,
  baseCurrency,
}: RecentTransactionsFeedProps) {
  const getSourceBadge = (sourceType: string) => {
    switch (sourceType) {
      case "csv_upwork":
        return { label: "Upwork CSV", bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" }
      case "csv_generic":
        return { label: "Invoice CSV", bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" }
      case "manual":
        return { label: "Manual Entry", bg: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20" }
      case "demo":
        return { label: "Demo Data", bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" }
      default:
        return { label: "Imported", bg: "bg-muted text-muted-foreground border-border" }
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">No recent transactions</p>
        <p className="text-[11px]">Import an Upwork CSV or record a payment to populate your income ledger.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="divide-y divide-border/60">
        {transactions.map((tx) => {
          const badge = getSourceBadge(tx.sourceType)
          const isForeignCurrency = tx.originalCurrency !== baseCurrency
          const formattedDate = new Date(tx.paymentDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })

          return (
            <div
              key={tx.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 first:pt-0 last:pb-0"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {tx.clientName}
                  </p>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium border ${badge.bg}`}
                  >
                    {badge.label}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate max-w-md">
                  {tx.description}
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 text-right">
                <div className="text-left sm:text-right">
                  <p className="text-xs font-bold text-foreground">
                    +{formatMoney(tx.convertedAmount, baseCurrency)}
                  </p>
                  {isForeignCurrency && (
                    <p className="text-[10px] font-mono text-muted-foreground">
                      {formatMoney(tx.originalAmount, tx.originalCurrency)} @ {tx.exchangeRate.toFixed(2)}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                    {formattedDate}
                  </span>
                  {tx.status === "completed" ? (
                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <Clock className="size-3.5 text-amber-500 shrink-0" />
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="pt-2 border-t border-border/40 text-center">
        <Link
          href="/transactions"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <span>View all transactions in ledger</span>
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </div>
  )
}

