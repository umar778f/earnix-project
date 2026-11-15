/**
 * EARNIX APPLICATION ORIGIN & CALLBACK SECURITY GUARDS
 *
 * Ensures all OAuth, magic links, email verification redirects, and callback routes
 * resolve strictly to the verified production domain in production environments,
 * completely preventing accidental or misconfigured redirects to `http://localhost:3000`.
 */

export const PRODUCTION_APP_URL = "https://earnix-project.vercel.app"

/**
 * Checks whether a given host or URL string points to a local development environment.
 */
export function isLocalhost(urlOrHost: string | null | undefined): boolean {
  if (!urlOrHost) return false
  const lower = urlOrHost.toLowerCase()
  return (
    lower.includes("localhost") ||
    lower.includes("127.0.0.1") ||
    lower.startsWith("http://[::1]")
  )
}

/**
 * Resolves the absolute application origin for an incoming server-side Request
 * (e.g. inside `src/app/auth/callback/route.ts`).
 *
 * Invariants:
 * 1. If the request arrives at a non-localhost host (production, preview, custom domain),
 *    the redirect base MUST NEVER be `localhost`, even if `NEXT_PUBLIC_APP_URL` was
 *    inadvertently configured with a localhost URL.
 * 2. If `NEXT_PUBLIC_APP_URL` is set to a valid non-localhost URL in production, it is respected.
 * 3. Falls back securely to `https://earnix-project.vercel.app`.
 */
export function resolveCallbackOrigin(request: Request): string {
  const { origin } = new URL(request.url)
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host")
  const proto = request.headers.get("x-forwarded-proto") || "https"
  const requestOrigin = host ? `${proto}://${host}` : origin

  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()

  const isRequestLocal = isLocalhost(requestOrigin)

  if (!isRequestLocal) {
    // Production/remote incoming request: NEVER redirect to localhost
    if (configuredUrl && !isLocalhost(configuredUrl)) {
      return configuredUrl.replace(/\/+$/, "")
    }
    if (!isLocalhost(requestOrigin)) {
      return requestOrigin.replace(/\/+$/, "")
    }
    return PRODUCTION_APP_URL
  }

  // Local development request
  if (configuredUrl && isLocalhost(configuredUrl)) {
    return configuredUrl.replace(/\/+$/, "")
  }
  return requestOrigin.replace(/\/+$/, "")
}

/**
 * Resolves the application base URL for server actions (e.g. signup emails, password resets).
 */
export function getSafeAppOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim()
  const isProduction =
    process.env.NODE_ENV === "production" || process.env.VERCEL === "1"

  if (isProduction) {
    if (configured && !isLocalhost(configured)) {
      return configured.replace(/\/+$/, "")
    }
    return PRODUCTION_APP_URL
  }

  if (configured) {
    return configured.replace(/\/+$/, "")
  }
  return "http://localhost:3000"
}
