import { type TaxPreparationData } from "@/lib/tax/service"
import { type TransactionRecordItem } from "@/lib/transactions/service"
import { type ExpenseItem } from "@/lib/expenses/service"

/**
 * Neutralizes Excel / Google Sheets formula injection (CWE-1236) and escapes double quotes.
 */
export function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '""'
  let str = String(value)
  // If the cell begins with formula execution characters, prefix with a single quote to force text interpretation
  if (/^[=\+\-@\t\r]/.test(str)) {
    str = "'" + str
  }
  return `"${str.replace(/"/g, '""')}"`
}

export function generateTaxReportCsv(params: {
  taxData: TaxPreparationData
  transactions: TransactionRecordItem[]
  expenses: ExpenseItem[]
}): string {
  const { taxData, transactions, expenses } = params
  const calc = taxData.calculations

  const lines: string[] = []

  // Document Title
  lines.push("EARNIX — FREELANCER TAX-READY FINANCIAL RECORDS REPORT")
  lines.push(`Generated: ${new Date().toISOString().split("T")[0]}`)
  lines.push(`Compliance Notice: Prepared for Certified Accountant Review & Tax Filing. Not Legal Tax Advice.`)
  lines.push("")

  // Executive Tax Summary
  lines.push("EXECUTIVE TAX SUMMARY")
  lines.push(`Tax Year,${sanitizeCsvCell(taxData.taxYear)}`)
  lines.push(`Jurisdiction,${sanitizeCsvCell(`${taxData.jurisdictionName} (${taxData.jurisdictionCode})`)}`)
  lines.push(`Business Entity,${sanitizeCsvCell(taxData.businessName || "Freelance Sole Proprietor")}`)
  lines.push(`Tax Identifier,${sanitizeCsvCell(taxData.taxIdentifier || "Not registered")}`)
  lines.push(`Reporting Currency,${sanitizeCsvCell(taxData.baseCurrency)}`)
  lines.push(`Gross Freelance Revenue,${calc.grossIncome.toFixed(2)}`)
  lines.push(`Total Operating Expenses,${calc.totalExpenses.toFixed(2)}`)
  lines.push(`Allowable Business Deductions,${calc.allowableDeductions.toFixed(2)}`)
  lines.push(`Non-Deductible Personal Costs,${calc.nonDeductibleExpenses.toFixed(2)}`)
  lines.push(`Net Taxable Income,${calc.netTaxableIncome.toFixed(2)}`)
  lines.push(`Configured Tax Estimation Rate,${calc.estimatedTaxRate.toFixed(2)}%`)
  lines.push(`Estimated Tax Liability,${calc.estimatedTaxLiability.toFixed(2)}`)
  lines.push(`Withholding Tax Suffered (Advance Tax),${calc.withholdingTaxSuffered.toFixed(2)}`)
  lines.push(`Net Estimated Tax Payable/(Refund),${calc.netTaxPayableOrRefund.toFixed(2)}`)
  lines.push(`Receipt Substantiation Coverage,${calc.receiptSubstantiationRatio}%`)
  lines.push("")

  // Quarterly Breakdown
  lines.push("QUARTERLY REPORTING PERIODS")
  lines.push("Quarter,Period,Gross Income,Allowable Deductions,Net Income,Estimated Tax Liability,Transactions")
  for (const q of calc.quarterlyBreakdown) {
    lines.push(
      `${sanitizeCsvCell(q.quarter)},${sanitizeCsvCell(q.periodName)},${q.grossIncome.toFixed(2)},${q.allowableDeductions.toFixed(
        2
      )},${q.netIncome.toFixed(2)},${q.estimatedTax.toFixed(2)},${q.transactionCount}`
    )
  }
  lines.push("")

  // Tax Deductions Category Breakdown
  lines.push("ALLOWABLE DEDUCTIONS BY TAX CLASSIFICATION")
  lines.push("Tax Category,Total Deductions,Expense Count,Percentage,Receipt Coverage")
  for (const c of calc.taxCategoryBreakdown) {
    lines.push(
      `${sanitizeCsvCell(c.taxCategory)},${c.totalDeductions.toFixed(2)},${c.expenseCount},${c.percentageOfDeductions.toFixed(
        1
      )}%,${c.hasReceiptCoveragePct}%`
    )
  }
  lines.push("")

  // Income Ledger Details
  lines.push("INCOME TRANSACTIONS LEDGER (DUAL-CURRENCY AUDIT TRAIL)")
  lines.push(
    "Date,Ref ID,Platform,Client Name,Description,Original Amount,Currency,Exchange Rate,Converted Amount,Status"
  )
  for (const t of transactions) {
    lines.push(
      `${sanitizeCsvCell(t.paymentDate.split("T")[0])},${sanitizeCsvCell(t.referenceId || "N/A")},${sanitizeCsvCell(
        t.platformName
      )},${sanitizeCsvCell(t.clientName)},${sanitizeCsvCell(t.description)},${t.originalAmount.toFixed(
        2
      )},${sanitizeCsvCell(t.originalCurrency)},${t.exchangeRate.toFixed(6)},${t.convertedAmount.toFixed(
        2
      )},${sanitizeCsvCell(t.status)}`
    )
  }
  lines.push("")

  // Expenses Details
  lines.push("BUSINESS EXPENSES & OPERATIONAL DEDUCTIONS")
  lines.push(
    "Date,Title / Vendor,Category,Tax Category,Original Amount,Currency,Exchange Rate,Converted Amount,Tax Deductible,Receipt Attached"
  )
  for (const e of expenses) {
    lines.push(
      `${sanitizeCsvCell(e.expenseDate)},${sanitizeCsvCell(e.title)},${sanitizeCsvCell(e.category)},${sanitizeCsvCell(
        e.taxCategory
      )},${e.originalAmount.toFixed(2)},${sanitizeCsvCell(e.originalCurrency)},${e.exchangeRate.toFixed(
        6
      )},${e.convertedAmount.toFixed(2)},"${e.isTaxDeductible ? "YES" : "NO"}",${sanitizeCsvCell(
        e.documentFileName || (e.documentId ? "Attached" : "None")
      )}`
    )
  }

  return lines.join("\n")
}

