import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { Globe, Shield, Sliders } from "lucide-react"

export default function SettingsPage() {
  return (
    <PageContainer maxWidth="narrow">
      <PageHeader
        title="Settings"
        description="Manage your profile, preferred base currency, tax jurisdiction, and data preferences."
      />

      <div className="space-y-4">
        {[
          {
            title: "Currency & Localization",
            description: "Default display currency (USD, EUR, GBP, PKR) and exchange rate provider.",
            icon: Globe,
          },
          {
            title: "Tax Jurisdiction & Rules",
            description: "Configure tax year, estimation rates, and allowable deduction parameters.",
            icon: Sliders,
          },
          {
            title: "Security & Data Isolation",
            description: "Manage credentials, active sessions, and data export/purge options.",
            icon: Shield,
          },
        ].map((item, idx) => {
          const Icon = item.icon
          return (
            <div
              key={idx}
              className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-xs"
            >
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0">
                <Icon className="size-4" />
              </div>
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-foreground">
                  {item.title}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
                <p className="text-[11px] font-mono text-muted-foreground/70 pt-1">
                  Module Configuration (Phase 3 &amp; Phase 8)
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </PageContainer>
  )
}
