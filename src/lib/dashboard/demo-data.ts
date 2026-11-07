export interface DashboardTransactionItem {
  id: string
  clientName: string
  platformCode: string
  platformName: string
  description: string
  originalAmount: number
  originalCurrency: string
  exchangeRate: number
  convertedAmount: number
  convertedCurrency: string
  paymentDate: string
  status: "completed" | "pending" | "refunded"
  sourceType: "csv_upwork" | "csv_generic" | "manual" | "direct"
  category: string
}

export interface DashboardClientItem {
  id: string
  name: string
  country: string
  platformName: string
  totalEarnedConverted: number
  contractCount: number
}

export interface MonthlyTrendItem {
  month: string
  income: number
  expenses: number
  net: number
}

export interface PlatformDistributionItem {
  platform: string
  code: string
  total: number
  percentage: number
}

export interface CurrencyDistributionItem {
  currency: string
  originalTotal: number
  convertedTotal: number
  percentage: number
}

export interface DashboardData {
  isDemoData: boolean
  baseCurrency: string
  totalGrossIncome: number
  monthlyIncome: number
  yearlyIncome: number
  totalExpenses: number
  netIncome: number
  estimatedTaxReserve: number
  estimatedTaxRate: number
  recentTransactions: DashboardTransactionItem[]
  topClients: DashboardClientItem[]
  monthlyTrends: MonthlyTrendItem[]
  platformDistribution: PlatformDistributionItem[]
  currencyDistribution: CurrencyDistributionItem[]
  transactionCount: number
  expenseCount: number
  unreadNotificationsCount: number
}
