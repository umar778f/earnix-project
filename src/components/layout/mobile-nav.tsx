"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { MainNavLinks, FooterNavLinks } from "@/components/layout/nav-links"
import { UserMenu } from "@/components/layout/user-menu"
import { Separator } from "@/components/ui/separator"

interface MobileNavProps {
  userEmail?: string | null
  userName?: string | null
}

export function MobileNav({ userEmail, userName }: MobileNavProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Open navigation menu"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 flex flex-col justify-between">
        <SheetHeader className="p-4 border-b border-border text-left">
          <SheetTitle className="sr-only">Earnix Mobile Navigation</SheetTitle>
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 font-semibold text-foreground tracking-tight"
          >
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <Sparkles className="size-4" />
            </div>
            <span className="text-base font-bold">Earnix</span>
          </Link>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Platform Menu
          </p>
          <MainNavLinks onNavigate={() => setOpen(false)} />
        </div>

        <div className="p-4 border-t border-border space-y-3 bg-muted/20">
          <FooterNavLinks onNavigate={() => setOpen(false)} />
          <Separator className="my-2" />
          <UserMenu email={userEmail} name={userName} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
