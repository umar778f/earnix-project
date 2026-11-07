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
import { AlertCircle, CheckCircle2, ArrowRight, Loader2, LogIn, UserPlus } from "lucide-react"

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
    signUpWithEmailAction,
    null
  )

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="space-y-1.5 text-center">
        <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
          Freelance Income &amp; Tax Operations
        </p>
        <CardTitle className="text-xl font-bold">Create your account</CardTitle>
        <CardDescription>
          Set up your multi-currency ledger in under a minute
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
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
                  className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-1.5")}
                >
                  <LogIn className="size-3.5" />
                  <span>Enter here</span>
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
              className="w-full gap-2 cursor-pointer font-semibold shadow-xs"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="size-4" />
                  <span>Create your account</span>
                  <ArrowRight className="size-3.5 ml-auto" />
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="flex flex-col border-t border-border/60 pt-4 text-center space-y-2">
        <p className="text-xs text-muted-foreground">Already have an account?</p>
        <Link
          href="/login"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full gap-1.5 font-medium")}
        >
          <LogIn className="size-3.5" />
          <span>Enter here</span>
        </Link>
      </CardFooter>
    </Card>
  )
}
