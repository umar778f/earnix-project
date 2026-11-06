"use client"

import Link from "next/link"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button, buttonVariants } from "@/components/ui/button"
import { formatMoney } from "@/lib/currency/format"
import { type ClientListItem } from "@/lib/clients/service"
import { cn } from "@/lib/utils"
import { Mail, Globe, Briefcase, Calendar, FileText, ArrowRight } from "lucide-react"

interface ClientHistorySheetProps {
  client: ClientListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  baseCurrency: string
}

export function ClientHistorySheet({
  client,
  open,
  onOpenChange,
  baseCurrency,
}: ClientHistorySheetProps) {
  if (!client) return null

  const formattedLastPayment = client.lastPaymentDate
    ? new Date(client.lastPaymentDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No payments recorded yet"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-6 sm:max-w-md flex flex-col justify-between">
        <div className="space-y-6">
          <SheetHeader className="p-0 border-none text-left">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase bg-muted px-2 py-0.5 rounded border border-border">
                Client Profile
              </span>
              {client.isDemo && (
                <span className="text-[10px] font-mono text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Demo Fixture
                </span>
              )}
            </div>
            <SheetTitle className="text-xl font-bold">{client.name}</SheetTitle>
            <SheetDescription>
              Lifetime financial overview and platform association
            </SheetDescription>
          </SheetHeader>

          {/* LTV KPI Card */}
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Lifetime Value (LTV)
            </p>
            <p className="text-2xl font-bold text-foreground">
              {formatMoney(client.totalEarningsConverted, baseCurrency)}
            </p>
            <p className="text-xs text-muted-foreground pt-1">
              Accumulated across {client.paymentCount} completed payments
            </p>
          </div>

          {/* Client Metadata Details */}
          <div className="space-y-3 text-xs">
            <h3 className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground/80">
              Contract Metadata
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded border border-border/50 bg-card">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="size-3.5" />
                  <span>Country:</span>
                </span>
                <span className="font-medium text-foreground">
                  {client.country || "Not specified"}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded border border-border/50 bg-card">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="size-3.5" />
                  <span>Primary Platform:</span>
                </span>
                <span className="font-medium text-foreground">
                  {client.platformName}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded border border-border/50 bg-card">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="size-3.5" />
                  <span>Billing Email:</span>
                </span>
                <span className="font-medium text-foreground">
                  {client.email || "No email stored"}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded border border-border/50 bg-card">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="size-3.5" />
                  <span>Last Payment Date:</span>
                </span>
                <span className="font-medium text-foreground">
                  {formattedLastPayment}
                </span>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {client.notes && (
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                <FileText className="size-3.5" />
                <span>Notes &amp; Terms:</span>
              </div>
              <p className="rounded-lg border border-border/60 bg-muted/20 p-3 text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {client.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer Link to Ledger */}
        <div className="pt-4 border-t border-border space-y-2">
          <Link
            href="/transactions"
            className={cn(buttonVariants({ variant: "default", size: "sm" }), "w-full gap-2")}
          >
            <span>View Client Ledger Transactions</span>
            <ArrowRight className="size-4" />
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

