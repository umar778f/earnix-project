"use client"

import * as React from "react"
import { useTransition } from "react"
import Link from "next/link"
import { parseUpworkCsv, SAMPLE_UPWORK_CSV } from "@/lib/parsers/upwork"
import { parseGenericCsv, SAMPLE_GENERIC_CSV } from "@/lib/parsers/generic"
import {
  reconcileImportRowsAction,
  commitImportBatchAction,
  type ImportCandidateRow,
  type ReconciliationResult,
  type CommitBatchResult,
} from "@/lib/transactions/import-actions"
import { formatMoney } from "@/lib/currency/format"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  FileText,
  ShieldCheck,
  Receipt,
  RotateCcw,
  Sparkles,
} from "lucide-react"

export function IngestionWizard() {
  // Wizard Step: 1 = Upload, 2 = Preview & Reconcile, 3 = Completed
  const [step, setStep] = React.useState<1 | 2 | 3>(1)
  const [platform, setPlatform] = React.useState<"upwork" | "generic_csv">("upwork")
  const [rawCsvText, setRawCsvText] = React.useState<string>("")
  const [fileName, setFileName] = React.useState<string>("")
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [importFeesAsExpenses, setImportFeesAsExpenses] = React.useState<boolean>(true)

  // Reconciliation Results
  const [reconciliation, setReconciliation] = React.useState<ReconciliationResult | null>(null)
  const [isReconciling, startReconcileTransition] = useTransition()

  // Commit Batch Results
  const [commitResult, setCommitResult] = React.useState<CommitBatchResult | null>(null)
  const [isCommitting, startCommitTransition] = useTransition()

  // Handle file drop / select
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null)
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        setRawCsvText(text || "")
      }
      reader.readAsText(file)
    }
  }

  // Handle Load Sample Fixture
  const handleLoadSample = (type: "upwork" | "generic_csv") => {
    setErrorMessage(null)
    setPlatform(type)
    if (type === "upwork") {
      setFileName("TransactionHistory_20261101_20261130_Sample.csv")
      setRawCsvText(SAMPLE_UPWORK_CSV)
    } else {
      setFileName("DirectInvoices_Q4_2026_Sample.csv")
      setRawCsvText(SAMPLE_GENERIC_CSV)
    }
  }

  // Trigger Parsing & Reconciliation (Step 1 -> Step 2)
  const handleParseAndReconcile = () => {
    setErrorMessage(null)
    if (!rawCsvText.trim()) {
      setErrorMessage("Please select a CSV file or load a sample statement first.")
      return
    }

    startReconcileTransition(async () => {
      let candidates: ImportCandidateRow[] = []

      if (platform === "upwork") {
        const parseRes = parseUpworkCsv(rawCsvText)
        if (!parseRes.success) {
          setErrorMessage(parseRes.error || "Failed to parse Upwork CSV.")
          return
        }
        candidates = parseRes.allRows.map((r) => ({
          date: r.date,
          referenceId: r.referenceId,
          clientName: r.clientName,
          description: r.description,
          originalAmount: r.amount,
          originalCurrency: r.currency,
          classification: r.classification,
        }))
      } else {
        const parseRes = parseGenericCsv(rawCsvText)
        if (!parseRes.success) {
          setErrorMessage(parseRes.error || "Failed to parse generic CSV.")
          return
        }
        candidates = parseRes.rows.map((r) => ({
          date: r.date,
          referenceId: r.referenceId,
          clientName: r.clientName,
          description: r.description,
          originalAmount: r.amount,
          originalCurrency: r.currency,
          classification: "income",
        }))
      }

      const reconRes = await reconcileImportRowsAction(candidates, platform)
      if (!reconRes.success) {
        setErrorMessage(reconRes.error || "Reconciliation failed.")
        return
      }

      setReconciliation(reconRes)
      setStep(2)
    })
  }

  // Trigger Commit to Ledger (Step 2 -> Step 3)
  const handleCommit = () => {
    if (!reconciliation) return
    setErrorMessage(null)

    const incomeRows = reconciliation.rows.filter(
      (r) => r.reconciliationStatus === "ready"
    )
    const feeRows = reconciliation.rows.filter(
      (r) => r.reconciliationStatus === "fee"
    )

    startCommitTransition(async () => {
      const res = await commitImportBatchAction({
        platformCode: platform,
        incomeRows,
        feeRows,
        importFeesAsExpenses,
      })

      if (!res.success) {
        setErrorMessage(res.error || "Failed to commit transactions to ledger.")
        return
      }

      setCommitResult(res)
      setStep(3)
    })
  }

  const handleReset = () => {
    setStep(1)
    setRawCsvText("")
    setFileName("")
    setReconciliation(null)
    setCommitResult(null)
    setErrorMessage(null)
  }

  return (
    <div className="space-y-6">
      {/* Wizard Step Indicator */}
      <div className="grid grid-cols-3 gap-2 border-b border-border pb-4">
        <div
          className={`flex items-center gap-2 text-xs font-medium ${
            step >= 1 ? "text-primary font-semibold" : "text-muted-foreground"
          }`}
        >
          <div
            className={`flex size-6 items-center justify-center rounded-full text-xs ${
              step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            1
          </div>
          <span>Select Statement</span>
        </div>

        <div
          className={`flex items-center gap-2 text-xs font-medium ${
            step >= 2 ? "text-primary font-semibold" : "text-muted-foreground"
          }`}
        >
          <div
            className={`flex size-6 items-center justify-center rounded-full text-xs ${
              step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            2
          </div>
          <span>Audit &amp; Reconcile</span>
        </div>

        <div
          className={`flex items-center gap-2 text-xs font-medium ${
            step === 3 ? "text-primary font-semibold" : "text-muted-foreground"
          }`}
        >
          <div
            className={`flex size-6 items-center justify-center rounded-full text-xs ${
              step === 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            3
          </div>
          <span>Ingestion Receipt</span>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertTriangle className="size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: STATEMENT SELECTION & UPLOAD                                      */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Format Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Select Statement Source Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPlatform("upwork")}
                className={`flex flex-col items-start gap-1 rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                  platform === "upwork"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border bg-card hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 font-bold text-xs">
                    Up
                  </div>
                  <span className="text-xs font-semibold text-foreground">
                    Upwork Statement
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-normal mt-0.5">
                  Official Upwork Transaction History CSV with milestones, hourly rates, and fee reconciliation.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPlatform("generic_csv")}
                className={`flex flex-col items-start gap-1 rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                  platform === "generic_csv"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border bg-card hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 font-bold text-xs">
                    CSV
                  </div>
                  <span className="text-xs font-semibold text-foreground">
                    Generic CSV
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-normal mt-0.5">
                  Standard format for direct international client invoices, wire transfers, and bank exports.
                </p>
              </button>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Upload CSV File
            </label>
            <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 p-8 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="absolute inset-0 size-full opacity-0 cursor-pointer"
              />

              {fileName ? (
                <div className="space-y-1.5">
                  <div className="flex size-10 mx-auto items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FileSpreadsheet className="size-5" />
                  </div>
                  <div className="text-xs font-semibold text-foreground">{fileName}</div>
                  <p className="text-[11px] text-muted-foreground">
                    Click or drop another file to replace
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex size-10 mx-auto items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Upload className="size-5" />
                  </div>
                  <div className="text-xs font-semibold text-foreground">
                    Choose a CSV statement or drag &amp; drop
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Supported: Upwork `TransactionHistory_*.csv` or custom columns
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sample Statement Templates */}
          <div className="rounded-xl border border-blue-500/20 bg-blue-50/50 p-4 text-xs dark:border-blue-500/30 dark:bg-blue-950/20 space-y-2.5">
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-semibold">
              <Sparkles className="size-4 text-blue-600 dark:text-blue-400" />
              <span>Statement Templates &amp; Example Formats</span>
            </div>
            <p className="text-[11px] text-blue-800/90 dark:text-blue-300/80 leading-relaxed">
              Want to test statement ingestion before connecting your account? Load a formatted Upwork statement or generic invoice template to preview the multi-currency reconciliation workflow.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => handleLoadSample("upwork")}
                className="gap-1.5 text-xs bg-background"
              >
                <FileSpreadsheet className="size-3" />
                <span>Load Example Upwork Statement (9 Rows)</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => handleLoadSample("generic_csv")}
                className="gap-1.5 text-xs bg-background"
              >
                <FileText className="size-3" />
                <span>Load Example Direct Client Invoices</span>
              </Button>
            </div>
          </div>

          {/* Proceed Button */}
          <div className="flex items-center justify-end pt-2">
            <Button
              type="button"
              onClick={handleParseAndReconcile}
              disabled={isReconciling || !rawCsvText.trim()}
              className="gap-1.5"
            >
              <span>{isReconciling ? "Parsing & Reconciling..." : "Parse & Reconcile Statement"}</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: RECONCILIATION PREVIEW & DEDUPLICATION AUDIT                      */}
      {/* ========================================================================= */}
      {step === 2 && reconciliation && (
        <div className="space-y-6">
          {/* Audit KPI Cards Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">Parsed Records</span>
                <FileSpreadsheet className="size-3.5" />
              </div>
              <div className="text-xl font-bold tracking-tight text-foreground">
                {reconciliation.totalParsed}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Total CSV statement rows
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                <span className="text-xs font-medium">Ready for Ledger</span>
                <CheckCircle2 className="size-3.5" />
              </div>
              <div className="text-xl font-bold tracking-tight text-emerald-700 dark:text-emerald-300">
                {formatMoney(reconciliation.totalGrossIncomeConverted, reconciliation.baseCurrency)}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {reconciliation.readyCount} valid payments to commit
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                <span className="text-xs font-medium">Duplicates Skipped</span>
                <ShieldCheck className="size-3.5" />
              </div>
              <div className="text-xl font-bold tracking-tight text-amber-700 dark:text-amber-300">
                {reconciliation.duplicateCount}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Protected by composite ref ID check
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
                <span className="text-xs font-medium">Platform Fees</span>
                <Receipt className="size-3.5" />
              </div>
              <div className="text-xl font-bold tracking-tight text-foreground">
                {formatMoney(reconciliation.totalFeesConverted, reconciliation.baseCurrency)}
              </div>
              <p className="text-[11px] text-muted-foreground">
                {reconciliation.feeCount} service fee rows
              </p>
            </div>
          </div>

          {/* Fee Inclusion Option */}
          {reconciliation.feeCount > 0 && (
            <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <label
                  htmlFor="importFeesCheck"
                  className="text-xs font-semibold text-foreground cursor-pointer flex items-center gap-1.5"
                >
                  <Receipt className="size-3.5 text-purple-600" />
                  <span>Record Platform Service Fees as Tax-Deductible Business Expenses</span>
                </label>
                <p className="text-[11px] text-muted-foreground">
                  Upwork 10% freelancer service fees will automatically be logged in your Expenses module under &quot;Platform &amp; Payment Fees&quot; to substantiate tax-deductible expense claims.
                </p>
              </div>
              <input
                id="importFeesCheck"
                type="checkbox"
                checked={importFeesAsExpenses}
                onChange={(e) => setImportFeesAsExpenses(e.target.checked)}
                className="size-4 rounded border-border text-primary focus:ring-primary cursor-pointer shrink-0"
              />
            </div>
          )}

          {/* Audit Preview Table */}
          <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
            <div className="border-b border-border bg-muted/30 px-4 py-2.5 flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                Ledger Reconciliation Audit Table
              </span>
              <span className="text-[11px] text-muted-foreground">
                Displaying all parsed statement rows with deduplication status
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground">
                    <th className="py-2.5 px-3.5">Date</th>
                    <th className="py-2.5 px-3.5">Ref ID</th>
                    <th className="py-2.5 px-3.5">Client</th>
                    <th className="py-2.5 px-3.5">Description</th>
                    <th className="py-2.5 px-3.5">Paid Amount</th>
                    <th className="py-2.5 px-3.5">Converted ({reconciliation.baseCurrency})</th>
                    <th className="py-2.5 px-3.5">Audit Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {reconciliation.rows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`hover:bg-muted/30 transition-colors ${
                        row.reconciliationStatus === "duplicate"
                          ? "bg-amber-50/30 dark:bg-amber-950/10 opacity-75"
                          : row.reconciliationStatus === "ignored"
                            ? "bg-muted/20 opacity-60"
                            : ""
                      }`}
                    >
                      <td className="py-2.5 px-3.5 whitespace-nowrap font-mono text-[11px] text-muted-foreground">
                        {row.date}
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap font-mono text-[11px] text-foreground">
                        {row.referenceId}
                      </td>
                      <td className="py-2.5 px-3.5 font-medium text-foreground whitespace-nowrap">
                        {row.clientName}
                      </td>
                      <td className="py-2.5 px-3.5 max-w-xs truncate text-[11px] text-muted-foreground" title={row.description}>
                        {row.description}
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap font-mono">
                        {formatMoney(row.originalAmount, row.originalCurrency)}
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap font-mono font-semibold text-foreground">
                        {formatMoney(row.convertedAmount, reconciliation.baseCurrency)}
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        {row.reconciliationStatus === "ready" && (
                          <Badge variant="success" className="text-[10px] gap-1">
                            <CheckCircle2 className="size-3" />
                            <span>Ready to Commit</span>
                          </Badge>
                        )}
                        {row.reconciliationStatus === "duplicate" && (
                          <Badge variant="warning" className="text-[10px] gap-1">
                            <ShieldCheck className="size-3" />
                            <span>Duplicate Skipped</span>
                          </Badge>
                        )}
                        {row.reconciliationStatus === "fee" && (
                          <Badge variant="secondary" className="text-[10px] gap-1 bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                            <Receipt className="size-3" />
                            <span>Platform Fee</span>
                          </Badge>
                        )}
                        {row.reconciliationStatus === "ignored" && (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            Bank Transfer (Ignored)
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Strip */}
          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setStep(1)}
              disabled={isCommitting}
              className="gap-1.5"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Upload</span>
            </Button>

            <Button
              type="button"
              onClick={handleCommit}
              disabled={isCommitting || reconciliation.readyCount === 0}
              className="gap-1.5"
            >
              <CheckCircle2 className="size-3.5" />
              <span>
                {isCommitting
                  ? "Committing to Ledger..."
                  : `Commit ${reconciliation.readyCount} Transactions to Ledger`}
              </span>
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: INGESTION CONFIRMATION & AUDIT RECEIPT                           */}
      {/* ========================================================================= */}
      {step === 3 && commitResult && (
        <div className="max-w-xl mx-auto rounded-xl border border-emerald-500/20 bg-card p-6 shadow-xs space-y-6 text-center">
          <div className="flex size-14 mx-auto items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-8" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-base font-bold text-foreground">
              Statement Successfully Ingested into Ledger
            </h2>
            <p className="text-xs text-muted-foreground">
              The financial transactions have been committed with dual-currency preservation and deduplication safeguards.
            </p>
          </div>

          {/* Receipt Breakdown Card */}
          <div className="rounded-lg border border-border bg-muted/30 p-4 text-left text-xs space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <span className="text-muted-foreground">Gross Income Registered:</span>
              <span className="font-bold text-foreground font-mono">
                {formatMoney(commitResult.totalGrossImported, commitResult.baseCurrency)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Income Payments Ingested:</span>
              <span className="font-semibold text-foreground font-mono">
                {commitResult.importedTransactionsCount} records
              </span>
            </div>

            {commitResult.importedFeesCount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Platform Fees Logged as Expenses:</span>
                <span className="font-semibold text-foreground font-mono">
                  {commitResult.importedFeesCount} expense records
                </span>
              </div>
            )}

            {commitResult.createdClientsCount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">New Clients Auto-Registered:</span>
                <span className="font-semibold text-foreground font-mono">
                  {commitResult.createdClientsCount} clients
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
              <span>Ledger Immutability Guarantee:</span>
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <ShieldCheck className="size-3" />
                <span>Original Currency &amp; Rates Preserved</span>
              </span>
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            <Link
              href="/transactions"
              className={cn(buttonVariants({ variant: "default", size: "sm" }), "w-full sm:w-auto text-xs")}
            >
              View Transactions Ledger
            </Link>
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full sm:w-auto text-xs")}
            >
              Return to Dashboard
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="w-full sm:w-auto text-xs gap-1.5"
            >
              <RotateCcw className="size-3" />
              <span>Import Another</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
