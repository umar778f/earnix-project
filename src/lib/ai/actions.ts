"use server"

import { revalidatePath } from "next/cache"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import {
  classifyIncomeTransaction,
  classifyExpenseRecord,
  type CategorizationSuggestion,
} from "@/lib/ai/categorizer"

export type AiActionResult<T = unknown> = {
  success: boolean
  error?: string
  data?: T
}

/**
 * Runs AI categorization on unassigned transactions and stages them for review
 */
export async function runAiTransactionCategorizationAction(): Promise<
  AiActionResult<{ count: number; suggestions: CategorizationSuggestion[] }>
> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return { success: false, error: "Authentication required." }
      }

      // Fetch unassigned or pending transactions
      const { data: txList, error } = await supabase
        .from("transactions")
        .select(`
          id,
          description,
          original_amount,
          category,
          ai_review_status,
          clients ( name )
        `)
        .eq("user_id", user.id)
        .in("ai_review_status", ["unassigned", "pending_review"])
        .limit(20)

      if (error) {
        return { success: false, error: error.message }
      }

      if (!txList || txList.length === 0) {
        return {
          success: true,
          data: { count: 0, suggestions: [] },
        }
      }

      const suggestions: CategorizationSuggestion[] = []

      for (const tx of txList) {
        const client = tx.clients as { name?: string } | null
        const clientName = client?.name || "Direct Client"

        const suggestion = await classifyIncomeTransaction(
          tx.id,
          tx.description,
          clientName,
          Number(tx.original_amount),
          tx.category
        )

        suggestions.push(suggestion)

        // Stage into pending_review (Does NOT mutate permanently without user confirmation)
        await supabase
          .from("transactions")
          .update({
            category: suggestion.suggestedCategory,
            ai_confidence: suggestion.confidence,
            ai_review_status: "pending_review",
            updated_at: new Date().toISOString(),
          })
          .eq("id", tx.id)
          .eq("user_id", user.id)
      }

      revalidatePath("/transactions")
      revalidatePath("/dashboard")
      return {
        success: true,
        data: { count: suggestions.length, suggestions },
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "AI categorization failed"
      return { success: false, error: msg }
    }
  }

  return {
    success: true,
    data: { count: 0, suggestions: [] },
  }
}

/**
 * Confirms an AI category suggestion (User Review Policy enforcement)
 */
export async function confirmAiTransactionCategoryAction(
  transactionId: string,
  approvedCategory?: string
): Promise<AiActionResult> {
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
        .from("transactions")
        .update({
          ai_review_status: "confirmed" as const,
          updated_at: new Date().toISOString(),
          ...(approvedCategory ? { category: approvedCategory } : {}),
        })
        .eq("id", transactionId)
        .eq("user_id", user.id)

      if (error) {
        return { success: false, error: error.message }
      }

      revalidatePath("/transactions")
      revalidatePath("/dashboard")
      return { success: true }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Confirmation failed"
      return { success: false, error: msg }
    }
  }

  revalidatePath("/transactions")
  return { success: true }
}

/**
 * Bulk confirms all pending transaction categories
 */
export async function bulkConfirmAiTransactionsAction(
  approvedIds: string[]
): Promise<AiActionResult<{ confirmedCount: number }>> {
  if (approvedIds.length === 0) {
    return { success: true, data: { confirmedCount: 0 } }
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
        .from("transactions")
        .update({
          ai_review_status: "confirmed",
          updated_at: new Date().toISOString(),
        })
        .in("id", approvedIds)
        .eq("user_id", user.id)

      if (error) {
        return { success: false, error: error.message }
      }

      revalidatePath("/transactions")
      revalidatePath("/dashboard")
      return { success: true, data: { confirmedCount: approvedIds.length } }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bulk confirmation failed"
      return { success: false, error: msg }
    }
  }

  revalidatePath("/transactions")
  return { success: true, data: { confirmedCount: approvedIds.length } }
}

/**
 * Runs AI categorization on unassigned expenses
 */
export async function runAiExpenseCategorizationAction(): Promise<
  AiActionResult<{ count: number; suggestions: CategorizationSuggestion[] }>
> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return { success: false, error: "Authentication required." }
      }

      const { data: expList, error } = await supabase
        .from("expenses")
        .select("id, title, original_amount, category, notes, ai_review_status")
        .eq("user_id", user.id)
        .in("ai_review_status", ["unassigned", "pending_review"])
        .limit(20)

      if (error) {
        return { success: false, error: error.message }
      }

      if (!expList || expList.length === 0) {
        return { success: true, data: { count: 0, suggestions: [] } }
      }

      const suggestions: CategorizationSuggestion[] = []

      for (const exp of expList) {
        const suggestion = await classifyExpenseRecord(
          exp.id,
          exp.title,
          Number(exp.original_amount),
          exp.category,
          exp.notes || undefined
        )

        suggestions.push(suggestion)

        await supabase
          .from("expenses")
          .update({
            category: suggestion.suggestedCategory,
            tax_category: suggestion.taxCategory || suggestion.suggestedCategory,
            is_tax_deductible: suggestion.isTaxDeductible ?? true,
            ai_review_status: "pending_review",
            updated_at: new Date().toISOString(),
          })
          .eq("id", exp.id)
          .eq("user_id", user.id)
      }

      revalidatePath("/expenses")
      revalidatePath("/tax")
      return { success: true, data: { count: suggestions.length, suggestions } }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Expense categorization failed"
      return { success: false, error: msg }
    }
  }

  return {
    success: true,
    data: { count: 0, suggestions: [] },
  }
}

/**
 * Bulk confirms all pending expense categories
 */
export async function bulkConfirmAiExpensesAction(
  approvedIds: string[]
): Promise<AiActionResult<{ confirmedCount: number }>> {
  if (approvedIds.length === 0) {
    return { success: true, data: { confirmedCount: 0 } }
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
        .update({
          ai_review_status: "confirmed",
          updated_at: new Date().toISOString(),
        })
        .in("id", approvedIds)
        .eq("user_id", user.id)

      if (error) {
        return { success: false, error: error.message }
      }

      revalidatePath("/expenses")
      revalidatePath("/tax")
      return { success: true, data: { confirmedCount: approvedIds.length } }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Bulk confirmation failed"
      return { success: false, error: msg }
    }
  }

  revalidatePath("/expenses")
  return { success: true, data: { confirmedCount: approvedIds.length } }
}
