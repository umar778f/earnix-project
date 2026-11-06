import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { toDecimal, addDecimals } from "@/lib/currency/format"
import { type SourceType, type TransactionStatus } from "@/types/database.types"

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

export const DEMO_TRANSACTIONS_LIST: TransactionRecordItem[] = [
  {
    id: "demo-tx-01",
    referenceId: "UP-2026-10492",
    clientId: "demo-client-01",
    clientName: "Acme Cloud Solutions",
    platformId: "00000000-0000-0000-0000-000000000001",
    platformCode: "upwork",
    platformName: "Upwork",
    originalAmount: 1800.0,
    originalCurrency: "USD",
    exchangeRate: 1.0,
    convertedAmount: 1800.0,
    convertedCurrency: "USD",
    conversionDate: "2026-11-02",
    conversionSource: "ecb_frankfurter",
    paymentDate: "2026-11-02T14:30:00Z",
    description: "Milestone 3: Next.js SaaS Architecture & API Implementation",
    status: "completed",
    sourceType: "demo",
    category: "Freelance Income",
    metadata: { contractType: "Fixed Price", feeAmount: 180.0 },
    createdAt: "2026-11-02T14:30:00Z",
    isDemo: true,
  },
  {
    id: "demo-tx-02",
    referenceId: "INV-2026-088",
    clientId: "demo-client-02",
    clientName: "Nordic FinTech Labs",
    platformId: "00000000-0000-0000-0000-000000000002",
    platformCode: "generic_csv",
    platformName: "Direct Invoice",
    originalAmount: 2200.0,
    originalCurrency: "EUR",
    exchangeRate: 1.085,
    convertedAmount: 2387.0,
    convertedCurrency: "USD",
    conversionDate: "2026-10-28",
    conversionSource: "ecb_frankfurter",
    paymentDate: "2026-10-28T09:15:00Z",
    description: "Monthly Retainer: Full-Stack Engineering & Code Review",
    status: "completed",
    sourceType: "demo",
    category: "Software Development",
    metadata: { invoiceNumber: "NF-2026-10", paymentMethod: "SEPA Wire" },
    createdAt: "2026-10-28T09:15:00Z",
    isDemo: true,
  },
  {
    id: "demo-tx-03",
    referenceId: "UP-2026-10440",
    clientId: "demo-client-03",
    clientName: "PixelCraft Studios",
    platformId: "00000000-0000-0000-0000-000000000001",
    platformCode: "upwork",
    platformName: "Upwork",
    originalAmount: 1102.5,
    originalCurrency: "USD",
    exchangeRate: 1.0,
    convertedAmount: 1102.5,
    convertedCurrency: "USD",
    conversionDate: "2026-10-21",
    conversionSource: "ecb_frankfurter",
    paymentDate: "2026-10-21T16:45:00Z",
    description: "Hourly Contract: 24.5 hrs at $45/hr — Frontend Optimization",
    status: "completed",
    sourceType: "demo",
    category: "Freelance Income",
    metadata: { hourlyRate: 45.0, hoursLogged: 24.5 },
    createdAt: "2026-10-21T16:45:00Z",
    isDemo: true,
  },
  {
    id: "demo-tx-04",
    referenceId: "DIR-2026-031",
    clientId: "demo-client-04",
    clientName: "Apex Retail Analytics",
    platformId: "00000000-0000-0000-0000-000000000003",
    platformCode: "manual",
    platformName: "Manual Entry",
    originalAmount: 950.0,
    originalCurrency: "USD",
    exchangeRate: 1.0,
    convertedAmount: 950.0,
    convertedCurrency: "USD",
    conversionDate: "2026-10-14",
    conversionSource: "manual_entry",
    paymentDate: "2026-10-14T11:00:00Z",
    description: "Direct Client: PostgreSQL Database Performance Tuning",
    status: "completed",
    sourceType: "demo",
    category: "Consulting",
    metadata: { serviceScope: "Database Optimization" },
    createdAt: "2026-10-14T11:00:00Z",
    isDemo: true,
  },
  {
    id: "demo-tx-05",
    referenceId: "UP-2026-10398",
    clientId: "demo-client-01",
    clientName: "Acme Cloud Solutions",
    platformId: "00000000-0000-0000-0000-000000000001",
    platformCode: "upwork",
    platformName: "Upwork",
    originalAmount: 2400.0,
    originalCurrency: "USD",
    exchangeRate: 1.0,
    convertedAmount: 2400.0,
    convertedCurrency: "USD",
    conversionDate: "2026-10-08",
    conversionSource: "ecb_frankfurter",
    paymentDate: "2026-10-08T15:00:00Z",
    description: "Milestone 2: Multi-Tenant Database Architecture & Supabase RLS",
    status: "completed",
    sourceType: "demo",
    category: "Freelance Income",
    metadata: { contractType: "Fixed Price" },
    createdAt: "2026-10-08T15:00:00Z",
    isDemo: true,
  },
  {
    id: "demo-tx-06",
    referenceId: "INV-2026-092",
    clientId: "demo-client-02",
    clientName: "Nordic FinTech Labs",
    platformId: "00000000-0000-0000-0000-000000000002",
    platformCode: "generic_csv",
    platformName: "Direct Invoice",
    originalAmount: 1800.0,
    originalCurrency: "EUR",
    exchangeRate: 1.085,
    convertedAmount: 1953.0,
    convertedCurrency: "USD",
    conversionDate: "2026-09-29",
    conversionSource: "ecb_frankfurter",
    paymentDate: "2026-09-29T10:00:00Z",
    description: "Consulting: Real-time FX Integration & Decimal Engine",
    status: "completed",
    sourceType: "demo",
    category: "Software Development",
    metadata: { invoiceNumber: "NF-2026-09" },
    createdAt: "2026-09-29T10:00:00Z",
    isDemo: true,
  },
  {
    id: "demo-tx-07",
    referenceId: "UP-2026-10312",
    clientId: "demo-client-03",
    clientName: "PixelCraft Studios",
    platformId: "00000000-0000-0000-0000-000000000001",
    platformCode: "upwork",
    platformName: "Upwork",
    originalAmount: 1350.0,
    originalCurrency: "USD",
    exchangeRate: 1.0,
    convertedAmount: 1350.0,
    convertedCurrency: "USD",
    conversionDate: "2026-09-15",
    conversionSource: "ecb_frankfurter",
    paymentDate: "2026-09-15T18:00:00Z",
    description: "Milestone: Tailwind CSS v4 & Theme Token System",
    status: "completed",
    sourceType: "demo",
    category: "Freelance Income",
    metadata: { contractType: "Fixed Price" },
    createdAt: "2026-09-15T18:00:00Z",
    isDemo: true,
  },
  {
    id: "demo-tx-08",
    referenceId: "DIR-2026-039",
    clientId: "demo-client-04",
    clientName: "Apex Retail Analytics",
    platformId: "00000000-0000-0000-0000-000000000003",
    platformCode: "manual",
    platformName: "Manual Entry",
    originalAmount: 1200.0,
    originalCurrency: "USD",
    exchangeRate: 1.0,
    convertedAmount: 1200.0,
    convertedCurrency: "USD",
    conversionDate: "2026-11-04",
    conversionSource: "manual_entry",
    paymentDate: "2026-11-04T12:00:00Z",
    description: "Pending Invoice: E-Commerce Data Pipeline Setup",
    status: "pending",
    sourceType: "demo",
    category: "Consulting",
    metadata: { terms: "Net 15" },
    createdAt: "2026-11-04T12:00:00Z",
    isDemo: true,
  },
]

export const DEMO_CLIENTS_OPTIONS = [
  { id: "demo-client-01", name: "Acme Cloud Solutions" },
  { id: "demo-client-02", name: "Nordic FinTech Labs" },
  { id: "demo-client-03", name: "PixelCraft Studios" },
  { id: "demo-client-04", name: "Apex Retail Analytics" },
]

export const DEMO_PLATFORMS_OPTIONS = [
  { id: "00000000-0000-0000-0000-000000000001", code: "upwork", name: "Upwork" },
  { id: "00000000-0000-0000-0000-000000000002", code: "generic_csv", name: "Generic CSV Import" },
  { id: "00000000-0000-0000-0000-000000000003", code: "manual", name: "Manual Entry" },
  { id: "00000000-0000-0000-0000-000000000004", code: "demo", name: "Demo Mode" },
]

export async function getTransactionsData(options?: { preferDemo?: boolean }): Promise<TransactionsPageData> {
  if (options?.preferDemo || !isSupabaseConfigured()) {
    let grossDec = toDecimal(0)
    let completed = 0
    let pending = 0

    for (const tx of DEMO_TRANSACTIONS_LIST) {
      if (tx.status === "completed") {
        grossDec = addDecimals(grossDec, toDecimal(tx.convertedAmount))
        completed++
      } else if (tx.status === "pending") {
        pending++
      }
    }

    return {
      transactions: DEMO_TRANSACTIONS_LIST,
      clients: DEMO_CLIENTS_OPTIONS,
      platforms: DEMO_PLATFORMS_OPTIONS,
      baseCurrency: "USD",
      totalConvertedGross: grossDec.toNumber(),
      completedCount: completed,
      pendingCount: pending,
      isDemoData: true,
    }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return getTransactionsData({ preferDemo: true })
    }

    // Query user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("default_currency")
      .eq("id", user.id)
      .single()

    const baseCurrency = profile?.default_currency || "USD"

    // Query platforms
    const { data: platformsData } = await supabase
      .from("platforms")
      .select("id, code, name")
      .eq("is_active", true)

    const platforms = platformsData && platformsData.length > 0 ? platformsData : DEMO_PLATFORMS_OPTIONS

    // Query clients
    const { data: clientsData } = await supabase
      .from("clients")
      .select("id, name")
      .eq("user_id", user.id)
      .order("name", { ascending: true })

    const clients = clientsData && clientsData.length > 0 ? clientsData : DEMO_CLIENTS_OPTIONS

    // Query transactions
    const { data: transactionsData } = await supabase
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
        metadata,
        created_at,
        client:clients(id, name),
        platform:platforms(id, code, name)
      `)
      .eq("user_id", user.id)
      .order("payment_date", { ascending: false })

    if (!transactionsData || transactionsData.length === 0) {
      return {
        transactions: DEMO_TRANSACTIONS_LIST,
        clients,
        platforms,
        baseCurrency,
        totalConvertedGross: DEMO_TRANSACTIONS_LIST.reduce((acc, t) => t.status === "completed" ? acc + t.convertedAmount : acc, 0),
        completedCount: DEMO_TRANSACTIONS_LIST.filter(t => t.status === "completed").length,
        pendingCount: DEMO_TRANSACTIONS_LIST.filter(t => t.status === "pending").length,
        isDemoData: true,
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const clientObj = tx.client as any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const platformObj = tx.platform as any

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
    return getTransactionsData({ preferDemo: true })
  }
}
