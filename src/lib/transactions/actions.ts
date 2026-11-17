"use server"

import { randomUUID } from "crypto"
import { revalidatePath } from "next/cache"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { transactionSchema } from "@/lib/transactions/schemas"
import { toDecimal, multiplyDecimals } from "@/lib/currency/format"
import { getExchangeRate } from "@/lib/currency/exchange"

function generateManualReferenceId(): string {
  return `MAN-${randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`
}

export type TransactionActionResult = {
  success: boolean
  error?: string
  message?: string
}

async function resolveValidPlatformId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  requestedPlatformId?: string | null
): Promise<string | null> {
  if (requestedPlatformId) {
    const { data: exact } = await supabase
      .from("platforms")
      .select("id")
      .eq("id", requestedPlatformId)
      .maybeSingle()
    if (exact?.id) {
      return exact.id
    }
  }

  const { data: platforms } = await supabase
    .from("platforms")
    .select("id, code")
    .eq("is_active", true)

  if (!platforms || platforms.length === 0) {
    return null
  }

  const preferred =
    platforms.find((p) => p.code === "manual") ||
    platforms.find((p) => p.code === "upwork") ||
    platforms[0]

  return preferred.id
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

  const today = new Date().toISOString().split("T")[0]
  const rawExchangeRate = formData.get("exchangeRate")
  const rawData = {
    clientId: formData.get("clientId") || "",
    platformId: formData.get("platformId") || "",
    originalAmount: formData.get("originalAmount") || "",
    originalCurrency: formData.get("originalCurrency") || "USD",
    exchangeRate: typeof rawExchangeRate === "string" && rawExchangeRate.trim() !== "" ? rawExchangeRate.trim() : undefined,
    paymentDate: formData.get("paymentDate") || today,
    description: formData.get("description") || "",
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

  const [profileResult, resolvedPlatformId] = await Promise.all([
    supabase.from("profiles").select("default_currency").eq("id", user.id).single(),
    resolveValidPlatformId(supabase, parsed.data.platformId),
  ])

  if (!resolvedPlatformId) {
    return {
      success: false,
      error: "No active platform found in database. Please run the database seed migration.",
    }
  }

  const baseCurrency = profileResult.data?.default_currency || "USD"
  const originalAmountDec = toDecimal(parsed.data.originalAmount)

  let exchangeRateNum: number
  let conversionSource = "manual_entry"
  if (parsed.data.exchangeRate) {
    exchangeRateNum = toDecimal(parsed.data.exchangeRate).toNumber()
  } else {
    const rateResult = await getExchangeRate(parsed.data.originalCurrency, baseCurrency)
    exchangeRateNum = rateResult.rate
    conversionSource = rateResult.source
  }

  const exchangeRateDec = toDecimal(exchangeRateNum)
  const convertedAmountDec = multiplyDecimals(originalAmountDec, exchangeRateDec)
  const resolvedReferenceId = parsed.data.referenceId?.trim() || generateManualReferenceId()

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    client_id: parsed.data.clientId || null,
    platform_id: resolvedPlatformId,
    reference_id: resolvedReferenceId,
    original_amount: originalAmountDec.toNumber(),
    original_currency: parsed.data.originalCurrency,
    exchange_rate: exchangeRateDec.toNumber(),
    converted_amount: convertedAmountDec.toNumber(),
    converted_currency: baseCurrency,
    conversion_date: today,
    conversion_source: conversionSource,
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
  revalidatePath("/tax")
  return {
    success: true,
    message: "Transaction saved.",
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

  const today = new Date().toISOString().split("T")[0]
  const rawExchangeRate = formData.get("exchangeRate")
  const rawData = {
    clientId: formData.get("clientId") || "",
    platformId: formData.get("platformId") || "",
    originalAmount: formData.get("originalAmount") || "",
    originalCurrency: formData.get("originalCurrency") || "USD",
    exchangeRate: typeof rawExchangeRate === "string" && rawExchangeRate.trim() !== "" ? rawExchangeRate.trim() : undefined,
    paymentDate: formData.get("paymentDate") || today,
    description: formData.get("description") || "",
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

  const [profileResult, resolvedPlatformId] = await Promise.all([
    supabase.from("profiles").select("default_currency").eq("id", user.id).single(),
    resolveValidPlatformId(supabase, parsed.data.platformId),
  ])

  if (!resolvedPlatformId) {
    return {
      success: false,
      error: "No active platform found in database.",
    }
  }

  const baseCurrency = profileResult.data?.default_currency || "USD"
  const originalAmountDec = toDecimal(parsed.data.originalAmount)
  const exchangeRateNum = parsed.data.exchangeRate
    ? toDecimal(parsed.data.exchangeRate).toNumber()
    : (await getExchangeRate(parsed.data.originalCurrency, baseCurrency)).rate

  const exchangeRateDec = toDecimal(exchangeRateNum)
  const convertedAmountDec = multiplyDecimals(originalAmountDec, exchangeRateDec)
  const resolvedReferenceId = parsed.data.referenceId?.trim() || generateManualReferenceId()

  const { error } = await supabase
    .from("transactions")
    .update({
      client_id: parsed.data.clientId || null,
      platform_id: resolvedPlatformId,
      reference_id: resolvedReferenceId,
      original_amount: originalAmountDec.toNumber(),
      original_currency: parsed.data.originalCurrency,
      exchange_rate: exchangeRateDec.toNumber(),
      converted_amount: convertedAmountDec.toNumber(),
      converted_currency: baseCurrency,
      payment_date: new Date(parsed.data.paymentDate).toISOString(),
      description: parsed.data.description,
      status: parsed.data.status,
      category: parsed.data.category,
      updated_at: new Date().toISOString(),
    })
    .eq("id", transactionId)
    .eq("user_id", user.id)

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        error: `Duplicate transaction detected: A transaction with Reference ID "${resolvedReferenceId}" already exists for this platform.`,
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
  revalidatePath("/tax")
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
  revalidatePath("/tax")
  return {
    success: true,
    message: "Transaction removed from ledger.",
  }
}
