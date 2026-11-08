"use server"

import { revalidatePath } from "next/cache"
import { createClient, isSupabaseConfigured, getAuthenticatedUser } from "@/lib/supabase/server"
import { SUPPORTED_CURRENCIES, type SupportedCurrency, getExchangeRate } from "@/lib/currency/exchange"

export type CurrencyActionResult = {
  success: boolean
  error?: string
  message?: string
}

export async function updateBaseCurrencyAction(newCurrency: string): Promise<CurrencyActionResult> {
  const currencyCode = newCurrency.toUpperCase() as SupportedCurrency

  if (!SUPPORTED_CURRENCIES[currencyCode]) {
    return {
      success: false,
      error: `Unsupported currency code: ${newCurrency}. Supported currencies are USD, EUR, GBP, PKR.`,
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const user = await getAuthenticatedUser()

      if (user) {
        const supabase = await createClient()
        const { error } = await supabase
          .from("profiles")
          .update({
            default_currency: currencyCode,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)

        if (error) {
          return {
            success: false,
            error: error.message,
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Database update failed"
      return {
        success: false,
        error: msg,
      }
    }
  }

  // Revalidate top-level dashboard layout once
  revalidatePath("/dashboard", "layout")

  return {
    success: true,
    message: `Default display currency updated to ${currencyCode}.`,
  }
}

export async function refreshExchangeRatesAction(): Promise<CurrencyActionResult> {
  try {
    // Refresh pairs against USD in parallel
    await Promise.all([
      getExchangeRate("USD", "PKR"),
      getExchangeRate("EUR", "USD"),
      getExchangeRate("GBP", "USD"),
    ])

    revalidatePath("/dashboard", "layout")

    return {
      success: true,
      message: "Exchange rates refreshed and synchronized with European Central Bank benchmarks.",
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to sync exchange rates"
    return {
      success: false,
      error: msg,
    }
  }
}
