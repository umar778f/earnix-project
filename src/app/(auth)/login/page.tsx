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
import { AlertCircle, ArrowRight, Loader2, Info } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get("next") || "/dashboard"
  const urlError = searchParams.get("error")

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
    <Card className="border-border shadow-sm">
      <CardHeader className="space-y-1.5 text-center">
        <CardTitle className="text-xl">Sign in to Earnix</CardTitle>
        <CardDescription>
          Enter your email and password to access your financial records
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Setup notice if Supabase is unconfigured */}
        <div className="rounded-lg border border-border/70 bg-muted/30 p-3 text-xs text-muted-foreground flex items-start gap-2.5">
          <Info className="size-4 shrink-0 text-primary mt-0.5" />
          <p>
            Authentication is powered by Supabase. Connect your credentials in{" "}
            <code className="font-mono text-[11px] bg-background px-1 py-0.5 rounded border border-border">
              .env.local
            </code>{" "}
            for live account access.
          </p>
        </div>

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
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              disabled={isPending}
            />
          </div>

          <Button
            type="submit"
            className="w-full gap-2 cursor-pointer"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign in</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col border-t border-border/50 pt-4 text-center text-xs text-muted-foreground">
        <p>
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign up for Earnix
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Card className="border-border shadow-sm p-8 text-center text-xs text-muted-foreground">
          <Loader2 className="size-5 animate-spin mx-auto mb-2 text-primary" />
          <span>Loading login form...</span>
        </Card>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
