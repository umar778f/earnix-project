"use client"

import * as React from "react"
import Link from "next/link"
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
import { sendPasswordResetAction, type AuthActionResult } from "@/lib/auth/actions"
import { AlertCircle, CheckCircle2, ArrowLeft, ArrowRight, Loader2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
    sendPasswordResetAction,
    null
  )

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="space-y-1.5 text-center">
        <CardTitle className="text-xl">Reset your password</CardTitle>
        <CardDescription>
          Enter your registered email address and we&apos;ll send you a password reset link
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {state?.error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{state.error}</span>
          </div>
        )}

        {state?.success && state.message && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Reset Link Sent</p>
              <p>{state.message}</p>
            </div>
          </div>
        )}

        {!state?.success && (
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

            <Button
              type="submit"
              className="w-full gap-2 cursor-pointer"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Sending reset link...</span>
                </>
              ) : (
                <>
                  <span>Send reset link</span>
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="flex flex-col border-t border-border/50 pt-4 text-center text-xs text-muted-foreground">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 font-medium text-foreground hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to login</span>
        </Link>
      </CardFooter>
    </Card>
  )
}

