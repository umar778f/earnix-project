import { parseCsvRows, normalizeHeader } from "@/lib/parsers/csv-helper"
import { toDecimal } from "@/lib/currency/format"
import Decimal from "decimal.js"

export interface ParsedGenericRow {
  rowNumber: number
  date: string
  referenceId: string
  clientName: string
  description: string
  amount: number
  currency: string
  category: string
}

export interface GenericParseResult {
  success: boolean
  error?: string
  totalRows: number
  rows: ParsedGenericRow[]
}

export function parseGenericCsv(csvContent: string): GenericParseResult {
  const table = parseCsvRows(csvContent)
  if (table.length < 2) {
    return {
      success: false,
      error: "CSV file is empty or missing data rows.",
      totalRows: 0,
      rows: [],
    }
  }

  const rawHeaders = table[0]
  const normalizedHeaders = rawHeaders.map(normalizeHeader)

  const dateIdx = normalizedHeaders.findIndex((h) => h === "date")
  const amountIdx = normalizedHeaders.findIndex(
    (h) => h === "amount" || h === "total" || h === "gross" || h === "paid"
  )
  const clientIdx = normalizedHeaders.findIndex(
    (h) => h === "client" || h === "customer" || h === "payer" || h === "clientname"
  )
  const descIdx = normalizedHeaders.findIndex(
    (h) => h === "description" || h === "details" || h === "memo" || h === "notes"
  )
  const currencyIdx = normalizedHeaders.findIndex((h) => h === "currency")
  const refIdIdx = normalizedHeaders.findIndex(
    (h) => h === "refid" || h === "referenceid" || h === "invoiceid" || h === "id"
  )
  const catIdx = normalizedHeaders.findIndex((h) => h === "category")

  if (dateIdx === -1 || amountIdx === -1) {
    return {
      success: false,
      error: "Missing required columns: CSV must contain 'Date' and 'Amount'.",
      totalRows: 0,
      rows: [],
    }
  }

  const rows: ParsedGenericRow[] = []

  for (let i = 1; i < table.length; i++) {
    const row = table[i]
    if (row.length === 0 || (row.length === 1 && row[0] === "")) continue

    const rawDate = row[dateIdx] || ""
    const rawAmountStr = row[amountIdx] || "0"
    const rawClient = clientIdx !== -1 ? row[clientIdx] || "Direct Client" : "Direct Client"
    const rawDesc = descIdx !== -1 ? row[descIdx] || "Freelance Payment" : "Freelance Payment"
    const rawCurrency =
      currencyIdx !== -1 && row[currencyIdx]
        ? row[currencyIdx].trim().toUpperCase()
        : "USD"
    const rawRefId = refIdIdx !== -1 ? row[refIdIdx] || "" : ""
    const rawCategory = catIdx !== -1 ? row[catIdx] || "Freelance Income" : "Freelance Income"

    // Parse amount
    let amountDec = new Decimal(0)
    try {
      amountDec = toDecimal(rawAmountStr.replace(/[^0-9.-]/g, "") || "0")
    } catch {
      amountDec = new Decimal(0)
    }

    if (amountDec.isZero() || amountDec.isNegative()) continue

    const isoDate = normalizeDate(rawDate)

    rows.push({
      rowNumber: i,
      date: isoDate,
      referenceId: rawRefId || `INV-${isoDate}-${i}`,
      clientName: rawClient.trim(),
      description: rawDesc.trim(),
      amount: amountDec.toNumber(),
      currency: rawCurrency,
      category: rawCategory.trim(),
    })
  }

  return {
    success: true,
    totalRows: rows.length,
    rows,
  }
}

function normalizeDate(dateStr: string): string {
  if (!dateStr) return "2026-11-01"
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) return dateStr.trim()
  const d = new Date(dateStr)
  if (!isNaN(d.getTime())) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`
  }
  return dateStr.trim().slice(0, 10)
}

export const SAMPLE_GENERIC_CSV = `Date,Client,Description,Amount,Currency,Ref ID,Category
2026-11-03,Nordic FinTech Labs,Monthly Retainer: Full-Stack Engineering,2200.00,EUR,INV-2026-11,Software Development
2026-10-18,Apex Retail Analytics,PostgreSQL Database Performance Tuning,950.00,USD,INV-2026-08,Consulting
2026-10-09,Local Tech Hub,Full-Stack Web Mentorship & Workshop,55000.00,PKR,INV-2026-05,Freelance Income`

