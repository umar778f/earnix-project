"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { MAIN_NAV_ITEMS, FOOTER_NAV_ITEMS, type NavItem } from "@/config/navigation"

interface NavListProps {
  items: NavItem[]
  onNavigate?: () => void
  className?: string
}

function NavList({ items, onNavigate, className }: NavListProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("space-y-1", className)} aria-label="Navigation Links">
      {items.map((item) => {
        const Icon = item.icon
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href))

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={true}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors outline-none",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              isActive
                ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-colors",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
                aria-hidden="true"
              />
              <span>{item.title}</span>
            </div>
            {item.badge && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                )}
              >
                {item.badge}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

export function MainNavLinks({ onNavigate, className }: { onNavigate?: () => void; className?: string }) {
  return <NavList items={MAIN_NAV_ITEMS} onNavigate={onNavigate} className={className} />
}

export function FooterNavLinks({ onNavigate, className }: { onNavigate?: () => void; className?: string }) {
  return <NavList items={FOOTER_NAV_ITEMS} onNavigate={onNavigate} className={className} />
}
