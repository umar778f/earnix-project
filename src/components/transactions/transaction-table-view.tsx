"use client"

import * as React from "react"
import Link from "next/link"
import { type TransactionRecordItem } from "@/lib/transactions/service"
import { formatMoney, toDecimal, addDecimals } from "@/lib/currency/format"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ManualEntryDialog } from "@/components/transactions/manual-entry-dialog"
import { TransactionDetailSheet } from "@/components/transactions/transaction-detail-sheet"
import { deleteTransactionAction } from "@/lib/transactions/actions"
import {
  Search,
  Plus,
  ArrowLeftRight,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertTriangle,
  Loader2,
  DollarSign,
  FileSpreadsheet,
} from "lucide-react"

interface TransactionTableViewProps {
  initialTransactions: TransactionRecordItem[]
  clients: { id: string; name: string }[]
  platforms: { id: string; code: string; name: string }[]
  baseCurrency: string
  isDemoData: boolean
}

export function TransactionTableView({
  initialTransactions,
  clients,
  platforms,
  baseCurrency,
  isDemoData,
}: TransactionTableViewProps) {
  // Filters state
  const [search, setSearch] = React.useState("")
  const [platformFilter, setPlatformFilter] = React.useState("all")
  const [currencyFilter, setCurrencyFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")

  // Modals state
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [transactionToEdit, setTransactionToEdit] = React.useState<TransactionRecordItem | null>(null)

  // Drawer state
  const [selectedTransaction, setSelectedTransaction] = React.useState<TransactionRecordItem | null>(null)
  const [sheetOpen, setSheetOpen] = React.useState(false)

  // Deletion state
  const [deletePendingId, setDeletePendingId] = React.useState<string | null>(null)
  const [actionError, setActionError] = React.useState<string | null>(null)

  // Filter computation
  const filteredTransactions = initialTransactions.filter((tx) => {
    const searchLower = search.toLowerCase()
    const matchesSearch =
      tx.description.toLowerCase().includes(searchLower) ||
      tx.clientName.toLowerCase().includes(searchLower) ||
      (tx.referenceId && tx.referenceId.toLowerCase().includes(searchLower))

    const matchesPlatform =
      platformFilter === "all" || tx.platformCode === platformFilter

    const matchesCurrency =
      currencyFilter === "all" || tx.originalCurrency === currencyFilter

    const matchesStatus =
      statusFilter === "all" || tx.status === statusFilter

    return matchesSearch && matchesPlatform && matchesCurrency && matchesStatus
  })

  // Aggregate summary metrics on the fly using Decimal math
  let filteredGrossDec = toDecimal(0)
  let completedCount = 0
  let pendingCount = 0

  for (const tx of filteredTransactions) {
    if (tx.status === "completed") {
      filteredGrossDec = addDecimals(filteredGrossDec, toDecimal(tx.convertedAmount))
      completedCount++
    } else if (tx.status === "pending") {
      pendingCount++
    }
  }

  const handleOpenAdd = () => {
    setTransactionToEdit(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (tx: TransactionRecordItem, e: React.MouseEvent) => {
    e.stopPropagation()
    setTransactionToEdit(tx)
    setDialogOpen(true)
  }

  const handleOpenDetails = (tx: TransactionRecordItem) => {
    setSelectedTransaction(tx)
    setSheetOpen(true)
  }

  const handleDelete = async (txId: string, desc: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`Are you sure you want to remove this transaction ("${desc}") from the ledger?`)) {
      return
    }

    setDeletePendingId(txId)
    setActionError(null)

    const result = await deleteTransactionAction(txId)
    setDeletePendingId(null)

    if (!result.success && result.error) {
      setActionError(result.error)
    }
  }

  const getSourceBadge = (sourceType: string) => {
    switch (sourceType) {
      case "csv_upwork":
        return { label: "Upwork CSV", bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" }
      case "csv_generic":
        return { label: "Invoice CSV", bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" }
      case "manual":
        return { label: "Manual Entry", bg: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20" }
      case "demo":
        return { label: "Demo Data", bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" }
      default:
        return { label: "Ledger", bg: "bg-muted text-muted-foreground border-border" }
    }
  }

  return (
    <div className="space-y-4">
      {/* KPI Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Filtered Gross Income
            </p>
            <p className="text-xl font-bold text-foreground">
              {formatMoney(filteredGrossDec, baseCurrency)}
            </p>
          </div>
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <DollarSign className="size-4" />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Completed Records
            </p>
            <p className="text-xl font-bold text-foreground">
              {completedCount} <span className="text-xs font-normal text-muted-foreground">payments</span>
            </p>
          </div>
          <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <CheckCircle2 className="size-4" />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Pending Clearances
            </p>
            <p className="text-xl font-bold text-foreground">
              {pendingCount} <span className="text-xs font-normal text-muted-foreground">unsettled</span>
            </p>
          </div>
          <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock className="size-4" />
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search description, client, or Ref ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2.5 text-xs text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="all">All Platforms</option>
            <option value="upwork">Upwork</option>
            <option value="generic_csv">Direct Invoices</option>
            <option value="manual">Manual Entry</option>
            <option value="demo">Demo Fixtures</option>
          </select>

          <select
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2.5 text-xs text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="all">All Currencies</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="PKR">PKR (₨)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2.5 text-xs text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/transactions/import"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5 cursor-pointer text-xs")}
          >
            <FileSpreadsheet className="size-3.5" />
            <span>Import Statement</span>
          </Link>
          <Button onClick={handleOpenAdd} size="sm" className="gap-1.5 cursor-pointer text-xs">
            <Plus className="size-4" />
            <span>Record Payment</span>
          </Button>
        </div>
      </div>

      {/* Action Error Alert */}
      {actionError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
          <AlertTriangle className="size-4 shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Transactions Ledger Table */}
      {filteredTransactions.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center shadow-xs space-y-3">
          <div className="flex size-10 mx-auto items-center justify-center rounded-full bg-muted text-muted-foreground">
            <ArrowLeftRight className="size-5" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">No transactions found</h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {search || platformFilter !== "all" || currencyFilter !== "all" || statusFilter !== "all"
              ? "No transactions match your filter criteria. Try resetting filters."
              : "No income records in your ledger yet. Click 'Record Payment' or import an Upwork CSV to get started."}
          </p>
          {(search || platformFilter !== "all" || currencyFilter !== "all" || statusFilter !== "all") && (
            <Button
              variant="outline"
              size="xs"
              onClick={() => {
                setSearch("")
                setPlatformFilter("all")
                setCurrencyFilter("all")
                setStatusFilter("all")
              }}
            >
              Reset All Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Description</th>
                  <th className="px-4 py-3 font-semibold">Client / Platform</th>
                  <th className="px-4 py-3 font-semibold">Source</th>
                  <th className="px-4 py-3 font-semibold text-center">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Amount ({baseCurrency})</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredTransactions.map((tx) => {
                  const isDeleting = deletePendingId === tx.id
                  const sourceBadge = getSourceBadge(tx.sourceType)
                  const isForeign = tx.originalCurrency !== baseCurrency
                  const formattedDate = new Date(tx.paymentDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })

                  return (
                    <tr
                      key={tx.id}
                      onClick={() => handleOpenDetails(tx)}
                      className="hover:bg-muted/30 cursor-pointer transition-colors group"
                    >
                      <td className="px-4 py-3.5 whitespace-nowrap text-muted-foreground font-mono text-[11px]">
                        {formattedDate}
                      </td>

                      <td className="px-4 py-3.5 max-w-[260px]">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {tx.description}
                          </p>
                          {tx.referenceId && (
                            <p className="text-[10px] font-mono text-muted-foreground/80 truncate">
                              Ref: {tx.referenceId}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <p className="font-medium text-foreground">{tx.clientName}</p>
                          <p className="text-[11px] text-muted-foreground">{tx.platformName}</p>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-medium border ${sourceBadge.bg}`}
                        >
                          {sourceBadge.label}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {tx.status === "completed" && (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="size-3" />
                            <span>Paid</span>
                          </span>
                        )}
                        {tx.status === "pending" && (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Clock className="size-3" />
                            <span>Pending</span>
                          </span>
                        )}
                        {tx.status === "refunded" && (
                          <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            <RotateCcw className="size-3" />
                            <span>Refunded</span>
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="space-y-0.5">
                          <p className="font-bold text-foreground">
                            +{formatMoney(tx.convertedAmount, baseCurrency)}
                          </p>
                          {isForeign && (
                            <p className="text-[10px] font-mono text-muted-foreground">
                              {formatMoney(tx.originalAmount, tx.originalCurrency)}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenDetails(tx)
                            }}
                            className="text-muted-foreground hover:text-foreground"
                            aria-label="View transaction audit details"
                            title="View audit trail"
                          >
                            <ExternalLink className="size-3.5" />
                          </Button>

                          {!isDemoData && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={(e) => handleOpenEdit(tx, e)}
                                className="text-muted-foreground hover:text-foreground"
                                aria-label="Edit transaction"
                                title="Edit transaction"
                              >
                                <Edit2 className="size-3.5" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon-xs"
                                disabled={isDeleting}
                                onClick={(e) => handleDelete(tx.id, tx.description, e)}
                                className="text-muted-foreground hover:text-destructive"
                                aria-label="Delete transaction"
                                title="Delete transaction"
                              >
                                {isDeleting ? (
                                  <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="size-3.5" />
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Entry Modal Dialog */}
      <ManualEntryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transactionToEdit={transactionToEdit}
        clients={clients}
        platforms={platforms}
        baseCurrency={baseCurrency}
      />

      {/* Transaction Detail Sheet */}
      <TransactionDetailSheet
        transaction={selectedTransaction}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        baseCurrency={baseCurrency}
      />
    </div>
  )
}

