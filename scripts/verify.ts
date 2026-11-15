/**
 * EARNIX — AUTOMATED PRODUCTION VERIFICATION SUITE
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
const sanitized = sanitizeFileName(dangerousFileName)
assert(
  !sanitized.includes("/") && !sanitized.includes("\\") && !sanitized.includes(".."),
  `File name sanitization neutralizes directory traversal attack: '${dangerousFileName}' -> '${sanitized}'`
)

// Test: CSV Formula Injection Neutralization (CWE-1236)
const maliciousFormula = "=cmd|' /C calc'!A0"
const sanitizedFormula = sanitizeFormulaCell(maliciousFormula)
assert(
  sanitizedFormula.startsWith("\"'") && sanitizedFormula.includes(maliciousFormula),
  `CSV export neutralizes Excel formula injection (prefixed with single quote): '${maliciousFormula}' -> ${sanitizedFormula}`
)

const maliciousSum = "@SUM(1+1)"
const sanitizedSum = sanitizeFormulaCell(maliciousSum)
assert(
  sanitizedSum.startsWith("\"'"),
  `CSV export neutralizes @ formula injection: '${maliciousSum}' -> ${sanitizedSum}`
)

// Test: OAuth Safe Redirect Path Validation
assert(
  getSafeRedirectUrl("//evil.com") === "/dashboard" &&
    getSafeRedirectUrl("https://evil.com") === "/dashboard" &&
    getSafeRedirectUrl("/dashboard/tax") === "/dashboard/tax",
  "OAuth callback strictly prevents external open redirects"
)

// -----------------------------------------------------------------------------
// 7. Security Rate Limiting & Notification Safe URL Tests
// -----------------------------------------------------------------------------
console.log("\n[7/7] Running Security Rate Limiting & Safe Routing Tests...")

import { sanitizeFileName, sanitizeFormulaCell, getSafeRedirectUrl, isSafeActionUrl } from "../src/lib/security/sanitization"
import { checkRateLimit } from "../src/lib/security/rate-limit"

// Test: Rate limiter allows requests up to maxRequests
const testKey = `test-ip-${Date.now()}`
let allowedCount = 0
for (let i = 0; i < 5; i++) {
  const res = checkRateLimit(testKey, { maxRequests: 5, windowMs: 1000 })
  if (res.allowed) allowedCount++
}
assert(allowedCount === 5, "Rate limiter permits allowed number of requests within window (5/5)")

// Test: Rate limiter rejects excess requests
const blockedRes = checkRateLimit(testKey, { maxRequests: 5, windowMs: 1000 })
assert(!blockedRes.allowed && blockedRes.remaining === 0, "Rate limiter throttles requests exceeding max limit")

// Test: Notification action URL validation
assert(
  isSafeActionUrl("/dashboard/tax") &&
    !isSafeActionUrl("javascript:alert(1)") &&
    !isSafeActionUrl("//malicious.site") &&
    !isSafeActionUrl("https://phishing.com") &&
    !isSafeActionUrl("/\\evil.com"),
  "Notification flyout strictly rejects unsafe or external action URLs"
)

// -----------------------------------------------------------------------------
// 8. Production Origin, Multi-Currency Normalization & Tax Engine Regression Tests
// -----------------------------------------------------------------------------
console.log("\n[8/8] Running Production Origin, Multi-Currency & Tax Cycle Regression Tests...")

import { resolveCallbackOrigin, isLocalhost, getSafeAppOrigin, PRODUCTION_APP_URL } from "../src/lib/security/origin"
import { normalizeMonetaryAmountToTarget } from "../src/lib/currency/normalization"

// Test 8.0: isLocalhost, getSafeAppOrigin, and PRODUCTION_APP_URL assertions
assert(
  isLocalhost("http://localhost:3000") &&
    isLocalhost("http://127.0.0.1:8080") &&
    !isLocalhost("https://earnix-project.vercel.app") &&
    PRODUCTION_APP_URL === "https://earnix-project.vercel.app" &&
    typeof getSafeAppOrigin() === "string",
  "Origin utility functions identify localhost and production domains correctly"
)

// Test 8.1: Production Callback Origin Guard blocks localhost redirection on production requests
const originalEnvAppUrl = process.env.NEXT_PUBLIC_APP_URL
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000"

const mockProductionRequest = new Request("https://earnix-project.vercel.app/auth/callback", {
  headers: {
    host: "earnix-project.vercel.app",
    "x-forwarded-proto": "https",
  },
})

const resolvedProdOrigin = resolveCallbackOrigin(mockProductionRequest)
assert(
  resolvedProdOrigin === "https://earnix-project.vercel.app" &&
    !resolvedProdOrigin.includes("localhost"),
  "Callback origin guard strictly prevents localhost redirect on production request even when NEXT_PUBLIC_APP_URL is localhost"
)

// Test 8.2: Localhost request in development resolves to localhost
const mockLocalRequest = new Request("http://localhost:3000/auth/callback", {
  headers: {
    host: "localhost:3000",
    "x-forwarded-proto": "http",
  },
})
const resolvedLocalOrigin = resolveCallbackOrigin(mockLocalRequest)
assert(
  resolvedLocalOrigin.includes("localhost:3000"),
  "Callback origin correctly resolves localhost in local development environments"
)

// Restore env
process.env.NEXT_PUBLIC_APP_URL = originalEnvAppUrl

// Test 8.3: Tax Engine Calendar-Year Cycle (US / Global)
const calendarTaxResult = calculateTaxReadyLedger({
  transactions: [
    { convertedAmount: 1500, paymentDate: "2025-02-15T10:00:00Z", status: "completed" }, // Feb -> Q1 in calendar
    { convertedAmount: 2500, paymentDate: "2025-05-10T10:00:00Z", status: "completed" }, // May -> Q2 in calendar
    { convertedAmount: 3500, paymentDate: "2025-08-20T10:00:00Z", status: "completed" }, // Aug -> Q3 in calendar
    { convertedAmount: 4500, paymentDate: "2025-11-05T10:00:00Z", status: "completed" }, // Nov -> Q4 in calendar
  ],
  expenses: [],
  estimatedTaxRate: 15.3,
  taxYearCycle: "calendar",
  jurisdictionCode: "US",
})

assert(
  calendarTaxResult.quarterlyBreakdown[0].periodName === "Q1 (Jan - Mar)" &&
    calendarTaxResult.quarterlyBreakdown[0].grossIncome === 1500 &&
    calendarTaxResult.quarterlyBreakdown[1].periodName === "Q2 (Apr - Jun)" &&
    calendarTaxResult.quarterlyBreakdown[1].grossIncome === 2500 &&
    calendarTaxResult.quarterlyBreakdown[2].periodName === "Q3 (Jul - Sep)" &&
    calendarTaxResult.quarterlyBreakdown[2].grossIncome === 3500 &&
    calendarTaxResult.quarterlyBreakdown[3].periodName === "Q4 (Oct - Dec)" &&
    calendarTaxResult.quarterlyBreakdown[3].grossIncome === 4500,
  "Tax engine correctly partitions Calendar-Year cycles: Q1=Jan-Mar, Q2=Apr-Jun, Q3=Jul-Sep, Q4=Oct-Dec"
)

// Test 8.4: Tax Engine July-June Fiscal Cycle (PK / FBR)
const fiscalTaxResult = calculateTaxReadyLedger({
  transactions: [
    { convertedAmount: 1000, paymentDate: "2024-08-15T10:00:00Z", status: "completed" }, // Aug -> Q1 in fiscal (Jul-Sep)
    { convertedAmount: 2000, paymentDate: "2024-11-10T10:00:00Z", status: "completed" }, // Nov -> Q2 in fiscal (Oct-Dec)
    { convertedAmount: 3000, paymentDate: "2025-02-20T10:00:00Z", status: "completed" }, // Feb -> Q3 in fiscal (Jan-Mar)
    { convertedAmount: 4000, paymentDate: "2025-05-05T10:00:00Z", status: "completed" }, // May -> Q4 in fiscal (Apr-Jun)
  ],
  expenses: [],
  estimatedTaxRate: 1.0,
  taxYearCycle: "july_june",
  jurisdictionCode: "PK",
})

assert(
  fiscalTaxResult.quarterlyBreakdown[0].periodName === "Q1 (Jul - Sep)" &&
    fiscalTaxResult.quarterlyBreakdown[0].grossIncome === 1000 &&
    fiscalTaxResult.quarterlyBreakdown[1].periodName === "Q2 (Oct - Dec)" &&
    fiscalTaxResult.quarterlyBreakdown[1].grossIncome === 2000 &&
    fiscalTaxResult.quarterlyBreakdown[2].periodName === "Q3 (Jan - Mar)" &&
    fiscalTaxResult.quarterlyBreakdown[2].grossIncome === 3000 &&
    fiscalTaxResult.quarterlyBreakdown[3].periodName === "Q4 (Apr - Jun)" &&
    fiscalTaxResult.quarterlyBreakdown[3].grossIncome === 4000,
  "Tax engine preserves July-June Fiscal cycles for PK/FBR jurisdictions"
)

// Test 8.5: Multi-Currency Normalization (USD + PKR)
// Scenario: User has Tx1 ($1,000 USD logged when base was USD) and Tx2 (278,500 PKR logged when base was PKR)
const txUsd = {
  original_amount: 1000,
  original_currency: "USD",
  converted_amount: 1000,
  converted_currency: "USD",
  exchange_rate: 1.0,
}

const txPkr = {
  original_amount: 278500,
  original_currency: "PKR",
  converted_amount: 278500,
  converted_currency: "PKR",
  exchange_rate: 1.0,
}

// When base currency is PKR:
// txUsd ($1,000) converts to 278,500 PKR. txPkr (278,500 PKR) is identity. Total = 557,000 PKR.
const amount1InPkr = normalizeMonetaryAmountToTarget(txUsd, "PKR")
const amount2InPkr = normalizeMonetaryAmountToTarget(txPkr, "PKR")
const totalInPkr = addDecimals(amount1InPkr, amount2InPkr)

assert(
  amount1InPkr.equals(new Decimal(278500)) &&
    amount2InPkr.equals(new Decimal(278500)) &&
    totalInPkr.equals(new Decimal(557000)),
  "Multi-currency normalizer converts USD to PKR accurately without cross-currency sum distortion"
)

// When user changes base currency back to USD:
// txUsd ($1,000) is identity. txPkr (278,500 PKR) converts to $1,000 USD. Total = $2,000 USD.
const amount1InUsd = normalizeMonetaryAmountToTarget(txUsd, "USD")
const amount2InUsd = normalizeMonetaryAmountToTarget(txPkr, "USD")
const totalInUsd = addDecimals(amount1InUsd, amount2InUsd)

assert(
  amount1InUsd.equals(new Decimal(1000)) &&
    amount2InUsd.equals(new Decimal(1000)) &&
    totalInUsd.equals(new Decimal(2000)),
  "Multi-currency normalizer converts PKR to USD accurately when user changes base currency"
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
