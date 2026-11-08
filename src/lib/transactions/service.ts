import { createClient, isSupabaseConfigured, getAuthenticatedUser, getUserProfile } from "@/lib/supabase/server"
import { toDecimal, addDecimals } from "@/lib/currency/format"
import { type SourceType, type TransactionStatus } from "@/types/database.types"

interface JoinedPlatform {
  id?: string
  code?: string
  name?: string
}

interface JoinedClient {
  id?: string
  name?: string
}

export interface TransactionRecordItem {
  id: string
  referenceId: string | null
  clientId: string | null
  clientName: string
  platformId: string
  platformCode: string
  platformName: string
  originalAmount: number
  originalCurrency: string
  exchangeRate: number
  convertedAmount: number
  convertedCurrency: string
  conversionDate: string
  conversionSource: string | null
  paymentDate: string
  description: string
  status: TransactionStatus
  sourceType: SourceType
  category: string
  aiReviewStatus?: "unassigned" | "pending_review" | "confirmed" | "rejected"
  aiConfidence?: number | null
  metadata: Record<string, unknown>
  createdAt: string
  isDemo?: boolean
}

export interface TransactionsPageData {
  transactions: TransactionRecordItem[]
  clients: { id: string; name: string }[]
  platforms: { id: string; code: string; name: string }[]
  baseCurrency: string
  totalConvertedGross: number
  completedCount: number
  pendingCount: number
  isDemoData: boolean
}

export const DEFAULT_PLATFORMS = [
  { id: "00000000-0000-0000-0000-000000000001", code: "upwork", name: "Upwork" },
  { id: "00000000-0000-0000-0000-000000000002", code: "generic_csv", name: "Generic CSV Import" },
  { id: "00000000-0000-0000-0000-000000000003", code: "manual", name: "Manual Entry" },
  { id: "00000000-0000-0000-0000-000000000004", code: "direct", name: "Direct Client" },
]

export async function getTransactionsData(): Promise<TransactionsPageData> {
  if (!isSupabaseConfigured()) {
    return {
      transactions: [],
      clients: [],
      platforms: DEFAULT_PLATFORMS,
      baseCurrency: "USD",
      totalConvertedGross: 0,
      completedCount: 0,
      pendingCount: 0,
      isDemoData: false,
    }
  }

  try {
    const user = await getAuthenticatedUser()

    if (!user) {
      return {
        transactions: [],
        clients: [],
        platforms: DEFAULT_PLATFORMS,
        baseCurrency: "USD",
        totalConvertedGross: 0,
        completedCount: 0,
        pendingCount: 0,
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
        .select("id, name")
        .eq("user_id", user.id)
        .order("name", { ascending: true }),
      supabase
        .from("transactions")
        .select(`
          id,
          reference_id,
          client_id,
          platform_id,
          original_amount,
          original_currency,
          exchange_rate,
          converted_amount,
          converted_currency,
          conversion_date,
          conversion_source,
          payment_date,
          description,
          status,
          source_type,
          category,
          ai_review_status,
          ai_confidence,
          metadata,
          created_at,
          client:clients(id, name),
          platform:platforms(id, code, name)
        `)
        .eq("user_id", user.id)
        .order("payment_date", { ascending: false }),
    ])

    const baseCurrency = profile?.default_currency || "USD"
    const platforms =
      platformsResult.data && platformsResult.data.length > 0 ? platformsResult.data : DEFAULT_PLATFORMS
    const clients = clientsResult.data || []
    const transactionsData = transactionsResult.data || []

    if (!transactionsData || transactionsData.length === 0) {
      return {
        transactions: [],
        clients,
        platforms,
        baseCurrency,
        totalConvertedGross: 0,
        completedCount: 0,
        pendingCount: 0,
        isDemoData: false,
      }
    }

    let grossDec = toDecimal(0)
    let completed = 0
    let pending = 0

    const mappedTransactions: TransactionRecordItem[] = transactionsData.map((tx) => {
      const amountDec = toDecimal(tx.converted_amount)
      if (tx.status === "completed") {
        grossDec = addDecimals(grossDec, amountDec)
        completed++
      } else if (tx.status === "pending") {
        pending++
      }

      const clientObj = tx.client as JoinedClient | null
      const platformObj = tx.platform as JoinedPlatform | null

      return {
        id: tx.id,
        referenceId: tx.reference_id,
        clientId: tx.client_id,
        clientName: clientObj?.name || "Direct Client",
        platformId: tx.platform_id,
        platformCode: platformObj?.code || "manual",
        platformName: platformObj?.name || "Manual Entry",
        originalAmount: toDecimal(tx.original_amount).toNumber(),
        originalCurrency: tx.original_currency,
        exchangeRate: toDecimal(tx.exchange_rate).toNumber(),
        convertedAmount: amountDec.toNumber(),
        convertedCurrency: tx.converted_currency,
        conversionDate: tx.conversion_date,
        conversionSource: tx.conversion_source,
        paymentDate: tx.payment_date,
        description: tx.description,
        status: tx.status,
        sourceType: tx.source_type,
        category: tx.category,
        aiReviewStatus: (tx.ai_review_status as TransactionRecordItem["aiReviewStatus"]) || "unassigned",
        aiConfidence: tx.ai_confidence ? Number(tx.ai_confidence) : null,
        metadata: (tx.metadata as Record<string, unknown>) || {},
        createdAt: tx.created_at,
        isDemo: false,
      }
    })

    return {
      transactions: mappedTransactions,
      clients,
      platforms,
      baseCurrency,
      totalConvertedGross: grossDec.toNumber(),
      completedCount: completed,
      pendingCount: pending,
      isDemoData: false,
    }
  } catch {
    return {
      transactions: [],
      clients: [],
      platforms: DEFAULT_PLATFORMS,
      baseCurrency: "USD",
      totalConvertedGross: 0,
      completedCount: 0,
      pendingCount: 0,
      isDemoData: false,
    }
  }
}
