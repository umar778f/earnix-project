import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { ExchangeRatesCard } from "@/components/currency/exchange-rates-card"
import { CurrencySwitcher } from "@/components/currency/currency-switcher"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { Globe, Shield, Sliders, ShieldCheck } from "lucide-react"

export const metadata = {
  title: "Settings — Earnix Financial Preferences",
  description: "Manage default base display currency, exchange rate synchronization, tax jurisdiction, and security settings.",
}

export default async function SettingsPage() {
  let defaultCurrency = "USD"
  let taxJurisdiction = "PK"
  let fullName = "Active Account"
  let email = "user@earnix.app"

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        email = user.email || email
        const { data: profile } = await supabase
          .from("profiles")
          .select("default_currency, tax_jurisdiction, full_name")
          .eq("id", user.id)
          .single()

        if (profile) {
          defaultCurrency = profile.default_currency || defaultCurrency
          taxJurisdiction = profile.tax_jurisdiction || taxJurisdiction
          fullName = profile.full_name || fullName
        }
      }
    } catch {
      // Graceful fallback to default configuration
    }
  }

  return (
    <PageContainer maxWidth="narrow">
      <PageHeader
        title="Settings &amp; Localization"
        description="Configure your primary reporting currency, exchange rate synchronization, and tax profile."
      />

      <div className="space-y-6">
        {/* Currency & Base Display Setting Card */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <Globe className="size-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Primary Display Currency
                </h2>
                <p className="text-xs text-muted-foreground">
                  The default currency used to convert and aggregate all foreign platform payments across your dashboard and tax estimates.
                </p>
              </div>
            </div>

            <CurrencySwitcher currentCurrency={defaultCurrency} />
          </div>

          <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Dual-ledger guarantee: Original amounts and currencies are permanently preserved.</span>
            <span className="font-mono text-[10px] bg-muted px-2 py-0.5 rounded border border-border">
              {defaultCurrency} Active
            </span>
          </div>
        </div>

        {/* Live / Benchmark Exchange Rates Monitor */}
        <ExchangeRatesCard />

        {/* Tax Jurisdiction Preferences */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <Sliders className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Tax Jurisdiction &amp; Reporting Scope
              </h2>
              <p className="text-xs text-muted-foreground">
                Configure legal estimation rules and accounting periods.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-1">
              <span className="text-muted-foreground text-[11px]">Active Jurisdiction:</span>
              <p className="font-bold text-foreground">
                {taxJurisdiction === "PK" ? "Pakistan (FBR Baseline)" : taxJurisdiction}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Configurable estimation assistance mode active.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-1">
              <span className="text-muted-foreground text-[11px]">Registered Freelancer:</span>
              <p className="font-bold text-foreground truncate">{fullName}</p>
              <p className="text-[10px] text-muted-foreground truncate">{email}</p>
            </div>
          </div>
        </div>

        {/* Security & Data Sovereignty Card */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Shield className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Data Isolation &amp; Security Controls
              </h2>
              <p className="text-xs text-muted-foreground">
                Row Level Security (RLS) active. No financial data is ever shared across users or third parties.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
            <ShieldCheck className="size-3.5 text-emerald-500" />
            <span>PostgreSQL RLS Enforced &bull; Encrypted Storage Buckets &bull; Strict Decimal Arithmetic</span>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
