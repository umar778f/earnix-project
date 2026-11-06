import { parseCsvRows, normalizeHeader } from "@/lib/parsers/csv-helper"
import { toDecimal } from "@/lib/currency/format"
import Decimal from "decimal.js"

export type UpworkRowClassification =
  | "income"
  | "service_fee"
  | "withdrawal"
  | "adjustment"
  | "other"

export interface ParsedUpworkRow {
  rowNumber: number
  date: string // YYYY-MM-DD
  rawDate: string
  referenceId: string
  type: string
  classification: UpworkRowClassification
  description: string
  clientName: string
  amount: number // Positive number for income, positive absolute for fees
  currency: string
  isFee: boolean
  isIncome: boolean
  rawRow: Record<string, string>
}

export interface UpworkParseResult {
  success: boolean
  error?: string
  totalRows: number
  incomeRows: ParsedUpworkRow[]
  feeRows: ParsedUpworkRow[]
  withdrawalRows: ParsedUpworkRow[]
  allRows: ParsedUpworkRow[]
}

export function parseUpworkCsv(csvContent: string): UpworkParseResult {
  const table = parseCsvRows(csvContent)
  if (table.length < 2) {
    return {
      success: false,
      error: "CSV file is empty or missing data rows.",
      totalRows: 0,
      incomeRows: [],
      feeRows: [],
      withdrawalRows: [],
      allRows: [],
    }
  }

  const rawHeaders = table[0]
  const normalizedHeaders = rawHeaders.map(normalizeHeader)

  // Map header indexes
  const dateIdx = normalizedHeaders.findIndex((h) => h === "date")
  const refIdIdx = normalizedHeaders.findIndex(
    (h) => h === "refid" || h === "referenceid" || h === "ref"
  )
  const typeIdx = normalizedHeaders.findIndex((h) => h === "type")
  const descIdx = normalizedHeaders.findIndex(
    (h) => h === "description" || h === "memo" || h === "details"
  )
  const accountIdx = normalizedHeaders.findIndex(
    (h) => h === "accountname" || h === "client" || h === "account"
  )
  const amountIdx = normalizedHeaders.findIndex(
    (h) => h === "amount" || h === "grossamount"
  )
  const currencyIdx = normalizedHeaders.findIndex((h) => h === "currency")

  if (dateIdx === -1 || amountIdx === -1) {
    return {
      success: false,
      error:
        "Invalid Upwork statement format. Required columns 'Date' and 'Amount' were not found.",
      totalRows: 0,
      incomeRows: [],
      feeRows: [],
      withdrawalRows: [],
      allRows: [],
    }
  }

  const allRows: ParsedUpworkRow[] = []
  const incomeRows: ParsedUpworkRow[] = []
  const feeRows: ParsedUpworkRow[] = []
  const withdrawalRows: ParsedUpworkRow[] = []

  for (let i = 1; i < table.length; i++) {
    const row = table[i]
    if (row.length === 0 || (row.length === 1 && row[0] === "")) continue

    const rawDate = row[dateIdx] || ""
    const rawRefId = refIdIdx !== -1 ? row[refIdIdx] || "" : ""
    const rawType = typeIdx !== -1 ? row[typeIdx] || "Payment" : "Payment"
    const rawDesc = descIdx !== -1 ? row[descIdx] || "" : ""
    const rawAccount = accountIdx !== -1 ? row[accountIdx] || "" : ""
    const rawAmountStr = row[amountIdx] || "0"
    const rawCurrency =
      currencyIdx !== -1 && row[currencyIdx]
        ? row[currencyIdx].trim().toUpperCase()
        : "USD"

    // Parse amount safely
    const cleanAmountStr = rawAmountStr.replace(/[^0-9.-]/g, "")
    let parsedDecimal = new Decimal(0)
    try {
      parsedDecimal = toDecimal(cleanAmountStr || "0")
    } catch {
      parsedDecimal = new Decimal(0)
    }

    const numericAmount = parsedDecimal.toNumber()
    const absAmount = parsedDecimal.abs().toNumber()

    // Determine classification
    const lowerType = rawType.toLowerCase()
    const lowerDesc = rawDesc.toLowerCase()

    let classification: UpworkRowClassification = "other"
    let isIncome = false
    let isFee = false

    if (
      lowerType.includes("withdrawal") ||
      lowerDesc.includes("withdrawal") ||
      lowerType.includes("disbursement")
    ) {
      classification = "withdrawal"
    } else if (
      lowerType.includes("fee") ||
      lowerDesc.includes("service fee") ||
      numericAmount < 0
    ) {
      classification = "service_fee"
      isFee = true
    } else if (
      lowerType.includes("hourly") ||
      lowerType.includes("fixed") ||
      lowerType.includes("milestone") ||
      lowerType.includes("bonus") ||
      lowerType.includes("salary") ||
      numericAmount > 0
    ) {
      classification = "income"
      isIncome = true
    }

    // Determine client name
    let clientName = rawAccount.trim()
    if (!clientName && rawDesc) {
      // Look for "Invoice for ... - Client Name" or "... by Client Name"
      const dashMatch = rawDesc.match(/-\s*([^-(]+)$/)
      if (dashMatch && dashMatch[1]) {
        clientName = dashMatch[1].trim()
      } else {
        clientName = "Upwork Client"
      }
    }
    if (!clientName) {
      clientName = isFee ? "Upwork Global Inc." : "Direct Client"
    }

    // Format ISO date (supports 'Nov 2, 2026', '2026-11-02', '11/02/2026')
    const formattedDate = parseUpworkDate(rawDate)

    const parsedRow: ParsedUpworkRow = {
      rowNumber: i,
      date: formattedDate,
      rawDate,
      referenceId: rawRefId || `UP-${formattedDate}-${i}`,
      type: rawType,
      classification,
      description: rawDesc || `${rawType} Payment`,
      clientName,
      amount: absAmount,
      currency: rawCurrency,
      isFee,
      isIncome,
      rawRow: rawHeaders.reduce(
        (acc, header, idx) => {
          acc[header] = row[idx] || ""
          return acc
        },
        {} as Record<string, string>
      ),
    }

    allRows.push(parsedRow)

    if (classification === "income") {
      incomeRows.push(parsedRow)
    } else if (classification === "service_fee") {
      feeRows.push(parsedRow)
    } else if (classification === "withdrawal") {
      withdrawalRows.push(parsedRow)
    }
  }

  return {
    success: true,
    totalRows: allRows.length,
    incomeRows,
    feeRows,
    withdrawalRows,
    allRows,
  }
}

function parseUpworkDate(dateStr: string): string {
  if (!dateStr) return "2026-11-01"

  // Standard YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
    return dateStr.trim()
  }

  // Parse English date strings like 'Nov 2, 2026' or 'November 2, 2026'
  const parsed = new Date(dateStr)
  if (!isNaN(parsed.getTime())) {
    const year = parsed.getFullYear()
    const month = String(parsed.getMonth() + 1).padStart(2, "0")
    const day = String(parsed.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  return dateStr.trim().slice(0, 10)
}

/**
 * Pre-configured realistic Upwork CSV Statement fixture for FYP Demonstration
 */
export const SAMPLE_UPWORK_CSV = `Date,Ref ID,Type,Description,Agency,Freelancer,Team,Account Name,Amount,Currency
Nov 2 2026,98240182,Fixed Price,Invoice for Milestone 3: Next.js SaaS Architecture & API Implementation,,Umar,,Acme Cloud Solutions,1800.00,USD
Nov 2 2026,98240183,Service Fee,Upwork Service Fee for Milestone 3 - Acme Cloud Solutions,,Umar,,Upwork,-180.00,USD
Oct 28 2026,98240170,Hourly,Hourly salary for 24.5 hrs at $45.00/hr - Frontend Optimization,,Umar,,PixelCraft Studios,1102.50,USD
Oct 28 2026,98240171,Service Fee,Upwork Service Fee for Hourly Contract - PixelCraft Studios,,Umar,,Upwork,-110.25,USD
Oct 21 2026,98240155,Fixed Price,Milestone 1: PostgreSQL Schema Design & Query Tuning,,Umar,,BrightWave Media,950.00,USD
Oct 21 2026,98240156,Service Fee,Upwork Service Fee for Milestone 1 - BrightWave Media,,Umar,,Upwork,-95.00,USD
Oct 14 2026,98240140,Hourly,Hourly salary for 18.0 hrs at $50.00/hr - AI Copilot Integration,,Umar,,Nordic FinTech Labs,900.00,USD
Oct 14 2026,98240141,Service Fee,Upwork Service Fee for Hourly - Nordic FinTech Labs,,Umar,,Upwork,-90.00,USD
Oct 05 2026,98240110,Withdrawal,Direct to Local Bank (Wire Transfer PKR) - Ref: W-9482110,,Umar,,Bank Transfer,-4277.25,USD`

