import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
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
  const [txData, expData] = await Promise.all([
    getTransactionsData(),
    getExpensesSummary(),
  ])

  let estimatedRate = SUPPORTED_TAX_JURISDICTIONS[requestedJurisdiction]?.defaultRate || 1.0
  let withholdingSuffered = 0
  let businessName: string | null = "Earnix Software Services"
  let taxIdentifier: string | null = "NTN: 8492019-3"
  let baseCurrency = txData.baseCurrency || "USD"

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("default_currency, tax_jurisdiction, business_name, tax_identifier")
          .eq("id", user.id)
          .single()

        if (profile) {
          baseCurrency = profile.default_currency || baseCurrency
          businessName = profile.business_name
          taxIdentifier = profile.tax_identifier
        }

        // Fetch tax profile
        const { data: taxProf } = await supabase
          .from("tax_profiles")
          .select("estimated_tax_rate, withholding_tax_suffered, jurisdiction_code")
          .eq("user_id", user.id)
          .eq("tax_year", requestedTaxYear)
          .single()

        if (taxProf) {
          estimatedRate = Number(taxProf.estimated_tax_rate)
          withholdingSuffered = Number(taxProf.withholding_tax_suffered)
        }
      }
    } catch {
      // Fallback
    }
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
