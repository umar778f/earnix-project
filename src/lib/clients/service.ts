import { createClient, isSupabaseConfigured, getAuthenticatedUser, getUserProfile } from "@/lib/supabase/server"
import { toDecimal, addDecimals } from "@/lib/currency/format"

interface JoinedPlatform {
  id?: string
  code?: string
  name?: string
}

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

export const DEFAULT_PLATFORMS = [
  { id: "00000000-0000-0000-0000-000000000001", code: "upwork", name: "Upwork" },
  { id: "00000000-0000-0000-0000-000000000002", code: "generic_csv", name: "Generic CSV Import" },
  { id: "00000000-0000-0000-0000-000000000003", code: "manual", name: "Direct Client / Manual" },
  { id: "00000000-0000-0000-0000-000000000004", code: "direct", name: "Direct Contract" },
]

export async function getClientsData(): Promise<ClientsPageData> {
  if (!isSupabaseConfigured()) {
    return {
      clients: [],
      platforms: DEFAULT_PLATFORMS,
      baseCurrency: "USD",
      isDemoData: false,
    }
  }

  try {
    const user = await getAuthenticatedUser()

    if (!user) {
      return {
        clients: [],
        platforms: DEFAULT_PLATFORMS,
        baseCurrency: "USD",
        isDemoData: false,
      }
    }

    const supabase = await createClient()

    // Parallel fetch: profile (memoized), platforms, clients, and transactions
    const [profile, platformsResult, clientsResult, transactionsResult] = await Promise.all([
      getUserProfile(user.id),
      supabase.from("platforms").select("id, code, name").eq("is_active", true),
      supabase
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
        .order("name", { ascending: true }),
      supabase
        .from("transactions")
        .select("id, client_id, converted_amount, payment_date, status")
        .eq("user_id", user.id),
    ])

    const baseCurrency = profile?.default_currency || "USD"
    const platforms =
      platformsResult.data && platformsResult.data.length > 0 ? platformsResult.data : DEFAULT_PLATFORMS
    const clientsData = clientsResult.data || []

    if (!clientsData || clientsData.length === 0) {
      return {
        clients: [],
        platforms,
        baseCurrency,
        isDemoData: false,
      }
    }

    const transactions = transactionsResult.data || []
    const clientStats: Record<string, { total: number; count: number; lastDate: string | null }> = {}

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

    const mappedClients: ClientListItem[] = clientsData.map((c) => {
      const platformObj = c.platform as JoinedPlatform | null
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
      clients: [],
      platforms: DEFAULT_PLATFORMS,
      baseCurrency: "USD",
      isDemoData: false,
    }
  }
}
