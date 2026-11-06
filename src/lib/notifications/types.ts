import { type NotificationType } from "@/types/database.types"

export interface NotificationItem {
  id: string
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  actionUrl: string | null
  createdAt: string
}

export const DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "demo-notif-01",
    title: "Missing Expense Receipt Proof",
    message:
      "Anker USB-C Multi-Display Dock ($129.99) has no receipt attached. Upload receipt proof to substantiate tax deductibility.",
    type: "action_required",
    isRead: false,
    actionUrl: "/expenses",
    createdAt: "10 minutes ago",
  },
  {
    id: "demo-notif-02",
    title: "AI Categorization Review Pending",
    message:
      "Milestone 3: Next.js SaaS Architecture was classified as Software Development (94% confidence). Review and confirm to update ledger.",
    type: "reminder",
    isRead: false,
    actionUrl: "/transactions",
    createdAt: "1 hour ago",
  },
  {
    id: "demo-notif-03",
    title: "Quarterly Tax Review Window Active",
    message:
      "Q2 fiscal reporting period is active. Verify gross revenue and allowable deductions in the Tax Preparation Center.",
    type: "info",
    isRead: true,
    actionUrl: "/tax",
    createdAt: "Yesterday",
  },
  {
    id: "demo-notif-04",
    title: "Statement Ingestion Completed",
    message:
      "Successfully ingested Upwork statement batch with 4 milestones committed to immutable income ledger.",
    type: "info",
    isRead: true,
    actionUrl: "/transactions",
    createdAt: "2 days ago",
  },
]
