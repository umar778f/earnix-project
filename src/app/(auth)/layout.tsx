import Link from "next/link"
import { Sparkles } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-muted/20 px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Bar with Brand & Theme Toggle */}
      <header className="flex items-center justify-between max-w-5xl w-full mx-auto">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-foreground tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
        >
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
            <Sparkles className="size-4" />
          </div>
          <span className="text-base font-bold">Earnix</span>
          <span className="text-[10px] font-mono uppercase bg-muted text-muted-foreground px-1.5 py-0.5 rounded border border-border">
            FYP
          </span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Auth Form Container */}
      <main className="flex-1 flex items-center justify-center py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-muted-foreground/80 py-4 max-w-md mx-auto">
        <p>
          Earnix &copy; 2026 — Freelancer Financial Recordkeeping Platform
        </p>
      </footer>
    </div>
  )
}
