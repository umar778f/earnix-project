"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { SUPPORTED_CURRENCIES, type SupportedCurrency } from "@/lib/currency/currencies"
import { updateBaseCurrencyAction } from "@/lib/currency/actions"
import { Loader2 } from "lucide-react"

interface CurrencySwitcherProps {
  currentCurrency: string
  className?: string
}

export function CurrencySwitcher({ currentCurrency, className }: CurrencySwitcherProps) {
  const router = useRouter()
  const [selected, setSelected] = React.useState<string>(currentCurrency.toUpperCase())
  const [isPending, startTransition] = React.useTransition()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextCode = e.target.value as SupportedCurrency
    setSelected(nextCode)

    startTransition(async () => {
      await updateBaseCurrencyAction(nextCode)
      router.refresh()
    })
  }

  return (
    <div className={`relative inline-flex items-center ${className || ""}`}>
      <select
        value={selected}
        onChange={handleChange}
        disabled={isPending}
        aria-label="Select base display currency"
        className="h-8 appearance-none rounded-md border border-border bg-background/80 pl-2 pr-7 text-xs font-semibold text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 cursor-pointer transition-colors"
      >
        {Object.values(SUPPORTED_CURRENCIES).map((curr) => (
          <option key={curr.code} value={curr.code}>
            {curr.flag} {curr.code} ({curr.symbol})
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-2 text-muted-foreground">
        {isPending ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <span className="text-[10px]">&#9662;</span>
        )}
      </div>
    </div>
  )
}
