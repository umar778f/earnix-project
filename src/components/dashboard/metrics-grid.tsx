import { formatMoney } from "@/lib/currency/format"
import { DollarSign, Wallet, TrendingUp, TrendingDown, Clock, ShieldCheck } from "lucide-react"

interface MetricsGridProps {
  totalGrossIncome: number
  monthlyIncome: number
  yearlyIncome: number
  totalExpenses: number
  netIncome: number
  estimatedTaxReserve: number
  estimatedTaxRate: number
  baseCurrency: string
}

export function MetricsGrid({
  totalGrossIncome,
  monthlyIncome,
  yearlyIncome,
  totalExpenses,
  netIncome,
  estimatedTaxReserve,
  estimatedTaxRate,
  baseCurrency,
}: MetricsGridProps) {
  const cards = [
    {
      title: "Total Gross Income",
      amount: formatMoney(totalGrossIncome, baseCurrency),
      subtext: `Year to Date: ${formatMoney(yearlyIncome, baseCurrency)}`,
      icon: DollarSign,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Monthly Income",
      amount: formatMoney(monthlyIncome, baseCurrency),
      subtext: "Current calendar month",
      icon: TrendingUp,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Total Expenses",
      amount: formatMoney(totalExpenses, baseCurrency),
      subtext: "Deductible operational costs",
      icon: TrendingDown,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      title: "Net Earnings",
      amount: formatMoney(netIncome, baseCurrency),
      subtext: "Gross income less expenses",
      icon: Wallet,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Tax-Ready Reserve",
      amount: formatMoney(estimatedTaxReserve, baseCurrency),
      subtext: `Estimated at ${estimatedTaxRate}% rate`,
      icon: Clock,
      color: "text-indigo-600 dark:text-indigo-400",
      badge: "Assistance Estimate",
      bg: "bg-indigo-500/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card, idx) => {
        const Icon = card.icon
        return (
          <div
            key={idx}
            className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {card.title}
              </span>
              <div className={`flex size-7 items-center justify-center rounded-lg ${card.bg} ${card.color}`}>
                <Icon className="size-4" />
              </div>
            </div>

            <div>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {card.amount}
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40">
              <span className="truncate">{card.subtext}</span>
              {card.badge && (
                <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-foreground">
                  <ShieldCheck className="size-3 text-emerald-500" />
                  <span>{card.badge}</span>
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

