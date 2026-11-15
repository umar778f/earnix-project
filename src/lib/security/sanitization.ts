/**
 * EARNIX SECURITY SANITIZATION & BOUNDARY GUARDS
 *
 * Centralized defenses against:
 * 1. Path Traversal & Directory Traversal (CWE-22)
 * 2. Excel / CSV Formula Injection (CWE-1236)
 * 3. Open Redirection via OAuth / Login next parameter (CWE-601)
 * 4. Unsafe Action URLs / JavaScript URI Injection
 */

/**
 * Neutralizes path traversal sequences and illegal characters in user-supplied file names.
 * Ensures uploaded documents cannot write outside the intended user storage bucket prefix.
 */
export function sanitizeFileName(fileName: string, maxLength = 100): string {
  if (!fileName) return `file_${Date.now()}`
  return fileName
    .trim()
    .replace(/\.\./g, "_")
    .replace(/[/\\]/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, maxLength)
}

/**
 * Neutralizes Excel / CSV formula execution (CWE-1236).
 * Prepends a single quote to any cell starting with formula execution triggers (=, +, -, @, \t, \r).
 */
export function sanitizeFormulaCell(value: unknown): string {
  if (value === null || value === undefined) return '""'
  let str = String(value)
  if (/^[=\+\-@\t\r]/.test(str)) {
    str = "'" + str
  }
  return `"${str.replace(/"/g, '""')}"`
}

/**
 * Validates redirect paths from search parameters (e.g. `?next=/dashboard/tax`).
 * Rejects external URLs, protocol-relative paths (`//evil.com`), and backslash bypasses (`/\evil.com`).
 */
export function getSafeRedirectUrl(next: string | null | undefined, fallback = "/dashboard"): string {
  if (!next) return fallback
  if (next.startsWith("/") && !next.startsWith("//") && !next.includes("\\")) {
    return next
  }
  return fallback
}

/**
 * Validates that an in-app action URL or notification target is an internal safe route.
 * Rejects `javascript:`, `data:`, and external protocol origins.
 */
export function isSafeActionUrl(url?: string | null): boolean {
  if (!url) return false
  return url.startsWith("/") && !url.startsWith("//") && !url.includes("\\")
}
