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
import { AlertCircle, ArrowRight, Loader2, LogIn, UserPlus } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
    <Card className="border-border shadow-xs">
      <CardHeader className="space-y-1.5 text-center">
        <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
          Freelance Income &amp; Tax Operations
        </p>
        <CardTitle className="text-xl font-bold">Enter here</CardTitle>
        <CardDescription>
          Sign in to access your financial records and ledger
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
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
            className="w-full gap-2 cursor-pointer font-semibold shadow-xs"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <LogIn className="size-4" />
                <span>Enter here</span>
                <ArrowRight className="size-3.5 ml-auto" />
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col border-t border-border/60 pt-4 text-center space-y-2">
        <p className="text-xs text-muted-foreground">New to Earnix?</p>
        <Link
          href="/signup"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full gap-1.5 font-medium")}
        >
          <UserPlus className="size-3.5" />
          <span>Create your account</span>
        </Link>
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
