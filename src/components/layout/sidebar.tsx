import Link from "next/link"
import { Sparkles } from "lucide-react"
import { MainNavLinks, FooterNavLinks } from "@/components/layout/nav-links"
import { UserMenu } from "@/components/layout/user-menu"
import { Separator } from "@/components/ui/separator"

interface SidebarProps {
  userEmail?: string | null
  userName?: string | null
}

export function Sidebar({ userEmail, userName }: SidebarProps) {
  return (
    <aside
      className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30 border-r border-border bg-card/60 backdrop-blur-xs"
      aria-label="Sidebar navigation"
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-border">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold text-foreground tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-1"
        >
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
            <Sparkles className="size-4" />
          </div>
          <span className="text-base font-bold">Earnix</span>
        </Link>
      </div>

      {/* Main Navigation links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        <div>
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Platform Menu
          </p>
          <MainNavLinks />
        </div>
      </div>

      {/* Bottom section */}
      <div className="p-3 border-t border-border space-y-3 bg-card/40">
        <FooterNavLinks />
        <Separator className="my-2" />
        <UserMenu email={userEmail} name={userName} />
      </div>
    </aside>
  )
}
