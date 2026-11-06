"use server"

import { revalidatePath } from "next/cache"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
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
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
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

  revalidatePath("/", "layout")
  revalidatePath("/dashboard")
  revalidatePath("/transactions")
  revalidatePath("/clients")
  revalidatePath("/settings")
  revalidatePath("/tax")

  return {
    success: true,
    message: `Default display currency updated to ${currencyCode}.`,
  }
}

export async function refreshExchangeRatesAction(): Promise<CurrencyActionResult> {
  try {
    // Refresh pairs against USD
    await getExchangeRate("USD", "PKR")
    await getExchangeRate("EUR", "USD")
    await getExchangeRate("GBP", "USD")

    revalidatePath("/dashboard")
    revalidatePath("/transactions")
    revalidatePath("/settings")

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

