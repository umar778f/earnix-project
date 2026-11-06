import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { toDecimal, addDecimals, subtractDecimals, divideDecimals } from "@/lib/currency/format"
import Decimal from "decimal.js"

export interface ExpenseItem {
  id: string
  title: string
  originalAmount: number
  originalCurrency: string
  exchangeRate: number
  convertedAmount: number
  convertedCurrency: string
  category: string
  isTaxDeductible: boolean
  taxCategory: string
  expenseDate: string
  documentId: string | null
  documentFileName: string | null
  notes: string | null
  aiReviewStatus: "unassigned" | "pending_review" | "confirmed"
}

export interface ExpenseCategoryBreakdown {
  category: string
  total: number
  percentage: number
  count: number
}

export interface ExpensesSummary {
  isDemoData: boolean
  baseCurrency: string
  totalExpenses: number
  taxDeductibleTotal: number
  nonDeductibleTotal: number
  deductiblePercentage: number
  expenseCount: number
  categoryBreakdown: ExpenseCategoryBreakdown[]
  expenses: ExpenseItem[]
}

export const DEMO_EXPENSES: ExpenseItem[] = [
  {
    id: "demo-exp-01",
    title: "AWS Cloud Infrastructure (EC2 & RDS PostgreSQL)",
    originalAmount: 145.80,
    originalCurrency: "USD",
    exchangeRate: 1.0,
    convertedAmount: 145.80,
    convertedCurrency: "USD",
    category: "Cloud Hosting & Infrastructure",
    isTaxDeductible: true,
    taxCategory: "Cloud Computing & Server Infrastructure",
    expenseDate: "2026-11-01",
    documentId: "demo-doc-02",
    documentFileName: "aws-october-invoice.pdf",
    notes: "Production server infrastructure for client deliverable deployments.",
    aiReviewStatus: "confirmed",
  },
  {
    id: "demo-exp-02",
    title: "JetBrains All Products Pack - Annual License",
    originalAmount: 289.00,
    originalCurrency: "USD",
    exchangeRate: 1.0,
    convertedAmount: 289.00,
    convertedCurrency: "USD",
    category: "Software & Subscriptions",
    isTaxDeductible: true,
    taxCategory: "Professional Software Licensing",
    expenseDate: "2026-10-25",
    documentId: "demo-doc-03",
    documentFileName: "jetbrains-annual-license.pdf",
    notes: "Development IDE tools for Python, TypeScript, and database engineering.",
    aiReviewStatus: "confirmed",
  },
  {
    id: "demo-exp-03",
    title: "Anker USB-C Multi-Display Docking Station",
    originalAmount: 129.99,
    originalCurrency: "USD",
    exchangeRate: 1.0,
    convertedAmount: 129.99,
    convertedCurrency: "USD",
    category: "Hardware & Equipment",
    isTaxDeductible: true,
    taxCategory: "Office Hardware & Peripherals",
    expenseDate: "2026-10-18",
    documentId: null,
    documentFileName: null,
    notes: "Dual monitor workspace setup for software development.",
    aiReviewStatus: "unassigned",
  },
  {
    id: "demo-exp-04",
    title: "Fiber High-Speed Internet - 500 Mbps Business Plan",
    originalAmount: 18500.0,
    originalCurrency: "PKR",
    exchangeRate: 0.00359,
    convertedAmount: 66.42,
    convertedCurrency: "USD",
    category: "Internet & Utilities",
    isTaxDeductible: true,
    taxCategory: "Telecommunications & Data Connectivity",
    expenseDate: "2026-10-15",
    documentId: null,
    documentFileName: null,
    notes: "Home office dedicated primary internet connection.",
    aiReviewStatus: "confirmed",
  },
  {
    id: "demo-exp-05",
    title: "GitHub Copilot Enterprise Monthly Seat",
    originalAmount: 19.00,
    originalCurrency: "USD",
    exchangeRate: 1.0,
    convertedAmount: 19.00,
    convertedCurrency: "USD",
    category: "Software & Subscriptions",
    isTaxDeductible: true,
    taxCategory: "Software Subscriptions",
    expenseDate: "2026-10-10",
    documentId: "demo-doc-01",
    documentFileName: "github-copilot-oct2026.pdf",
    notes: "AI coding assistant subscription.",
    aiReviewStatus: "confirmed",
  },
  {
    id: "demo-exp-06",
    title: "Figma Professional Team Plan",
    originalAmount: 15.00,
    originalCurrency: "EUR",
    exchangeRate: 1.085,
    convertedAmount: 16.28,
    convertedCurrency: "USD",
    category: "Software & Subscriptions",
    isTaxDeductible: true,
    taxCategory: "Design Software Subscriptions",
    expenseDate: "2026-10-03",
    documentId: null,
    documentFileName: null,
    notes: "UI/UX mockup prototyping for client reviews.",
    aiReviewStatus: "unassigned",
  },
  {
    id: "demo-exp-07",
    title: "Office Ergonomic Desk Lamp & Accessories",
    originalAmount: 48.00,
    originalCurrency: "USD",
    exchangeRate: 1.0,
    convertedAmount: 48.00,
    convertedCurrency: "USD",
    category: "Office & Workspace",
    isTaxDeductible: false,
    taxCategory: "Personal Workspace Enhancement",
    expenseDate: "2026-09-28",
    documentId: null,
    documentFileName: null,
    notes: "General workspace lighting (marked non-deductible for fiscal caution).",
    aiReviewStatus: "unassigned",
  },
]

export async function getExpensesSummary(): Promise<ExpensesSummary> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Fetch user default currency
        const { data: profile } = await supabase
          .from("profiles")
          .select("default_currency")
          .eq("id", user.id)
          .single()

        const baseCurrency = profile?.default_currency || "USD"

        // Fetch user expenses with attached document metadata
        const { data: expenses, error } = await supabase
          .from("expenses")
          .select(`
            id,
            title,
            original_amount,
            original_currency,
            exchange_rate,
            converted_amount,
            converted_currency,
            category,
            is_tax_deductible,
            tax_category,
            expense_date,
            document_id,
            notes,
            ai_review_status,
            documents (
              file_name
            )
          `)
          .eq("user_id", user.id)
          .order("expense_date", { ascending: false })

        if (!error && expenses && expenses.length > 0) {
          return computeExpensesSummary(
            expenses.map((e) => {
              // Supabase join typing
              const doc = e.documents as { file_name?: string } | null
              return {
                id: e.id,
                title: e.title,
                originalAmount: toDecimal(e.original_amount).toNumber(),
                originalCurrency: e.original_currency,
                exchangeRate: toDecimal(e.exchange_rate).toNumber(),
                convertedAmount: toDecimal(e.converted_amount).toNumber(),
                convertedCurrency: e.converted_currency,
                category: e.category,
                isTaxDeductible: e.is_tax_deductible,
                taxCategory: e.tax_category || e.category,
                expenseDate: e.expense_date,
                documentId: e.document_id,
                documentFileName: doc?.file_name || null,
                notes: e.notes,
                aiReviewStatus: (e.ai_review_status as ExpenseItem["aiReviewStatus"]) || "unassigned",
              }
            }),
            false,
            baseCurrency
          )
        }
      }
    } catch {
      // Fallback on error
    }
  }

  // Academic FYP Demo Fallback
  return computeExpensesSummary(DEMO_EXPENSES, true, "USD")
}

function computeExpensesSummary(
  expenses: ExpenseItem[],
  isDemoData: boolean,
  baseCurrency: string
): ExpensesSummary {
  let totalExpensesDec = new Decimal(0)
  let taxDeductibleDec = new Decimal(0)
  const categoryMap = new Map<string, { totalDec: Decimal; count: number }>()

  for (const exp of expenses) {
    const amountDec = toDecimal(exp.convertedAmount)
    totalExpensesDec = addDecimals(totalExpensesDec, amountDec)

    if (exp.isTaxDeductible) {
      taxDeductibleDec = addDecimals(taxDeductibleDec, amountDec)
    }

    const currentCat = categoryMap.get(exp.category) || {
      totalDec: new Decimal(0),
      count: 0,
    }
    categoryMap.set(exp.category, {
      totalDec: addDecimals(currentCat.totalDec, amountDec),
      count: currentCat.count + 1,
    })
  }

  const nonDeductibleDec = subtractDecimals(totalExpensesDec, taxDeductibleDec)
  const deductiblePercentage = totalExpensesDec.isZero()
    ? 0
    : divideDecimals(taxDeductibleDec, totalExpensesDec)
        .times(100)
        .toDecimalPlaces(1, Decimal.ROUND_HALF_UP)
        .toNumber()

  const categoryBreakdown: ExpenseCategoryBreakdown[] = Array.from(categoryMap.entries())
    .map(([category, { totalDec, count }]) => {
      const pct = totalExpensesDec.isZero()
        ? 0
        : divideDecimals(totalDec, totalExpensesDec)
            .times(100)
            .toDecimalPlaces(1, Decimal.ROUND_HALF_UP)
            .toNumber()
      return {
        category,
        total: totalDec.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
        percentage: pct,
        count,
      }
    })
    .sort((a, b) => b.total - a.total)

  return {
    isDemoData,
    baseCurrency,
    totalExpenses: totalExpensesDec.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    taxDeductibleTotal: taxDeductibleDec.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    nonDeductibleTotal: nonDeductibleDec.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    deductiblePercentage,
    expenseCount: expenses.length,
    categoryBreakdown,
    expenses,
  }
}

