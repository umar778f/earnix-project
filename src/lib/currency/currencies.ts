export type SupportedCurrency = "USD" | "EUR" | "GBP" | "PKR"

export interface CurrencyMetadata {
  code: SupportedCurrency
  name: string
  symbol: string
  flag: string
  locale: string
}

export const SUPPORTED_CURRENCIES: Record<SupportedCurrency, CurrencyMetadata> = {
  USD: {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    flag: "🇺🇸",
    locale: "en-US",
  },
  EUR: {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    flag: "🇪🇺",
    locale: "de-DE",
  },
  GBP: {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    flag: "🇬🇧",
    locale: "en-GB",
  },
  PKR: {
    code: "PKR",
    name: "Pakistani Rupee",
    symbol: "₨",
    flag: "🇵🇰",
    locale: "en-PK",
  },
}

// Fallback benchmark rates relative to USD (1 USD = X target currency)
export const BENCHMARK_RATES_TO_USD: Record<SupportedCurrency, number> = {
  USD: 1.0,
  EUR: 0.9216, // 1 USD = 0.9216 EUR (or 1 EUR = 1.085 USD)
  GBP: 0.7825, // 1 USD = 0.7825 GBP (or 1 GBP = 1.278 USD)
  PKR: 278.50, // 1 USD = 278.50 PKR (SBP benchmark)
}

