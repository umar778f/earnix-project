import { formatMoney } from "@/lib/currency/format"
import { type CurrencyDistributionItem } from "@/lib/dashboard/demo-data"
import { Coins } from "lucide-react"

interface CurrencyDistributionProps {
  distribution: CurrencyDistributionItem[]
  baseCurrency: string
}

export function CurrencyDistribution({
  distribution,
  baseCurrency,
}: CurrencyDistributionProps) {
  return (
    <div className="space-y-3">
      {distribution.map((item, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground font-mono font-bold text-xs">
              <Coins className="size-3.5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">
                {item.currency} Currency Vault
              </p>
              <p className="text-[11px] text-muted-foreground">
                Original: {formatMoney(item.originalTotal, item.currency)}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs font-semibold text-foreground">
              {formatMoney(item.convertedTotal, baseCurrency)}
            </p>
            <p className="text-[10px] text-muted-foreground font-mono">
              {item.percentage}% of portfolio
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

