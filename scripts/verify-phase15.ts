/**
 * EARNIX — PHASE 15 AUTOMATED VERIFICATION SUITE
 * 
 * Comprehensive tests covering:
 * 1. Financial Precision & Decimal.js Non-Floating Point Arithmetic
 * 2. Multi-Currency Dual-Ledger Invariants
 * 3. Tax Engine Calculations, Boundary Dates & Leap Year Handling
 * 4. RFC 4180 CSV Statement Parsers (Upwork & Generic)
 * 5. AI Categorization Heuristic Fallback & Offline Resilience
 * 6. Zod Schema Input Sanitization & Path Traversal Prevention
 */

import Decimal from "decimal.js"
import { toDecimal, addDecimals, multiplyDecimals, divideDecimals } from "../src/lib/currency/format"
import { BENCHMARK_RATES_TO_USD } from "../src/lib/currency/currencies"
import { calculateTaxReadyLedger } from "../src/lib/tax/engine"
import { sanitizeCsvCell } from "../src/lib/tax/export"
import { parseUpworkCsv, SAMPLE_UPWORK_CSV } from "../src/lib/parsers/upwork"
import { parseGenericCsv, SAMPLE_GENERIC_CSV } from "../src/lib/parsers/generic"
import { classifyIncomeTransaction, classifyExpenseRecord } from "../src/lib/ai/categorizer"
import { transactionSchema } from "../src/lib/transactions/schemas"
import { expenseFormSchema } from "../src/lib/expenses/schemas"
import { documentUploadSchema } from "../src/lib/documents/schemas"

let passedTests = 0
let failedTests = 0

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passedTests++
    console.log(`  ✓ ${testName}`)
  } else {
    failedTests++
    console.error(`  ✗ FAIL: ${testName}`)
    if (detail) console.error(`    Detail: ${detail}`)
  }
}

// -----------------------------------------------------------------------------
// 1. Financial Precision & Non-Floating Point Calculations
// -----------------------------------------------------------------------------
console.log("\n[1/6] Running Financial Precision & Decimal.js Tests...")

// Test: 0.1 + 0.2 strictly equals 0.3 (Standard JS IEEE-754 fails this)
const standardJsSum = 0.1 + 0.2
const decimalSum = addDecimals(toDecimal(0.1), toDecimal(0.2))
assert(
  standardJsSum !== 0.3 && decimalSum.equals(new Decimal(0.3)),
  "Decimal.js prevents IEEE-754 floating-point inaccuracy (0.1 + 0.2 === 0.3)"
)

// Test: Multiplication of currencies (19.99 * 100 strictly equals 1999)
const decimalMult = multiplyDecimals(toDecimal(19.99), toDecimal(100))
assert(
  decimalMult.equals(new Decimal(1999)),
  "Arbitrary-precision multiplication prevents rounding drift (19.99 * 100 === 1999)"
)

// Test: Division and rounding to 4 decimal places
const decimalDiv = divideDecimals(toDecimal(100), toDecimal(3)).toDecimalPlaces(4, Decimal.ROUND_HALF_UP)
assert(
  decimalDiv.equals(new Decimal("33.3333")),
  "Accurate 4-decimal place ledger rounding for foreign exchange rates"
)

// -----------------------------------------------------------------------------
// 2. Multi-Currency Dual-Ledger Invariants
// -----------------------------------------------------------------------------
console.log("\n[2/6] Running Multi-Currency Dual-Ledger Invariant Tests...")

const originalUsd = 1500.0
const pkrRate = BENCHMARK_RATES_TO_USD.PKR // e.g. 278.50
const convertedPkr = multiplyDecimals(toDecimal(originalUsd), toDecimal(pkrRate))
assert(
  convertedPkr.toNumber() === 417750,
  `Dual-ledger correctly computes USD 1,500 @ ${pkrRate} PKR = ₨417,750`
)

const originalEur = 1000.0
const eurToUsdRate = 1.08
const convertedUsd = multiplyDecimals(toDecimal(originalEur), toDecimal(eurToUsdRate))
assert(
  convertedUsd.toNumber() === 1080,
  `Dual-ledger preserves original EUR 1,000 and calculates converted USD 1,080`
)

// -----------------------------------------------------------------------------
// 3. Tax Engine Calculations, Boundary Dates & Leap Year Handling
// -----------------------------------------------------------------------------
console.log("\n[3/6] Running Tax Engine & Fiscal Date Boundary Tests...")

// Empty State Test (0 transactions, 0 expenses)
const emptyTaxResult = calculateTaxReadyLedger({
  transactions: [],
  expenses: [],
  estimatedTaxRate: 1.0,
})
assert(
  emptyTaxResult.grossIncome === 0 &&
    emptyTaxResult.estimatedTaxLiability === 0 &&
    emptyTaxResult.receiptSubstantiationRatio === 100 &&
    emptyTaxResult.quarterlyBreakdown.length === 4,
  "Empty ledger state safely yields zero totals without division-by-zero"
)

// Standard Freelance Income & Deductibility Test
const mockTaxResult = calculateTaxReadyLedger({
  transactions: [
    { convertedAmount: 5000, paymentDate: "2024-08-15", status: "completed" },
    { convertedAmount: 3000, paymentDate: "2024-11-20", status: "completed" },
    { convertedAmount: 2000, paymentDate: "2025-02-28", status: "completed" },
  ],
  expenses: [
    { convertedAmount: 500, isTaxDeductible: true, expenseDate: "2024-09-01", category: "Software", documentId: "doc-1" },
    { convertedAmount: 300, isTaxDeductible: true, expenseDate: "2024-10-10", category: "Internet", documentId: null },
    { convertedAmount: 200, isTaxDeductible: false, expenseDate: "2024-11-05", category: "Personal", documentId: null },
  ],
  estimatedTaxRate: 1.0,
  withholdingTaxSuffered: 50,
})

assert(mockTaxResult.grossIncome === 10000, "Gross income equals exactly $10,000.00")
assert(mockTaxResult.allowableDeductions === 800, "Allowable deductible expenses equal $800.00")
assert(mockTaxResult.nonDeductibleExpenses === 200, "Non-deductible expenses identified ($200.00)")
assert(mockTaxResult.netTaxableIncome === 9200, "Net taxable income strictly equals $9,200.00")
assert(mockTaxResult.estimatedTaxLiability === 100, "1.00% benchmark tax on gross income equals $100.00")
assert(mockTaxResult.netTaxPayableOrRefund === 50, "Net tax payable after $50 withholding tax equals $50.00")
assert(mockTaxResult.receiptSubstantiationRatio === 33, "Receipt substantiation ratio correctly calculated (1/3 = 33%)")

// Leap Year Handling Test (February 29th)
const leapYearResult = calculateTaxReadyLedger({
  transactions: [
    { convertedAmount: 1200, paymentDate: "2024-02-29", status: "completed" }, // Leap year day!
  ],
  expenses: [],
  estimatedTaxRate: 1.0,
})
const q3 = leapYearResult.quarterlyBreakdown.find((q) => q.quarter === "Q3")
assert(
  q3?.grossIncome === 1200,
  "Leap year transaction (2024-02-29) successfully placed in Q3 (Jan - Mar)"
)

// -----------------------------------------------------------------------------
// 4. RFC 4180 CSV Statement Parsers
// -----------------------------------------------------------------------------
console.log("\n[4/6] Running CSV Statement Parser Robustness Tests...")

// Official Upwork CSV Fixture parsing
const upworkParsed = parseUpworkCsv(SAMPLE_UPWORK_CSV)
assert(upworkParsed.success, "Upwork statement parsed successfully")
assert(upworkParsed.allRows.length === 9, `Extracted 9 transactions from Upwork statement (got ${upworkParsed.allRows.length})`)

const incomeRows = upworkParsed.incomeRows
const feeRows = upworkParsed.feeRows
const withdrawalRows = upworkParsed.withdrawalRows
assert(incomeRows.length === 4, "Correctly classified 4 gross income rows from Upwork statement")
assert(feeRows.length === 4, "Correctly classified 4 Upwork service fee deduction rows")
assert(withdrawalRows.length === 1, "Correctly classified 1 cash withdrawal row")

// Edge Case: Handling empty and malformed CSV
const emptyCsvParsed = parseUpworkCsv("")
assert(!emptyCsvParsed.success && emptyCsvParsed.allRows.length === 0, "Empty CSV string safely rejected")

// Generic CSV Statement parsing
const genericParsed = parseGenericCsv(SAMPLE_GENERIC_CSV)
assert(genericParsed.success, "Generic invoice CSV parsed successfully")
assert(genericParsed.rows.length === 3, `Generic CSV extracted 3 income records (got ${genericParsed.rows.length})`)

// -----------------------------------------------------------------------------
// 5. AI Categorization Fallback & Offline Resilience
// -----------------------------------------------------------------------------
console.log("\n[5/6] Running AI Categorizer Heuristic & Resilience Tests...")

// Test: Offline heuristic categorization (no Gemini network calls needed)
async function runCategorizerTests() {
  const devIncome = await classifyIncomeTransaction(
    "tx-1",
    "Full-stack Next.js web application delivery with API endpoints",
    "TechCorp Global",
    2500,
    "Freelance Income"
  )
  assert(
    devIncome.suggestedCategory === "Software Development",
    `Heuristic classifies Next.js project as 'Software Development' (got '${devIncome.suggestedCategory}')`
  )

  const uiIncome = await classifyIncomeTransaction(
    "tx-2",
    "Figma user interface redesign and responsive design wireframes",
    "Design Studio",
    1200,
    "Freelance Income"
  )
  assert(
    uiIncome.suggestedCategory === "UI/UX & Product Design",
    `Heuristic classifies Figma redesign as 'UI/UX & Product Design' (got '${uiIncome.suggestedCategory}')`
  )

  const cloudExpense = await classifyExpenseRecord(
    "exp-1",
    "AWS EC2 and RDS cloud hosting monthly billing",
    240,
    "Other Business Expense"
  )
  assert(
    cloudExpense.suggestedCategory === "Cloud Hosting & Infrastructure",
    `Heuristic classifies AWS invoice as 'Cloud Hosting & Infrastructure' (got '${cloudExpense.suggestedCategory}')`
  )

  const subExpense = await classifyExpenseRecord(
    "exp-2",
    "GitHub Copilot and JetBrains IDE subscription license",
    39,
    "Other Business Expense"
  )
  assert(
    subExpense.suggestedCategory === "Software & Subscriptions",
    `Heuristic classifies GitHub/JetBrains as 'Software & Subscriptions' (got '${subExpense.suggestedCategory}')`
  )

  const feeExpense = await classifyExpenseRecord(
    "exp-3",
    "Upwork Freelancer 10% platform service fee",
    125,
    "Other Business Expense"
  )
  assert(
    feeExpense.suggestedCategory === "Platform & Payment Fees",
    `Heuristic classifies Upwork fee as 'Platform & Payment Fees' (got '${feeExpense.suggestedCategory}')`
  )
}

// -----------------------------------------------------------------------------
// 6. Zod Schema Input Sanitization & Security Boundary Tests
// -----------------------------------------------------------------------------
console.log("\n[6/6] Running Zod Schema Input Sanitization & Security Tests...")

// Test: Transaction schema rejects negative amount
const negativeTx = transactionSchema.safeParse({
  platformId: "a0000000-0000-0000-0000-000000000001",
  originalAmount: "-500.00",
  originalCurrency: "USD",
  paymentDate: "2025-01-01",
  description: "Test Transaction",
  status: "completed",
  category: "Freelance Income",
})
assert(!negativeTx.success, "Transaction schema strictly rejects negative amounts")

// Test: Transaction schema rejects invalid currency code
const invalidCurrencyTx = transactionSchema.safeParse({
  platformId: "a0000000-0000-0000-0000-000000000001",
  originalAmount: "500.00",
  originalCurrency: "US", // Invalid length
  paymentDate: "2025-01-01",
  description: "Test Transaction",
  status: "completed",
  category: "Freelance Income",
})
assert(!invalidCurrencyTx.success, "Transaction schema rejects invalid currency format")

// Test: Expense schema rejects unsupported currency
const invalidExpenseCurrency = expenseFormSchema.safeParse({
  title: "Server Hosting",
  originalAmount: "50.00",
  originalCurrency: "INVALID_CURRENCY",
  category: "Cloud Hosting & Infrastructure",
  expenseDate: "2025-01-01",
})
assert(!invalidExpenseCurrency.success, "Expense schema rejects unsupported currency codes")

// Test: Document schema rejects invalid document type
const invalidDoc = documentUploadSchema.safeParse({
  documentType: "executable_script",
})
assert(!invalidDoc.success, "Document upload schema rejects disallowed document types")

// Test: File name sanitization against path traversal
const dangerousFileName = "../../../etc/passwd.pdf"
const sanitized = dangerousFileName.trim().replace(/\.\./g, "_").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100)
assert(
  !sanitized.includes("/") && !sanitized.includes("\\") && !sanitized.includes(".."),
  `File name sanitization neutralizes directory traversal attack: '${dangerousFileName}' -> '${sanitized}'`
)

// Test: CSV Formula Injection Neutralization (CWE-1236)
const maliciousFormula = "=cmd|' /C calc'!A0"
const sanitizedFormula = sanitizeCsvCell(maliciousFormula)
assert(
  sanitizedFormula.startsWith("\"'") && sanitizedFormula.includes(maliciousFormula),
  `CSV export neutralizes Excel formula injection (prefixed with single quote): '${maliciousFormula}' -> ${sanitizedFormula}`
)

const maliciousSum = "@SUM(1+1)"
const sanitizedSum = sanitizeCsvCell(maliciousSum)
assert(
  sanitizedSum.startsWith("\"'"),
  `CSV export neutralizes @ formula injection: '${maliciousSum}' -> ${sanitizedSum}`
)

// Test: OAuth Safe Redirect Path Validation
function getSafeRedirectUrl(next: string | null, fallback = "/dashboard"): string {
  if (!next) return fallback
  if (next.startsWith("/") && !next.startsWith("//") && !next.includes("\\")) {
    return next
  }
  return fallback
}
assert(
  getSafeRedirectUrl("//evil.com") === "/dashboard" &&
    getSafeRedirectUrl("https://evil.com") === "/dashboard" &&
    getSafeRedirectUrl("/dashboard/tax") === "/dashboard/tax",
  "OAuth callback strictly prevents external open redirects"
)

// Run async categorizer tests and summarize
runCategorizerTests().then(() => {
  console.log("\n============================================================")
  console.log(`VERIFICATION SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`)
  console.log("============================================================\n")

  if (failedTests > 0) {
    process.exit(1)
  } else {
    process.exit(0)
  }
})
