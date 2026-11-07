import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
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
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
      {/* 1. CLEAN TOP NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-6">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-2.5 font-semibold text-slate-900 dark:text-white"
          >
            <div className="flex size-7 items-center justify-center rounded-md bg-teal-600 text-white">
              <Sparkles className="size-4" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Earnix<span className="text-teal-600 dark:text-teal-400">.org</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-600 dark:text-slate-400">
            <Link href="#home" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Home
            </Link>
            <Link href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              How it works
            </Link>
            <Link href="#tax-engine" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Tax engine
            </Link>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <LogIn className="size-4 mr-1.5" />
              <span>Enter here</span>
            </Link>
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ size: "sm" }),
                "text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
              )}
            >
              <UserPlus className="size-4 mr-1.5" />
              <span>Create account</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section id="home" className="py-16 md:py-24 border-b border-slate-200/70 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Quiet, Crisp Product Preview */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                {/* Header bar */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Financial overview
                    </h3>
                    <p className="text-xs text-slate-500">Dual-ledger accounting</p>
                  </div>
                  <span className="text-xs font-medium text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-200/60 dark:border-teal-800">
                    Live ledger
                  </span>
                </div>

                {/* 3 Quiet KPI Numbers */}
                <div className="grid grid-cols-3 gap-4 py-5 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-xs text-slate-500">Gross income</p>
                    <p className="text-base font-semibold text-slate-900 dark:text-white font-mono mt-0.5">
                      $12,450
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">₨3.47M</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Expenses</p>
                    <p className="text-base font-semibold text-slate-900 dark:text-white font-mono mt-0.5">
                      $1,280
                    </p>
                    <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">100% receipts</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Tax reserve (1%)</p>
                    <p className="text-base font-semibold text-teal-600 dark:text-teal-400 font-mono mt-0.5">
                      $124.50
                    </p>
                    <p className="text-[11px] text-slate-400">Section 154A</p>
                  </div>
                </div>

                {/* Clean Ledger Records snippet */}
                <div className="pt-4 space-y-2.5">
                  <p className="text-xs font-medium text-slate-500">Recent records</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">Upwork milestone</p>
                        <p className="text-[11px] text-slate-400">Web application contract</p>
                      </div>
                      <div className="text-right font-mono">
                        <p className="font-semibold text-teal-600 dark:text-teal-400">+$2,500.00</p>
                        <p className="text-[10px] text-slate-400">₨697,250</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">Cloud hosting &amp; tools</p>
                        <p className="text-[11px] text-slate-400">Tax deductible expense</p>
                      </div>
                      <div className="text-right font-mono">
                        <p className="font-semibold text-slate-700 dark:text-slate-300">-$84.20</p>
                        <p className="text-[10px] text-slate-400">Verified</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Clean Typography & Restrained Content */}
            <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                  Personal and freelance finance, without spreadsheet chaos.
                </h1>
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                  An easy, secure system to track multi-currency income, deduct business expenses, and calculate tax reserves on any device.
                </p>
              </div>

              {/* Simple, un-hyped bullet list */}
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-3">
                  <div className="size-5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="size-3" />
                  </div>
                  <span>More reliable than spreadsheets: dual-ledger accounting without math drift.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="size-5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="size-3" />
                  </div>
                  <span>Know where your money goes and what qualifies as a deductible expense.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="size-5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="size-3" />
                  </div>
                  <span>Automated statement ingestion for Upwork and standard bank CSV exports.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="size-5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="size-3" />
                  </div>
                  <span>Automatic tax reserve estimates for IT exporters (FBR 154A 1%), IRS, or HMRC.</span>
                </li>
              </ul>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/signup"
                  className={cn(
                    buttonVariants({ size: "default" }),
                    "bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-2.5 shadow-xs"
                  )}
                >
                  <UserPlus className="size-4 mr-2" />
                  <span>Create your account</span>
                </Link>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "default" }),
                    "border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 px-6 py-2.5"
                  )}
                >
                  <LogIn className="size-4 mr-2" />
                  <span>Enter here</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES (Clean, disciplined 6-grid like Economizzer) */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900/60">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-16 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Features
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Straightforward tools designed for independent contractors, consultants, and remote workers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="space-y-3 p-5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
              <div className="size-10 rounded-lg bg-teal-100/80 dark:bg-teal-950 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                <Smartphone className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Responsive interface
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Clean and fast on laptops, tablets, and smartphones without unnecessary UI noise.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="space-y-3 p-5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
              <div className="size-10 rounded-lg bg-teal-100/80 dark:bg-teal-950 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                <LayoutDashboard className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Financial dashboards
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Clear charts for monthly income velocity, client distribution, and deductible spending.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="space-y-3 p-5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
              <div className="size-10 rounded-lg bg-teal-100/80 dark:bg-teal-950 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                <Coins className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Multi-currency ledger
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Store original contract amounts in USD, EUR, or GBP alongside converted local currency.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="space-y-3 p-5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
              <div className="size-10 rounded-lg bg-teal-100/80 dark:bg-teal-950 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                <FileSpreadsheet className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                CSV statement import
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Upload Upwork transaction histories or generic bank CSV files with duplicate detection.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="space-y-3 p-5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
              <div className="size-10 rounded-lg bg-teal-100/80 dark:bg-teal-950 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                <Calculator className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Tax-ready estimates
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Deterministic calculation of estimated tax reserves with receipt substantiation tracking.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="space-y-3 p-5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
              <div className="size-10 rounded-lg bg-teal-100/80 dark:bg-teal-950 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                <ShieldCheck className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Data isolation
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Every record is strictly isolated per account with PostgreSQL Row Level Security (RLS).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (Quiet, readable 3-step sequence) */}
      <section id="how-it-works" className="py-20 border-t border-slate-200/70 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              How it works
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Get started in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2.5 text-center md:text-left">
              <span className="text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-100/80 dark:bg-teal-950 px-2.5 py-1 rounded">
                Step 1
              </span>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white pt-1">
                Create your account
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Register in seconds with email and password to start your private ledger.
              </p>
            </div>

            <div className="space-y-2.5 text-center md:text-left">
              <span className="text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-100/80 dark:bg-teal-950 px-2.5 py-1 rounded">
                Step 2
              </span>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white pt-1">
                Record or import
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Log earnings manually or drag-and-drop Upwork and bank CSV statements.
              </p>
            </div>

            <div className="space-y-2.5 text-center md:text-left">
              <span className="text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-100/80 dark:bg-teal-950 px-2.5 py-1 rounded">
                Step 3
              </span>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white pt-1">
                Track and file
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                View net profits, deduct valid expenses, and export tax reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TAX ENGINE SECTION */}
      <section id="tax-engine" className="py-20 border-t border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-6">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Deterministic tax calculation
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Earnix estimates taxes using strict decimal arithmetic rather than estimates or guesswork:
            </p>
            <div className="space-y-3 pt-2 text-sm text-slate-700 dark:text-slate-300">
              <p className="flex items-start gap-2.5">
                <span className="font-semibold text-teal-600">1.</span>
                <span><strong>Gross inflow:</strong> Converted at verified daily exchange rates without rounding error.</span>
              </p>
              <p className="flex items-start gap-2.5">
                <span className="font-semibold text-teal-600">2.</span>
                <span><strong>Deductible expenses:</strong> Operational costs (software, hardware, cloud) reduce taxable income.</span>
              </p>
              <p className="flex items-start gap-2.5">
                <span className="font-semibold text-teal-600">3.</span>
                <span><strong>Net taxable income:</strong> Gross income minus verified deductible expenses.</span>
              </p>
              <p className="flex items-start gap-2.5">
                <span className="font-semibold text-teal-600">4.</span>
                <span><strong>Regime benchmark:</strong> 1.00% IT export reserve (FBR 154A), IRS self-employment, or HMRC.</span>
              </p>
              <p className="flex items-start gap-2.5">
                <span className="font-semibold text-teal-600">5.</span>
                <span><strong>Withholding tax credits:</strong> Pre-deducted bank taxes offset directly against liability.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="py-16 bg-teal-700 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Ready to organize your freelance finances?
          </h2>
          <p className="text-teal-100 text-sm sm:text-base max-w-xl mx-auto">
            Take control of your client earnings, deductible expenses, and tax records.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ size: "default" }),
                "bg-white hover:bg-slate-100 text-teal-800 font-semibold px-6 py-2.5 shadow-sm"
              )}
            >
              <UserPlus className="size-4 mr-2 text-teal-700" />
              <span>Create your account</span>
            </Link>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "outline", size: "default" }),
                "border-white/40 text-white hover:bg-white/10 font-medium px-6 py-2.5"
              )}
            >
              <LogIn className="size-4 mr-2" />
              <span>Enter here</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. QUIET FOOTER */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 py-10 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            Earnix.org &copy; 2026 — Personal finance manager for freelancers.
          </p>
          <div className="flex items-center gap-6 text-slate-600 dark:text-slate-400">
            <Link href="/login" className="hover:text-slate-900 dark:hover:text-white">
              Enter here
            </Link>
            <Link href="/signup" className="hover:text-slate-900 dark:hover:text-white">
              Create account
            </Link>
            <Link href="/forgot-password" className="hover:text-slate-900 dark:hover:text-white">
              Reset password
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
