import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { InteractiveTiltCard } from "@/components/ui/interactive-tilt-card"
import {
  Sparkles,
  Check,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Coins,
  FileSpreadsheet,
  Calculator,
  ShieldCheck,
  Smartphone,
  ArrowRight,
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-muted">
      {/* 1. TOP NAVIGATION */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-xs">
        <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-foreground tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
          >
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <Sparkles className="size-4" />
            </div>
            <span className="text-base font-bold">Earnix</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm text-muted-foreground font-medium">
            <Link href="#features" className="hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="hover:text-foreground transition-colors">
              How it works
            </Link>
            <Link href="#tax-engine" className="hover:text-foreground transition-colors">
              Tax calculation
            </Link>
          </nav>

          {/* Auth Action Buttons with Clear Hierarchy */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "text-xs font-semibold gap-1.5 shadow-xs"
              )}
            >
              <LogIn className="size-3.5" />
              <span>Enter here</span>
            </Link>
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "text-xs font-medium gap-1.5 hidden sm:inline-flex"
              )}
            >
              <UserPlus className="size-3.5" />
              <span>Create account</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="py-12 md:py-20 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Interactive 3D Product Snapshot */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <InteractiveTiltCard className="space-y-4">
                {/* Header bar */}
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <div>
                    <h3 className="text-xs font-semibold text-foreground">
                      Financial snapshot
                    </h3>
                    <p className="text-[11px] text-muted-foreground">Dual-ledger accounting</p>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border/60">
                    Active
                  </span>
                </div>

                {/* 3 KPI Numbers matching Dashboard MetricsGrid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-border/80 bg-muted/40 p-3 space-y-0.5">
                    <p className="text-[11px] text-muted-foreground">Gross income</p>
                    <p className="text-base font-bold text-foreground font-mono">
                      $12,450.00
                    </p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                      ₨3,472,325
                    </p>
                  </div>

                  <div className="rounded-lg border border-border/80 bg-muted/40 p-3 space-y-0.5">
                    <p className="text-[11px] text-muted-foreground">Expenses</p>
                    <p className="text-base font-bold text-foreground font-mono">
                      $1,280.00
                    </p>
                    <p className="text-[10px] text-muted-foreground">100% receipts</p>
                  </div>

                  <div className="rounded-lg border border-border/80 bg-muted/40 p-3 space-y-0.5">
                    <p className="text-[11px] text-muted-foreground">Tax reserve (1%)</p>
                    <p className="text-base font-bold text-foreground font-mono">
                      $124.50
                    </p>
                    <p className="text-[10px] text-muted-foreground">Section 154A</p>
                  </div>
                </div>

                {/* Simulated Ledger Records */}
                <div className="pt-2 space-y-2">
                  <p className="text-[11px] font-medium text-muted-foreground">Recent ledger records</p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-muted/30">
                      <div>
                        <p className="font-medium text-foreground">Upwork milestone payment</p>
                        <p className="text-[11px] text-muted-foreground">Full-stack development</p>
                      </div>
                      <div className="text-right font-mono">
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">+$2,500.00</p>
                        <p className="text-[10px] text-muted-foreground">₨697,250</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-muted/30">
                      <div>
                        <p className="font-medium text-foreground">Cloud infrastructure</p>
                        <p className="text-[11px] text-muted-foreground">Operational deduction</p>
                      </div>
                      <div className="text-right font-mono">
                        <p className="font-semibold text-foreground">-$84.20</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Receipt attached</p>
                      </div>
                    </div>
                  </div>
                </div>
              </InteractiveTiltCard>
            </div>

            {/* Right Column: Hero Copy & Clear Dual Action Cards */}
            <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground border border-border/60">
                  <Sparkles className="size-3.5 text-foreground" />
                  <span>Freelance Income &amp; Tax Operations</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground leading-tight">
                  Financial records and tax estimates for freelancers.
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Track international client income, record deductible business expenses, and calculate tax reserves on any device.
                </p>
              </div>

              {/* Bullet Points */}
              <ul className="space-y-2 text-xs sm:text-sm text-foreground">
                <li className="flex items-start gap-2.5">
                  <Check className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Dual-ledger tracking with original foreign currencies and daily converted values.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>CSV statement imports for Upwork and standard bank accounts.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Receipt attachment and proof tracking for deductible business costs.</span>
                </li>
              </ul>

              {/* High-Clarity Dual Authentication Block */}
              <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-3">
                {/* Option 1: Returning users (Primary Action) */}
                <div className="space-y-1">
                  <Link
                    href="/login"
                    className={cn(
                      buttonVariants({ variant: "default", size: "default" }),
                      "w-full justify-between h-11 px-4 font-semibold text-sm shadow-xs cursor-pointer"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <LogIn className="size-4" />
                      <span>Enter here</span>
                    </span>
                    <span className="text-xs font-normal opacity-85 flex items-center gap-1">
                      Already have an account?
                      <ArrowRight className="size-3.5" />
                    </span>
                  </Link>
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-border/60" />
                  <span className="flex-shrink mx-3 text-[11px] text-muted-foreground uppercase font-mono">or</span>
                  <div className="flex-grow border-t border-border/60" />
                </div>

                {/* Option 2: New users (Secondary Action) */}
                <div className="space-y-1">
                  <Link
                    href="/signup"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "default" }),
                      "w-full justify-between h-11 px-4 font-medium text-sm hover:bg-muted cursor-pointer"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <UserPlus className="size-4" />
                      <span>Create your account</span>
                    </span>
                    <span className="text-xs text-muted-foreground font-normal flex items-center gap-1">
                      New here?
                      <ArrowRight className="size-3.5" />
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES */}
      <section id="features" className="py-14 md:py-20 border-b border-border bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-12 space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Features
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Accounting tools designed for independent contractors and consultants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Feature 1 */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Smartphone className="size-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                Responsive interface
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Clean, keyboard-accessible design that runs fast on desktops, laptops, tablets, and phones.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <LayoutDashboard className="size-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                Financial dashboards
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Charts showing monthly earnings velocity, client distribution, and deductible costs.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Coins className="size-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                Multi-currency ledger
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Store original contract values in USD, EUR, or GBP alongside your local reporting currency.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileSpreadsheet className="size-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                CSV statement imports
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Upload Upwork transaction histories or standard bank CSV files with duplicate detection.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Calculator className="size-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                Tax reserve estimates
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Deterministic calculation of estimated tax reserves with receipt substantiation tracking.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="size-4" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                Data isolation
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every record is strictly isolated per account with PostgreSQL Row Level Security.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="py-14 md:py-20 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              How it works
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Three steps to organize your records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-2">
              <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border/60">
                Step 1
              </span>
              <h3 className="text-sm font-semibold text-foreground pt-1">
                Create an account
              </h3>
              <p className="text-xs text-muted-foreground">
                Register with your email and select your preferred display currency.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-2">
              <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border/60">
                Step 2
              </span>
              <h3 className="text-sm font-semibold text-foreground pt-1">
                Record or import
              </h3>
              <p className="text-xs text-muted-foreground">
                Log earnings manually or drag-and-drop Upwork and bank CSV statements.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-2">
              <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border/60">
                Step 3
              </span>
              <h3 className="text-sm font-semibold text-foreground pt-1">
                Track and file
              </h3>
              <p className="text-xs text-muted-foreground">
                View net profits, deduct valid expenses, and export tax reports for filing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TAX ENGINE SECTION */}
      <section id="tax-engine" className="py-14 md:py-20 border-b border-border bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                Tax calculation method
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Earnix computes tax estimates using strict decimal arithmetic:
              </p>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm text-foreground">
              <p className="flex items-start gap-2">
                <span className="font-mono text-xs text-muted-foreground shrink-0 mt-0.5">1.</span>
                <span><strong>Gross inflow:</strong> Aggregates payments in original currencies and converts them at payment date rates.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-mono text-xs text-muted-foreground shrink-0 mt-0.5">2.</span>
                <span><strong>Deductible expenses:</strong> Substantiated operational costs reduce your net taxable income.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-mono text-xs text-muted-foreground shrink-0 mt-0.5">3.</span>
                <span><strong>Net taxable income:</strong> Gross earnings minus verified deductible expenses.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-mono text-xs text-muted-foreground shrink-0 mt-0.5">4.</span>
                <span><strong>Regime benchmark:</strong> Applies Pakistan Section 154A (1%), US self-employment, or UK HMRC rates.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-mono text-xs text-muted-foreground shrink-0 mt-0.5">5.</span>
                <span><strong>Withholding tax credits:</strong> Pre-deducted bank taxes are credited against the estimate.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="py-14 border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Manage your freelance finances
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            Organize foreign client payments, deductible expenses, and tax records in one place.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "default", size: "default" }), "w-full sm:w-auto font-semibold gap-2")}
            >
              <LogIn className="size-4" />
              <span>Enter here</span>
            </Link>
            <Link
              href="/signup"
              className={cn(buttonVariants({ variant: "outline", size: "default" }), "w-full sm:w-auto font-medium gap-2")}
            >
              <UserPlus className="size-4" />
              <span>Create an account</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="py-8 bg-background text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            Earnix &copy; 2026. Financial recordkeeping for freelancers.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/login" className="hover:text-foreground transition-colors font-medium text-foreground">
              Enter here
            </Link>
            <Link href="/signup" className="hover:text-foreground transition-colors">
              Create account
            </Link>
            <Link href="/forgot-password" className="hover:text-foreground transition-colors">
              Reset password
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
