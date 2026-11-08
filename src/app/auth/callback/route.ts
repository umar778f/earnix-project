import { NextResponse } from "next/server"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"

function getSafeRedirectUrl(next: string | null, fallback = "/dashboard"): string {
  if (!next) return fallback
  // Strictly prevent open redirects, protocol-relative URLs (//), and backslash bypasses
  if (next.startsWith("/") && !next.startsWith("//") && !next.includes("\\")) {
    return next
  }
  return fallback
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const safeNext = getSafeRedirectUrl(searchParams.get("next"))

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host")
  const proto = request.headers.get("x-forwarded-proto") || "https"
  const baseOrigin = process.env.NEXT_PUBLIC_APP_URL || (host ? `${proto}://${host}` : origin)

  if (code && isSupabaseConfigured()) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${baseOrigin}${safeNext}`)
    }
  }

  return NextResponse.redirect(`${baseOrigin}/login?error=auth_callback_failed`)
}

