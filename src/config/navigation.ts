import {
  LayoutDashboard,
  ArrowLeftRight,
  Users,
  Receipt,
  FolderArchive,
  Calculator,
  Sparkles,
  Settings,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  badge?: string
  description?: string
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Financial overview and key metrics",
  },
  {
    title: "Transactions",
    href: "/transactions",
    icon: ArrowLeftRight,
    description: "Income ledger and CSV imports",
  },
  {
    title: "Clients",
    href: "/clients",
    icon: Users,
    description: "Client directory and lifetime earnings",
  },
  {
    title: "Expenses",
    href: "/expenses",
    icon: Receipt,
    description: "Track business costs and deductions",
  },
  {
    title: "Documents",
    href: "/documents",
    icon: FolderArchive,
    description: "Invoices, receipts, and statements",
  },
  {
    title: "Tax Center",
    href: "/tax",
    icon: Calculator,
    description: "Tax-ready records and estimates",
  },
  {
    title: "AI Copilot",
    href: "/copilot",
    icon: Sparkles,
    badge: "AI",
    description: "Grounded financial assistant",
  },
]

export const FOOTER_NAV_ITEMS: NavItem[] = [
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Currency, profile, and preferences",
  },
]

