---
name: csv-parser-and-injection-defense
description: >-
  Use this skill whenever working with CSV statement imports (Upwork, banks, invoices) or tax CSV exports.
  Enforces RFC 4180 parsing compliance, deduplication, platform fee separation, and Excel/CSV formula
  injection neutralization (CWE-1236).
---

# CSV Parser Safety & Formula Injection Defense

This skill governs the ingestion of external financial statements and the export of accountant-ready tax CSV files in Earnix.

---

## Core Invariants

1. **RFC 4180 Ingestion Compliance:**
   - Multi-line fields, escaped quotes (`""`), and CRLF/LF line terminators must be parsed robustly without splitting on raw comma characters.
   - Handled by [`src/lib/parsers/csv-helper.ts`](../../src/lib/parsers/csv-helper.ts) and [`src/lib/parsers/upwork.ts`](../../src/lib/parsers/upwork.ts).

2. **Deduplication Invariant:**
   - Statements must compute a deterministic record signature (e.g. `SHA-256(date + ref_id + amount + description)`) to prevent accidental double-importing of payments.

3. **Formula Injection Neutralization (CWE-1236):**
   - Spreadsheet software (Microsoft Excel, LibreOffice, Google Sheets) interprets cells starting with `=`, `+`, `-`, `@`, `\t`, or `\r` as executable formulas or DDE commands.
   - Before writing any string into an exported CSV cell, pass it through `sanitizeFormulaCell()` from `@/lib/security/sanitization`.
   - Any cell starting with these characters must be prepended with a single quote (`'`) to force raw text evaluation.

4. **Fee Isolation Invariant:**
   - In platform statements (such as Upwork Transaction History), gross earnings and service fee deductions (e.g. 10% fee) must be parsed into distinct ledger entries so deductible operating costs can be claimed separately.

---

## Implementation Reference in Earnix

- **Formula Sanitizer:** [`src/lib/security/sanitization.ts`](../../src/lib/security/sanitization.ts)
- **Tax Report Export:** [`src/lib/tax/export.ts`](../../src/lib/tax/export.ts)
- **Upwork Statement Parser:** [`src/lib/parsers/upwork.ts`](../../src/lib/parsers/upwork.ts)
- **Generic Statement Parser:** [`src/lib/parsers/generic.ts`](../../src/lib/parsers/generic.ts)

---

## Verification Runbook

```bash
npm test
```

Expected assertions:
- `Upwork statement parsed successfully`
- `Extracted 9 transactions from Upwork statement`
- `Correctly classified 4 gross income rows from Upwork statement`
- `Correctly classified 4 Upwork service fee deduction rows`
- `CSV export neutralizes Excel formula injection (prefixed with single quote): '=cmd|' /C calc'!A0' -> "'=cmd|' /C calc'!A0"`
- `CSV export neutralizes @ formula injection: '@SUM(1+1)' -> "'@SUM(1+1)"`
