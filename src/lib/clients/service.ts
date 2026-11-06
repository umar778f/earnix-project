import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { toDecimal, addDecimals } from "@/lib/currency/format"

export interface ClientListItem {
  id: string
  name: string
  email: string | null
  country: string | null
  platformId: string | null
  platformCode: string
  platformName: string
  notes: string | null
  totalEarningsConverted: number
  paymentCount: number
  lastPaymentDate: string | null
  isDemo?: boolean
}

export interface ClientTransactionItem {
  id: string
  description: string
  originalAmount: number
  originalCurrency: string
  exchangeRate: number
  convertedAmount: number
  convertedCurrency: string
  paymentDate: string
  status: string
  sourceType: string
}

export interface ClientsPageData {
  clients: ClientListItem[]
  platforms: { id: string; code: string; name: string }[]
  baseCurrency: string
  isDemoData: boolean
}

export const DEMO_CLIENTS_LIST: ClientListItem[] = [
  {
    id: "demo-client-01",
    name: "Acme Cloud Solutions",
    email: "billing@acmecloud.io",
    country: "United States",
    platformId: "00000000-0000-0000-0000-000000000001",
    platformCode: "upwork",
    platformName: "Upwork",
    notes: "Enterprise client for Next.js micro-frontend migrations. Bi-weekly milestone billing.",
    totalEarningsConverted: 14200.0,
    paymentCount: 8,
    lastPaymentDate: "2026-11-02T14:30:00Z",
    isDemo: true,
  },
  {
    id: "demo-client-02",
    name: "Nordic FinTech Labs",
    email: "accounting@nordicfin.de",
    country: "Germany",
    platformId: "00000000-0000-0000-0000-000000000002",
    platformCode: "generic_csv",
    platformName: "Direct Invoice",
    notes: "Full-stack European banking SaaS client. Retainer billed in EUR.",
    totalEarningsConverted: 11500.0,
    paymentCount: 5,
    lastPaymentDate: "2026-10-28T09:15:00Z",
    isDemo: true,
  },
  {
    id: "demo-client-03",
    name: "PixelCraft Studios",
    email: "finance@pixelcraft.co.uk",
    country: "United Kingdom",
    platformId: "00000000-0000-0000-0000-000000000001",
    platformCode: "upwork",
    platformName: "Upwork",
    notes: "Hourly design systems contract. Tracked via Upwork desktop time tracker.",
    totalEarningsConverted: 5450.0,
    paymentCount: 4,
    lastPaymentDate: "2026-10-21T16:45:00Z",
    isDemo: true,
  },
  {
    id: "demo-client-04",
    name: "Apex Retail Analytics",
    email: "accounts@apexretail.ca",
    country: "Canada",
    platformId: "00000000-0000-0000-0000-000000000003",
    platformCode: "manual",
    platformName: "Direct Client",
    notes: "PostgreSQL schema optimization & BI dashboard setup. Wire transfer payout.",
    totalEarningsConverted: 3700.0,
    paymentCount: 3,
    lastPaymentDate: "2026-10-14T11:00:00Z",
    isDemo: true,
  },
]

export const DEMO_PLATFORMS = [
  { id: "00000000-0000-0000-0000-000000000001", code: "upwork", name: "Upwork" },
  { id: "00000000-0000-0000-0000-000000000002", code: "generic_csv", name: "Generic CSV Import" },
  { id: "00000000-0000-0000-0000-000000000003", code: "manual", name: "Direct Client / Manual" },
  { id: "00000000-0000-0000-0000-000000000004", code: "demo", name: "Demo Mode" },
]

export async function getClientsData(options?: { preferDemo?: boolean }): Promise<ClientsPageData> {
  if (options?.preferDemo || !isSupabaseConfigured()) {
    return {
      clients: DEMO_CLIENTS_LIST,
      platforms: DEMO_PLATFORMS,
      baseCurrency: "USD",
      isDemoData: true,
    }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        clients: DEMO_CLIENTS_LIST,
        platforms: DEMO_PLATFORMS,
        baseCurrency: "USD",
        isDemoData: true,
      }
    }

    // Fetch user base currency
    const { data: profile } = await supabase
      .from("profiles")
      .select("default_currency")
      .eq("id", user.id)
      .single()

    const baseCurrency = profile?.default_currency || "USD"

    // Fetch active platforms catalog
    const { data: platformsData } = await supabase
      .from("platforms")
      .select("id, code, name")
      .eq("is_active", true)

    const platforms = platformsData && platformsData.length > 0 ? platformsData : DEMO_PLATFORMS

    // Fetch clients
    const { data: clientsData } = await supabase
      .from("clients")
      .select(`
        id,
        name,
        email,
        country,
        default_platform_id,
        notes,
        created_at,
        platform:platforms(id, code, name)
      `)
      .eq("user_id", user.id)
      .order("name", { ascending: true })

    if (!clientsData || clientsData.length === 0) {
      return {
        clients: DEMO_CLIENTS_LIST,
        platforms,
        baseCurrency,
        isDemoData: true,
      }
    }

    // Fetch transactions grouped by client to calculate lifetime value
    const { data: transactions } = await supabase
      .from("transactions")
      .select("id, client_id, converted_amount, payment_date, status")
      .eq("user_id", user.id)

    const clientStats: Record<string, { total: number; count: number; lastDate: string | null }> = {}

    if (transactions) {
      for (const tx of transactions) {
        if (!tx.client_id) continue
        if (!clientStats[tx.client_id]) {
          clientStats[tx.client_id] = { total: 0, count: 0, lastDate: null }
        }
        if (tx.status === "completed") {
          clientStats[tx.client_id].total = addDecimals(
            toDecimal(clientStats[tx.client_id].total),
            toDecimal(tx.converted_amount)
          ).toNumber()
          clientStats[tx.client_id].count += 1
          if (
            !clientStats[tx.client_id].lastDate ||
            new Date(tx.payment_date) > new Date(clientStats[tx.client_id].lastDate!)
          ) {
            clientStats[tx.client_id].lastDate = tx.payment_date
          }
        }
      }
    }

    const mappedClients: ClientListItem[] = clientsData.map((c) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const platformObj = c.platform as any
      const stats = clientStats[c.id] || { total: 0, count: 0, lastDate: null }

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        country: c.country,
        platformId: c.default_platform_id,
        platformCode: platformObj?.code || "manual",
        platformName: platformObj?.name || "Direct Client",
        notes: c.notes,
        totalEarningsConverted: stats.total,
        paymentCount: stats.count,
        lastPaymentDate: stats.lastDate,
        isDemo: false,
      }
    })

    return {
      clients: mappedClients,
      platforms,
      baseCurrency,
      isDemoData: false,
    }
  } catch {
    return {
      clients: DEMO_CLIENTS_LIST,
      platforms: DEMO_PLATFORMS,
      baseCurrency: "USD",
      isDemoData: true,
    }
  }
}

