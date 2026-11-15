"use client"

import * as React from "react"

export default function RootGlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error("Critical root global error caught:", error?.digest || error?.message)
  }, [error])

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-zinc-100 p-4 font-sans">
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center space-y-6 shadow-2xl">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
            <svg
              className="size-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-50">
              Application Error
            </h1>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Earnix encountered a critical initialization error. Please refresh or try again.
            </p>
            {error?.digest && (
              <p className="font-mono text-[11px] text-zinc-500 bg-zinc-950/80 rounded px-2 py-0.5 inline-block border border-zinc-800">
                Digest: {error.digest}
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={() => reset()}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
            >
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
