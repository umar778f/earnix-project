---
name: input-validation-and-path-sanitization
description: >-
  Use this skill whenever processing user inputs, forms, file uploads, search parameters, or redirect URLs.
  Enforces strict Zod schema validation, directory traversal prevention (CWE-22), and open redirect
  neutralization (CWE-601).
---

# Input Validation & Path Sanitization

This skill ensures that all user-supplied data entering the system is strictly validated, sanitized, and bounded before reaching application logic or database queries.

---

## Core Invariants

1. **Strict Zod Schema Validation:**
   - Every Server Action and API endpoint must parse its payload using a compiled Zod schema.
   - Reject negative financial amounts (amounts must be strictly positive decimals; expense direction is defined by the record type).
   - Enforce ISO currency codes (3 uppercase alphabetic characters from the supported list: USD, EUR, GBP, PKR, CAD, AUD).
   - Enforce allowed document MIME types (`application/pdf`, `image/png`, `image/jpeg`, `image/webp`, `text/csv`).

2. **Directory Traversal Neutralization (CWE-22):**
   - User-supplied file names must be sanitized via `sanitizeFileName()` from `@/lib/security/sanitization`.
   - Remove all occurrences of `..`, `/`, `\`, null bytes, and non-alphanumeric characters (except `.`, `_`, `-`).
   - Limit file name lengths to a maximum of 100 characters.

3. **Open Redirect Prevention (CWE-601):**
   - Query parameters such as `?next=/dashboard/tax` must be validated using `getSafeRedirectUrl()`.
   - Safe URLs must begin with a single `/` and must never begin with `//` (protocol-relative URL) or contain backslashes (`\`).
   - If an invalid or external redirect target is provided, fallback immediately to `/dashboard`.

---

## Implementation Reference in Earnix

- **Sanitization Helpers:** [`src/lib/security/sanitization.ts`](file:///d:/Earnix/src/lib/security/sanitization.ts)
- **Document Actions:** [`src/lib/documents/actions.ts`](file:///d:/Earnix/src/lib/documents/actions.ts)
- **Document Schema:** [`src/lib/documents/schemas.ts`](file:///d:/Earnix/src/lib/documents/schemas.ts)
- **Transaction Schema:** [`src/lib/transactions/schemas.ts`](file:///d:/Earnix/src/lib/transactions/schemas.ts)
- **Expense Schema:** [`src/lib/expenses/schemas.ts`](file:///d:/Earnix/src/lib/expenses/schemas.ts)
- **Auth Callback Handler:** [`src/app/auth/callback/route.ts`](file:///d:/Earnix/src/app/auth/callback/route.ts)

---

## Verification Runbook

```bash
npm test
```

Expected assertions:
- `Transaction schema strictly rejects negative amounts`
- `Transaction schema rejects invalid currency format`
- `Expense schema rejects unsupported currency codes`
- `Document upload schema rejects disallowed document types`
- `File name sanitization neutralizes directory traversal attack: '../../../etc/passwd.pdf' -> '______etc_passwd.pdf'`
- `OAuth callback strictly prevents external open redirects`
