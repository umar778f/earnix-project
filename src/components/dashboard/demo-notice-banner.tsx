import { Sparkles, Info } from "lucide-react"

export function DemoNoticeBanner() {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
      <div className="flex items-start gap-3">
        <Sparkles className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-foreground">
            University FYP Evaluation Dataset Active
          </p>
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            Displaying realistic demonstration fixtures (Upwork milestones, direct client invoices, dual-currency exchange rates, and business expenses). Real records will replace these when CSV statements are uploaded in Phase 10.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-mono font-medium text-amber-800 dark:text-amber-300 border border-amber-500/30">
          <Info className="size-3" />
          <span>Demo Data Labeled</span>
        </span>
      </div>
    </div>
  )
}

