/**
 * Lightweight, zero-dependency sliding-window in-memory rate limiter.
 * Protects public Server Actions against brute-force, scraping, and credential stuffing.
 */

interface RateLimitRecord {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitRecord>()

// Periodically clean up expired entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanupExpired() {
  const now = Date.now()
  if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
    lastCleanup = now
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }
}

export interface RateLimitOptions {
  /** Maximum number of requests allowed within the window */
  maxRequests: number
  /** Window duration in milliseconds */
  windowMs: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetInSeconds: number
}

/**
 * Checks if an action by an identifier (e.g. IP or user ID) is within rate limits.
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions = { maxRequests: 10, windowMs: 60 * 1000 }
): RateLimitResult {
  cleanupExpired()

  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + options.windowMs,
    })
    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetInSeconds: Math.ceil(options.windowMs / 1000),
    }
  }

  if (record.count >= options.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.max(1, Math.ceil((record.resetTime - now) / 1000)),
    }
  }

  record.count++
  return {
    allowed: true,
    remaining: options.maxRequests - record.count,
    resetInSeconds: Math.ceil((record.resetTime - now) / 1000),
  }
}
