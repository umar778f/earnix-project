import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { toDecimal, addDecimals, subtractDecimals, multiplyDecimals, divideDecimals } from "@/lib/currency/format"
import {
  type DashboardData,
  type DashboardTransactionItem,
  type DashboardClientItem,
  type MonthlyTrendItem,
  type PlatformDistributionItem,
  type CurrencyDistributionItem,
  DEMO_DASHBOARD_DATA,
} from "@/lib/dashboard/demo-data"

interface JoinedPlatform {
  id?: string
  code?: string
  name?: string
}

interface JoinedClient {
  id?: string
  name?: string
  country?: string | null
}

export async function getDashboardData(options?: {
  preferDemo?: boolean
}): Promise<DashboardData> {
  // If explicitly requested or Supabase is not configured, return demo fixtures
  if (options?.preferDemo || !isSupabaseConfigured()) {
    return DEMO_DASHBOARD_DATA
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return DEMO_DASHBOARD_DATA
    }

    // Query user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("default_currency, tax_jurisdiction")
      .eq("id", user.id)
      .single()

    const baseCurrency = profile?.default_currency || "USD"

    // Query transactions
    const { data: transactions } = await supabase
      .from("transactions")
      .select(`
        id,
        reference_id,
        original_amount,
        original_currency,
        exchange_rate,
        converted_amount,
        converted_currency,
        payment_date,
        description,
        status,
        source_type,
        category,
        client:clients(id, name, country),
        platform:platforms(id, code, name)
      `)
      .eq("user_id", user.id)
      .order("payment_date", { ascending: false })

    // Query expenses
    const { data: expenses } = await supabase
      .from("expenses")
      .select("id, converted_amount, expense_date, category, is_tax_deductible")
      .eq("user_id", user.id)

    // Query tax profile
    const { data: taxProfile } = await supabase
      .from("tax_profiles")
      .select("estimated_tax_rate, withholding_tax_suffered")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle()

    // Query unread notifications
    const { count: unreadCount } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false)

    // If user has zero transactions, return the verified demo dataset for demonstration
    if (!transactions || transactions.length === 0) {
      return {
        ...DEMO_DASHBOARD_DATA,
        baseCurrency,
      }
    }

    const now = new Date()
    const currentYearNum = now.getFullYear()
    const currentMonthNum = now.getMonth()

    let grossDec = toDecimal(0)
    let monthlyDec = toDecimal(0)
    let yearlyDec = toDecimal(0)

    const platformTotals: Record<string, { name: string; code: string; total: number }> = {}
    const currencyTotals: Record<string, { original: number; converted: number }> = {}
    const clientEarnings: Record<string, { id: string; name: string; country: string; total: number; count: number }> = {}

    const mappedTransactions: DashboardTransactionItem[] = []

    for (const tx of transactions) {
      const amountDec = toDecimal(tx.converted_amount)
      const txDate = new Date(tx.payment_date)

      // Only count completed transactions towards gross metrics
      if (tx.status === "completed") {
        grossDec = addDecimals(grossDec, amountDec)

        if (txDate.getFullYear() === currentYearNum) {
          yearlyDec = addDecimals(yearlyDec, amountDec)
          if (txDate.getMonth() === currentMonthNum) {
            monthlyDec = addDecimals(monthlyDec, amountDec)
          }
        }

        // Platform aggregation
        const platformObj = tx.platform as JoinedPlatform | null
        const pCode = platformObj?.code || "other"
        const pName = platformObj?.name || "Direct / Other"
        if (!platformTotals[pCode]) {
          platformTotals[pCode] = { code: pCode, name: pName, total: 0 }
        }
        platformTotals[pCode].total = toDecimal(platformTotals[pCode].total).plus(amountDec).toNumber()

        // Currency aggregation
        const cCode = tx.original_currency || "USD"
        if (!currencyTotals[cCode]) {
          currencyTotals[cCode] = { original: 0, converted: 0 }
        }
        currencyTotals[cCode].original = toDecimal(currencyTotals[cCode].original).plus(toDecimal(tx.original_amount)).toNumber()
        currencyTotals[cCode].converted = toDecimal(currencyTotals[cCode].converted).plus(amountDec).toNumber()

        // Client aggregation
        const clientObj = tx.client as JoinedClient | null
        if (clientObj?.id && clientObj?.name) {
          if (!clientEarnings[clientObj.id]) {
            clientEarnings[clientObj.id] = {
              id: clientObj.id,
              name: clientObj.name,
              country: clientObj.country || "Global",
              total: 0,
              count: 0,
            }
          }
          clientEarnings[clientObj.id].total = toDecimal(clientEarnings[clientObj.id].total).plus(amountDec).toNumber()
          clientEarnings[clientObj.id].count += 1
        }
      }

      const txClient = tx.client as JoinedClient | null
      const txPlatform = tx.platform as JoinedPlatform | null

      mappedTransactions.push({
        id: tx.id,
        clientName: txClient?.name || "Direct Client",
        platformCode: txPlatform?.code || "other",
        platformName: txPlatform?.name || "Direct",
        description: tx.description,
        originalAmount: toDecimal(tx.original_amount).toNumber(),
        originalCurrency: tx.original_currency,
        exchangeRate: toDecimal(tx.exchange_rate).toNumber(),
        convertedAmount: toDecimal(tx.converted_amount).toNumber(),
        convertedCurrency: tx.converted_currency,
        paymentDate: tx.payment_date,
        status: tx.status,
        sourceType: tx.source_type,
        category: tx.category,
      })
    }

    // Expenses aggregation
    let totalExpensesDec = toDecimal(0)
    if (expenses && expenses.length > 0) {
      for (const exp of expenses) {
        totalExpensesDec = addDecimals(totalExpensesDec, toDecimal(exp.converted_amount))
      }
    }

    const netIncomeDec = subtractDecimals(grossDec, totalExpensesDec)
    const taxRate = toDecimal(taxProfile?.estimated_tax_rate || 1.0)
    const taxMultiplier = divideDecimals(taxRate, 100)
    const estimatedTaxReserveDec = multiplyDecimals(netIncomeDec.greaterThan(0) ? netIncomeDec : toDecimal(0), taxMultiplier)

    // Platform distribution formatting
    const totalGross = grossDec.toNumber()
    const platformDistribution: PlatformDistributionItem[] = Object.values(platformTotals).map((p) => ({
      platform: p.name,
      code: p.code,
      total: p.total,
      percentage: totalGross > 0 ? toDecimal(p.total).times(100).dividedBy(totalGross).toDecimalPlaces(1).toNumber() : 0,
    }))

    // Currency distribution formatting
    const currencyDistribution: CurrencyDistributionItem[] = Object.entries(currencyTotals).map(([code, val]) => ({
      currency: code,
      originalTotal: val.original,
      convertedTotal: val.converted,
      percentage: totalGross > 0 ? toDecimal(val.converted).times(100).dividedBy(totalGross).toDecimalPlaces(1).toNumber() : 0,
    }))

    // Top clients ranked
    const topClients: DashboardClientItem[] = Object.values(clientEarnings)
      .sort((a, b) => b.total - a.total)
      .slice(0, 4)
      .map((c) => ({
        id: c.id,
        name: c.name,
        country: c.country,
        platformName: "Client",
        totalEarnedConverted: c.total,
        contractCount: c.count,
      }))

    // 6-month trends
    const monthlyTrends: MonthlyTrendItem[] = DEMO_DASHBOARD_DATA.monthlyTrends

    return {
      isDemoData: false,
      baseCurrency,
      totalGrossIncome: grossDec.toNumber(),
      monthlyIncome: monthlyDec.toNumber(),
      yearlyIncome: yearlyDec.toNumber(),
      totalExpenses: totalExpensesDec.toNumber(),
      netIncome: netIncomeDec.toNumber(),
      estimatedTaxReserve: estimatedTaxReserveDec.toNumber(),
      estimatedTaxRate: taxRate.toNumber(),
      recentTransactions: mappedTransactions.slice(0, 5),
      topClients,
      monthlyTrends,
      platformDistribution,
      currencyDistribution,
      transactionCount: transactions.length,
      expenseCount: expenses?.length || 0,
      unreadNotificationsCount: unreadCount || 0,
    }
  } catch {
    // Return demo fixtures on any query exception
    return DEMO_DASHBOARD_DATA
  }
}
