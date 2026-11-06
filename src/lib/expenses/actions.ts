"use server"

import { revalidatePath } from "next/cache"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { expenseFormSchema } from "@/lib/expenses/schemas"
import { toDecimal, multiplyDecimals } from "@/lib/currency/format"
import Decimal from "decimal.js"

export type ExpenseActionResult = {
  success: boolean
  error?: string
  id?: string
  fieldErrors?: Record<string, string[]>
}

export async function createExpenseAction(formData: FormData): Promise<ExpenseActionResult> {
  const rawData: Record<string, unknown> = {
    title: formData.get("title"),
    originalAmount: formData.get("originalAmount"),
    originalCurrency: formData.get("originalCurrency") || "USD",
    exchangeRate: formData.get("exchangeRate") || "1.0",
    category: formData.get("category"),
    isTaxDeductible: formData.get("isTaxDeductible") === "true" || formData.get("isTaxDeductible") === "on",
    taxCategory: formData.get("taxCategory") || undefined,
    expenseDate: formData.get("expenseDate"),
    documentId: formData.get("documentId") || null,
    notes: formData.get("notes") || undefined,
  }

  const parsed = expenseFormSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed. Please review the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const originalAmountDec = toDecimal(parsed.data.originalAmount)
  const exchangeRateDec = toDecimal(parsed.data.exchangeRate || 1.0)
  const convertedAmountDec = multiplyDecimals(originalAmountDec, exchangeRateDec)

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return {
          success: false,
          error: "You must be signed in to log an expense.",
        }
      }

      // Read user's default display currency
      const { data: profile } = await supabase
        .from("profiles")
        .select("default_currency")
        .eq("id", user.id)
        .single()

      const baseCurrency = profile?.default_currency || "USD"

      const { data, error } = await supabase
        .from("expenses")
        .insert({
          user_id: user.id,
          title: parsed.data.title,
          original_amount: originalAmountDec.toNumber(),
          original_currency: parsed.data.originalCurrency,
          exchange_rate: exchangeRateDec.toNumber(),
          converted_amount: convertedAmountDec.toDecimalPlaces(4, Decimal.ROUND_HALF_UP).toNumber(),
          converted_currency: baseCurrency,
          category: parsed.data.category,
          is_tax_deductible: parsed.data.isTaxDeductible,
          tax_category: parsed.data.taxCategory || parsed.data.category,
          expense_date: parsed.data.expenseDate,
          document_id: parsed.data.documentId || null,
          notes: parsed.data.notes || null,
          ai_review_status: "unassigned",
        })
        .select("id")
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      revalidatePath("/expenses")
      revalidatePath("/dashboard")
      revalidatePath("/tax")
      return { success: true, id: data?.id }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to record expense"
      return { success: false, error: msg }
    }
  }

  // Guest/demo fallback
  revalidatePath("/expenses")
  return { success: true, id: `demo-exp-${Date.now()}` }
}

export async function updateExpenseAction(formData: FormData): Promise<ExpenseActionResult> {
  const expenseId = formData.get("id") as string
  if (!expenseId) {
    return { success: false, error: "Missing expense ID" }
  }

  const rawData: Record<string, unknown> = {
    id: expenseId,
    title: formData.get("title"),
    originalAmount: formData.get("originalAmount"),
    originalCurrency: formData.get("originalCurrency") || "USD",
    exchangeRate: formData.get("exchangeRate") || "1.0",
    category: formData.get("category"),
    isTaxDeductible: formData.get("isTaxDeductible") === "true" || formData.get("isTaxDeductible") === "on",
    taxCategory: formData.get("taxCategory") || undefined,
    expenseDate: formData.get("expenseDate"),
    documentId: formData.get("documentId") || null,
    notes: formData.get("notes") || undefined,
  }

  const parsed = expenseFormSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed. Please review the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const originalAmountDec = toDecimal(parsed.data.originalAmount)
  const exchangeRateDec = toDecimal(parsed.data.exchangeRate || 1.0)
  const convertedAmountDec = multiplyDecimals(originalAmountDec, exchangeRateDec)

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return { success: false, error: "Authentication required." }
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("default_currency")
        .eq("id", user.id)
        .single()

      const baseCurrency = profile?.default_currency || "USD"

      const { error } = await supabase
        .from("expenses")
        .update({
          title: parsed.data.title,
          original_amount: originalAmountDec.toNumber(),
          original_currency: parsed.data.originalCurrency,
          exchange_rate: exchangeRateDec.toNumber(),
          converted_amount: convertedAmountDec.toDecimalPlaces(4, Decimal.ROUND_HALF_UP).toNumber(),
          converted_currency: baseCurrency,
          category: parsed.data.category,
          is_tax_deductible: parsed.data.isTaxDeductible,
          tax_category: parsed.data.taxCategory || parsed.data.category,
          expense_date: parsed.data.expenseDate,
          document_id: parsed.data.documentId || null,
          notes: parsed.data.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", expenseId)
        .eq("user_id", user.id)

      if (error) {
        return { success: false, error: error.message }
      }

      revalidatePath("/expenses")
      revalidatePath("/dashboard")
      revalidatePath("/tax")
      return { success: true, id: expenseId }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update expense"
      return { success: false, error: msg }
    }
  }

  revalidatePath("/expenses")
  return { success: true, id: expenseId }
}

export async function deleteExpenseAction(id: string): Promise<ExpenseActionResult> {
  if (!id) {
    return { success: false, error: "Missing expense ID" }
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return { success: false, error: "Authentication required." }
      }

      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)

      if (error) {
        return { success: false, error: error.message }
      }

      revalidatePath("/expenses")
      revalidatePath("/dashboard")
      revalidatePath("/tax")
      return { success: true }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete expense"
      return { success: false, error: msg }
    }
  }

  revalidatePath("/expenses")
  return { success: true }
}
