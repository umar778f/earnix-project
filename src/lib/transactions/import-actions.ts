"use server"

import { revalidatePath } from "next/cache"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { toDecimal, multiplyDecimals } from "@/lib/currency/format"
import { BENCHMARK_RATES_TO_USD, type SupportedCurrency } from "@/lib/currency/currencies"
import { type TransactionStatus, type SourceType, type AiReviewStatus } from "@/types/database.types"
import Decimal from "decimal.js"

export type ImportCandidateClassification =
  | "income"
  | "service_fee"
  | "withdrawal"
  | "adjustment"
  | "other"

export interface ImportCandidateRow {
  date: string
  referenceId: string
  clientName: string
  description: string
  originalAmount: number
  originalCurrency: string
  classification: ImportCandidateClassification
}

export interface ReconciledRow extends ImportCandidateRow {
  reconciliationStatus: "ready" | "duplicate" | "fee" | "ignored"
  reconciliationMessage: string
  exchangeRate: number
  convertedAmount: number
  convertedCurrency: string
}

export interface ReconciliationResult {
  success: boolean
  error?: string
  baseCurrency: string
  totalParsed: number
  readyCount: number
  duplicateCount: number
  feeCount: number
  totalGrossIncomeConverted: number
  totalFeesConverted: number
  rows: ReconciledRow[]
}

export async function reconcileImportRowsAction(
  candidates: ImportCandidateRow[],
  platformCode: "upwork" | "generic_csv" = "upwork"
): Promise<ReconciliationResult> {
  let baseCurrency = "USD"
  const existingRefIds = new Set<string>()

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Fetch default base currency
        const { data: profile } = await supabase
          .from("profiles")
          .select("default_currency")
          .eq("id", user.id)
          .single()

        if (profile?.default_currency) {
          baseCurrency = profile.default_currency
        }

        // Fetch platform ID for Upwork / generic
        const { data: platform } = await supabase
          .from("platforms")
          .select("id")
          .eq("code", platformCode)
          .single()

        const platformId = platform?.id

        // Fetch existing reference IDs for deduplication
        let query = supabase
          .from("transactions")
          .select("reference_id")
          .eq("user_id", user.id)

        if (platformId) {
          query = query.eq("platform_id", platformId)
        }

        const { data: existingTx } = await query
        if (existingTx) {
          existingTx.forEach((tx) => {
            if (tx.reference_id) existingRefIds.add(tx.reference_id)
          })
        }
      }
    } catch {
      // Fallback
    }
  }

  let totalGrossDec = new Decimal(0)
  let totalFeesDec = new Decimal(0)
  let readyCount = 0
  let duplicateCount = 0
  let feeCount = 0

  const reconciledRows: ReconciledRow[] = []

  for (const row of candidates) {
    // Compute FX rate relative to baseCurrency
    const curr = (row.originalCurrency as SupportedCurrency) || "USD"
    let rate = 1.0

    if (curr !== baseCurrency) {
      if (curr === "PKR" && baseCurrency === "USD") {
        rate = 1 / BENCHMARK_RATES_TO_USD.PKR
      } else if (curr === "USD" && baseCurrency === "PKR") {
        rate = BENCHMARK_RATES_TO_USD.PKR
      } else if (curr === "EUR" && baseCurrency === "USD") {
        rate = 1.085
      } else if (curr === "GBP" && baseCurrency === "USD") {
        rate = 1.278
      }
    }

    const rateDec = toDecimal(rate)
    const amountDec = toDecimal(row.originalAmount)
    const convertedDec = multiplyDecimals(amountDec, rateDec).toDecimalPlaces(
      4,
      Decimal.ROUND_HALF_UP
    )

    let status: ReconciledRow["reconciliationStatus"] = "ready"
    let message = "Valid income transaction ready for immutable commit"

    if (row.classification === "withdrawal") {
      status = "ignored"
      message = "Bank withdrawal / disbursement (cash movement, excluded from gross revenue)"
    } else if (row.classification === "service_fee") {
      status = "fee"
      message = "Platform service fee (can be logged into Expenses as tax-deductible)"
      feeCount++
      totalFeesDec = totalFeesDec.plus(convertedDec)
    } else if (row.referenceId && existingRefIds.has(row.referenceId)) {
      status = "duplicate"
      message = `Duplicate reference ID "${row.referenceId}" already recorded in database ledger`
      duplicateCount++
    } else {
      readyCount++
      totalGrossDec = totalGrossDec.plus(convertedDec)
    }

    reconciledRows.push({
      ...row,
      reconciliationStatus: status,
      reconciliationMessage: message,
      exchangeRate: rateDec.toNumber(),
      convertedAmount: convertedDec.toNumber(),
      convertedCurrency: baseCurrency,
    })
  }

  return {
    success: true,
    baseCurrency,
    totalParsed: candidates.length,
    readyCount,
    duplicateCount,
    feeCount,
    totalGrossIncomeConverted: totalGrossDec.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    totalFeesConverted: totalFeesDec.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    rows: reconciledRows,
  }
}

export interface CommitBatchParams {
  platformCode: "upwork" | "generic_csv"
  incomeRows: ReconciledRow[]
  feeRows: ReconciledRow[]
  importFeesAsExpenses: boolean
}

export interface CommitBatchResult {
  success: boolean
  error?: string
  importedTransactionsCount: number
  importedFeesCount: number
  createdClientsCount: number
  totalGrossImported: number
  baseCurrency: string
}

export async function commitImportBatchAction(
  params: CommitBatchParams
): Promise<CommitBatchResult> {
  const { platformCode, incomeRows, feeRows, importFeesAsExpenses } = params

  if (incomeRows.length === 0 && (!importFeesAsExpenses || feeRows.length === 0)) {
    return {
      success: false,
      error: "No eligible records selected for ingestion.",
      importedTransactionsCount: 0,
      importedFeesCount: 0,
      createdClientsCount: 0,
      totalGrossImported: 0,
      baseCurrency: "USD",
    }
  }

  let baseCurrency = "USD"
  let newClientsCount = 0

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return {
          success: false,
          error: "You must be signed in to commit transactions to the ledger.",
          importedTransactionsCount: 0,
          importedFeesCount: 0,
          createdClientsCount: 0,
          totalGrossImported: 0,
          baseCurrency: "USD",
        }
      }

      // Read profile base currency
      const { data: profile } = await supabase
        .from("profiles")
        .select("default_currency")
        .eq("id", user.id)
        .single()

      if (profile?.default_currency) {
        baseCurrency = profile.default_currency
      }

      // Resolve platform ID
      const { data: platform } = await supabase
        .from("platforms")
        .select("id")
        .eq("code", platformCode)
        .single()

      const platformId = platform?.id
      if (!platformId) {
        return {
          success: false,
          error: `Platform ${platformCode} not found in database catalog.`,
          importedTransactionsCount: 0,
          importedFeesCount: 0,
          createdClientsCount: 0,
          totalGrossImported: 0,
          baseCurrency,
        }
      }

      // 1. Resolve and create missing clients
      const uniqueClientNames = Array.from(
        new Set(incomeRows.map((r) => r.clientName.trim()).filter(Boolean))
      )

      const clientMap = new Map<string, string>() // Name -> Client ID

      // Fetch existing clients
      const { data: existingClients } = await supabase
        .from("clients")
        .select("id, name")
        .eq("user_id", user.id)

      if (existingClients) {
        existingClients.forEach((c) => clientMap.set(c.name.toLowerCase(), c.id))
      }

      // Create clients that don't exist yet in a single batch
      const missingClientNames = uniqueClientNames.filter((name) => !clientMap.has(name.toLowerCase()))
      if (missingClientNames.length > 0) {
        const { data: newClients, error: clientErr } = await supabase
          .from("clients")
          .insert(
            missingClientNames.map((name) => ({
              user_id: user.id,
              name,
              default_platform_id: platformId,
              notes: `Auto-created from ${platformCode === "upwork" ? "Upwork" : "Generic"} statement import.`,
            }))
          )
          .select("id, name")

        if (!clientErr && newClients) {
          newClients.forEach((nc) => clientMap.set(nc.name.toLowerCase(), nc.id))
          newClientsCount = newClients.length
        }
      }

      // 2. Batch insert income transactions into ledger
      const transactionsToInsert = incomeRows.map((row) => ({
        user_id: user.id,
        platform_id: platformId,
        client_id: clientMap.get(row.clientName.toLowerCase()) || null,
        reference_id: row.referenceId,
        original_amount: row.originalAmount,
        original_currency: row.originalCurrency,
        exchange_rate: row.exchangeRate,
        converted_amount: row.convertedAmount,
        converted_currency: baseCurrency,
        payment_date: `${row.date}T12:00:00Z`,
        description: row.description,
        status: "completed" as TransactionStatus,
        source_type: (platformCode === "upwork" ? "csv_upwork" : "csv_generic") as SourceType,
        category: "Freelance Income",
        ai_review_status: "unassigned" as AiReviewStatus,
        metadata: {
          importedAt: new Date().toISOString(),
          platform: platformCode,
        },
      }))

      if (transactionsToInsert.length > 0) {
        const { error: txError } = await supabase
          .from("transactions")
          .insert(transactionsToInsert)

        if (txError) {
          return {
            success: false,
            error: `Failed to commit transactions: ${txError.message}`,
            importedTransactionsCount: 0,
            importedFeesCount: 0,
            createdClientsCount: newClientsCount,
            totalGrossImported: 0,
            baseCurrency,
          }
        }
      }

      // 3. Batch insert service fees into expenses if requested
      let importedFeesCount = 0
      if (importFeesAsExpenses && feeRows.length > 0) {
        const feesToInsert = feeRows.map((row) => ({
          user_id: user.id,
          title: `Upwork Service Fee (${row.description.slice(0, 50)})`,
          original_amount: row.originalAmount,
          original_currency: row.originalCurrency,
          exchange_rate: row.exchangeRate,
          converted_amount: row.convertedAmount,
          converted_currency: baseCurrency,
          category: "Platform & Payment Fees",
          is_tax_deductible: true,
          tax_category: "Platform Service Fees & Commissions",
          expense_date: row.date,
          notes: `Upwork Ref ID: ${row.referenceId}. Auto-imported from statement.`,
          ai_review_status: "confirmed" as AiReviewStatus,
        }))

        const { error: feeErr } = await supabase.from("expenses").insert(feesToInsert)
        if (!feeErr) {
          importedFeesCount = feesToInsert.length
        }
      }

      const totalGross = incomeRows.reduce((acc, r) => acc + r.convertedAmount, 0)
      const formattedTotal = totalGross.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })

      // 4. Automatically create in-app notification in notifications table
      try {
        const notifTitle =
          platformCode === "upwork"
            ? `Upwork Ingestion: ${transactionsToInsert.length} milestone${transactionsToInsert.length === 1 ? "" : "s"} added`
            : `Statement Ingestion: ${transactionsToInsert.length} record${transactionsToInsert.length === 1 ? "" : "s"} added`

        const notifMessage =
          platformCode === "upwork"
            ? `Successfully committed ${transactionsToInsert.length} Upwork milestone${transactionsToInsert.length === 1 ? "" : "s"} (${baseCurrency} ${formattedTotal})${importedFeesCount > 0 ? ` and ${importedFeesCount} platform fee expense${importedFeesCount === 1 ? "" : "s"}` : ""} to your ledger.`
            : `Successfully committed ${transactionsToInsert.length} transaction${transactionsToInsert.length === 1 ? "" : "s"} (${baseCurrency} ${formattedTotal}) to your ledger.`

        await supabase.from("notifications").insert({
          user_id: user.id,
          title: notifTitle,
          message: notifMessage,
          type: "info",
          is_read: false,
          action_url: "/transactions",
        })
      } catch (notifErr) {
        console.warn("Could not insert notification for imported batch:", notifErr)
      }

      // Revalidate cache paths
      revalidatePath("/transactions")
      revalidatePath("/dashboard")
      revalidatePath("/clients")
      revalidatePath("/expenses")
      revalidatePath("/tax")

      return {
        success: true,
        importedTransactionsCount: transactionsToInsert.length,
        importedFeesCount,
        createdClientsCount: newClientsCount,
        totalGrossImported: Number(totalGross.toFixed(2)),
        baseCurrency,
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ingestion commit failed"
      return {
        success: false,
        error: msg,
        importedTransactionsCount: 0,
        importedFeesCount: 0,
        createdClientsCount: 0,
        totalGrossImported: 0,
        baseCurrency,
      }
    }
  }

  return {
    success: false,
    error: "Supabase credentials are not configured. Cannot commit transactions to the database ledger.",
    importedTransactionsCount: 0,
    importedFeesCount: 0,
    createdClientsCount: 0,
    totalGrossImported: 0,
    baseCurrency: "USD",
  }
}

