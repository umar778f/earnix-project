"use client"

import * as React from "react"
import { useActionState } from "react"
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
import { formatMoney, toDecimal, multiplyDecimals } from "@/lib/currency/format"
import { AlertCircle, CheckCircle2, Loader2, Calculator } from "lucide-react"

interface ManualEntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transactionToEdit?: TransactionRecordItem | null
  clients: { id: string; name: string }[]
  platforms: { id: string; code: string; name: string }[]
  baseCurrency: string
}

export function ManualEntryDialog({
  open,
  onOpenChange,
  transactionToEdit,
  clients,
  platforms,
  baseCurrency,
}: ManualEntryDialogProps) {
  const isEditing = !!transactionToEdit

  // Form interactive states
  const [amount, setAmount] = React.useState<string>(
    transactionToEdit ? transactionToEdit.originalAmount.toString() : ""
  )
  const [currency, setCurrency] = React.useState<string>(
    transactionToEdit ? transactionToEdit.originalCurrency : baseCurrency
  )
  const [rate, setRate] = React.useState<string>(
    transactionToEdit ? transactionToEdit.exchangeRate.toString() : "1.0"
  )

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency)
    if (newCurrency === baseCurrency) {
      setRate("1.0")
    } else if (newCurrency === "USD" && baseCurrency === "PKR") {
      setRate("278.50")
    } else if (newCurrency === "EUR" && baseCurrency === "USD") {
      setRate("1.085")
    } else if (newCurrency === "GBP" && baseCurrency === "USD") {
      setRate("1.278")
    }
  }

  const [state, formAction, isPending] = useActionState<TransactionActionResult | null, FormData>(
    async (prevState, formData) => {
      let result: TransactionActionResult
      if (isEditing && transactionToEdit) {
        result = await updateTransactionAction(transactionToEdit.id, prevState, formData)
      } else {
        result = await createTransactionAction(prevState, formData)
      }

      if (result.success) {
        setTimeout(() => {
          onOpenChange(false)
        }, 1200)
      }
      return result
    },
    null
  )

  // Calculate live preview converted amount using Decimal math
  const previewConverted = multiplyDecimals(toDecimal(amount), toDecimal(rate))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Transaction" : "Record Income Transaction"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update transaction details in your financial ledger."
              : "Manually log a freelance payment with multi-currency exchange tracking."}
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
          <div className="space-y-1.5">
            <Label htmlFor="description">Payment Description *</Label>
            <Input
              id="description"
              name="description"
              defaultValue={transactionToEdit?.description || ""}
              placeholder="e.g. Milestone 2: API Architecture & Next.js Setup"
              required
              disabled={isPending}
            />
          </div>

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
                <option value="">Direct Client / Unassigned</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="platformId">Platform *</Label>
              <select
                id="platformId"
                name="platformId"
                defaultValue={transactionToEdit?.platformId || platforms[0]?.id || ""}
                required
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

          {/* Amount and Currency Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="originalAmount">Original Amount Paid *</Label>
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
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="originalCurrency">Currency *</Label>
              <select
                id="originalCurrency"
                name="originalCurrency"
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                disabled={isPending}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="PKR">PKR (₨)</option>
              </select>
            </div>
          </div>

          {/* Exchange Rate & Live Preview */}
          <div className="rounded-lg border border-border/70 bg-muted/20 p-3 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="space-y-1">
                <Label htmlFor="exchangeRate" className="text-xs">
                  Exchange Rate to {baseCurrency}
                </Label>
                <Input
                  id="exchangeRate"
                  name="exchangeRate"
                  type="number"
                  step="0.000001"
                  min="0.000001"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  disabled={isPending}
                  className="h-8 text-xs font-mono max-w-[140px]"
                />
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center sm:justify-end gap-1">
                  <Calculator className="size-3" />
                  <span>Converted Equivalent</span>
                </span>
                <p className="text-sm font-bold text-foreground">
                  {formatMoney(previewConverted, baseCurrency)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="paymentDate">Payment Date *</Label>
              <Input
                id="paymentDate"
                name="paymentDate"
                type="date"
                defaultValue={transactionToEdit?.paymentDate ? transactionToEdit.paymentDate.split("T")[0] : ""}
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="referenceId">Reference ID / Invoice #</Label>
              <Input
                id="referenceId"
                name="referenceId"
                defaultValue={transactionToEdit?.referenceId || ""}
                placeholder="e.g. UP-10492 or INV-01"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={transactionToEdit?.status || "completed"}
                disabled={isPending}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                defaultValue={transactionToEdit?.category || "Freelance Income"}
                disabled={isPending}
              />
            </div>
          </div>

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
              <span>{isEditing ? "Save Changes" : "Record Payment"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
