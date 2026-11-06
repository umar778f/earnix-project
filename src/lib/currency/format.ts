import Decimal from "decimal.js"

// Configure Decimal precision for financial calculations
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP })

export function toDecimal(value: string | number | Decimal | null | undefined): Decimal {
  if (value === null || value === undefined || value === "") {
    return new Decimal(0)
  }
  try {
    return new Decimal(value)
  } catch {
    return new Decimal(0)
  }
}

export function addDecimals(
  a: string | number | Decimal,
  b: string | number | Decimal
): Decimal {
  return toDecimal(a).plus(toDecimal(b))
}

export function subtractDecimals(
  a: string | number | Decimal,
  b: string | number | Decimal
): Decimal {
  return toDecimal(a).minus(toDecimal(b))
}

export function multiplyDecimals(
  a: string | number | Decimal,
  b: string | number | Decimal
): Decimal {
  return toDecimal(a).times(toDecimal(b))
}

export function divideDecimals(
  a: string | number | Decimal,
  b: string | number | Decimal
): Decimal {
  const divisor = toDecimal(b)
  if (divisor.isZero()) {
    return new Decimal(0)
  }
  return toDecimal(a).dividedBy(divisor)
}

export function formatMoney(
  amount: string | number | Decimal | null | undefined,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  const dec = toDecimal(amount)
  const num = dec.toNumber()

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  } catch {
    // Fallback if currency code is non-standard
    return `${currency.toUpperCase()} ${num.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }
}

export function formatCompactNumber(
  amount: string | number | Decimal | null | undefined,
  currency?: string
): string {
  const num = toDecimal(amount).toNumber()
  const formatted = new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(num)

  return currency ? `${currency} ${formatted}` : formatted
}

