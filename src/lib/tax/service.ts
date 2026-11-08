import { createClient, isSupabaseConfigured, getAuthenticatedUser, getUserProfile } from "@/lib/supabase/server"
import {
  calculateTaxReadyLedger,
  type TaxCalculationResults,
  SUPPORTED_TAX_JURISDICTIONS,
} from "@/lib/tax/engine"
import { getTransactionsData } from "@/lib/transactions/service"
import { getExpensesSummary } from "@/lib/expenses/service"

export interface TaxPreparationData {
  isDemoData: boolean
  baseCurrency: string
  taxYear: string
  jurisdictionCode: string
  jurisdictionName: string
  businessName: string | null
  taxIdentifier: string | null
  calculations: TaxCalculationResults
}

export async function getTaxPreparationSummary(
  requestedTaxYear: string = "2025-2026",
  requestedJurisdiction: string = "PK"
): Promise<TaxPreparationData> {
  const user = await getAuthenticatedUser()

  // Parallel fetch: transactions, expenses, user profile (memoized), and tax profile
  const [txData, expData, profile, taxProf] = await Promise.all([
    getTransactionsData(),
    getExpensesSummary(),
    user ? getUserProfile(user.id) : null,
    user && isSupabaseConfigured()
      ? (async () => {
          try {
            const supabase = await createClient()
            const { data } = await supabase
              .from("tax_profiles")
              .select("estimated_tax_rate, withholding_tax_suffered, jurisdiction_code")
              .eq("user_id", user.id)
              .eq("tax_year", requestedTaxYear)
              .maybeSingle()
            return data
          } catch {
            return null
          }
        })()
      : null,
  ])

  let estimatedRate = SUPPORTED_TAX_JURISDICTIONS[requestedJurisdiction]?.defaultRate || 1.0
  let withholdingSuffered = 0
  const businessName: string | null = profile?.business_name || null
  const taxIdentifier: string | null = profile?.tax_identifier || null
  const baseCurrency = profile?.default_currency || txData.baseCurrency || "USD"

  if (taxProf) {
    estimatedRate = Number(taxProf.estimated_tax_rate)
    withholdingSuffered = Number(taxProf.withholding_tax_suffered)
  }

  const jurisdiction =
    SUPPORTED_TAX_JURISDICTIONS[requestedJurisdiction] || SUPPORTED_TAX_JURISDICTIONS.PK

  const calculations = calculateTaxReadyLedger({
    transactions: txData.transactions.map((t) => ({
      convertedAmount: t.convertedAmount,
      paymentDate: t.paymentDate,
      status: t.status,
    })),
    expenses: expData.expenses.map((e) => ({
      convertedAmount: e.convertedAmount,
      isTaxDeductible: e.isTaxDeductible,
      taxCategory: e.taxCategory,
      category: e.category,
      expenseDate: e.expenseDate,
      documentId: e.documentId,
    })),
    estimatedTaxRate: estimatedRate,
    withholdingTaxSuffered: withholdingSuffered,
  })

  return {
    isDemoData: txData.isDemoData,
    baseCurrency,
    taxYear: requestedTaxYear,
    jurisdictionCode: requestedJurisdiction,
    jurisdictionName: jurisdiction.name,
    businessName,
    taxIdentifier,
    calculations,
  }
}
