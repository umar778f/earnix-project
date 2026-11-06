import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { ClientTableView } from "@/components/clients/client-table-view"
import { getClientsData } from "@/lib/clients/service"
import { DemoNoticeBanner } from "@/components/dashboard/demo-notice-banner"

export const metadata = {
  title: "Clients — Earnix Freelancer Management",
  description: "Client directory, lifetime earnings tracking, platform relationships, and billing notes.",
}

export default async function ClientsPage() {
  const data = await getClientsData()

  return (
    <PageContainer>
      <PageHeader
        title="Client Directory"
        description="Manage international clients, track lifetime earnings (LTV), and review platform associations."
      />

      {data.isDemoData && <DemoNoticeBanner />}

      <ClientTableView
        initialClients={data.clients}
        platforms={data.platforms}
        baseCurrency={data.baseCurrency}
        isDemoData={data.isDemoData}
      />
    </PageContainer>
  )
}
