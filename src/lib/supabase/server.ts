import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type Database } from "@/types/database.types"
import { cache } from "react"
import { type User } from "@supabase/supabase-js"

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return (
    !!url &&
    !!anonKey &&
    !url.includes("your-project-id") &&
    anonKey !== "your-supabase-anon-key-here"
  )
}

/**
 * Creates a memoized request-scoped Supabase client for Server Components.
 * Wrapping in React cache() avoids redundant cookieStore lookups and client creations.
 */
export const createClient = cache(async () => {
  const cookieStore = await cookies()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if middleware is refreshing user sessions.
        }
      },
    },
  })
})

/**
 * Request-scoped memoized authenticated user retrieval.
 * Eliminates redundant network calls to Supabase Auth API (/auth/v1/user) during a single request lifecycle.
 */
export const getAuthenticatedUser = cache(async (): Promise<User | null> => {
  if (!isSupabaseConfigured()) {
    return null
  }
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user ?? null
  } catch {
    return null
  }
})

export interface UserProfileCache {
  id: string
  full_name: string | null
  default_currency: string
  tax_jurisdiction: string
  business_name: string | null
  tax_identifier: string | null
}

/**
 * Request-scoped memoized user profile query.
 * Replaces repetitive profile queries across layout, navigation, and page data services.
 */
export const getUserProfile = cache(async (userId: string): Promise<UserProfileCache | null> => {
  if (!isSupabaseConfigured() || !userId) {
    return null
  }
  try {
    const supabase = await createClient()
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, default_currency, tax_jurisdiction, business_name, tax_identifier")
      .eq("id", userId)
      .single()
    return profile ?? null
  } catch {
    return null
  }
})
