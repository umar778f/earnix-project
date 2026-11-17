"use client"

import * as React from "react"
import { Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { signInWithEmailAction, type AuthActionResult } from "@/lib/auth/actions"
import { getSafeRedirectUrl } from "@/lib/security/sanitization"
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = getSafeRedirectUrl(searchParams.get("next"))
  const urlError = searchParams.get("error")
  const [showPassword, setShowPassword] = React.useState(false)

  const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
    async (prevState, formData) => {
      const result = await signInWithEmailAction(prevState, formData)
      if (result.success) {
        router.push(nextUrl)
        router.refresh()
      }
      return result
    },
    null
  )

  return (
    <Card className="rounded-2xl border-border bg-card shadow-sm px-2 py-3 sm:px-4 sm:py-5">
      <CardHeader className="space-y-2 text-left">
        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
          Welcome Back
        </p>
        <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
          Sign in to your account
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Access your freelance income, expenses, and tax ledger.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 pt-2">
        {/* Global Error Banner */}
        {(state?.error || urlError) && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>
              {state?.error ||
                (urlError === "auth_callback_failed"
                  ? "Authentication verification link expired or invalid."
                  : urlError)}
            </span>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-semibold text-foreground">
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              required
              disabled={isPending}
              className="h-11 rounded-lg text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={isPending}
                className="h-11 rounded-lg pr-14 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isPending}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 cursor-pointer disabled:opacity-50"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-xs cursor-pointer gap-2"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground pt-1">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Create Account
          </Link>
        </p>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border/60 pt-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Home</span>
        </Link>
      </CardFooter>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Card className="rounded-2xl border-border shadow-sm p-8 text-center text-xs text-muted-foreground">
          <Loader2 className="size-5 animate-spin mx-auto mb-2 text-primary" />
          <span>Loading sign in form...</span>
        </Card>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
