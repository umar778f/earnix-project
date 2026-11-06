"use server"

import { revalidatePath } from "next/cache"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"

export interface TaxConfigInput {
  taxYear: string
  jurisdictionCode: string
  estimatedRate: number
  withholdingTax: number
}

export interface TaxActionResult {
  success: boolean
  error?: string
}

export async function updateTaxConfigAction(input: TaxConfigInput): Promise<TaxActionResult> {
  const { taxYear, jurisdictionCode, estimatedRate, withholdingTax } = input

  if (!taxYear || isNaN(estimatedRate) || estimatedRate < 0) {
    return { success: false, error: "Please provide a valid tax year and non-negative tax rate." }
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
        .from("tax_profiles")
        .upsert(
          {
            user_id: user.id,
            tax_year: taxYear,
            jurisdiction_code: jurisdictionCode,
            estimated_tax_rate: estimatedRate,
            withholding_tax_suffered: withholdingTax,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,tax_year" }
        )

      if (error) {
        return { success: false, error: error.message }
      }

      // Also update default jurisdiction in profiles
      await supabase
        .from("profiles")
        .update({ tax_jurisdiction: jurisdictionCode, updated_at: new Date().toISOString() })
        .eq("id", user.id)

      revalidatePath("/tax")
      revalidatePath("/dashboard")
      revalidatePath("/settings")
      return { success: true }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update tax profile"
      return { success: false, error: msg }
    }
  }

  // Demo fallback
  revalidatePath("/tax")
  return { success: true }
}

