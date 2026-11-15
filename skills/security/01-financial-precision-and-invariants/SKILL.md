---
name: financial-precision-and-invariants
description: >-
  Use this skill whenever working with currency conversions, tax calculations, ledger amounts,
  or monetary math in Earnix. Enforces arbitrary-precision Decimal.js arithmetic, PostgreSQL
  NUMERIC(14,4) schema rules, and immutable historical foreign exchange rate capture.
---

# Secure Financial Precision & Invariants

This skill governs all monetary arithmetic, multi-currency conversions, and tax calculations in Earnix.
Financial calculations must never use native JavaScript floating-point numbers (`number`), which suffer from IEEE-754 binary floating-point rounding drift (e.g. `0.1 + 0.2 === 0.30000000000000004`).

---

## Core Invariants

1. **Non-Floating Point Arithmetic:**
   - Always wrap financial inputs with `toDecimal()` from `@/lib/currency/format`.
   - Perform all arithmetic operations using `addDecimals`, `subtractDecimals`, `multiplyDecimals`, and `divideDecimals`.
   - Never use standard arithmetic operators (`+`, `-`, `*`, `/`) directly on monetary quantities.

2. **Database Storage Precision:**
   - All monetary columns in PostgreSQL must be defined as `NUMERIC(14,4)`.
   - Exchange rates must be stored with at least 4 decimal places (`NUMERIC(14,4)` or higher).

3. **Dual-Value Ledger Immutability:**
   - Every transaction record must store both the original currency amount (`original_amount`, `original_currency`), the historical exchange rate (`exchange_rate_to_base`), and the converted base amount (`converted_amount`, `base_currency`).
   - Exchange rates are captured at the time of transaction execution or payment date and must never be dynamically recomputed from live rates retroactively.

4. **Tax Reserve Rounding Rules:**
   - Tax reserve estimates (e.g. Pakistan FBR Section 154A 1.00% IT export benchmark) must be calculated on gross remittance proceeds without floating-point drift.
   - Use `Decimal.ROUND_HALF_UP` for rounding fractional monetary values.

---

## Implementation Reference in Earnix

- **Formatting & Arithmetic Engine:** [`src/lib/currency/format.ts`](../../src/lib/currency/format.ts)
- **Supported Currencies & Fallbacks:** [`src/lib/currency/currencies.ts`](../../src/lib/currency/currencies.ts)
- **Tax Calculation Engine:** [`src/lib/tax/engine.ts`](../../src/lib/tax/engine.ts)
- **Automated Verification:** `npm test` checks `[1/6] Running Financial Precision & Decimal.js Tests`

---

## Verification Runbook

```bash
# Execute the automated financial precision suite
npm test
```

Expected assertions:
- `Decimal.js prevents IEEE-754 floating-point inaccuracy (0.1 + 0.2 === 0.3)`
- `Arbitrary-precision multiplication prevents rounding drift (19.99 * 100 === 1999)`
- `Accurate 4-decimal place ledger rounding for foreign exchange rates`
