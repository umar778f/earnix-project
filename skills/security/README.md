# Earnix Security Skills Catalog

This directory contains the operational security skills, defense runbooks, and invariants enforced across the **Earnix** platform.

Earnix is a financial application handling multi-currency contracts, bank and platform statements, receipt documents, and tax-reserve estimates for international freelancers. Security, mathematical determinism, and tenant isolation are first-class architectural constraints.

---

## Security Skills Matrix

| Skill | Category | Key Invariant | Implementation in Earnix |
|:---|:---|:---|:---|
| [**01. Financial Precision & Invariants**](./01-financial-precision-and-invariants/SKILL.md) | Precision | Non-floating point arithmetic via `decimal.js` and `NUMERIC(14,4)` | [`src/lib/currency/format.ts`](../../src/lib/currency/format.ts) |
| [**02. Supabase RLS & Tenant Isolation**](./02-supabase-rls-and-tenant-isolation/SKILL.md) | Access Control | Strict `user_id = auth.uid()` RLS on every table and storage bucket | [`supabase/migrations/`](../../supabase/migrations/) |
| [**03. CSV Parser & Injection Defense**](./03-csv-parser-and-injection-defense/SKILL.md) | Parser Safety | RFC 4180 parsing, fee separation & single-quote prefixing against CWE-1236 | [`src/lib/tax/export.ts`](../../src/lib/tax/export.ts) |
| [**04. Input Validation & Path Sanitization**](./04-input-validation-and-path-sanitization/SKILL.md) | Input Defense | Zod schemas, directory traversal defense (CWE-22) & open redirect defense (CWE-601) | [`src/lib/security/sanitization.ts`](../../src/lib/security/sanitization.ts) |
| [**05. API Protection & Rate Limiting**](./05-api-protection-and-rate-limiting/SKILL.md) | Network & Headers | Sliding-window in-memory rate limiting & CSP, HSTS, X-Frame-Options headers | [`next.config.ts`](../../next.config.ts), [`src/lib/security/rate-limit.ts`](../../src/lib/security/rate-limit.ts) |
| [**06. Grounded AI & Prompt Defense**](./06-grounded-ai-and-prompt-defense/SKILL.md) | AI Governance | Zero hallucinated numbers; RAG grounded in SQL queries; human-in-the-loop review | [`src/lib/ai/copilot-action.ts`](../../src/lib/ai/copilot-action.ts), [`src/lib/ai/rag.ts`](../../src/lib/ai/rag.ts) |
| [**07. Accidental Data Loss Prevention**](./07-accidental-data-loss-prevention/SKILL.md) | Data Integrity | Destructive query guards, immutable ledgers, and environment isolation | [`.gitignore`](../../.gitignore), [`supabase/seed.sql`](../../supabase/seed.sql) |

---

## Automated Verification Suite

All security invariants are verified on every commit and deployment via our automated 38-point test runner:

```bash
# Run the complete test suite
npm test

# Run ESLint compliance
npm run lint

# Compile production build
npm run build
```

### Coverage Summary

1. **Financial Precision:** Verifies that `0.1 + 0.2 === 0.3` strictly holds under `decimal.js` and foreign exchange rate conversions do not drift.
2. **Dual-Ledger Invariants:** Validates dual-currency conversion preserving original and converted values.
3. **Tax Engine & Date Boundaries:** Tests FBR Section 154A withholding tax calculations, deduction offsets, and leap-year boundaries (Feb 29).
4. **CSV Parser Robustness:** Validates multi-line RFC 4180 Upwork statements, service fee deductions, and withdrawal extractions.
5. **AI Categorization Heuristics:** Validates offline deterministic classification fallbacks across development, design, cloud infrastructure, and software subscriptions.
6. **Zod Input Sanitization:** Confirms negative amounts, invalid currency codes, and disallowed document types are rejected.
7. **Security Defenses:** Tests directory traversal sanitization (`../../../etc/passwd.pdf` -> `______etc_passwd.pdf`), Excel formula injection escaping (`=cmd|...` -> `'=cmd|...`), open redirect prevention (`//evil.com` -> `/dashboard`), and rate limiter throttling.
