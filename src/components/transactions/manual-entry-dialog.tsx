"use client"

import * as React from "react"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
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
import { createTransactionAction, updateTransactionAction, type TransactionActionResult } from "@/lib/transactions/actions"
import { type TransactionRecordItem } from "@/lib/transactions/service"
import { BENCHMARK_RATES_TO_USD } from "@/lib/currency/currencies"
import { formatMoney, toDecimal, multiplyDecimals, divideDecimals } from "@/lib/currency/format"
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Loader2 } from "lucide-react"

interface ManualEntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transactionToEdit?: TransactionRecordItem | null
  clients: { id: string; name: string }[]
  platforms: { id: string; code: string; name: string }[]
  baseCurrency: string
}

function getDefaultCrossRate(fromCurrency: string, toCurrency: string): string {
  const from = fromCurrency.toUpperCase()
  const to = toCurrency.toUpperCase()
  if (from === to) return "1"

  const rates = BENCHMARK_RATES_TO_USD as Record<string, number>
  const fromInUsd = rates[from] ?? 1
  const toInUsd = rates[to] ?? 1
  return divideDecimals(toDecimal(toInUsd), toDecimal(fromInUsd))
    .toDecimalPlaces(4)
    .toString()
}

export function ManualEntryDialog({
  open,
  onOpenChange,
  transactionToEdit,
  clients,
  platforms,
  baseCurrency,
}: ManualEntryDialogProps) {
  const router = useRouter()
  const isEditing = !!transactionToEdit
  const todayStr = new Date().toISOString().split("T")[0]

  const [amount, setAmount] = React.useState<string>(
    transactionToEdit ? transactionToEdit.originalAmount.toString() : ""
  )
  const [currency, setCurrency] = React.useState<string>(
    transactionToEdit ? transactionToEdit.originalCurrency : baseCurrency
  )
  const [customRate, setCustomRate] = React.useState<string>(
    transactionToEdit ? transactionToEdit.exchangeRate.toString() : ""
  )
  const [referenceId, setReferenceId] = React.useState<string>(
    transactionToEdit?.referenceId || ""
  )
  const [status, setStatus] = React.useState<string>(
    transactionToEdit?.status || "completed"
  )
  const [category, setCategory] = React.useState<string>(
    transactionToEdit?.category || "Freelance Income"
  )
  const [showMore, setShowMore] = React.useState<boolean>(
    Boolean(
      transactionToEdit &&
        (transactionToEdit.referenceId ||
          transactionToEdit.status !== "completed" ||
          transactionToEdit.category !== "Freelance Income")
    )
  )

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency)
    // Clear manual override so conversion automatically recalculates for the new currency
    setCustomRate("")
  }

  const [state, formAction, isPending] = useActionState<TransactionActionResult | null, FormData>(
    async (prevState, formData) => {
      const result =
        isEditing && transactionToEdit
          ? await updateTransactionAction(transactionToEdit.id, prevState, formData)
          : await createTransactionAction(prevState, formData)

      if (result.success) {
        router.refresh()
        setTimeout(() => {
          onOpenChange(false)
        }, 450)
      }
      return result
    },
    null
  )

  const effectiveRate = customRate || getDefaultCrossRate(currency, baseCurrency)
  const previewConverted =
    amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0
      ? multiplyDecimals(toDecimal(amount), toDecimal(effectiveRate))
      : toDecimal(0)

  const defaultPlatformId =
    transactionToEdit?.platformId ||
    platforms.find((p) => p.code === "upwork")?.id ||
    platforms[0]?.id ||
    ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update payment details in your ledger."
              : "Log a payment in seconds. Exchange rates are calculated automatically."}
          </DialogDescription>
        </DialogHeader>

        {state?.error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{state.error}</span>
          </div>
        )}

        {state?.success && state.message && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
            <span>{state.message}</span>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          {/* Amount & Currency */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="originalAmount">Amount *</Label>
              <Input
                id="originalAmount"
                name="originalAmount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                autoFocus
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="originalCurrency">Currency</Label>
              <select
                id="originalCurrency"
                name="originalCurrency"
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                disabled={isPending}
                className="flex h-9 w-full rounded-md border border-input bg-background px-2.5 py-1 text-sm shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="USD">USD ($)</option>
                <option value="PKR">PKR (₨)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          {/* Automatic conversion hint when currency differs from base */}
          {currency !== baseCurrency && previewConverted.greaterThan(0) && (
            <p className="text-xs text-muted-foreground -mt-2">
              Auto-converted:{" "}
              <span className="font-mono font-semibold text-foreground">
                {formatMoney(previewConverted, baseCurrency)}
              </span>{" "}
              <span className="font-mono text-[11px]">(rate {effectiveRate})</span>
            </p>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              name="description"
              defaultValue={transactionToEdit?.description || ""}
              placeholder="e.g. Website milestone payment"
              required
              disabled={isPending}
            />
          </div>

          {/* Client & Platform */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="clientId">Client (Optional)</Label>
              <select
                id="clientId"
                name="clientId"
                defaultValue={transactionToEdit?.clientId || ""}
                disabled={isPending}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">No client / Direct</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="platformId">Platform</Label>
              <select
                id="platformId"
                name="platformId"
                defaultValue={defaultPlatformId}
                disabled={isPending}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {platforms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Date */}
          <div className="space-y-1.5">
            <Label htmlFor="paymentDate">Date *</Label>
            <Input
              id="paymentDate"
              name="paymentDate"
              type="date"
              defaultValue={
                transactionToEdit?.paymentDate
                  ? transactionToEdit.paymentDate.split("T")[0]
                  : todayStr
              }
              required
              disabled={isPending}
            />
          </div>

          {/* Optional Advanced Fields */}
          <button
            type="button"
            onClick={() => setShowMore((prev) => !prev)}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {showMore ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            <span>{showMore ? "Hide more options" : "More options (status, category, invoice #, rate)"}</span>
          </button>

          {showMore ? (
            <div className="space-y-3 rounded-lg border border-border/70 bg-muted/20 p-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="status" className="text-xs">Status</Label>
                  <select
                    id="status"
                    name="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={isPending}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs">Category</Label>
                  <Input
                    id="category"
                    name="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={isPending}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="referenceId" className="text-xs">Invoice / Ref #</Label>
                  <Input
                    id="referenceId"
                    name="referenceId"
                    value={referenceId}
                    onChange={(e) => setReferenceId(e.target.value)}
                    placeholder="Optional"
                    disabled={isPending}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="exchangeRate" className="text-xs">
                    Rate to {baseCurrency}
                  </Label>
                  <Input
                    id="exchangeRate"
                    name="exchangeRate"
                    type="number"
                    step="0.000001"
                    min="0.000001"
                    value={customRate}
                    onChange={(e) => setCustomRate(e.target.value)}
                    placeholder={`Auto (${effectiveRate})`}
                    disabled={isPending}
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <input type="hidden" name="status" value={status} />
              <input type="hidden" name="category" value={category} />
              <input type="hidden" name="referenceId" value={referenceId} />
              <input type="hidden" name="exchangeRate" value={customRate} />
            </>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending} className="cursor-pointer gap-1.5">
              {isPending && <Loader2 className="size-3.5 animate-spin" />}
              <span>{isEditing ? "Save Changes" : "Add Transaction"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
