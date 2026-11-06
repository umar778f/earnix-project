"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { formatMoney } from "@/lib/currency/format"
import { type TransactionRecordItem } from "@/lib/transactions/service"
import {
  CheckCircle2,
  Clock,
  RotateCcw,
  Calendar,
  Coins,
  Briefcase,
  Layers,
  FileText,
} from "lucide-react"

interface TransactionDetailSheetProps {
  transaction: TransactionRecordItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  baseCurrency: string
}

export function TransactionDetailSheet({
  transaction,
  open,
  onOpenChange,
  baseCurrency,
}: TransactionDetailSheetProps) {
  if (!transaction) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return { label: "Completed", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" }
      case "pending":
        return { label: "Pending", icon: Clock, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" }
      default:
        return { label: "Refunded", icon: RotateCcw, color: "text-rose-500 bg-rose-500/10 border-rose-500/20" }
    }
  }

  const getSourceBadge = (source: string) => {
    switch (source) {
      case "csv_upwork":
        return { label: "Upwork CSV Statement", bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400" }
      case "csv_generic":
        return { label: "Generic Invoice CSV", bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400" }
      case "manual":
        return { label: "Manual Freelancer Entry", bg: "bg-slate-500/10 text-slate-600 dark:text-slate-400" }
      case "demo":
        return { label: "University Demo Fixture", bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400" }
      default:
        return { label: "Imported Record", bg: "bg-muted text-muted-foreground" }
    }
  }

  const statusBadge = getStatusBadge(transaction.status)
  const StatusIcon = statusBadge.icon
  const sourceBadge = getSourceBadge(transaction.sourceType)
  const isForeign = transaction.originalCurrency !== baseCurrency

  const formattedPaymentDate = new Date(transaction.paymentDate).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-6 sm:max-w-md flex flex-col justify-between">
        <div className="space-y-6">
          <SheetHeader className="p-0 border-none text-left">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium border ${statusBadge.color}`}>
                <StatusIcon className="size-3" />
                <span>{statusBadge.label}</span>
              </span>
              <span className={`rounded px-2 py-0.5 text-[10px] font-medium ${sourceBadge.bg}`}>
                {sourceBadge.label}
              </span>
            </div>
            <SheetTitle className="text-xl font-bold pt-1">{transaction.description}</SheetTitle>
            <SheetDescription>
              Transaction audit record &amp; immutable currency conversion
            </SheetDescription>
          </SheetHeader>

          {/* Amount Cards */}
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground uppercase font-semibold">
                Converted Amount ({baseCurrency})
              </span>
              <span className="text-xl font-bold text-foreground">
                {formatMoney(transaction.convertedAmount, baseCurrency)}
              </span>
            </div>

            {isForeign && (
              <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Original Transaction Amount:</span>
                <span className="font-semibold text-foreground">
                  {formatMoney(transaction.originalAmount, transaction.originalCurrency)}
                </span>
              </div>
            )}
          </div>

          {/* Currency Audit Details */}
          <div className="space-y-3 text-xs">
            <h3 className="font-semibold uppercase tracking-wider text-[11px] text-muted-foreground">
              Ledger Audit Trail
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded border border-border/50 bg-card">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Coins className="size-3.5" />
                  <span>Exchange Rate Snapshot:</span>
                </span>
                <span className="font-mono font-medium text-foreground">
                  1 {transaction.originalCurrency} = {transaction.exchangeRate.toFixed(6)} {baseCurrency}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded border border-border/50 bg-card">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="size-3.5" />
                  <span>Payment Date:</span>
                </span>
                <span className="font-medium text-foreground">
                  {formattedPaymentDate}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded border border-border/50 bg-card">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="size-3.5" />
                  <span>Platform / Source:</span>
                </span>
                <span className="font-medium text-foreground">
                  {transaction.platformName}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded border border-border/50 bg-card">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Layers className="size-3.5" />
                  <span>Client / Payee:</span>
                </span>
                <span className="font-medium text-foreground">
                  {transaction.clientName}
                </span>
              </div>

              {transaction.referenceId && (
                <div className="flex items-center justify-between p-2 rounded border border-border/50 bg-card">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="size-3.5" />
                    <span>Reference / Ref ID:</span>
                  </span>
                  <span className="font-mono font-medium text-foreground">
                    {transaction.referenceId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Metadata Breakdown if Available */}
          {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
            <div className="space-y-1.5 text-xs">
              <p className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider">
                Imported Metadata
              </p>
              <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-1">
                {Object.entries(transaction.metadata).map(([key, val]) => (
                  <div key={key} className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1")}:</span>
                    <span className="font-mono text-foreground">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => onOpenChange(false)}
          >
            Close Audit Details
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

