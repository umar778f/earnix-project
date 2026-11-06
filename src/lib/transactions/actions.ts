"use server"

import { revalidatePath } from "next/cache"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { transactionSchema } from "@/lib/transactions/schemas"
import { toDecimal, multiplyDecimals } from "@/lib/currency/format"

export type TransactionActionResult = {
  success: boolean
  error?: string
  message?: string
}

export async function createTransactionAction(
  prevState: TransactionActionResult | null,
  formData: FormData
): Promise<TransactionActionResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase credentials are not configured. Cannot record transaction to database.",
    }
  }

  const rawData = {
    clientId: formData.get("clientId") || "",
    platformId: formData.get("platformId"),
    originalAmount: formData.get("originalAmount"),
    originalCurrency: formData.get("originalCurrency"),
    exchangeRate: formData.get("exchangeRate") || "1.0",
    paymentDate: formData.get("paymentDate"),
    description: formData.get("description"),
    referenceId: formData.get("referenceId") || "",
    status: formData.get("status") || "completed",
    category: formData.get("category") || "Freelance Income",
  }

  const parsed = transactionSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid transaction details",
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: "Authentication required to log transactions.",
    }
  }

  // Determine user base currency
  const { data: profile } = await supabase
    .from("profiles")
    .select("default_currency")
    .eq("id", user.id)
    .single()

  const baseCurrency = profile?.default_currency || "USD"
  const originalAmountDec = toDecimal(parsed.data.originalAmount)
  const exchangeRateDec = toDecimal(parsed.data.exchangeRate || 1.0)

  // Use arbitrary-precision decimal multiplication for financial ledger
  const convertedAmountDec = multiplyDecimals(originalAmountDec, exchangeRateDec)

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    client_id: parsed.data.clientId || null,
    platform_id: parsed.data.platformId,
    reference_id: parsed.data.referenceId || null,
    original_amount: originalAmountDec.toNumber(),
    original_currency: parsed.data.originalCurrency,
    exchange_rate: exchangeRateDec.toNumber(),
    converted_amount: convertedAmountDec.toNumber(),
    converted_currency: baseCurrency,
    conversion_date: new Date().toISOString().split("T")[0],
    conversion_source: "manual_entry",
    payment_date: new Date(parsed.data.paymentDate).toISOString(),
    description: parsed.data.description,
    status: parsed.data.status,
    source_type: "manual",
    category: parsed.data.category,
    metadata: { entryMethod: "Manual User Entry" },
  })

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        error: `Duplicate transaction detected: A transaction with Reference ID "${parsed.data.referenceId}" already exists for this platform.`,
      }
    }
    return {
      success: false,
      error: error.message,
    }
  }

  revalidatePath("/transactions")
  revalidatePath("/dashboard")
  revalidatePath("/clients")
  return {
    success: true,
    message: "Transaction logged successfully in ledger.",
  }
}

export async function updateTransactionAction(
  transactionId: string,
  prevState: TransactionActionResult | null,
  formData: FormData
): Promise<TransactionActionResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase credentials are not configured.",
    }
  }

  const rawData = {
    clientId: formData.get("clientId") || "",
    platformId: formData.get("platformId"),
    originalAmount: formData.get("originalAmount"),
    originalCurrency: formData.get("originalCurrency"),
    exchangeRate: formData.get("exchangeRate") || "1.0",
    paymentDate: formData.get("paymentDate"),
    description: formData.get("description"),
    referenceId: formData.get("referenceId") || "",
    status: formData.get("status") || "completed",
    category: formData.get("category") || "Freelance Income",
  }

  const parsed = transactionSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid transaction details",
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: "Authentication required.",
    }
  }

  const originalAmountDec = toDecimal(parsed.data.originalAmount)
  const exchangeRateDec = toDecimal(parsed.data.exchangeRate || 1.0)
  const convertedAmountDec = multiplyDecimals(originalAmountDec, exchangeRateDec)

  const { error } = await supabase
    .from("transactions")
    .update({
      client_id: parsed.data.clientId || null,
      platform_id: parsed.data.platformId,
      reference_id: parsed.data.referenceId || null,
      original_amount: originalAmountDec.toNumber(),
      original_currency: parsed.data.originalCurrency,
      exchange_rate: exchangeRateDec.toNumber(),
      converted_amount: convertedAmountDec.toNumber(),
      payment_date: new Date(parsed.data.paymentDate).toISOString(),
      description: parsed.data.description,
      status: parsed.data.status,
      category: parsed.data.category,
      updated_at: new Date().toISOString(),
    })
    .eq("id", transactionId)
    .eq("user_id", user.id)

  if (error) {
    return {
      success: false,
      error: error.message,
    }
  }

  revalidatePath("/transactions")
  revalidatePath("/dashboard")
  revalidatePath("/clients")
  return {
    success: true,
    message: "Transaction updated.",
  }
}

export async function deleteTransactionAction(transactionId: string): Promise<TransactionActionResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase credentials are not configured.",
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: "Authentication required.",
    }
  }

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", transactionId)
    .eq("user_id", user.id)

  if (error) {
    return {
      success: false,
      error: error.message,
    }
  }

  revalidatePath("/transactions")
  revalidatePath("/dashboard")
  revalidatePath("/clients")
  return {
    success: true,
    message: "Transaction removed from ledger.",
  }
}

