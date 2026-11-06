"use client"

import * as React from "react"
import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { AiReviewModal } from "@/components/ai/ai-review-modal"
import {
  runAiTransactionCategorizationAction,
  runAiExpenseCategorizationAction,
  bulkConfirmAiTransactionsAction,
  bulkConfirmAiExpensesAction,
} from "@/lib/ai/actions"
import { type CategorizationSuggestion } from "@/lib/ai/categorizer"
import { Sparkles, ShieldCheck, CheckCheck, Loader2 } from "lucide-react"

interface AiReviewBannerProps {
  type: "transaction" | "expense"
  pendingCount: number
  unassignedCount: number
  initialSuggestions?: CategorizationSuggestion[]
}

export function AiReviewBanner({
  type,
  pendingCount,
  unassignedCount,
  initialSuggestions = [],
}: AiReviewBannerProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [suggestions, setSuggestions] = React.useState<CategorizationSuggestion[]>(initialSuggestions)
  const [isClassifying, startClassifyTransition] = useTransition()
  const [isApprovingAll, startApproveAllTransition] = useTransition()
  const [bannerDismissed, setBannerDismissed] = React.useState(false)

  const handleRunAi = () => {
    startClassifyTransition(async () => {
      const result =
        type === "transaction"
          ? await runAiTransactionCategorizationAction()
          : await runAiExpenseCategorizationAction()

      if (result.success && result.data && result.data.suggestions.length > 0) {
        setSuggestions(result.data.suggestions)
        setIsModalOpen(true)
      }
    })
  }

  const handleApproveAllQuick = () => {
    const ids = suggestions.map((s) => s.id)
    startApproveAllTransition(async () => {
      if (type === "transaction") {
        await bulkConfirmAiTransactionsAction(ids)
      } else {
        await bulkConfirmAiExpensesAction(ids)
      }
      setBannerDismissed(true)
    })
  }

  if (bannerDismissed) return null

  // Case 1: Suggestions staged for review
  if (pendingCount > 0 || suggestions.length > 0) {
    const activeCount = pendingCount || suggestions.length
    return (
      <>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3.5 text-xs shadow-xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5 sm:mt-0">
              <Sparkles className="size-4" />
            </div>
            <div className="space-y-0.5">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <span>AI Categorization Review: {activeCount} records staged</span>
                <span className="text-[10px] text-muted-foreground font-normal">(User Confirmation Required)</span>
              </span>
              <p className="text-[11px] text-muted-foreground">
                Earnix AI analyzed domain terms to propose tax-ready categories with confidence scoring. No record is modified without your review.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="xs"
              variant="outline"
              onClick={() => setIsModalOpen(true)}
              className="gap-1.5 text-xs bg-background"
            >
              <ShieldCheck className="size-3 text-primary" />
              <span>Review Suggestions ({activeCount})</span>
            </Button>

            {suggestions.length > 0 && (
              <Button
                size="xs"
                onClick={handleApproveAllQuick}
                disabled={isApprovingAll}
                className="gap-1 text-xs"
              >
                <CheckCheck className="size-3" />
                <span>{isApprovingAll ? "Approving..." : "Approve All"}</span>
              </Button>
            )}
          </div>
        </div>

        <AiReviewModal
          key={suggestions.map((s) => s.id).join(",") || (isModalOpen ? "open" : "closed")}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          suggestions={suggestions}
          type={type}
          onCompleted={() => setBannerDismissed(true)}
        />
      </>
    )
  }

  // Case 2: Unassigned records can be classified by AI
  if (unassignedCount > 0) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-blue-500/20 bg-blue-50/40 p-3.5 text-xs text-blue-900 dark:border-blue-500/30 dark:bg-blue-950/20 dark:text-blue-300 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Sparkles className="size-4" />
          </div>
          <div className="space-y-0.5">
            <span className="font-semibold">
              {unassignedCount} unclassified {type === "transaction" ? "payments" : "expenses"} ready for AI analysis
            </span>
            <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80">
              Run Gemini AI to automatically identify software engineering, consulting, or design taxonomy.
            </p>
          </div>
        </div>

        <Button
          size="xs"
          onClick={handleRunAi}
          disabled={isClassifying}
          className="gap-1.5 text-xs shrink-0 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isClassifying ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Sparkles className="size-3" />
          )}
          <span>{isClassifying ? "Analyzing..." : "Classify with AI"}</span>
        </Button>
      </div>
    )
  }

  return null
}
