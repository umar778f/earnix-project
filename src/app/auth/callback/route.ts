import { NextResponse } from "next/server"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { getSafeRedirectUrl } from "@/lib/security/sanitization"
import { resolveCallbackOrigin } from "@/lib/security/origin"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const safeNext = getSafeRedirectUrl(searchParams.get("next"))
  const baseOrigin = resolveCallbackOrigin(request)

  if (code && isSupabaseConfigured()) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${baseOrigin}${safeNext}`)
    }
  }

  return NextResponse.redirect(`${baseOrigin}/login?error=auth_callback_failed`)
}

