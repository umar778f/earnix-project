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
import { Badge } from "@/components/ui/badge"
import { type CategorizationSuggestion } from "@/lib/ai/categorizer"
import { INCOME_TAXONOMY, EXPENSE_TAXONOMY } from "@/lib/ai/taxonomy"
import {
  confirmAiTransactionCategoryAction,
  bulkConfirmAiTransactionsAction,
} from "@/lib/ai/actions"
import { Sparkles, CheckCircle2, ShieldCheck, CheckCheck } from "lucide-react"

interface AiReviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  suggestions: CategorizationSuggestion[]
  type?: "transaction" | "expense"
  onCompleted?: () => void
}

export function AiReviewModal({
  open,
  onOpenChange,
  suggestions: initialSuggestions,
  type = "transaction",
  onCompleted,
}: AiReviewModalProps) {
  const [suggestions, setSuggestions] = React.useState<CategorizationSuggestion[]>(initialSuggestions)
  const [selectedOverrides, setSelectedOverrides] = React.useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()

  const categoryOptions =
    type === "transaction"
      ? INCOME_TAXONOMY.map((t) => t.category)
      : EXPENSE_TAXONOMY.map((t) => t.category)

  const handleOverrideChange = (id: string, category: string) => {
    setSelectedOverrides((prev) => ({ ...prev, [id]: category }))
  }

  const handleApproveSingle = (suggestion: CategorizationSuggestion) => {
    const finalCategory = selectedOverrides[suggestion.id] || suggestion.suggestedCategory

    startTransition(async () => {
      await confirmAiTransactionCategoryAction(suggestion.id, finalCategory)
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id))
      if (suggestions.length <= 1) {
        onOpenChange(false)
        onCompleted?.()
      }
    })
  }

  const handleApproveAll = () => {
    const ids = suggestions.map((s) => s.id)

    startTransition(async () => {
      await bulkConfirmAiTransactionsAction(ids)
      setSuggestions([])
      onOpenChange(false)
      onCompleted?.()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="size-4" />
            <DialogTitle className="text-base font-semibold">
              AI Categorization Audit &amp; Review
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Review Gemini AI classification recommendations before committing them to the official ledger.
          </DialogDescription>
        </DialogHeader>

        {suggestions.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground space-y-2">
            <CheckCircle2 className="size-8 mx-auto text-emerald-600" />
            <p className="font-semibold text-foreground">All AI Suggestions Reviewed!</p>
            <p>Every transaction is verified under your confirmed classification.</p>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            <div className="rounded-lg border border-border/80 bg-muted/30 p-2.5 text-[11px] text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-primary" />
                <span>Mandatory User Review Policy Enforced</span>
              </span>
              <span className="font-semibold text-foreground font-mono">
                {suggestions.length} items awaiting audit
              </span>
            </div>

            <div className="space-y-3">
              {suggestions.map((item) => {
                const currentOverride = selectedOverrides[item.id] || item.suggestedCategory
                const pct = Math.round(item.confidence * 100)

                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-border bg-card p-3.5 shadow-xs space-y-2.5 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-foreground truncate" title={item.title}>
                          {item.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {item.reason}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge
                          variant={pct >= 85 ? "success" : "info"}
                          className="text-[10px] px-1.5 py-0 h-4"
                        >
                          {pct}% confidence
                        </Badge>
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 text-muted-foreground font-mono">
                          {item.aiModelUsed}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-border/60">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-[11px] text-muted-foreground shrink-0">Category:</span>
                        <select
                          value={currentOverride}
                          onChange={(e) => handleOverrideChange(item.id, e.target.value)}
                          className="h-7 w-full max-w-xs rounded-md border border-border bg-background px-2 text-xs text-foreground shadow-xs outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          {categoryOptions.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => handleApproveSingle(item)}
                        disabled={isPending}
                        className="gap-1 text-xs shrink-0"
                      >
                        <CheckCircle2 className="size-3 text-emerald-600" />
                        <span>Confirm</span>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            <DialogFooter className="pt-3 border-t border-border gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Close
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handleApproveAll}
                disabled={isPending || suggestions.length === 0}
                className="gap-1.5"
              >
                <CheckCheck className="size-3.5" />
                <span>Approve All ({suggestions.length})</span>
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
