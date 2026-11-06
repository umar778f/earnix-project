import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Sparkles, ShieldCheck } from "lucide-react"

export default function CopilotPage() {
  return (
    <PageContainer maxWidth="narrow">
      <PageHeader
        title="Earnix AI Copilot"
        description="Ask natural-language questions grounded strictly in your verified financial ledger."
      />

      {/* Safety Notice */}
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
        <ShieldCheck className="size-4 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">Zero-Hallucination Architecture</p>
          <p>
            Earnix Copilot calculates financial numbers strictly using PostgreSQL queries and deterministic application logic. AI is restricted to explaining and summarizing.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-12 text-center shadow-xs space-y-3">
        <div className="flex size-10 mx-auto items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Sparkles className="size-5" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">
          Interactive Financial Assistant
        </h2>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Ask questions such as &quot;What did I earn from Upwork this quarter?&quot; or &quot;Show my largest expense categories.&quot; Target: Phase 12.
        </p>
        <div className="pt-2">
          <Button variant="outline" size="sm" className="text-xs" disabled>
            Copilot Interface (Phase 12)
          </Button>
        </div>
      </div>
    </PageContainer>
  )
}

