"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, LogIn } from "lucide-react"
import { MobileNav } from "@/components/layout/mobile-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { CurrencySwitcher } from "@/components/currency/currency-switcher"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MAIN_NAV_ITEMS, FOOTER_NAV_ITEMS } from "@/config/navigation"

interface HeaderProps {
  userEmail?: string | null
  userName?: string | null
  baseCurrency?: string
}

export function Header({ userEmail, userName, baseCurrency = "USD" }: HeaderProps) {
  const pathname = usePathname()

  // Find current active item title
  const allItems = [...MAIN_NAV_ITEMS, ...FOOTER_NAV_ITEMS]
  const currentItem = allItems.find(
    (item) =>
      pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(item.href))
  )

  const pageTitle = currentItem?.title || "Earnix"
  const displayName = userName || userEmail?.split("@")[0] || "Freelancer"
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b border-border bg-background/80 px-4 sm:px-6 backdrop-blur-xs">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <MobileNav userEmail={userEmail} userName={userName} />

        {/* Breadcrumb / Page Title */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-xs font-medium text-muted-foreground">
            Earnix
          </span>
          <span className="hidden sm:inline text-xs text-muted-foreground/50">/</span>
          <h1 className="text-sm font-semibold text-foreground tracking-tight">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right Action Tools */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Base Display Currency Switcher */}
        <CurrencySwitcher currentCurrency={baseCurrency} />

        {/* Notification placeholder button */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative text-muted-foreground hover:text-foreground cursor-pointer"
          aria-label="Notifications (Phase 14)"
          title="Notifications (Phase 14)"
        >
          <Bell className="size-4" />
          <span className="absolute top-1 right-1 size-1.5 rounded-full bg-emerald-500 ring-2 ring-background" />
        </Button>

        {/* Light/Dark Theme toggle */}
        <ThemeToggle />

        {/* Small header user badge */}
        {userEmail ? (
          <div
            className="hidden sm:flex items-center gap-2 pl-2 border-l border-border text-xs text-muted-foreground"
            title={userEmail}
          >
            <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px] ring-1 ring-primary/20">
              {initial}
            </div>
            <span className="font-medium text-foreground max-w-[120px] truncate">
              {displayName}
            </span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center pl-2 border-l border-border">
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline", size: "xs" }), "gap-1.5 text-xs")}
            >
              <LogIn className="size-3.5" />
              <span>Sign In</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
