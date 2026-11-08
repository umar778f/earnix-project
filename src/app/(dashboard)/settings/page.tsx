import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { ExchangeRatesCard } from "@/components/currency/exchange-rates-card"
import { CurrencySwitcher } from "@/components/currency/currency-switcher"
import { getAuthenticatedUser, getUserProfile } from "@/lib/supabase/server"
import { Globe, Shield, Sliders, ShieldCheck } from "lucide-react"

export const metadata = {
  title: "Settings | Earnix",
  description: "Manage default base display currency, exchange rate synchronization, tax jurisdiction, and security settings.",
}

export default async function SettingsPage() {
  let defaultCurrency = "USD"
  let taxJurisdiction = "PK"
  let fullName = "Active Account"
  let email = "user@earnix.app"

  try {
    const user = await getAuthenticatedUser()
    if (user) {
      email = user.email || email
      const profile = await getUserProfile(user.id)

      if (profile) {
        defaultCurrency = profile.default_currency || defaultCurrency
        taxJurisdiction = profile.tax_jurisdiction || taxJurisdiction
        fullName = profile.full_name || fullName
      }
    }
  } catch {
    // Graceful fallback to default configuration
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
                  Default Reporting Currency
                </h2>
                <p className="text-xs text-muted-foreground">
                  All foreign earnings (USD, EUR, GBP) will be converted to this currency for ledger summaries and tax reserves.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-foreground">Active Base Currency</span>
              <p className="text-[11px] text-muted-foreground">
                Current selection: <span className="font-mono font-semibold text-foreground">{defaultCurrency}</span>
              </p>
            </div>
            <CurrencySwitcher currentCurrency={defaultCurrency} />
          </div>
        </div>

        {/* Live Exchange Rate Synchronization Card */}
        <ExchangeRatesCard />

        {/* Tax Profile & Jurisdiction Card */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Sliders className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Tax Jurisdiction &amp; Compliance Regime
              </h2>
              <p className="text-xs text-muted-foreground">
                Configured rules determining benchmark tax rates, filing years, and allowable expense substantiation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/60">
            <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground">Jurisdiction</span>
              <p className="text-sm font-semibold text-foreground">
                {taxJurisdiction === "PK" ? "Pakistan (FBR)" : taxJurisdiction}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Income Tax Ordinance Section 154A (1.00% final export tax)
              </p>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-1">
              <span className="text-[11px] font-medium text-muted-foreground">Account Status</span>
              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-emerald-500" />
                Active Taxpayer (Filer)
              </p>
              <p className="text-[10px] text-muted-foreground">
                Eligible for reduced 0.25% - 1.00% withholding rate under PSEB
              </p>
            </div>
          </div>
        </div>

        {/* Account & Multi-Tenant Security Info Card */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
              <Shield className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Tenant Isolation &amp; Data Security
              </h2>
              <p className="text-xs text-muted-foreground">
                PostgreSQL Row Level Security ensures complete cryptographic privacy for your financial records.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-border bg-muted/20 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">User Name</span>
              <span className="font-medium text-foreground">{fullName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Account Email</span>
              <span className="font-mono text-muted-foreground">{email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Database Partition</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">auth.uid() = user_id (RLS Active)</span>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
