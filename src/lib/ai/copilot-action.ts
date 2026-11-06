"use server"

import { queryEarnixCopilot, type CopilotAnswer } from "@/lib/ai/rag"

export type CopilotActionResult = {
  success: boolean
  error?: string
  data?: CopilotAnswer
}

export async function askCopilotAction(query: string): Promise<CopilotActionResult> {
  const trimmed = query.trim()
  if (!trimmed) {
    return { success: false, error: "Please enter a valid financial question." }
  }

  try {
    const answer = await queryEarnixCopilot(trimmed)
    return { success: true, data: answer }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Copilot failed to process query"
    return { success: false, error: msg }
  }
}

