/**
 * EARNIX MULTI-CURRENCY MONETARY NORMALIZATION
 *
 * Enforces strict financial invariants:
 * 1. Never add or aggregate monetary amounts without first verifying currency alignment.
 * 2. Preserve historical transaction amounts and recorded exchange-rate values.
 * 3. Guarantee that all portfolio and client lifetime earnings totals are expressed
 *    in the user's active base currency using arbitrary-precision Decimal.js arithmetic.
 */

import Decimal from "decimal.js"
import { toDecimal, divideDecimals, multiplyDecimals } from "@/lib/currency/format"
import { BENCHMARK_RATES_TO_USD } from "@/lib/currency/currencies"

export interface MonetaryRecord {
  original_amount: number | string
  original_currency: string
  converted_amount: number | string
  converted_currency: string
  exchange_rate?: number | string
}

/**
 * Resolves a monetary transaction or expense record into an exact Decimal amount
 * denominated strictly in the specified targetCurrency.
 *
 * Invariant rules:
 * - Rule 1: If converted_currency matches targetCurrency:
 *   Returns `converted_amount` as a Decimal, preserving historical conversion and recorded rate.
 * - Rule 2: If original_currency matches targetCurrency:
 *   Returns `original_amount` directly with 0 conversion drift.
 * - Rule 3: If neither matches (e.g. historical transaction was recorded in USD when base was USD,
 *   and user subsequently changed profile default_currency to PKR):
 *   Converts `original_amount` from `original_currency` to `targetCurrency` using Decimal.js cross-rates.
 */
export function normalizeMonetaryAmountToTarget(
  record: MonetaryRecord,
  targetCurrency: string,
  rateOverrides?: Record<string, number>
): Decimal {
  const target = (targetCurrency || "USD").toUpperCase()
  const origCurr = (record.original_currency || "USD").toUpperCase()
  const convCurr = (record.converted_currency || "USD").toUpperCase()

  // 1. Identity match with recorded conversion
  if (convCurr === target) {
    return toDecimal(record.converted_amount)
  }

  // 2. Identity match with original recorded currency
  if (origCurr === target) {
    return toDecimal(record.original_amount)
  }

  // 3. Dynamic benchmark cross-rate conversion via Decimal.js
  const rates: Record<string, number> = {
    ...BENCHMARK_RATES_TO_USD,
    ...rateOverrides,
  }

  const fromInUsd = rates[origCurr] ?? (BENCHMARK_RATES_TO_USD as Record<string, number>)[origCurr] ?? 1.0
  const toInUsd = rates[target] ?? (BENCHMARK_RATES_TO_USD as Record<string, number>)[target] ?? 1.0

  const origDec = toDecimal(record.original_amount)
  const crossRateDec = divideDecimals(toDecimal(toInUsd), toDecimal(fromInUsd))
  return multiplyDecimals(origDec, crossRateDec).toDecimalPlaces(4, Decimal.ROUND_HALF_UP)
}
