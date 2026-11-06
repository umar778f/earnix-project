"use client"

import * as React from "react"
import Link from "next/link"
import { useActionState } from "react"
import { Button, buttonVariants } from "@/components/ui/button"
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
import { updatePasswordAction, type AuthActionResult } from "@/lib/auth/actions"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle2, ArrowRight, Loader2 } from "lucide-react"

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState<AuthActionResult | null, FormData>(
    updatePasswordAction,
    null
  )

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="space-y-1.5 text-center">
        <CardTitle className="text-xl">Set new password</CardTitle>
        <CardDescription>
          Enter and confirm your new password below
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
              <p className="font-semibold">Password Updated</p>
              <p>{state.message}</p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className={cn(buttonVariants({ variant: "default", size: "sm" }))}
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
              <Label htmlFor="password">New password</Label>
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
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Repeat new password"
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
                  <span>Updating password...</span>
                </>
              ) : (
                <>
                  <span>Update password</span>
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
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Return to login
        </Link>
      </CardFooter>
    </Card>
  )
}

