"use client"

import * as React from "react"
import { useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EXPENSE_CATEGORIES } from "@/lib/expenses/schemas"
import { createExpenseAction, updateExpenseAction } from "@/lib/expenses/actions"
import { type ExpenseItem } from "@/lib/expenses/service"
import { type ReceiptOption } from "@/lib/documents/service"
import { SUPPORTED_CURRENCIES, BENCHMARK_RATES_TO_USD, type SupportedCurrency } from "@/lib/currency/currencies"
import { formatMoney, toDecimal, multiplyDecimals } from "@/lib/currency/format"
import { AlertCircle, FileText, CheckCircle2 } from "lucide-react"

interface ExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expenseToEdit?: ExpenseItem | null
  receiptOptions: ReceiptOption[]
  baseCurrency?: string
}

export function ExpenseDialog({
  open,
  onOpenChange,
  expenseToEdit,
  receiptOptions,
  baseCurrency = "USD",
}: ExpenseDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string[]>>({})

  // Form State
  const [currency, setCurrency] = React.useState<SupportedCurrency>(
    (expenseToEdit?.originalCurrency as SupportedCurrency) || "USD"
  )
  const [amount, setAmount] = React.useState<string>(
    expenseToEdit ? expenseToEdit.originalAmount.toString() : ""
  )
  const [exchangeRate, setExchangeRate] = React.useState<string>(
    expenseToEdit ? expenseToEdit.exchangeRate.toString() : "1.0"
  )
  const [isTaxDeductible, setIsTaxDeductible] = React.useState<boolean>(
    expenseToEdit ? expenseToEdit.isTaxDeductible : true
  )

  const handleClose = () => {
    setErrorMsg(null)
    setFieldErrors({})
    onOpenChange(false)
  }

  const handleCurrencyChange = (newCurr: SupportedCurrency) => {
    setCurrency(newCurr)
    if (newCurr === baseCurrency) {
      setExchangeRate("1.0")
    } else {
      const benchmarkRate =
        newCurr === "PKR"
          ? (1 / BENCHMARK_RATES_TO_USD.PKR).toFixed(6)
          : newCurr === "EUR"
            ? (1 / BENCHMARK_RATES_TO_USD.EUR).toFixed(4)
            : newCurr === "GBP"
              ? (1 / BENCHMARK_RATES_TO_USD.GBP).toFixed(4)
              : "1.0"
      setExchangeRate(benchmarkRate)
    }
  }

  // Live conversion preview
  const previewConverted = React.useMemo(() => {
    try {
      const aDec = toDecimal(amount || "0")
      const rDec = toDecimal(exchangeRate || "1.0")
      if (aDec.isPositive() && rDec.isPositive()) {
        const res = multiplyDecimals(aDec, rDec)
        return res.toNumber()
      }
    } catch {
      // ignore parsing error
    }
    return 0
  }, [amount, exchangeRate])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg(null)
    setFieldErrors({})

    const formData = new FormData(e.currentTarget)
    formData.set("isTaxDeductible", isTaxDeductible ? "true" : "false")

    startTransition(async () => {
      const result = expenseToEdit
        ? await updateExpenseAction(formData)
        : await createExpenseAction(formData)

      if (!result.success) {
        setErrorMsg(result.error || "An error occurred while saving the expense.")
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors)
        }
      } else {
        onOpenChange(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {expenseToEdit ? "Edit Business Expense" : "Record Business Expense"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {expenseToEdit
              ? "Update expense details, currency conversions, and tax deductibility."
              : "Log an operational expense, attach receipt proofs from your vault, and track tax-deductible costs."}
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {expenseToEdit && (
            <input type="hidden" name="id" value={expenseToEdit.id} />
          )}

          {/* Expense Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs">
              Expense Title / Vendor *
            </Label>
            <Input
              id="title"
              name="title"
              defaultValue={expenseToEdit?.title || ""}
              placeholder="e.g. AWS Cloud Hosting, JetBrains License, High-Speed Internet"
              required
              aria-invalid={!!fieldErrors.title}
              className="text-xs"
            />
            {fieldErrors.title && (
              <p className="text-[11px] text-destructive">{fieldErrors.title[0]}</p>
            )}
          </div>

          {/* Amount, Currency & Rate Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="originalAmount" className="text-xs">
                Paid Amount *
              </Label>
              <Input
                id="originalAmount"
                name="originalAmount"
                type="number"
                step="any"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                aria-invalid={!!fieldErrors.originalAmount}
                className="text-xs"
              />
              {fieldErrors.originalAmount && (
                <p className="text-[11px] text-destructive">
                  {fieldErrors.originalAmount[0]}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="originalCurrency" className="text-xs">
                Currency *
              </Label>
              <select
                id="originalCurrency"
                name="originalCurrency"
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value as SupportedCurrency)}
                className="flex h-8 w-full rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exchangeRate" className="text-xs">
                FX Rate to {baseCurrency}
              </Label>
              <Input
                id="exchangeRate"
                name="exchangeRate"
                type="number"
                step="any"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                required
                className="text-xs font-mono"
              />
            </div>
          </div>

          {/* Live Conversion Banner */}
          {currency !== baseCurrency && (
            <div className="rounded-lg border border-border/80 bg-muted/40 p-2.5 text-xs flex items-center justify-between">
              <span className="text-muted-foreground">Converted Equivalent:</span>
              <span className="font-semibold text-foreground">
                {formatMoney(previewConverted, baseCurrency)}
              </span>
            </div>
          )}

          {/* Category & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-xs">
                Category *
              </Label>
              <select
                id="category"
                name="category"
                defaultValue={expenseToEdit?.category || EXPENSE_CATEGORIES[0]}
                required
                className="flex h-8 w-full rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="expenseDate" className="text-xs">
                Date of Expense *
              </Label>
              <Input
                id="expenseDate"
                name="expenseDate"
                type="date"
                defaultValue={expenseToEdit?.expenseDate || ""}
                required
                className="text-xs"
              />
            </div>
          </div>

          {/* Tax Deductible Toggle */}
          <div className="rounded-lg border border-border p-3 space-y-2 bg-card">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="taxDeductibleCheck" className="text-xs font-medium cursor-pointer">
                  Tax-Deductible Business Expense
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Eligible operational cost to be deducted from gross freelance earnings during tax estimation.
                </p>
              </div>
              <input
                id="taxDeductibleCheck"
                type="checkbox"
                checked={isTaxDeductible}
                onChange={(e) => setIsTaxDeductible(e.target.checked)}
                className="size-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
            </div>

            {isTaxDeductible && (
              <div className="pt-2 border-t border-border/60">
                <Label htmlFor="taxCategory" className="text-[11px] text-muted-foreground">
                  Tax Classification Code / Description
                </Label>
                <Input
                  id="taxCategory"
                  name="taxCategory"
                  defaultValue={expenseToEdit?.taxCategory || ""}
                  placeholder="e.g. Telecommunications, Software & IT Consumables, Depreciation"
                  className="h-7 text-xs mt-1"
                />
              </div>
            )}
          </div>

          {/* Receipt Document Attachment */}
          <div className="space-y-1.5">
            <Label htmlFor="documentId" className="text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="size-3 text-muted-foreground" />
                <span>Attach Receipt Proof from Vault</span>
              </span>
              <span className="text-[10px] text-muted-foreground">Optional</span>
            </Label>
            <select
              id="documentId"
              name="documentId"
              defaultValue={expenseToEdit?.documentId || ""}
              className="flex h-8 w-full rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <option value="">No receipt attached</option>
              {receiptOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.fileName} ({opt.documentType})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-muted-foreground">
              Need to upload a new receipt? You can also upload PDF/image files directly in the Document Vault.
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs">
              Notes &amp; Justification
            </Label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              defaultValue={expenseToEdit?.notes || ""}
              placeholder="e.g. Monthly cloud hosting for client project deploy, substantiated with October AWS invoice."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 resize-none"
            />
          </div>

          <DialogFooter className="pt-3 border-t border-border gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending} className="gap-1.5">
              <CheckCircle2 className="size-3.5" />
              <span>{isPending ? "Saving..." : expenseToEdit ? "Update Expense" : "Record Expense"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
