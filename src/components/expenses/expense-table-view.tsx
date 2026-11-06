"use client"

import * as React from "react"
import { useTransition } from "react"
import { type ExpenseItem, type ExpensesSummary } from "@/lib/expenses/service"
import { type ReceiptOption } from "@/lib/documents/service"
import { ExpenseDialog } from "@/components/expenses/expense-dialog"
import { deleteExpenseAction } from "@/lib/expenses/actions"
import { formatMoney } from "@/lib/currency/format"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  Plus,
  Receipt,
  FileText,
  DollarSign,
  ShieldCheck,
  Percent,
  CheckCircle2,
  Trash2,
  Pencil,
  Info,
} from "lucide-react"

interface ExpenseTableViewProps {
  summary: ExpensesSummary
  receiptOptions: ReceiptOption[]
}

export function ExpenseTableView({ summary, receiptOptions }: ExpenseTableViewProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all")
  const [selectedDeductibility, setSelectedDeductibility] = React.useState<string>("all")

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [expenseToEdit, setExpenseToEdit] = React.useState<ExpenseItem | null>(null)

  // Delete transition
  const [isDeleting, startDeleteTransition] = useTransition()
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  const handleOpenCreate = () => {
    setExpenseToEdit(null)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (expense: ExpenseItem) => {
    setExpenseToEdit(expense)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete expense "${title}"?`)) {
      setDeletingId(id)
      startDeleteTransition(async () => {
        await deleteExpenseAction(id)
        setDeletingId(null)
      })
    }
  }

  // Filtered expenses
  const filteredExpenses = React.useMemo(() => {
    return summary.expenses.filter((exp) => {
      // Search
      const matchesSearch =
        searchQuery === "" ||
        exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exp.notes && exp.notes.toLowerCase().includes(searchQuery.toLowerCase()))

      // Category
      const matchesCategory =
        selectedCategory === "all" || exp.category === selectedCategory

      // Deductibility
      const matchesDeductibility =
        selectedDeductibility === "all" ||
        (selectedDeductibility === "deductible" && exp.isTaxDeductible) ||
        (selectedDeductibility === "non_deductible" && !exp.isTaxDeductible)

      return matchesSearch && matchesCategory && matchesDeductibility
    })
  }, [summary.expenses, searchQuery, selectedCategory, selectedDeductibility])

  // Count receipts attached
  const receiptsAttachedCount = React.useMemo(() => {
    return summary.expenses.filter((e) => e.documentId !== null).length
  }, [summary.expenses])

  return (
    <div className="space-y-6">
      {/* Demo Notice Banner if Demo Mode */}
      {summary.isDemoData && (
        <div className="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-50/50 p-4 text-xs text-blue-900 dark:border-blue-500/30 dark:bg-blue-950/20 dark:text-blue-300">
          <Info className="size-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
          <div className="space-y-1">
            <span className="font-semibold">[FYP Demo Mode] Realistic Academic Expense Fixtures</span>
            <p className="text-[11px] leading-relaxed text-blue-800/90 dark:text-blue-300/80">
              Displaying simulated freelancer operational expenses (cloud servers, IDE licenses, high-speed internet, hardware peripherals) with tax-deductibility classifications and attached receipts.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Total Expenses</span>
            <DollarSign className="size-3.5" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground">
            {formatMoney(summary.totalExpenses, summary.baseCurrency)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Across {summary.expenseCount} recorded items
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-medium">Tax-Deductible</span>
            <ShieldCheck className="size-3.5" />
          </div>
          <div className="text-xl font-bold tracking-tight text-emerald-700 dark:text-emerald-300">
            {formatMoney(summary.taxDeductibleTotal, summary.baseCurrency)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {summary.deductiblePercentage}% of operational expenditures
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Non-Deductible</span>
            <Percent className="size-3.5" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground">
            {formatMoney(summary.nonDeductibleTotal, summary.baseCurrency)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Personal or ineligible costs
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Substantiated Proofs</span>
            <Receipt className="size-3.5" />
          </div>
          <div className="text-xl font-bold tracking-tight text-foreground">
            {receiptsAttachedCount} / {summary.expenseCount}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Expenses with vault receipt attachments
          </p>
        </div>
      </div>

      {/* Control Strip: Search, Filters & Action */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search expenses, vendors, notes..."
              className="h-8 pl-8 text-xs"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <option value="all">All Categories</option>
            {summary.categoryBreakdown.map((cat) => (
              <option key={cat.category} value={cat.category}>
                {cat.category} ({cat.count})
              </option>
            ))}
          </select>

          <select
            value={selectedDeductibility}
            onChange={(e) => setSelectedDeductibility(e.target.value)}
            className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <option value="all">All Deductibility</option>
            <option value="deductible">Tax-Deductible Only</option>
            <option value="non_deductible">Non-Deductible</option>
          </select>
        </div>

        <Button size="sm" onClick={handleOpenCreate} className="gap-1.5 shrink-0">
          <Plus className="size-3.5" />
          <span>Record Expense</span>
        </Button>
      </div>

      {/* Expenses Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[11px] font-semibold text-muted-foreground">
                <th className="py-2.5 px-3.5">Date</th>
                <th className="py-2.5 px-3.5">Expense / Vendor</th>
                <th className="py-2.5 px-3.5">Category</th>
                <th className="py-2.5 px-3.5">Paid Amount</th>
                <th className="py-2.5 px-3.5">Converted ({summary.baseCurrency})</th>
                <th className="py-2.5 px-3.5">Tax Status</th>
                <th className="py-2.5 px-3.5">Receipt Proof</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground text-xs">
                    No business expenses found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr
                    key={exp.id}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-3 px-3.5 whitespace-nowrap text-muted-foreground font-mono text-[11px]">
                      {exp.expenseDate}
                    </td>

                    {/* Title & Notes */}
                    <td className="py-3 px-3.5 max-w-xs">
                      <div className="font-medium text-foreground truncate">
                        {exp.title}
                      </div>
                      {exp.notes && (
                        <div className="text-[11px] text-muted-foreground truncate max-w-xs">
                          {exp.notes}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-md bg-secondary/80 px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                        {exp.category}
                      </span>
                    </td>

                    {/* Paid Original Amount */}
                    <td className="py-3 px-3.5 whitespace-nowrap font-mono text-xs">
                      {formatMoney(exp.originalAmount, exp.originalCurrency)}
                    </td>

                    {/* Converted Equivalent */}
                    <td className="py-3 px-3.5 whitespace-nowrap font-mono text-xs font-semibold text-foreground">
                      {formatMoney(exp.convertedAmount, summary.baseCurrency)}
                      {exp.originalCurrency !== summary.baseCurrency && (
                        <span className="block text-[10px] font-normal text-muted-foreground">
                          @ {exp.exchangeRate.toFixed(4)}
                        </span>
                      )}
                    </td>

                    {/* Tax Status */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {exp.isTaxDeductible ? (
                        <Badge variant="success" className="text-[10px] gap-1">
                          <CheckCircle2 className="size-3" />
                          <span>Deductible</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">
                          Non-Deductible
                        </Badge>
                      )}
                    </td>

                    {/* Receipt Proof */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {exp.documentFileName ? (
                        <div className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline cursor-pointer">
                          <FileText className="size-3.5 shrink-0" />
                          <span className="max-w-[120px] truncate text-[11px]">
                            {exp.documentFileName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground/70 italic">
                          No receipt
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleOpenEdit(exp)}
                          title="Edit Expense"
                        >
                          <Pencil className="size-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(exp.id, exp.title)}
                          disabled={isDeleting && deletingId === exp.id}
                          title="Delete Expense"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense Add/Edit Modal */}
      <ExpenseDialog
        key={expenseToEdit?.id || (isDialogOpen ? "open" : "closed")}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        expenseToEdit={expenseToEdit}
        receiptOptions={receiptOptions}
        baseCurrency={summary.baseCurrency}
      />
    </div>
  )
}
