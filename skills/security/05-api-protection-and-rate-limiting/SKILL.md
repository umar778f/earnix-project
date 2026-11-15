---
name: api-protection-and-rate-limiting
description: >-
  Use this skill whenever building or reviewing public endpoints, authentication actions, server actions,
  or HTTP headers in Earnix. Enforces sliding-window rate limiting, brute-force mitigation, and production
  HTTP security headers (CSP, HSTS, X-Frame-Options, Permissions-Policy).
---

# API Protection, Rate Limiting & HTTP Security Headers

This skill governs defenses against automated denial of service, credential stuffing, brute force attacks, and browser-side cross-site scripting/clickjacking.

---

## Core Invariants

1. **Sliding-Window Rate Limiting:**
   - Protect sensitive endpoints (e.g. login attempts, magic links, CSV parsing, AI queries) using `checkRateLimit()` from `@/lib/security/rate-limit`.
   - Track request counts per IP or authenticated user key within a sliding time window.
   - Automatically purge stale keys via periodic cleanup to avoid memory leaks.

2. **Content-Security-Policy (CSP):**
   - Must be configured in `next.config.ts`.
   - Restrict `default-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`.
   - Whitelist only verified external connection targets:
     - `https://*.supabase.co` & `wss://*.supabase.co`
     - `https://generativelanguage.googleapis.com` (Google Gemini)
     - `https://api.frankfurter.app` (European Central Bank FX)

3. **Production Security Headers:**
   - `X-Frame-Options: DENY` (prevents clickjacking attacks)
   - `X-Content-Type-Options: nosniff` (prevents MIME-type sniffing)
   - `Referrer-Policy: strict-origin-when-cross-origin` (prevents referrer leak)
   - `Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()`
   - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (enforces HTTPS)

4. **Safe Action URL Enforcement:**
   - In-app notification links and redirect targets must pass `isSafeActionUrl()`.
   - Reject `javascript:`, `data:`, and protocol-relative links.

---

## Implementation Reference in Earnix

- **Next.js Config & Security Headers:** [`next.config.ts`](../../next.config.ts)
- **Rate Limiter:** [`src/lib/security/rate-limit.ts`](../../src/lib/security/rate-limit.ts)
- **Sanitization & URL Guard:** [`src/lib/security/sanitization.ts`](../../src/lib/security/sanitization.ts)
- **Notification Flyout Action Guard:** [`src/components/notifications/notifications-flyout.tsx`](../../src/components/notifications/notifications-flyout.tsx)

---

## Verification Runbook

```bash
npm test
```

Expected assertions:
- `Rate limiter permits allowed number of requests within window (5/5)`
- `Rate limiter throttles requests exceeding max limit`
- `Notification flyout strictly rejects unsafe or external action URLs`
