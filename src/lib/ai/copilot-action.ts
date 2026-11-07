"use server"

import { queryEarnixCopilot, type CopilotAnswer } from "@/lib/ai/rag"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"

export type CopilotActionResult = {
  success: boolean
  error?: string
  data?: CopilotAnswer
}

const MAX_COPILOT_QUERY_LENGTH = 500

export async function askCopilotAction(query: string): Promise<CopilotActionResult> {
  const trimmed = query?.trim() || ""
  if (!trimmed) {
    return { success: false, error: "Please enter a valid financial question." }
  }

  if (trimmed.length > MAX_COPILOT_QUERY_LENGTH) {
    return {
      success: false,
      error: `Question exceeds maximum allowed length of ${MAX_COPILOT_QUERY_LENGTH} characters.`,
    }
  }

  let isAuthenticated = false
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      isAuthenticated = Boolean(user)
    } catch {
      isAuthenticated = false
    }
  } else {
    isAuthenticated = true
  }

  const queryLower = trimmed.toLowerCase()
  const isGeneralOrTaxQuery =
    queryLower.includes("how you calculate tax") ||
    queryLower.includes("how do you calculate tax") ||
    queryLower.includes("how is tax calculated") ||
    queryLower.includes("calculate tax") ||
    queryLower.includes("tax formula") ||
    queryLower.includes("how tax works") ||
    queryLower.includes("what is earnix") ||
    queryLower.includes("supported currencies") ||
    queryLower.includes("how does it work")

  if (!isAuthenticated && !isGeneralOrTaxQuery) {
    return {
      success: true,
      data: {
        query: trimmed,
        answer:
          "Please sign in or create an account to view your private financial ledger and Upwork earnings. Earnix protects all financial records using PostgreSQL Row Level Security (RLS) so that your earnings, expenses, and tax records are strictly accessible only to your authenticated account.",
        groundedMetrics: [
          { label: "Account Status", value: "Sign-In Required" },
          { label: "Ledger Security", value: "PostgreSQL RLS Active" },
        ],
        citations: [],
        deterministicModel: "Earnix Grounded Security Engine",
        timestamp: new Date().toISOString(),
      },
    }
  }

  try {
    const answer = await queryEarnixCopilot(trimmed)
    return { success: true, data: answer }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Copilot failed to process query"
    return { success: false, error: msg }
  }
}

