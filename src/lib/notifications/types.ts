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
