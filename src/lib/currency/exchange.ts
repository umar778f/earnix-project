import Decimal from "decimal.js"
import { toDecimal, multiplyDecimals, divideDecimals } from "@/lib/currency/format"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import {
  type SupportedCurrency,
  type CurrencyMetadata,
  SUPPORTED_CURRENCIES,
  BENCHMARK_RATES_TO_USD,
} from "@/lib/currency/currencies"

export type { SupportedCurrency, CurrencyMetadata }
export { SUPPORTED_CURRENCIES, BENCHMARK_RATES_TO_USD }

export interface ExchangeRateResult {
  baseCurrency: string
  targetCurrency: string
  rate: number
  rateDate: string
  source: string
}

export interface ConversionResult {
  originalAmount: number
  originalCurrency: string
  convertedAmount: number
  convertedCurrency: string
  exchangeRate: number
  conversionDate: string
  source: string
}

// In-memory rate cache with timestamp
let memoryRateCache: {
  rates: Record<string, number>
  cachedAt: number
} | null = null

const CACHE_TTL_MS = 1000 * 60 * 60 * 6 // 6 hours

export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<ExchangeRateResult> {
  const from = fromCurrency.toUpperCase()
  const to = toCurrency.toUpperCase()
  const todayStr = new Date().toISOString().split("T")[0]

  if (from === to) {
    return {
      baseCurrency: from,
      targetCurrency: to,
      rate: 1.0,
      rateDate: todayStr,
      source: "identity",
    }
  }

  // 1. Try Live API with In-Memory Cache (Bounded 2.5-second network timeout to fail fast)
  const now = Date.now()
  if (!memoryRateCache || now - memoryRateCache.cachedAt > CACHE_TTL_MS) {
    try {
      const res = await fetch("https://api.frankfurter.app/latest?from=USD", {
        next: { revalidate: 21600 }, // 6 hours Next.js cache
        signal: AbortSignal.timeout(2500), // Fail fast to static benchmarks to avoid cold network stalls
      })
      if (res.ok) {
        const json = await res.json()
        const fetchedRates: Record<string, number> = {
          USD: 1.0,
          EUR: json.rates?.EUR || BENCHMARK_RATES_TO_USD.EUR,
          GBP: json.rates?.GBP || BENCHMARK_RATES_TO_USD.GBP,
          PKR: BENCHMARK_RATES_TO_USD.PKR, // Supplement with SBP benchmark
        }
        memoryRateCache = {
          rates: fetchedRates,
          cachedAt: now,
        }
      }
    } catch {
      // Fallback to static benchmarks if fetch fails
    }
  }

  const activeRates: Record<string, number> =
    memoryRateCache?.rates || (BENCHMARK_RATES_TO_USD as Record<string, number>)

  // Calculate cross-rate: (1 USD in Target) / (1 USD in From)
  const fromInUsd = activeRates[from] ?? (BENCHMARK_RATES_TO_USD as Record<string, number>)[from] ?? 1.0
  const toInUsd = activeRates[to] ?? (BENCHMARK_RATES_TO_USD as Record<string, number>)[to] ?? 1.0

  const calculatedRateDec = divideDecimals(toDecimal(toInUsd), toDecimal(fromInUsd))
  const calculatedRate = calculatedRateDec.toDecimalPlaces(6, Decimal.ROUND_HALF_UP).toNumber()

  // 2. Cache snapshot asynchronously to Supabase without blocking the client response
  if (isSupabaseConfigured()) {
    createClient()
      .then((supabase) =>
        supabase.from("exchange_rates").upsert(
          {
            base_currency: from,
            target_currency: to,
            rate: calculatedRate,
            rate_date: todayStr,
            source: memoryRateCache ? "frankfurter_ecb" : "seed_benchmark",
          },
          { onConflict: "base_currency,target_currency,rate_date" }
        )
      )
      .catch(() => {
        // Non-blocking background cache failure
      })
  }

  return {
    baseCurrency: from,
    targetCurrency: to,
    rate: calculatedRate,
    rateDate: todayStr,
    source: memoryRateCache ? "frankfurter_ecb" : "seed_benchmark",
  }
}

export async function convertCurrency(
  amount: string | number | Decimal,
  fromCurrency: string,
  toCurrency: string
): Promise<ConversionResult> {
  const decAmount = toDecimal(amount)
  const rateResult = await getExchangeRate(fromCurrency, toCurrency)
  const rateDec = toDecimal(rateResult.rate)

  const convertedDec = multiplyDecimals(decAmount, rateDec).toDecimalPlaces(4, Decimal.ROUND_HALF_UP)

  return {
    originalAmount: decAmount.toNumber(),
    originalCurrency: fromCurrency.toUpperCase(),
    convertedAmount: convertedDec.toNumber(),
    convertedCurrency: toCurrency.toUpperCase(),
    exchangeRate: rateResult.rate,
    conversionDate: rateResult.rateDate,
    source: rateResult.source,
  }
}
