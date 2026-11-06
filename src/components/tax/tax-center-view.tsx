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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Download,
  Printer,
  ShieldCheck,
  AlertCircle,
  Percent,
  CheckCircle2,
  Receipt,
  Coins,
  Settings,
  Scale,
  DollarSign,
  FileSpreadsheet,
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
        setStatusMessage({ success: true, text: "Tax profile settings updated successfully." })
      } else {
        setStatusMessage({ success: false, text: res.error || "Failed to update tax profile." })
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
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Mandatory Statutory Notice */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-50/50 p-4 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/20 dark:text-amber-300 shadow-xs">
        <AlertCircle className="size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <div className="space-y-1">
          <span className="font-semibold">Tax Preparation Assistance &amp; Recordkeeping Notice</span>
          <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300/80">
            Earnix organizes financial records and computes liabilities based on explicitly configured user rules. Earnix does NOT claim to be a certified tax authority or legal advisor. All summaries and exported packages are designed to assist you and your certified accountant during formal tax filing.
          </p>
        </div>
      </div>

      {/* Tax Configuration & Controls Bar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-4">
        <form onSubmit={handleSavePreferences} className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Settings className="size-3.5" />
              </div>
              <span className="text-xs font-semibold text-foreground">
                Configurable Tax Estimation Rules
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={handleDownloadCsv}
                className="gap-1.5 text-xs"
              >
                <Download className="size-3" />
                <span>Download Tax Pack (CSV)</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={handlePrint}
                className="gap-1.5 text-xs hidden sm:inline-flex"
              >
                <Printer className="size-3" />
                <span>Print Summary</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Tax Year */}
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

            {/* Jurisdiction */}
            <div className="space-y-1">
              <label htmlFor="jurisdictionSelect" className="text-[11px] text-muted-foreground font-medium">
                Tax Jurisdiction
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

            {/* Configurable Rate */}
            <div className="space-y-1">
              <label htmlFor="estimatedRateInput" className="text-[11px] text-muted-foreground font-medium">
                Estimated Tax Rate (%)
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

            {/* Withholding Tax */}
            <div className="space-y-1">
              <label htmlFor="withholdingTaxInput" className="text-[11px] text-muted-foreground font-medium">
                Advance Tax Withheld ({initialTaxData.baseCurrency})
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

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-muted-foreground">
              {SUPPORTED_TAX_JURISDICTIONS[jurisdiction]?.description}
            </span>

            <Button
              type="submit"
              size="xs"
              disabled={isSaving}
              className="gap-1.5 text-xs shrink-0"
            >
              <CheckCircle2 className="size-3" />
              <span>{isSaving ? "Saving..." : "Save Rules"}</span>
            </Button>
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

      {/* Executive Tax Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">Gross Revenue</span>
            <Coins className="size-3.5" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground">
            {formatMoney(calc.grossIncome, initialTaxData.baseCurrency)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Total freelance earnings
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-[11px] font-medium">Allowable Deductions</span>
            <ShieldCheck className="size-3.5" />
          </div>
          <div className="text-xl font-bold tracking-tight text-emerald-700 dark:text-emerald-300">
            {formatMoney(calc.allowableDeductions, initialTaxData.baseCurrency)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Tax-deductible expenses
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">Net Taxable Income</span>
            <Scale className="size-3.5" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground">
            {formatMoney(calc.netTaxableIncome, initialTaxData.baseCurrency)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Revenue minus deductions
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
            <span className="text-[11px] font-medium">Estimated Liability</span>
            <Receipt className="size-3.5" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground">
            {formatMoney(calc.estimatedTaxLiability, initialTaxData.baseCurrency)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            At {calc.estimatedTaxRate.toFixed(2)}% benchmark rate
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
            <span className="text-[11px] font-medium">Net Tax Reserve Due</span>
            <DollarSign className="size-3.5" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground">
            {formatMoney(calc.netTaxPayableOrRefund, initialTaxData.baseCurrency)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Less {formatMoney(calc.withholdingTaxSuffered, initialTaxData.baseCurrency)} advance
          </p>
        </div>
      </div>

      {/* Quarterly Reporting Periods Breakdown */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="border-b border-border bg-muted/30 px-4 py-2.5 flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">
            Quarterly Reporting Periods &bull; Tax Year {taxYear}
          </span>
          <span className="text-[11px] text-muted-foreground">
            Accruals aggregated by payment date
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground">
                <th className="py-2.5 px-3.5">Quarter</th>
                <th className="py-2.5 px-3.5">Reporting Window</th>
                <th className="py-2.5 px-3.5">Gross Revenue</th>
                <th className="py-2.5 px-3.5">Allowable Deductions</th>
                <th className="py-2.5 px-3.5">Net Income</th>
                <th className="py-2.5 px-3.5">Estimated Tax Liability</th>
                <th className="py-2.5 px-3.5 text-right">Transactions</th>
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
                  <td className="py-2.5 px-3.5 font-mono font-semibold text-foreground">
                    {formatMoney(q.netIncome, initialTaxData.baseCurrency)}
                  </td>
                  <td className="py-2.5 px-3.5 font-mono">
                    {formatMoney(q.estimatedTax, initialTaxData.baseCurrency)}
                  </td>
                  <td className="py-2.5 px-3.5 text-right font-mono text-muted-foreground">
                    {q.transactionCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tax Classifications Breakdown & Receipt Health Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tax Category Breakdown (2 Cols) */}
        <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden lg:col-span-2">
          <div className="border-b border-border bg-muted/30 px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">
              Allowable Deductions by Tax Classification Code
            </span>
            <span className="text-[11px] text-muted-foreground">
              Categorized business expenses
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground">
                  <th className="py-2.5 px-3.5">Tax Category</th>
                  <th className="py-2.5 px-3.5">Deduction Total</th>
                  <th className="py-2.5 px-3.5">Share</th>
                  <th className="py-2.5 px-3.5 text-right">Receipt Coverage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {calc.taxCategoryBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-muted-foreground">
                      No tax-deductible expenses recorded for this period.
                    </td>
                  </tr>
                ) : (
                  calc.taxCategoryBreakdown.map((c) => (
                    <tr key={c.taxCategory} className="hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-3.5 font-medium text-foreground">
                        {c.taxCategory}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono">
                        {formatMoney(c.totalDeductions, initialTaxData.baseCurrency)}
                      </td>
                      <td className="py-2.5 px-3.5 text-muted-foreground">
                        {c.percentageOfDeductions}%
                      </td>
                      <td className="py-2.5 px-3.5 text-right">
                        <Badge
                          variant={c.hasReceiptCoveragePct >= 80 ? "success" : "outline"}
                          className="text-[10px]"
                        >
                          {c.hasReceiptCoveragePct}% Substantiated
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Readiness & Documentation Health (1 Col) */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground">
                Audit Defense Readiness
              </span>
              <p className="text-[10px] text-muted-foreground">
                Substantiating documentation score
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span>Receipt Proof Coverage</span>
              <span className="font-bold text-foreground font-mono">
                {calc.receiptSubstantiationRatio}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-emerald-600 transition-all rounded-full"
                style={{ width: `${calc.receiptSubstantiationRatio}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground leading-normal">
              Tax authorities require contemporaneous receipts for business operational deductions. High receipt coverage ensures safe deduction substantiation.
            </p>
          </div>

          <div className="pt-2 border-t border-border space-y-2">
            <span className="text-[11px] font-semibold text-foreground block">
              Certified Accountant Package:
            </span>
            <ul className="text-[11px] text-muted-foreground space-y-1 list-disc pl-4">
              <li>Dual-currency transaction ledger</li>
              <li>Itemized operational expenses</li>
              <li>Quarterly accruals breakdown</li>
              <li>Exchange rate source timestamps</li>
            </ul>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadCsv}
              className="w-full text-xs gap-1.5 mt-2"
            >
              <FileSpreadsheet className="size-3.5" />
              <span>Export Full CSV Audit Pack</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
