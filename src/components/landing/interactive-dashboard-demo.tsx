"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { InteractiveTiltCard } from "@/components/ui/interactive-tilt-card"
import {
  Coins,
  FileSpreadsheet,
  Calculator,
  Sparkles,
  CheckCircle2,
  Download,
} from "lucide-react"

type DemoTab = "ledger" | "importer" | "tax" | "copilot"

export function InteractiveDashboardDemo() {
  const [activeTab, setActiveTab] = React.useState<DemoTab>("ledger")

  return (
    <InteractiveTiltCard
      maxTilt={1.8}
      className="p-0 rounded-2xl border-border bg-card shadow-sm overflow-hidden"
    >
      {/* Tab Navigation Header */}
      <div className="flex border-b border-border bg-muted/30 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("ledger")}
          className={cn(
            "flex items-center gap-2 px-5 py-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors",
            activeTab === "ledger"
              ? "border-emerald-500 text-foreground bg-card"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <Coins className="size-4 text-emerald-500" />
          <span>Dual-Currency Ledger</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("importer")}
          className={cn(
            "flex items-center gap-2 px-5 py-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors",
            activeTab === "importer"
              ? "border-emerald-500 text-foreground bg-card"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <FileSpreadsheet className="size-4 text-blue-500" />
          <span>Upwork CSV Importer</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tax")}
          className={cn(
            "flex items-center gap-2 px-5 py-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors",
            activeTab === "tax"
              ? "border-emerald-500 text-foreground bg-card"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <Calculator className="size-4 text-purple-500" />
          <span>FBR Section 154A Tax Pack</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("copilot")}
          className={cn(
            "flex items-center gap-2 px-5 py-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors",
            activeTab === "copilot"
              ? "border-emerald-500 text-foreground bg-card"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <Sparkles className="size-4 text-amber-500" />
          <span>AI Ledger Copilot</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-5 sm:p-6 min-h-[380px] flex flex-col justify-center">
        {/* TAB 1: DUAL-CURRENCY LEDGER */}
        {activeTab === "ledger" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Verified Payment Entries
                </h4>
                <p className="text-xs text-muted-foreground">
                  Dual-entry records converting original contract currency to PKR at payment-date bank rates
                </p>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded border border-border/60 self-start sm:self-auto">
                Base Currency: PKR (₨)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="py-2 px-3 font-medium">Date</th>
                    <th className="py-2 px-3 font-medium">Platform / Client</th>
                    <th className="py-2 px-3 font-medium">Original Amount</th>
                    <th className="py-2 px-3 font-medium">Exchange Rate</th>
                    <th className="py-2 px-3 font-medium text-right">PKR Equivalent</th>
                    <th className="py-2 px-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-mono">
                  <tr className="hover:bg-muted/30">
                    <td className="py-2.5 px-3 text-muted-foreground font-sans">2026-03-28</td>
                    <td className="py-2.5 px-3 font-sans font-medium text-foreground">Upwork Escrow Milestone</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">$2,500.00 USD</td>
                    <td className="py-2.5 px-3 text-muted-foreground">278.90 PKR</td>
                    <td className="py-2.5 px-3 text-right font-bold text-foreground">₨697,250</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-sans">
                        <CheckCircle2 className="size-3" />
                        Verified
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td className="py-2.5 px-3 text-muted-foreground font-sans">2026-03-24</td>
                    <td className="py-2.5 px-3 font-sans font-medium text-foreground">Direct Client Wire (London)</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">£1,200.00 GBP</td>
                    <td className="py-2.5 px-3 text-muted-foreground">354.20 PKR</td>
                    <td className="py-2.5 px-3 text-right font-bold text-foreground">₨425,040</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-sans">
                        <CheckCircle2 className="size-3" />
                        Verified
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/30">
                    <td className="py-2.5 px-3 text-muted-foreground font-sans">2026-03-18</td>
                    <td className="py-2.5 px-3 font-sans font-medium text-foreground">Upwork Hourly Contract</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">$1,450.00 USD</td>
                    <td className="py-2.5 px-3 text-muted-foreground">278.75 PKR</td>
                    <td className="py-2.5 px-3 text-right font-bold text-foreground">₨404,188</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-sans">
                        <CheckCircle2 className="size-3" />
                        Verified
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40">
              <span>Arbitrary-precision arithmetic (Decimal.js): Zero floating-point rounding loss.</span>
              <span className="font-semibold text-foreground">Quarterly Inflow: ₨1,526,478</span>
            </div>
          </div>
        )}

        {/* TAB 2: UPWORK CSV IMPORTER */}
        {activeTab === "importer" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Upwork Statement Reconciliation
                </h4>
                <p className="text-xs text-muted-foreground">
                  Automatic separation of gross client billings, Upwork 10% platform fees, and net withdrawals
                </p>
              </div>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded">
                Statement Parsed: 9 Rows
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
                <p className="text-[11px] text-muted-foreground">Gross Freelance Inflow</p>
                <p className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">+$3,950.00 USD</p>
                <p className="text-[10px] text-muted-foreground">4 Payment Milestones</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
                <p className="text-[11px] text-muted-foreground">Upwork Service Fees (Deductible)</p>
                <p className="text-base font-bold font-mono text-amber-600 dark:text-amber-400">-$395.00 USD</p>
                <p className="text-[10px] text-muted-foreground">Tax Deductible Expense</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
                <p className="text-[11px] text-muted-foreground">Net Bank Transfer</p>
                <p className="text-base font-bold font-mono text-foreground">$3,555.00 USD</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400">₨991,489 Received</p>
              </div>
            </div>

            <div className="rounded-lg border border-border/70 bg-card p-3 text-xs space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="font-semibold text-foreground">Reconciliation Integrity Check</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono">0 Duplicates Detected</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                All Upwork reference transaction IDs are checked against your immutable ledger before committing to prevent duplicate entries.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: TAX PACK */}
        {activeTab === "tax" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  FBR Section 154A Tax Pack &amp; Reserves
                </h4>
                <p className="text-xs text-muted-foreground">
                  1.00% final tax regime on gross export proceeds for PSEB / registered IT freelancers
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-1 rounded">
                  FY 2025-2026
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded flex items-center gap-1">
                  <Download className="size-3" />
                  Audit Pack Ready
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-[11px] font-sans text-muted-foreground">Gross Remittances</p>
                <p className="text-sm font-bold text-foreground">₨3,472,325</p>
                <p className="text-[10px] text-muted-foreground">$12,450.00</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-[11px] font-sans text-muted-foreground">Deductible Costs</p>
                <p className="text-sm font-bold text-foreground">₨357,000</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400">100% Receipts</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-[11px] font-sans text-muted-foreground">1% Tax Reserve</p>
                <p className="text-sm font-bold text-purple-600 dark:text-purple-400">₨34,723</p>
                <p className="text-[10px] text-muted-foreground">$124.50</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-[11px] font-sans text-muted-foreground">Net Take-Home</p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">₨3,080,602</p>
                <p className="text-[10px] text-muted-foreground">Tax Protected</p>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground pt-1">
              Export one-click structured CSV summaries formatted for Pakistani tax consultants, FBR IRIS e-filing, and bank remittance verification certificates.
            </p>
          </div>
        )}

        {/* TAB 4: COPILOT */}
        {activeTab === "copilot" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Grounded Financial Inquiries
                </h4>
                <p className="text-xs text-muted-foreground">
                  Ask natural-language questions with zero AI hallucinations
                </p>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                Ledger Grounded
              </span>
            </div>

            {/* Conversation Preview */}
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-muted/50 border border-border/60 max-w-md ml-auto">
                <p className="font-medium text-foreground">
                  What was my total gross income from Upwork and how much tax should I reserve?
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-card border border-border shadow-xs space-y-2 max-w-lg">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                  <Sparkles className="size-3.5" />
                  <span>Earnix Ledger Engine</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Based on your verified ledger records, your total gross earnings received from Upwork stand at <strong className="text-foreground font-mono">$3,950.00 USD (₨1,101,655 PKR)</strong> across 4 completed contract milestones. Under the FBR Section 154A 1.00% benchmark, your recommended tax reserve is <strong className="text-foreground font-mono">₨11,017 PKR ($39.50 USD)</strong>.
                </p>
                <div className="flex gap-2 pt-1">
                  <span className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded border border-border/60">
                    4 Audited Transactions
                  </span>
                  <span className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded border border-border/60">
                    Exact 278.90 PKR Rate
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </InteractiveTiltCard>
  )
}
