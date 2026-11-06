import Link from "next/link"
import { LogIn, LogOut, User } from "lucide-react"
import { signOutAction } from "@/lib/auth/actions"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface UserMenuProps {
  email?: string | null
  name?: string | null
}

export function UserMenu({ email, name }: UserMenuProps) {
  const isAuthenticated = !!email
  const displayName = name || email?.split("@")[0] || "Freelancer"
  const initial = displayName.charAt(0).toUpperCase()

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/30 p-2 text-left">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground font-medium text-xs">
            <User className="size-3.5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-foreground">Guest Mode</p>
            <p className="truncate text-[10px] text-muted-foreground">Not signed in</p>
          </div>
        </div>
        <Link
          href="/login"
          className={cn(buttonVariants({ variant: "ghost", size: "xs" }), "h-7 text-xs gap-1 shrink-0 text-primary")}
        >
          <LogIn className="size-3" />
          <span>Sign in</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/30 p-2 text-left">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs ring-1 ring-primary/20">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-foreground">
            {displayName}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {email}
          </p>
        </div>
      </div>
      <form action={signOutAction} className="shrink-0">
        <Button
          type="submit"
          variant="ghost"
          size="icon-xs"
          className="text-muted-foreground hover:text-destructive cursor-pointer"
          aria-label="Sign out"
          title="Sign out of Earnix"
        >
          <LogOut className="size-3.5" />
        </Button>
      </form>
    </div>
  )
}
