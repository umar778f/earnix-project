import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Sparkles,
  CheckCircle2,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Coins,
  FileSpreadsheet,
  Calculator,
  Smartphone,
  LineChart,
  Lock,
  TrendingUp,
  Receipt,
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-primary/20">
      {/* 1. TOP NAVBAR (Mirroring Economizzer Navbar) */}
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Brand Logo */}
          <Link
            href="#home"
            className="flex items-center gap-2.5 font-bold text-lg tracking-tight text-foreground hover:opacity-90 transition-opacity"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
              <Sparkles className="size-4" />
            </div>
            <span className="font-extrabold text-xl tracking-tight">Earnix<span className="text-emerald-500">.org</span></span>
          </Link>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="#home" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="#features" className="hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#dashboards" className="hover:text-foreground transition-colors">
              Dashboards
            </Link>
            <Link href="#tax" className="hover:text-foreground transition-colors">
              Tax Engine
            </Link>
            <Link href="#contact" className="hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>

          {/* Auth Action Buttons */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-xs font-semibold gap-1.5 hover:bg-muted"
              )}
            >
              <LogIn className="size-3.5" />
              <span>Enter here</span>
            </Link>
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
              )}
            >
              <UserPlus className="size-3.5" />
              <span>Create your account</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION (#home - Exactly like Economizzer layout) */}
      <section id="home" className="relative border-b border-border/60 bg-muted/30 py-12 md:py-20 lg:py-24 overflow-hidden">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center md:text-left mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-3">
              <Sparkles className="size-3.5" />
              <span>Open Source Freelance Financial &amp; Tax Operations Platform</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-foreground">
              Smart Freelancer Income &amp; Tax Manager
            </h1>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">
            {/* Left Column: Graphical Interface Mockup Preview */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="relative mx-auto rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xl space-y-5">
                {/* Simulated Dashboard Header */}
                <div className="flex items-center justify-between border-b border-border/80 pb-4">
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                      Deterministic Dual-Ledger
                    </p>
                    <h3 className="text-base font-bold text-foreground">
                      Financial Snapshot
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Verified Live
                  </span>
                </div>

                {/* Simulated KPI Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 space-y-1">
                    <p className="text-xs text-muted-foreground">Gross Freelance Inflow</p>
                    <p className="text-lg font-bold text-foreground font-mono">$12,450.00</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      ₨3,472,325 @ 278.90 PKR
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 space-y-1">
                    <p className="text-xs text-muted-foreground">1% Tax Reserve (FBR 154A)</p>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">$124.50</p>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      100% Receipt Backed
                    </p>
                  </div>
                </div>

                {/* Simulated Income Velocity Bar */}
                <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <TrendingUp className="size-3.5 text-emerald-500" />
                      Monthly Trajectory (Upwork &amp; Direct)
                    </span>
                    <span className="text-muted-foreground font-mono text-[11px]">+18.4% vs last month</span>
                  </div>
                  <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "72%" }} />
                  </div>
                </div>

                {/* Simulated Recent Ingested Transactions */}
                <div className="space-y-2 pt-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Recent Dual-Currency Records
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-muted/40">
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-[10px]">
                          UP
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Upwork Escrow Milestone</p>
                          <p className="text-[10px] text-muted-foreground">Full-Stack Development</p>
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">+$2,500.00</p>
                        <p className="text-[10px] text-muted-foreground">₨697,250</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-muted/40">
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                          AWS
                        </div>
                        <div>
                          <p className="font-medium text-foreground">AWS Cloud Infrastructure</p>
                          <p className="text-[10px] text-muted-foreground">Allowable Tax Deduction</p>
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <p className="font-semibold text-foreground">-$84.20</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Receipt Attached</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Tagline, Bullets, and Economizzer CTA Buttons */}
            <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
              <p className="text-lg sm:text-xl text-muted-foreground italic leading-relaxed">
                An easy, grounded, and secure system for freelancers to manage multi-currency earnings, track business expenses, and calculate tax reserves on your computer, tablet, or smartphone.
              </p>

              {/* Bullet Points */}
              <ul className="space-y-3.5 text-sm sm:text-base text-foreground/90">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Much more complete than spreadsheets:</strong> Dual-ledger accounting without floating-point math errors.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Know where your money goes:</strong> Identify highest-earning clients and tax-deductible operational costs.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Various analytical graphs to help you:</strong> Monthly velocity, platform distribution, and currency exposures.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Automated Statement Ingestion:</strong> Drag-and-drop Upwork and generic bank CSV statements in seconds.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Tax-Ready Calculations:</strong> Automated 1.00% IT export reserve (FBR 154A), IRS, or HMRC sole trader baselines.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Use anywhere, anytime, on any device:</strong> High-performance responsive web application.</span>
                </li>
              </ul>

              {/* Economizzer-Style Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link
                  href="/signup"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base px-7 py-6 shadow-md gap-2 cursor-pointer text-center justify-center"
                  )}
                >
                  <UserPlus className="size-5" />
                  <span>Create your account</span>
                </Link>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "font-semibold text-base px-7 py-6 border-border hover:bg-muted gap-2 cursor-pointer text-center justify-center"
                  )}
                >
                  <LogIn className="size-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Enter here</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION (#features - Matching Economizzer grid) */}
      <section id="features" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
              Features
            </h2>
            <p className="text-base text-muted-foreground">
              Everything independent contractors and freelancers need to manage income streams, control deductible expenses, and prepare for tax season with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: Graphical Interface */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all space-y-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Smartphone className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Graphical Interface</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Responsive, accessible interface crafted with modern Tailwind CSS that looks crisp and operates fast on desktops, laptops, tablets, and smartphones.
              </p>
            </div>

            {/* Feature 2: Dashboards */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all space-y-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <LineChart className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Analytical Dashboards</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Various analytical graphs, cashflow velocity, currency exposure breakdowns, and client concentration ratios to help you better conduct your finances.
              </p>
            </div>

            {/* Feature 3: Simplicity */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all space-y-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <LayoutDashboard className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Simplicity &amp; Speed</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Designed to be fast, keyboard-accessible, and straightforward. No unnecessary accounting bloat—just clear records, client milestones, and receipts.
              </p>
            </div>

            {/* Feature 4: Multi-Currency Conversions */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all space-y-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Coins className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Dual-Currency Accounting</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Records original contract currency (USD, EUR, GBP, AED) alongside converted base currency using exact historical exchange rates with zero rounding drift.
              </p>
            </div>

            {/* Feature 5: Statement Ingestion */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all space-y-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <FileSpreadsheet className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Statement Ingestion</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Import CSV statements from Upwork, payment gateways, and bank invoices. Features smart column detection and automatic duplicate prevention.
              </p>
            </div>

            {/* Feature 6: Tax-Ready Records */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all space-y-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Calculator className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Tax-Ready Estimates</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Calculates your estimated freelance tax reserves under Section 154A (1.00% IT export benchmark), IRS self-employment, or HMRC sole trader rules with receipt proof.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DASHBOARD SHOWCASE SECTION (#dashboards) */}
      <section id="dashboards" className="py-16 md:py-24 bg-muted/20 border-y border-border/60">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
              Powerful Dashboards &amp; Ledger Control
            </h2>
            <p className="text-base text-muted-foreground">
              Get an instant high-level overview or drill down into individual payment vouchers, client contracts, and expense deductions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                  <TrendingUp className="size-5" />
                </div>
                <h4 className="font-bold text-foreground">Income Velocity</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Visualizes your 6-month earnings trajectory across platforms with dual-value conversions and deterministic aggregations.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 space-y-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                  <Receipt className="size-5" />
                </div>
                <h4 className="font-bold text-foreground">Receipt Vault</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Upload and substantiates tax-deductible expense receipts in a private, encrypted storage bucket strictly isolated to your user ID.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 space-y-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
                  <Sparkles className="size-5" />
                </div>
                <h4 className="font-bold text-foreground">Grounded Copilot</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Ask questions about your revenue, client milestones, and tax liability with zero AI hallucination—all answers are calculated from your ledger.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TAX ENGINE SECTION (#tax) */}
      <section id="tax" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-12 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <Calculator className="size-3.5" />
                  <span>Deterministic Accounting Engine</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  Audit-Ready Tax Preparation
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Earnix implements a rigorous 5-step fiscal workflow:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>1. Gross Inflow:</strong> Daily exchange rate conversions</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>2. Deductible Costs:</strong> Validated operational expenses</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>3. Net Taxable Income:</strong> Decimal.js precision math</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>4. Jurisdiction Rules:</strong> FBR 1%, IRS, HMRC baselines</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>5. WHT Offsets:</strong> Withheld banking tax credits applied</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Receipt Ratio:</strong> Proof coverage check for audits</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-muted/40 rounded-2xl border border-border p-6 text-center space-y-4">
                <Lock className="size-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-foreground">Data Privacy by Architecture</h4>
                <p className="text-xs text-muted-foreground">
                  Each freelancer’s transactions, receipts, and clients are strictly partitioned using PostgreSQL Row Level Security (RLS). No other user can ever view or access your financial records.
                </p>
                <Link
                  href="/signup"
                  className={cn(
                    buttonVariants({ size: "default" }),
                    "w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-5"
                  )}
                >
                  Create your account &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER (Just like Economizzer bottom) */}
      <section className="py-16 bg-emerald-600 text-white">
        <div className="container mx-auto max-w-4xl px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to organize your freelance finances?
          </h2>
          <p className="text-emerald-100 text-base sm:text-lg max-w-2xl mx-auto">
            Join independent professionals managing foreign client earnings, deducting verified business expenses, and preparing tax reserves with precision.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-base px-8 py-6 shadow-lg gap-2 cursor-pointer w-full sm:w-auto"
              )}
            >
              <UserPlus className="size-5 text-emerald-700" />
              <span>Create your account</span>
            </Link>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-white/40 text-white hover:bg-white/10 font-bold text-base px-8 py-6 gap-2 cursor-pointer w-full sm:w-auto"
              )}
            >
              <LogIn className="size-5" />
              <span>Enter here</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. CONTACT & FOOTER SECTION (#contact - Matching Economizzer) */}
      <footer id="contact" className="border-t border-border bg-background py-12 text-sm text-muted-foreground">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Col 1: Brand */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2 font-bold text-base text-foreground">
                <div className="flex size-6 items-center justify-center rounded-md bg-emerald-600 text-white">
                  <Sparkles className="size-3.5" />
                </div>
                <span>Earnix.org</span>
              </div>
              <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                Open Source Freelancer Financial Management &amp; Tax Preparation Platform. Powered by Next.js, Supabase, PostgreSQL Row Level Security, and high-precision financial arithmetic.
              </p>
            </div>

            {/* Col 2: Navigation */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">Navigation</p>
              <ul className="space-y-1.5 text-xs">
                <li><Link href="#home" className="hover:text-foreground">Home</Link></li>
                <li><Link href="#features" className="hover:text-foreground">Features</Link></li>
                <li><Link href="#dashboards" className="hover:text-foreground">Dashboards</Link></li>
                <li><Link href="#tax" className="hover:text-foreground">Tax Engine</Link></li>
              </ul>
            </div>

            {/* Col 3: Access */}
            <div className="space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">Access</p>
              <ul className="space-y-1.5 text-xs">
                <li><Link href="/login" className="hover:text-foreground font-medium text-emerald-600 dark:text-emerald-400">Enter here (Login)</Link></li>
                <li><Link href="/signup" className="hover:text-foreground font-medium text-emerald-600 dark:text-emerald-400">Create your account</Link></li>
                <li><Link href="/forgot-password" className="hover:text-foreground">Reset Password</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>
              Earnix.org &copy; 2026 — Open Source Freelancer Personal Finance Manager. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/login" className="hover:text-foreground">Sign In</Link>
              <span>&bull;</span>
              <Link href="/signup" className="hover:text-foreground">Register</Link>
              <span>&bull;</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">PostgreSQL RLS Protected</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
