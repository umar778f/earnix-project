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
  sourceType: "csv_upwork" | "csv_generic" | "manual" | "demo"
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

export const DEMO_DASHBOARD_DATA: DashboardData = {
  isDemoData: true,
  baseCurrency: "USD",
  totalGrossIncome: 34850.0,
  monthlyIncome: 4650.0,
  yearlyIncome: 34850.0,
  totalExpenses: 4230.0,
  netIncome: 30620.0,
  estimatedTaxReserve: 348.5, // 1% estimated rate (e.g. export software services regime)
  estimatedTaxRate: 1.0,
  transactionCount: 28,
  expenseCount: 14,
  unreadNotificationsCount: 2,

  recentTransactions: [
    {
      id: "demo-tx-01",
      clientName: "Acme Cloud Solutions",
      platformCode: "upwork",
      platformName: "Upwork",
      description: "Milestone 3: Next.js SaaS Architecture & API Implementation",
      originalAmount: 1800.0,
      originalCurrency: "USD",
      exchangeRate: 1.0,
      convertedAmount: 1800.0,
      convertedCurrency: "USD",
      paymentDate: "2026-11-02T14:30:00Z",
      status: "completed",
      sourceType: "demo",
      category: "Freelance Income",
    },
    {
      id: "demo-tx-02",
      clientName: "Nordic FinTech Labs",
      platformCode: "generic_csv",
      platformName: "Direct Invoice",
      description: "Monthly Retainer: Full-Stack Engineering & Code Review",
      originalAmount: 2200.0,
      originalCurrency: "EUR",
      exchangeRate: 1.085,
      convertedAmount: 2387.0,
      convertedCurrency: "USD",
      paymentDate: "2026-10-28T09:15:00Z",
      status: "completed",
      sourceType: "demo",
      category: "Software Development",
    },
    {
      id: "demo-tx-03",
      clientName: "PixelCraft Studios",
      platformCode: "upwork",
      platformName: "Upwork",
      description: "Hourly Contract: 24.5 hrs at $45/hr — Frontend Optimization",
      originalAmount: 1102.5,
      originalCurrency: "USD",
      exchangeRate: 1.0,
      convertedAmount: 1102.5,
      convertedCurrency: "USD",
      paymentDate: "2026-10-21T16:45:00Z",
      status: "completed",
      sourceType: "demo",
      category: "Freelance Income",
    },
    {
      id: "demo-tx-04",
      clientName: "Apex Retail Analytics",
      platformCode: "manual",
      platformName: "Manual Entry",
      description: "Direct Client: PostgreSQL Database Performance Tuning",
      originalAmount: 950.0,
      originalCurrency: "USD",
      exchangeRate: 1.0,
      convertedAmount: 950.0,
      convertedCurrency: "USD",
      paymentDate: "2026-10-14T11:00:00Z",
      status: "completed",
      sourceType: "demo",
      category: "Consulting",
    },
    {
      id: "demo-tx-05",
      clientName: "BrightWave Media",
      platformCode: "upwork",
      platformName: "Upwork",
      description: "Fixed Price: React Dashboard & Recharts Visualizations",
      originalAmount: 850.0,
      originalCurrency: "USD",
      exchangeRate: 1.0,
      convertedAmount: 850.0,
      convertedCurrency: "USD",
      paymentDate: "2026-10-05T18:20:00Z",
      status: "completed",
      sourceType: "demo",
      category: "Freelance Income",
    },
  ],

  topClients: [
    {
      id: "client-01",
      name: "Acme Cloud Solutions",
      country: "United States",
      platformName: "Upwork",
      totalEarnedConverted: 14200.0,
      contractCount: 8,
    },
    {
      id: "client-02",
      name: "Nordic FinTech Labs",
      country: "Germany",
      platformName: "Direct Client",
      totalEarnedConverted: 11500.0,
      contractCount: 5,
    },
    {
      id: "client-03",
      name: "PixelCraft Studios",
      country: "United Kingdom",
      platformName: "Upwork",
      totalEarnedConverted: 5450.0,
      contractCount: 4,
    },
    {
      id: "client-04",
      name: "Apex Retail Analytics",
      country: "Canada",
      platformName: "Direct Client",
      totalEarnedConverted: 3700.0,
      contractCount: 3,
    },
  ],

  monthlyTrends: [
    { month: "Jun", income: 4200, expenses: 540, net: 3660 },
    { month: "Jul", income: 5100, expenses: 620, net: 4480 },
    { month: "Aug", income: 4850, expenses: 780, net: 4070 },
    { month: "Sep", income: 5900, expenses: 810, net: 5090 },
    { month: "Oct", income: 6450, expenses: 760, net: 5690 },
    { month: "Nov", income: 4650, expenses: 720, net: 3930 },
  ],

  platformDistribution: [
    { platform: "Upwork", code: "upwork", total: 20500.0, percentage: 58.8 },
    { platform: "Direct Invoices", code: "generic_csv", total: 10650.0, percentage: 30.6 },
    { platform: "Manual Entries", code: "manual", total: 3700.0, percentage: 10.6 },
  ],

  currencyDistribution: [
    { currency: "USD", originalTotal: 23450.0, convertedTotal: 23450.0, percentage: 67.3 },
    { currency: "EUR", originalTotal: 7200.0, convertedTotal: 7812.0, percentage: 22.4 },
    { currency: "GBP", originalTotal: 2800.0, convertedTotal: 3588.0, percentage: 10.3 },
  ],
}

