"use client"

import * as React from "react"
import { useTransition } from "react"
import { type TaxPreparationData } from "@/lib/tax/service"
import { type TransactionRecordItem } from "@/lib/transactions/service"
import { type ExpenseItem } from "@/lib/expenses/service"
import { SUPPORTED_TAX_JURISDICTIONS } from "@/lib/tax/engine"
import { updateTaxConfigAction } from "@/lib/tax/actions"
import { generateTaxReportCsv } from "@/lib/tax/export"
import { formatMoney } from "@/lib/currency/format"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Download,
  ShieldCheck,
  AlertCircle,
  Percent,
  CheckCircle2,
  Coins,
  Scale,
  DollarSign,
} from "lucide-react"

interface TaxCenterViewProps {
  initialTaxData: TaxPreparationData
  transactions: TransactionRecordItem[]
  expenses: ExpenseItem[]
}

const TAX_YEAR_OPTIONS = ["2025-2026", "2024-2025", "2023-2024"]

export function TaxCenterView({
  initialTaxData,
  transactions,
  expenses,
}: TaxCenterViewProps) {
  const [taxYear, setTaxYear] = React.useState<string>(initialTaxData.taxYear)
  const [jurisdiction, setJurisdiction] = React.useState<string>(initialTaxData.jurisdictionCode)
  const [estimatedRate, setEstimatedRate] = React.useState<string>(
    initialTaxData.calculations.estimatedTaxRate.toString()
  )
  const [withholdingTax, setWithholdingTax] = React.useState<string>(
    initialTaxData.calculations.withholdingTaxSuffered.toString()
  )

  const [isSaving, startSaveTransition] = useTransition()
  const [statusMessage, setStatusMessage] = React.useState<{ success: boolean; text: string } | null>(
    null
  )

  const calc = initialTaxData.calculations

  const handleJurisdictionChange = (newCode: string) => {
    setJurisdiction(newCode)
    const jur = SUPPORTED_TAX_JURISDICTIONS[newCode]
    if (jur) {
      setEstimatedRate(jur.defaultRate.toString())
    }
  }

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault()
    setStatusMessage(null)

    const rateNum = parseFloat(estimatedRate)
    const withholdingNum = parseFloat(withholdingTax) || 0

    if (isNaN(rateNum) || rateNum < 0) {
      setStatusMessage({ success: false, text: "Please enter a valid tax percentage rate." })
      return
    }

    startSaveTransition(async () => {
      const res = await updateTaxConfigAction({
        taxYear,
        jurisdictionCode: jurisdiction,
        estimatedRate: rateNum,
        withholdingTax: withholdingNum,
      })

      if (res.success) {
        setStatusMessage({ success: true, text: "Tax settings saved." })
      } else {
        setStatusMessage({ success: false, text: res.error || "Failed to save tax settings." })
      }
    })
  }

  const handleDownloadCsv = () => {
    const csvContent = generateTaxReportCsv({
      taxData: initialTaxData,
      transactions,
      expenses,
    })

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute(
      "download",
      `Earnix_Tax_Report_${taxYear}_${initialTaxData.baseCurrency}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      {/* Core Tax Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">Gross Income</span>
            <Coins className="size-3.5" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground font-mono">
            {formatMoney(calc.grossIncome, initialTaxData.baseCurrency)}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-[11px] font-medium">Deductible Expenses</span>
            <ShieldCheck className="size-3.5" />
          </div>
          <div className="text-xl font-bold tracking-tight text-emerald-700 dark:text-emerald-300 font-mono">
            {formatMoney(calc.allowableDeductions, initialTaxData.baseCurrency)}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">Net Taxable Income</span>
            <Scale className="size-3.5" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground font-mono">
            {formatMoney(calc.netTaxableIncome, initialTaxData.baseCurrency)}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
            <span className="text-[11px] font-medium">Estimated Tax Due</span>
            <DollarSign className="size-3.5" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground font-mono">
            {formatMoney(calc.netTaxPayableOrRefund, initialTaxData.baseCurrency)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {calc.estimatedTaxRate.toFixed(2)}% rate
            {calc.withholdingTaxSuffered > 0
              ? ` · less ${formatMoney(calc.withholdingTaxSuffered, initialTaxData.baseCurrency)} withheld`
              : ""}
          </p>
        </div>
      </div>

      {/* Compact Tax Settings & Export */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <form onSubmit={handleSavePreferences} className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/60">
            <span className="text-xs font-semibold text-foreground">Tax Settings</span>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={handleDownloadCsv}
                className="gap-1.5 text-xs cursor-pointer"
              >
                <Download className="size-3" />
                <span>Export CSV</span>
              </Button>
              <Button
                type="submit"
                size="xs"
                disabled={isSaving}
                className="gap-1.5 text-xs cursor-pointer"
              >
                <CheckCircle2 className="size-3" />
                <span>{isSaving ? "Saving..." : "Save"}</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label htmlFor="taxYearSelect" className="text-[11px] text-muted-foreground font-medium">
                Tax Year
              </label>
              <select
                id="taxYearSelect"
                value={taxYear}
                onChange={(e) => setTaxYear(e.target.value)}
                className="h-8 w-full rounded-lg border border-border bg-background px-2.5 text-xs text-foreground shadow-xs outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {TAX_YEAR_OPTIONS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="jurisdictionSelect" className="text-[11px] text-muted-foreground font-medium">
                Jurisdiction
              </label>
              <select
                id="jurisdictionSelect"
                value={jurisdiction}
                onChange={(e) => handleJurisdictionChange(e.target.value)}
                className="h-8 w-full rounded-lg border border-border bg-background px-2.5 text-xs text-foreground shadow-xs outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {Object.values(SUPPORTED_TAX_JURISDICTIONS).map((jur) => (
                  <option key={jur.code} value={jur.code}>
                    {jur.flag} {jur.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="estimatedRateInput" className="text-[11px] text-muted-foreground font-medium">
                Tax Rate (%)
              </label>
              <div className="relative">
                <Input
                  id="estimatedRateInput"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={estimatedRate}
                  onChange={(e) => setEstimatedRate(e.target.value)}
                  className="h-8 pr-7 text-xs font-mono"
                />
                <Percent className="pointer-events-none absolute right-2.5 top-2.5 size-3 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="withholdingTaxInput" className="text-[11px] text-muted-foreground font-medium">
                Tax Withheld ({initialTaxData.baseCurrency})
              </label>
              <Input
                id="withholdingTaxInput"
                type="number"
                step="any"
                min="0"
                value={withholdingTax}
                onChange={(e) => setWithholdingTax(e.target.value)}
                placeholder="0.00"
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          {statusMessage && (
            <div
              className={`p-2 rounded-lg text-xs flex items-center gap-1.5 ${
                statusMessage.success
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {statusMessage.success ? (
                <CheckCircle2 className="size-3.5 shrink-0" />
              ) : (
                <AlertCircle className="size-3.5 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}
        </form>
      </div>

      {/* Quarterly Breakdown */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="border-b border-border bg-muted/30 px-4 py-2.5 flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">
            Quarterly Breakdown &bull; {taxYear}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground">
                <th className="py-2.5 px-3.5">Quarter</th>
                <th className="py-2.5 px-3.5">Period</th>
                <th className="py-2.5 px-3.5">Gross Income</th>
                <th className="py-2.5 px-3.5">Deductions</th>
                <th className="py-2.5 px-3.5 text-right">Estimated Tax</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {calc.quarterlyBreakdown.map((q) => (
                <tr key={q.quarter} className="hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 px-3.5 font-bold text-foreground">{q.quarter}</td>
                  <td className="py-2.5 px-3.5 text-muted-foreground">{q.periodName}</td>
                  <td className="py-2.5 px-3.5 font-mono">
                    {formatMoney(q.grossIncome, initialTaxData.baseCurrency)}
                  </td>
                  <td className="py-2.5 px-3.5 font-mono text-emerald-700 dark:text-emerald-300">
                    {formatMoney(q.allowableDeductions, initialTaxData.baseCurrency)}
                  </td>
                  <td className="py-2.5 px-3.5 text-right font-mono font-semibold text-foreground">
                    {formatMoney(q.estimatedTax, initialTaxData.baseCurrency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
