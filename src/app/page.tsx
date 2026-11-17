import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { InteractiveTiltCard } from "@/components/ui/interactive-tilt-card"
import { InteractiveDashboardDemo } from "@/components/landing/interactive-dashboard-demo"
import { FaqSection } from "@/components/landing/faq-section"
import {
  Sparkles,
  LogIn,
  ArrowRight,
  Coins,
  FileSpreadsheet,
  Calculator,
  Receipt,
  Users,
  ShieldCheck,
  Upload,
  FileText,
  TrendingUp,
  AlertCircle,
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased font-sans selection:bg-emerald-500/20">
      {/* 1. STICKY TOP NAVIGATION */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-2.5 font-semibold text-foreground tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-md"
          >
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
              <Sparkles className="size-4" />
            </div>
            <span className="text-base font-bold">
              Earnix
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="hover:text-foreground transition-colors">
              How it works
            </Link>
            <Link href="#tax-example" className="hover:text-foreground transition-colors">
              Tax calculation
            </Link>
            <Link href="#demo" className="hover:text-foreground transition-colors">
              Product demo
            </Link>
            <Link href="#faq" className="hover:text-foreground transition-colors">
              FAQ
            </Link>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-sm font-medium text-muted-foreground hover:text-foreground"
              )}
            >
              <span>Log in</span>
            </Link>
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm shadow-xs"
              )}
            >
              <span>Sign up</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="py-20 md:py-24 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            {/* Left Headline & Action Column */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Sparkles className="size-3.5" />
                <span>Freelance Bookkeeping &amp; Tax Planning</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold tracking-tight text-foreground leading-[1.12]">
                  Know exactly how much tax to set aside from every Upwork payment.
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  A dual-currency bookkeeping ledger that automatically imports Upwork statements, tracks deductible business expenses, and calculates audit-ready tax reserves in PKR and USD.
                </p>
              </div>

              {/* Clean Primary / Secondary Action Row */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link
                  href="/signup"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base px-7 py-6 shadow-sm gap-2 cursor-pointer text-center justify-center"
                  )}
                >
                  <span>Start free</span>
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "font-semibold text-base px-7 py-6 border-border hover:bg-muted text-foreground gap-2 cursor-pointer text-center justify-center"
                  )}
                >
                  <LogIn className="size-4 text-muted-foreground" />
                  <span>Log in</span>
                </Link>
              </div>

              {/* Trust Line */}
              <p className="text-xs text-muted-foreground/90 font-medium">
                No credit card required &bull; Data isolated per account &bull; Export CSV anytime
              </p>
            </div>

            {/* Right Column: Financial Snapshot Card */}
            <div className="lg:col-span-6">
              <InteractiveTiltCard className="space-y-4 border-border bg-card shadow-md">
                {/* Header bar */}
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Financial snapshot
                    </h3>
                    <p className="text-xs text-muted-foreground">Dual-currency ledger</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    278.90 PKR / USD
                  </span>
                </div>

                {/* 3 Metric Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1">
                    <p className="text-[11px] text-muted-foreground font-medium">Gross income</p>
                    <p className="text-base sm:text-lg font-bold text-foreground font-mono tabular-nums">
                      $12,450.00
                    </p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono tabular-nums font-semibold">
                      ₨3,472,305
                    </p>
                  </div>

                  <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1">
                    <p className="text-[11px] text-muted-foreground font-medium">Deductions</p>
                    <p className="text-base sm:text-lg font-bold text-foreground font-mono tabular-nums">
                      $1,280.00
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono tabular-nums">
                      ₨357,000
                    </p>
                  </div>

                  <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1">
                    <p className="text-[11px] text-muted-foreground font-medium">1% Tax reserve</p>
                    <p className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                      $124.50
                    </p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono tabular-nums font-semibold">
                      ₨34,723
                    </p>
                  </div>
                </div>

                {/* Mini Income Velocity Sparkline */}
                <div className="rounded-lg border border-border/70 bg-muted/20 p-3 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <TrendingUp className="size-3.5 text-emerald-500" />
                      6-month income velocity
                    </span>
                    <span className="text-muted-foreground font-mono text-[11px] font-medium">+18.4% vs last period</span>
                  </div>
                  {/* Visual SVG Sparkline */}
                  <div className="h-10 w-full flex items-end gap-1.5 pt-1">
                    <div className="w-1/6 bg-emerald-500/30 rounded-t h-[40%]" />
                    <div className="w-1/6 bg-emerald-500/40 rounded-t h-[55%]" />
                    <div className="w-1/6 bg-emerald-500/50 rounded-t h-[50%]" />
                    <div className="w-1/6 bg-emerald-500/60 rounded-t h-[75%]" />
                    <div className="w-1/6 bg-emerald-500/80 rounded-t h-[85%]" />
                    <div className="w-1/6 bg-emerald-500 rounded-t h-[100%]" />
                  </div>
                </div>

                {/* Recent Verified Records */}
                <div className="space-y-1.5 text-xs pt-1">
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-muted/30">
                    <div>
                      <p className="font-semibold text-foreground">Upwork milestone (Contract 4921)</p>
                      <p className="text-[11px] text-muted-foreground">Software engineering &bull; Auto-imported</p>
                    </div>
                    <div className="text-right font-mono tabular-nums">
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">+$2,500.00</p>
                      <p className="text-[10px] text-muted-foreground">₨697,250</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-muted/30">
                    <div>
                      <p className="font-semibold text-foreground">AWS cloud servers &amp; tooling</p>
                      <p className="text-[11px] text-muted-foreground">Operational deduction &bull; Receipt verified</p>
                    </div>
                    <div className="text-right font-mono tabular-nums">
                      <p className="font-semibold text-foreground">-$84.20</p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400">₨23,480</p>
                    </div>
                  </div>
                </div>
              </InteractiveTiltCard>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section id="features" className="py-20 md:py-24 border-b border-border bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-16 space-y-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              Built for international freelance realities.
            </h2>
            <p className="text-base text-muted-foreground">
              Eliminate spreadsheet errors and stop wondering what you owe at tax season.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <InteractiveTiltCard className="p-6 space-y-3 hover:border-emerald-500/40 transition-colors">
              <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Coins className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Dual-currency accounting
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Log contract amounts in original USD, EUR, or GBP alongside converted PKR at exact payment-date rates without formula rounding drift.
              </p>
            </InteractiveTiltCard>

            {/* Feature 2 */}
            <InteractiveTiltCard className="p-6 space-y-3 hover:border-blue-500/40 transition-colors">
              <div className="flex size-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <FileSpreadsheet className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Upwork CSV statement import
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Drop your Upwork CSV history. Earnix automatically extracts gross earnings, separates 10% platform fee deductions, and detects duplicates.
              </p>
            </InteractiveTiltCard>

            {/* Feature 3 */}
            <InteractiveTiltCard className="p-6 space-y-3 hover:border-amber-500/40 transition-colors">
              <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Receipt className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Never lose a receipt before filing
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Store receipts and invoice proofs in an encrypted vault. Track receipt coverage so your accountant has proof for every claimed business deduction.
              </p>
            </InteractiveTiltCard>

            {/* Feature 4 */}
            <InteractiveTiltCard className="p-6 space-y-3 hover:border-purple-500/40 transition-colors">
              <div className="flex size-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Calculator className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                FBR Section 154A tax reserves
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Automatically calculate the 1.00% final tax reserve on IT export proceeds with quarterly breakdowns ready for FBR IRIS e-filing.
              </p>
            </InteractiveTiltCard>

            {/* Feature 5 */}
            <InteractiveTiltCard className="p-6 space-y-3 hover:border-cyan-500/40 transition-colors">
              <div className="flex size-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <Users className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Client concentration insights
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Monitor client lifetime revenue, identify your highest-paying accounts, and track project milestones across multiple platforms.
              </p>
            </InteractiveTiltCard>

            {/* Feature 6 */}
            <InteractiveTiltCard className="p-6 space-y-3 hover:border-emerald-500/40 transition-colors">
              <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                Strict database isolation
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your entries, documents, and clients are strictly partitioned via PostgreSQL Row Level Security (RLS). No other user can ever view your ledger.
              </p>
            </InteractiveTiltCard>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION (Connected 3-Step Flow) */}
      <section id="how-it-works" className="py-20 md:py-24 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-16 space-y-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              How it works
            </h2>
            <p className="text-base text-muted-foreground">
              From raw platform export to tax-ready financial statement in three steps.
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <InteractiveTiltCard className="p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex size-8 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-xs">
                    1
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    Input &bull; 30s
                  </span>
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  Import statement or log payments
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Upload your Upwork Transaction History CSV or enter client milestones manually with original foreign currency values.
                </p>
              </div>

              {/* Step UI Snippet */}
              <div className="rounded-lg border border-border/80 bg-muted/40 p-3 text-xs space-y-1.5 font-mono">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Upload className="size-3.5 text-blue-500" />
                  <span className="truncate">Upwork_Statement_2026.csv</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>4 Income rows</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">$3,950.00</span>
                </div>
              </div>
            </InteractiveTiltCard>

            {/* Step 2 */}
            <InteractiveTiltCard className="p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex size-8 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-xs">
                    2
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    Deductions
                  </span>
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  Attach business expenses
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Record operational costs for cloud hosting, domain fees, and hardware with substantiating receipt files in your vault.
                </p>
              </div>

              {/* Step UI Snippet */}
              <div className="rounded-lg border border-border/80 bg-muted/40 p-3 text-xs space-y-1.5 font-mono">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Receipt className="size-3.5 text-amber-500" />
                  <span>AWS_Invoice_INV29.pdf</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>100% Deductible</span>
                  <span className="text-foreground font-bold">-$84.20 USD</span>
                </div>
              </div>
            </InteractiveTiltCard>

            {/* Step 3 */}
            <InteractiveTiltCard className="p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex size-8 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-xs">
                    3
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    Audit Ready
                  </span>
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  Export your tax reserve pack
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Generate structured CSV reports showing exact gross remittances, allowable expense offsets, and 1.00% reserve calculations.
                </p>
              </div>

              {/* Step UI Snippet */}
              <div className="rounded-lg border border-border/80 bg-muted/40 p-3 text-xs space-y-1.5 font-mono">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <FileText className="size-3.5 text-purple-500" />
                  <span>FBR_Section154A_Pack.csv</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Reserve Total</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">₨34,723 PKR</span>
                </div>
              </div>
            </InteractiveTiltCard>
          </div>
        </div>
      </section>

      {/* 5. TAX CALCULATION WORKED EXAMPLE */}
      <section id="tax-example" className="py-20 md:py-24 border-b border-border bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-16 space-y-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              Worked tax calculation example
            </h2>
            <p className="text-base text-muted-foreground">
              How Earnix deterministically computes your Section 154A IT export reserve.
            </p>
          </div>

          <InteractiveTiltCard maxTilt={1.8} className="rounded-2xl p-6 sm:p-8 shadow-xs space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
              {/* Step 1 */}
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-1 text-center md:text-left">
                <span className="text-[10px] font-mono uppercase text-muted-foreground">1. Upwork Remittance</span>
                <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">$2,500.00</p>
                <p className="text-xs text-muted-foreground">Original USD billing</p>
              </div>

              <div className="text-center font-mono text-xs text-muted-foreground">
                <span className="hidden md:inline">&rarr;</span>
                <span className="md:hidden">&darr;</span>
                <p className="text-[10px] mt-0.5">@ 278.90 PKR</p>
              </div>

              {/* Step 2 */}
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-1 text-center md:text-left">
                <span className="text-[10px] font-mono uppercase text-muted-foreground">2. Bank Gross Inflow</span>
                <p className="text-lg font-bold font-mono text-foreground">₨697,250</p>
                <p className="text-xs text-muted-foreground">Remittance credit</p>
              </div>

              <div className="text-center font-mono text-xs text-muted-foreground">
                <span className="hidden md:inline">&rarr;</span>
                <span className="md:hidden">&darr;</span>
                <p className="text-[10px] mt-0.5">- ₨23,480 costs</p>
              </div>

              {/* Step 3 */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-1 text-center md:text-left">
                <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-semibold">
                  3. 1% Tax Reserve
                </span>
                <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">₨6,973</p>
                <p className="text-xs text-muted-foreground">$25.00 USD set aside</p>
              </div>
            </div>

            {/* Net take-home summary callout */}
            <div className="p-4 rounded-xl border border-border/80 bg-muted/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-muted-foreground">
                  <strong className="text-foreground">Net freelancer take-home:</strong> ₨666,797 after allowable business expenses and 1.00% tax reserve.
                </span>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                Audited &amp; Reconciled
              </span>
            </div>

            {/* Formal Disclaimer */}
            <div className="pt-2 border-t border-border/60 text-center text-xs text-muted-foreground">
              <p>
                Estimates for record-keeping and reserve planning only. Not formal tax or legal advice. Consult your certified tax consultant for final FBR return filing.
              </p>
            </div>
          </InteractiveTiltCard>
        </div>
      </section>

      {/* 6. INTERACTIVE PRODUCT DEMO SECTION */}
      <section id="demo" className="py-20 md:py-24 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-14 space-y-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              Explore the Earnix dashboard
            </h2>
            <p className="text-base text-muted-foreground">
              Click the tabs below to preview real multi-currency ledgers, CSV reconciliations, and tax packs.
            </p>
          </div>

          <InteractiveDashboardDemo />
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section id="faq" className="py-20 md:py-24 border-b border-border bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14 space-y-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              Frequently asked questions
            </h2>
            <p className="text-base text-muted-foreground">
              Everything you need to know about Earnix for freelance bookkeeping.
            </p>
          </div>

          <FaqSection />
        </div>
      </section>

      {/* 8. FINAL CALL TO ACTION BAND */}
      <section className="py-20 md:py-24 border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <Sparkles className="size-3.5" />
            <span>Ready for tax peace of mind?</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
            Stop guessing your freelance tax liability.
          </h2>

          <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Join independent professionals keeping clean dual-currency records, deducting validated expenses, and setting aside exact tax reserves.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base px-8 py-6 shadow-sm gap-2 cursor-pointer w-full sm:w-auto"
              )}
            >
              <span>Start tracking for free</span>
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "font-medium text-base px-8 py-6 border-border hover:bg-muted text-foreground cursor-pointer w-full sm:w-auto"
              )}
            >
              <span>Already have an account? Log in</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 9. EXPANDED FOOTER */}
      <footer className="py-14 bg-background text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Col 1: Brand */}
            <div className="col-span-2 md:col-span-1 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                <div className="flex size-6 items-center justify-center rounded-md bg-emerald-600 text-white">
                  <Sparkles className="size-3.5" />
                </div>
                <span>Earnix</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Bookkeeping and tax-reserve management for international freelancers and consultants.
              </p>
            </div>

            {/* Col 2: Product */}
            <div className="space-y-2.5">
              <p className="font-semibold text-foreground text-xs uppercase tracking-wider font-mono">Product</p>
              <ul className="space-y-2">
                <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="#how-it-works" className="hover:text-foreground transition-colors">How it works</Link></li>
                <li><Link href="#tax-example" className="hover:text-foreground transition-colors">FBR Tax Calculator</Link></li>
                <li><Link href="#demo" className="hover:text-foreground transition-colors">Interactive Demo</Link></li>
              </ul>
            </div>

            {/* Col 3: Tax Regimes */}
            <div className="space-y-2.5">
              <p className="font-semibold text-foreground text-xs uppercase tracking-wider font-mono">Tax Regimes</p>
              <ul className="space-y-2">
                <li><span className="text-muted-foreground">Pakistan Section 154A (1%)</span></li>
                <li><span className="text-muted-foreground">US IRS Self-Employment</span></li>
                <li><span className="text-muted-foreground">UK HMRC Sole Trader</span></li>
                <li><span className="text-muted-foreground">Custom Regional Rates</span></li>
              </ul>
            </div>

            {/* Col 4: Legal & Auth */}
            <div className="space-y-2.5">
              <p className="font-semibold text-foreground text-xs uppercase tracking-wider font-mono">Access &amp; Security</p>
              <ul className="space-y-2">
                <li><Link href="/login" className="hover:text-foreground font-medium text-foreground transition-colors">Log in</Link></li>
                <li><Link href="/signup" className="hover:text-foreground font-medium text-emerald-600 dark:text-emerald-400 transition-colors">Sign up</Link></li>
                <li><span className="text-muted-foreground">PostgreSQL RLS Protected</span></li>
                <li><span className="text-muted-foreground">Encrypted Document Vault</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>
              Earnix &copy; 2026. Financial recordkeeping and tax-reserve planning for freelancers.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/login" className="hover:text-foreground transition-colors">Log in</Link>
              <Link href="/signup" className="hover:text-foreground transition-colors">Sign up</Link>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">WCAG AA Compliant</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
