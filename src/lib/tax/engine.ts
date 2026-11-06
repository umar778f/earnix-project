import { toDecimal, addDecimals, subtractDecimals, multiplyDecimals, divideDecimals } from "@/lib/currency/format"
import Decimal from "decimal.js"

export interface TaxJurisdiction {
  code: string
  name: string
  flag: string
  currency: string
  defaultRate: number
  description: string
  taxYearCycle: "july_june" | "calendar"
}

export const SUPPORTED_TAX_JURISDICTIONS: Record<string, TaxJurisdiction> = {
  PK: {
    code: "PK",
    name: "Pakistan (FBR Regime)",
    flag: "🇵🇰",
    currency: "PKR",
    defaultRate: 1.0, // Section 154A IT export services final tax benchmark
    description: "Configurable IT & IT-enabled export services regime benchmark (Section 154A).",
    taxYearCycle: "july_june",
  },
  US: {
    code: "US",
    name: "United States (IRS Estimate)",
    flag: "🇺🇸",
    currency: "USD",
    defaultRate: 15.3, // Self-employment tax benchmark
    description: "Self-employment and estimated quarterly tax assistance baseline.",
    taxYearCycle: "calendar",
  },
  GB: {
    code: "GB",
    name: "United Kingdom (HMRC Self-Assessment)",
    flag: "🇬🇧",
    currency: "GBP",
    defaultRate: 9.0, // Class 4 NIC sole trader baseline
    description: "Sole trader self-assessment assistance and recordkeeping.",
    taxYearCycle: "calendar",
  },
  GEN: {
    code: "GEN",
    name: "Global / Generic Freelancer",
    flag: "🌐",
    currency: "USD",
    defaultRate: 2.0,
    description: "Custom user-configured tax estimation rate for any tax jurisdiction.",
    taxYearCycle: "calendar",
  },
}

export interface QuarterlySummaryItem {
  quarter: string
  periodName: string
  grossIncome: number
  allowableDeductions: number
  netIncome: number
  estimatedTax: number
  transactionCount: number
}

export interface TaxCategoryBreakdownItem {
  taxCategory: string
  totalDeductions: number
  expenseCount: number
  percentageOfDeductions: number
  hasReceiptCoveragePct: number
}

export interface TaxCalculationResults {
  grossIncome: number
  totalExpenses: number
  allowableDeductions: number
  nonDeductibleExpenses: number
  netTaxableIncome: number
  estimatedTaxRate: number
  estimatedTaxLiability: number
  withholdingTaxSuffered: number
  netTaxPayableOrRefund: number
  receiptSubstantiationRatio: number // 0 to 100
  quarterlyBreakdown: QuarterlySummaryItem[]
  taxCategoryBreakdown: TaxCategoryBreakdownItem[]
}

/**
 * Computes deterministic tax-ready figures strictly using decimal.js
 */
export function calculateTaxReadyLedger(params: {
  transactions: Array<{
    convertedAmount: number
    paymentDate: string
    status: string
  }>
  expenses: Array<{
    convertedAmount: number
    isTaxDeductible: boolean
    taxCategory?: string | null
    category: string
    expenseDate: string
    documentId?: string | null
  }>
  estimatedTaxRate: number
  withholdingTaxSuffered?: number
}): TaxCalculationResults {
  const { transactions, expenses, estimatedTaxRate, withholdingTaxSuffered = 0 } = params

  let grossIncomeDec = new Decimal(0)
  for (const t of transactions) {
    if (t.status === "completed") {
      grossIncomeDec = addDecimals(grossIncomeDec, toDecimal(t.convertedAmount))
    }
  }

  let totalExpensesDec = new Decimal(0)
  let allowableDeductionsDec = new Decimal(0)
  let expensesWithReceiptCount = 0

  const taxCatMap = new Map<
    string,
    { totalDec: Decimal; count: number; withReceipt: number }
  >()

  for (const e of expenses) {
    const amountDec = toDecimal(e.convertedAmount)
    totalExpensesDec = addDecimals(totalExpensesDec, amountDec)

    const hasReceipt = Boolean(e.documentId)
    if (hasReceipt) {
      expensesWithReceiptCount++
    }

    if (e.isTaxDeductible) {
      allowableDeductionsDec = addDecimals(allowableDeductionsDec, amountDec)

      const catName = e.taxCategory || e.category || "Operational Deductions"
      const current = taxCatMap.get(catName) || {
        totalDec: new Decimal(0),
        count: 0,
        withReceipt: 0,
      }
      taxCatMap.set(catName, {
        totalDec: addDecimals(current.totalDec, amountDec),
        count: current.count + 1,
        withReceipt: current.withReceipt + (hasReceipt ? 1 : 0),
      })
    }
  }

  const nonDeductibleExpensesDec = subtractDecimals(totalExpensesDec, allowableDeductionsDec)
  const netTaxableIncomeDec = subtractDecimals(grossIncomeDec, allowableDeductionsDec)

  const rateDec = divideDecimals(toDecimal(estimatedTaxRate), toDecimal(100))
  // Estimated tax calculated on gross income (as in section 154A final tax regime) or net income
  const estimatedTaxLiabilityDec = multiplyDecimals(grossIncomeDec, rateDec).toDecimalPlaces(
    2,
    Decimal.ROUND_HALF_UP
  )

  const withholdingDec = toDecimal(withholdingTaxSuffered)
  const netTaxPayableDec = subtractDecimals(estimatedTaxLiabilityDec, withholdingDec).toDecimalPlaces(
    2,
    Decimal.ROUND_HALF_UP
  )

  const receiptSubstantiationRatio =
    expenses.length === 0
      ? 100
      : Math.round((expensesWithReceiptCount / expenses.length) * 100)

  // Tax Category Breakdown
  const taxCategoryBreakdown: TaxCategoryBreakdownItem[] = Array.from(taxCatMap.entries())
    .map(([taxCategory, data]) => {
      const pct = allowableDeductionsDec.isZero()
        ? 0
        : divideDecimals(data.totalDec, allowableDeductionsDec)
            .times(100)
            .toDecimalPlaces(1, Decimal.ROUND_HALF_UP)
            .toNumber()

      return {
        taxCategory,
        totalDeductions: data.totalDec.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
        expenseCount: data.count,
        percentageOfDeductions: pct,
        hasReceiptCoveragePct: Math.round((data.withReceipt / (data.count || 1)) * 100),
      }
    })
    .sort((a, b) => b.totalDeductions - a.totalDeductions)

  // Quarterly Breakdown
  const quarterlyBreakdown = computeQuarterlyBreakdown({
    transactions,
    expenses,
    estimatedTaxRate,
  })

  return {
    grossIncome: grossIncomeDec.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    totalExpenses: totalExpensesDec.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    allowableDeductions: allowableDeductionsDec.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    nonDeductibleExpenses: nonDeductibleExpensesDec.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    netTaxableIncome: netTaxableIncomeDec.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    estimatedTaxRate,
    estimatedTaxLiability: estimatedTaxLiabilityDec.toNumber(),
    withholdingTaxSuffered: withholdingDec.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    netTaxPayableOrRefund: netTaxPayableDec.toNumber(),
    receiptSubstantiationRatio,
    quarterlyBreakdown,
    taxCategoryBreakdown,
  }
}

function computeQuarterlyBreakdown(params: {
  transactions: Array<{ convertedAmount: number; paymentDate: string; status: string }>
  expenses: Array<{ convertedAmount: number; isTaxDeductible: boolean; expenseDate: string }>
  estimatedTaxRate: number
}): QuarterlySummaryItem[] {
  const { transactions, expenses, estimatedTaxRate } = params

  const quarters = [
    { key: "Q1", label: "Q1 (Jul - Sep)", startMonth: 7, endMonth: 9 },
    { key: "Q2", label: "Q2 (Oct - Dec)", startMonth: 10, endMonth: 12 },
    { key: "Q3", label: "Q3 (Jan - Mar)", startMonth: 1, endMonth: 3 },
    { key: "Q4", label: "Q4 (Apr - Jun)", startMonth: 4, endMonth: 6 },
  ]

  const rateDec = divideDecimals(toDecimal(estimatedTaxRate), toDecimal(100))

  return quarters.map((q) => {
    let qIncomeDec = new Decimal(0)
    let qDeductionsDec = new Decimal(0)
    let txCount = 0

    for (const t of transactions) {
      if (t.status !== "completed") continue
      const date = new Date(t.paymentDate)
      const month = date.getMonth() + 1
      if (month >= q.startMonth && month <= q.endMonth) {
        qIncomeDec = addDecimals(qIncomeDec, toDecimal(t.convertedAmount))
        txCount++
      }
    }

    for (const e of expenses) {
      if (!e.isTaxDeductible) continue
      const date = new Date(e.expenseDate)
      const month = date.getMonth() + 1
      if (month >= q.startMonth && month <= q.endMonth) {
        qDeductionsDec = addDecimals(qDeductionsDec, toDecimal(e.convertedAmount))
      }
    }

    const qNetDec = subtractDecimals(qIncomeDec, qDeductionsDec)
    const qTaxDec = multiplyDecimals(qIncomeDec, rateDec).toDecimalPlaces(2, Decimal.ROUND_HALF_UP)

    return {
      quarter: q.key,
      periodName: q.label,
      grossIncome: qIncomeDec.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
      allowableDeductions: qDeductionsDec.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
      netIncome: qNetDec.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
      estimatedTax: qTaxDec.toNumber(),
      transactionCount: txCount,
    }
  })
}
