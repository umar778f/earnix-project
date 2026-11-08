import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase is not configured yet with real values, do not attempt network session calls
  if (!url || !anonKey || url.includes("your-project-id") || anonKey === "your-supabase-anon-key-here") {
    return supabaseResponse
  }

  // Do not run auth validation for static assets, metadata files, or api routes
  const { pathname } = request.nextUrl
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return supabaseResponse
  }

  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password")

  const isDashboardRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/transactions") ||
    pathname.startsWith("/clients") ||
    pathname.startsWith("/expenses") ||
    pathname.startsWith("/documents") ||
    pathname.startsWith("/tax") ||
    pathname.startsWith("/copilot") ||
    pathname.startsWith("/settings")

  // Performance optimization: For public routes (like the landing page '/'),
  // no session refresh or redirect logic is needed. Return immediately without network roundtrips.
  if (!isAuthRoute && !isDashboardRoute) {
    return supabaseResponse
  }

  // Check if any Supabase authentication cookies exist
  const allCookies = request.cookies.getAll()
  const hasAuthCookie = allCookies.some((c) => c.name.startsWith("sb-"))

  // Fast path: Unauthenticated visitor accessing protected dashboard routes without cookies
  if (!hasAuthCookie && isDashboardRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/login"
    redirectUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Fast path: Unauthenticated visitor accessing login/signup without cookies
  if (!hasAuthCookie && isAuthRoute) {
    return supabaseResponse
  }

  // User has auth cookies and is on an auth or dashboard route: validate session
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // Fetch the authenticated user from the refreshed session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Unauthenticated user attempting to access dashboard
  if (!user && isDashboardRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/login"
    redirectUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Authenticated user attempting to access auth pages
  if (user && isAuthRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/dashboard"
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}
