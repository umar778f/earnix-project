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

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return {
          success: false,
          error: "Authentication required to query financial records.",
        }
      }
    } catch {
      // Allow fallback if session read fails in demo/offline mode
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

