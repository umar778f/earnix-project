"use client"

import * as React from "react"
import { useActionState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClientAction, updateClientAction, type ClientActionResult } from "@/lib/clients/actions"
import { type ClientListItem } from "@/lib/clients/service"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

interface ClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientToEdit?: ClientListItem | null
  platforms: { id: string; code: string; name: string }[]
}

export function ClientDialog({
  open,
  onOpenChange,
  clientToEdit,
  platforms,
}: ClientDialogProps) {
  const isEditing = !!clientToEdit

  const [state, formAction, isPending] = useActionState<ClientActionResult | null, FormData>(
    async (prevState, formData) => {
      let result: ClientActionResult
      if (isEditing && clientToEdit) {
        result = await updateClientAction(clientToEdit.id, prevState, formData)
      } else {
        result = await createClientAction(prevState, formData)
      }

      if (result.success) {
        setTimeout(() => {
          onOpenChange(false)
        }, 1200)
      }
      return result
    },
    null
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Client" : "Add New Client"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update client details and default billing platform."
              : "Register an international client or platform contact in your directory."}
          </DialogDescription>
        </DialogHeader>

        {state?.error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{state.error}</span>
          </div>
        )}

        {state?.success && state.message && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
            <span>{state.message}</span>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Client / Company Name *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={clientToEdit?.name || ""}
              placeholder="e.g. Acme Cloud Corp"
              required
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                defaultValue={clientToEdit?.country || ""}
                placeholder="e.g. United States"
                disabled={isPending}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Billing Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={clientToEdit?.email || ""}
                placeholder="billing@client.com"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="defaultPlatformId">Primary Platform</Label>
            <select
              id="defaultPlatformId"
              name="defaultPlatformId"
              defaultValue={clientToEdit?.platformId || ""}
              disabled={isPending}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Select Platform Association</option>
              {platforms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes &amp; Contract Terms</Label>
            <textarea
              id="notes"
              name="notes"
              defaultValue={clientToEdit?.notes || ""}
              rows={3}
              placeholder="e.g. Milestone billing, weekly rate, NDA terms..."
              disabled={isPending}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending} className="cursor-pointer gap-1.5">
              {isPending && <Loader2 className="size-3.5 animate-spin" />}
              <span>{isEditing ? "Save Changes" : "Create Client"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

