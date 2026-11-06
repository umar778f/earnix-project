"use client"

import * as React from "react"
import Link from "next/link"
import { useActionState } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
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
import { signUpWithEmailAction, type AuthActionResult } from "@/lib/auth/actions"
import { AlertCircle, CheckCircle2, ArrowRight, Loader2, Info } from "lucide-react"

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
    signUpWithEmailAction,
    null
  )

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="space-y-1.5 text-center">
        <CardTitle className="text-xl">Create your Earnix account</CardTitle>
        <CardDescription>
          Start tracking freelance income, expenses, and preparing tax records
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Setup notice if Supabase is unconfigured */}
        <div className="rounded-lg border border-border/70 bg-muted/30 p-3 text-xs text-muted-foreground flex items-start gap-2.5">
          <Info className="size-4 shrink-0 text-primary mt-0.5" />
          <p>
            Self-hosted with Supabase Auth. Set your keys in{" "}
            <code className="font-mono text-[11px] bg-background px-1 py-0.5 rounded border border-border">
              .env.local
            </code>{" "}
            to complete account creation.
          </p>
        </div>

        {/* Global Error Banner */}
        {state?.error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{state.error}</span>
          </div>
        )}

        {/* Success Banner */}
        {state?.success && state.message && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Account Created</p>
              <p>{state.message}</p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className={cn(buttonVariants({ variant: "outline", size: "xs" }))}
                >
                  Proceed to Login
                </Link>
              </div>
            </div>
          </div>
        )}

        {!state?.success && (
          <form action={formAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Jane Doe"
                autoComplete="name"
                required
                disabled={isPending}
              />
            </div>

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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="At least 6 characters"
                autoComplete="new-password"
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Repeat your password"
                autoComplete="new-password"
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
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create account</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="flex flex-col border-t border-border/50 pt-4 text-center text-xs text-muted-foreground">
        <p>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
