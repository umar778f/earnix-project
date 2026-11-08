"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { checkRateLimit } from "@/lib/security/rate-limit"
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/auth/schemas"

export type AuthActionResult = {
  success: boolean
  error?: string
  message?: string
}

async function getClientIp(): Promise<string> {
  try {
    const headerList = await headers()
    const forwarded = headerList.get("x-forwarded-for")
    if (forwarded) {
      return forwarded.split(",")[0].trim()
    }
    return headerList.get("x-real-ip") || "127.0.0.1"
  } catch {
    return "127.0.0.1"
  }
}

export async function signInWithEmailAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const clientIp = await getClientIp()
  const rateLimit = checkRateLimit(`login:${clientIp}`, { maxRequests: 10, windowMs: 60 * 1000 })
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: `Too many sign-in attempts. Please try again in ${rateLimit.resetInSeconds} seconds.`,
    }
  }
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error:
        "Supabase credentials are not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
    }
  }

  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  }

  const parsed = loginSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid credentials",
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return {
      success: false,
      error: error.message,
    }
  }

  revalidatePath("/", "layout")
  return {
    success: true,
  }
}

export async function signUpWithEmailAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error:
        "Supabase credentials are not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
    }
  }

  const rawData = {
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  }

  const parsed = signupSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid input data",
    }
  }

  const supabase = await createClient()
  const origin = process.env.NEXT_PUBLIC_APP_URL || "https://earnix-project.vercel.app"
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: parsed.data.fullName,
      },
    },
  })

  if (error) {
    return {
      success: false,
      error: error.message,
    }
  }

  return {
    success: true,
    message: "Registration successful! Please check your email to verify your account or proceed to login.",
  }
}

export async function sendPasswordResetAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const clientIp = await getClientIp()
  const rateLimit = checkRateLimit(`reset:${clientIp}`, { maxRequests: 3, windowMs: 60 * 1000 })
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: `Too many password reset requests. Please try again in ${rateLimit.resetInSeconds} seconds.`,
    }
  }

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error:
        "Supabase credentials are not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
    }
  }

  const rawData = {
    email: formData.get("email"),
  }

  const parsed = forgotPasswordSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid email address",
    }
  }

  const supabase = await createClient()
  const origin = process.env.NEXT_PUBLIC_APP_URL || "https://earnix-project.vercel.app"

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/reset-password`,
  })

  if (error) {
    return {
      success: false,
      error: error.message,
    }
  }

  return {
    success: true,
    message: "Password reset instructions have been sent to your email address.",
  }
}

export async function updatePasswordAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const clientIp = await getClientIp()
  const rateLimit = checkRateLimit(`update-pw:${clientIp}`, { maxRequests: 5, windowMs: 60 * 1000 })
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: `Too many password update attempts. Please try again in ${rateLimit.resetInSeconds} seconds.`,
    }
  }

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase credentials are not configured.",
    }
  }

  const rawData = {
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  }

  const parsed = resetPasswordSchema.safeParse(rawData)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid password",
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })

  if (error) {
    return {
      success: false,
      error: error.message,
    }
  }

  return {
    success: true,
    message: "Password updated successfully! You can now log in with your new password.",
  }
}

export async function signOutAction(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    await supabase.auth.signOut()
  }
  revalidatePath("/", "layout")
  redirect("/login")
}

