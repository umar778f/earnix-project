import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { type NotificationType } from "@/types/database.types"
import {
  type NotificationItem
} from "@/lib/notifications/types"

export type { NotificationItem }

export async function getUserNotifications(): Promise<{
  notifications: NotificationItem[]
  unreadCount: number
}> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data, error } = await supabase
          .from("notifications")
          .select("id, title, message, type, is_read, action_url, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(15)

        if (!error && data) {
          const mapped: NotificationItem[] = data.map((n) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type as NotificationType,
            isRead: n.is_read,
            actionUrl: n.action_url,
            createdAt: formatRelativeTime(n.created_at),
          }))

          const unreadCount = mapped.filter((n) => !n.isRead).length
          return { notifications: mapped, unreadCount }
        }
      }
    } catch {
      // Fallback
    }
  }

  return { notifications: [], unreadCount: 0 }
}

function formatRelativeTime(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 5) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays}d ago`
    return isoString.split("T")[0]
  } catch {
    return "Recently"
  }
}
