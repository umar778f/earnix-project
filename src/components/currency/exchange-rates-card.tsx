"use client"

import * as React from "react"
import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { refreshExchangeRatesAction } from "@/lib/currency/actions"
import { RefreshCw, CheckCircle2, AlertCircle, Coins, ShieldCheck } from "lucide-react"

interface ExchangeRateRow {
  pair: string
  rate: number
  description: string
}

const BENCHMARK_PAIRS: ExchangeRateRow[] = [
  { pair: "USD / PKR", rate: 278.50, description: "1 US Dollar = 278.50 Pakistani Rupees" },
  { pair: "EUR / USD", rate: 1.085, description: "1 Euro = 1.0850 US Dollars" },
  { pair: "GBP / USD", rate: 1.278, description: "1 British Pound = 1.2780 US Dollars" },
  { pair: "EUR / PKR", rate: 302.25, description: "1 Euro = 302.25 Pakistani Rupees" },
  { pair: "GBP / PKR", rate: 356.10, description: "1 British Pound = 356.10 Pakistani Rupees" },
]

export function ExchangeRatesCard() {
  const [isPending, startTransition] = useTransition()
  const [statusMessage, setStatusMessage] = React.useState<{ success: boolean; text: string } | null>(null)

  const handleRefresh = () => {
    setStatusMessage(null)
    startTransition(async () => {
      const result = await refreshExchangeRatesAction()
      if (result.success && result.message) {
        setStatusMessage({ success: true, text: result.message })
      } else if (result.error) {
        setStatusMessage({ success: false, text: result.error })
      }
    })
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Coins className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Multi-Currency FX Exchange Rates
            </h2>
            <p className="text-xs text-muted-foreground">
              Real-time benchmarks cached from European Central Bank &amp; SBP
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="xs"
          onClick={handleRefresh}
          disabled={isPending}
          className="gap-1.5 self-start sm:self-auto cursor-pointer text-xs"
        >
          <RefreshCw className={`size-3.5 ${isPending ? "animate-spin" : ""}`} />
          <span>{isPending ? "Syncing..." : "Sync FX Rates"}</span>
        </Button>
      </div>

      {statusMessage && (
        <div
          className={`rounded-lg p-2.5 text-xs flex items-center gap-2 border ${
            statusMessage.success
              ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20"
              : "bg-destructive/10 text-destructive border-destructive/20"
          }`}
        >
          {statusMessage.success ? (
            <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
          ) : (
            <AlertCircle className="size-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* FX Rates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {BENCHMARK_PAIRS.map((row) => (
          <div
            key={row.pair}
            className="flex flex-col justify-between p-3 rounded-lg border border-border/50 bg-muted/20 space-y-1"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground font-mono">{row.pair}</span>
              <span className="font-mono text-xs font-semibold text-primary">
                {row.rate.toFixed(4)}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">{row.description}</p>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <ShieldCheck className="size-3 text-emerald-500" />
          <span>Immutable Snapshot: Past transactions preserve historical rate on payment date</span>
        </span>
        <span className="font-mono text-[10px]">ECB / SBP Benchmark</span>
      </div>
    </div>
  )
}
