import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { ExchangeRatesCard } from "@/components/currency/exchange-rates-card"
import { CurrencySwitcher } from "@/components/currency/currency-switcher"
import { getAuthenticatedUser, getUserProfile } from "@/lib/supabase/server"
import { Globe } from "lucide-react"

export const metadata = {
  title: "Settings | Earnix",
  description: "Manage default base display currency and multi-currency FX exchange rate synchronization.",
}

export default async function SettingsPage() {
  let defaultCurrency = "USD"

  try {
    const user = await getAuthenticatedUser()
    if (user) {
      const profile = await getUserProfile(user.id)

      if (profile) {
        defaultCurrency = profile.default_currency || defaultCurrency
      }
    }
  } catch {
    // Graceful fallback to default configuration
  }

  return (
    <PageContainer maxWidth="narrow">
      <PageHeader
        title="Settings &amp; Localization"
        description="Configure your primary reporting currency and multi-currency exchange rate synchronization."
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
      </div>
    </PageContainer>
  )
}
