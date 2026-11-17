"use client"

import * as React from "react"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
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
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Loader2 } from "lucide-react"

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
  const router = useRouter()
  const isEditing = !!clientToEdit

  const hasExistingOptionalDetails = Boolean(
    clientToEdit?.email || clientToEdit?.country || clientToEdit?.notes
  )
  const [showMore, setShowMore] = React.useState(hasExistingOptionalDetails)
  const [email, setEmail] = React.useState(clientToEdit?.email || "")
  const [country, setCountry] = React.useState(clientToEdit?.country || "")
  const [notes, setNotes] = React.useState(clientToEdit?.notes || "")

  const [state, formAction, isPending] = useActionState<ClientActionResult | null, FormData>(
    async (prevState, formData) => {
      const result =
        isEditing && clientToEdit
          ? await updateClientAction(clientToEdit.id, prevState, formData)
          : await createClientAction(prevState, formData)

      if (result.success) {
        router.refresh()
        setTimeout(() => {
          onOpenChange(false)
        }, 450)
      }
      return result
    },
    null
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Client" : "Add Client"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update client name or details."
              : "Just enter a name to add a client. Extra details are optional."}
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
            <Label htmlFor="name">Client Name *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={clientToEdit?.name || ""}
              placeholder="e.g. Acme Studio"
              required
              autoFocus
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="defaultPlatformId">Platform (Optional)</Label>
            <select
              id="defaultPlatformId"
              name="defaultPlatformId"
              defaultValue={clientToEdit?.platformId || ""}
              disabled={isPending}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">Direct / No Platform</option>
              {platforms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowMore((prev) => !prev)}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {showMore ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            <span>{showMore ? "Hide optional details" : "Add optional details (email, country, notes)"}</span>
          </button>

          {showMore ? (
            <div className="space-y-3 rounded-lg border border-border/70 bg-muted/20 p-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="country" className="text-xs">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. United States"
                    disabled={isPending}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@example.com"
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs">Notes</Label>
                <textarea
                  id="notes"
                  name="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Optional contract or billing notes..."
                  disabled={isPending}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
                />
              </div>
            </div>
          ) : (
            <>
              <input type="hidden" name="country" value={country} />
              <input type="hidden" name="email" value={email} />
              <input type="hidden" name="notes" value={notes} />
            </>
          )}

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
              <span>{isEditing ? "Save Changes" : "Add Client"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
