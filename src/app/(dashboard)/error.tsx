"use client"

import * as React from "react"
import Link from "next/link"
import { AlertCircle, RefreshCw, LayoutDashboard } from "lucide-react"

export default function DashboardErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    // Log safe error digest for operational observability
    console.error("Dashboard error boundary caught:", error?.digest || error?.message)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-8 text-foreground">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8 text-center space-y-6">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive shadow-xs">
          <AlertCircle className="size-6" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
            Unable to load dashboard data
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            We encountered a temporary issue while fetching your records. No changes were made to your ledger.
          </p>
          {error?.digest && (
            <p className="font-mono text-[11px] text-muted-foreground/70 bg-muted/50 rounded px-2 py-0.5 inline-block">
              Incident ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RefreshCw className="size-3.5" />
            <span>Try Again</span>
          </button>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LayoutDashboard className="size-3.5" />
            <span>Overview</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
