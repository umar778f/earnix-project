import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, ShieldCheck, Calculator, Sparkles, ReceiptText } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center p-6 md:p-12 lg:p-24">
      <div className="w-full max-w-4xl space-y-8 text-center sm:text-left">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <Sparkles className="size-3.5" />
          <span>Final Year Project — University Platform Baseline</span>
        </div>

        {/* Hero title */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
            Earnix
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground font-light max-w-2xl">
            AI-Powered Freelancer Income Management, Financial Recordkeeping &amp; Tax Preparation Platform
          </p>
        </div>

        {/* Pillars / Feature cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-4">
          <div className="rounded-xl border border-border bg-card p-5 text-left shadow-xs space-y-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ReceiptText className="size-5" />
            </div>
            <h2 className="text-base font-semibold text-foreground">Structured Income Tracking</h2>
            <p className="text-sm text-muted-foreground">
              Direct CSV ingestion for Upwork and multi-currency transaction ledgers with zero floating-point loss.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 text-left shadow-xs space-y-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calculator className="size-5" />
            </div>
            <h2 className="text-base font-semibold text-foreground">Tax-Ready Records</h2>
            <p className="text-sm text-muted-foreground">
              Configurable estimations and structured reports ready for your accountant or filing assistance.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 text-left shadow-xs space-y-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <h2 className="text-base font-semibold text-foreground">Grounded AI Safety</h2>
            <p className="text-sm text-muted-foreground">
              Strict deterministic calculations with AI categorization requiring explicit user verification.
            </p>
          </div>
        </div>

        {/* Phase 2 Verification Callout */}
        <div className="rounded-xl border border-border/80 bg-muted/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">System Status</p>
            <p className="text-sm font-medium text-foreground">
              Phase 2 Completed: Application Shell, Navigation &amp; Responsive Layouts Verified
            </p>
          </div>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "default", size: "default" }), "gap-2 cursor-pointer")}
          >
            <span>Open Dashboard Shell</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
