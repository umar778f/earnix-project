"use server"

import { revalidatePath } from "next/cache"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"

export type NotificationActionResult = {
  success: boolean
  error?: string
}

export async function markNotificationAsReadAction(
  id: string
): Promise<NotificationActionResult> {
  if (!id) return { success: false, error: "Missing notification ID." }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { error } = await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id", id)
          .eq("user_id", user.id)

        if (error) {
          return { success: false, error: error.message }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update notification"
      return { success: false, error: msg }
    }
  }

  revalidatePath("/", "layout")
  return { success: true }
}

export async function markAllNotificationsAsReadAction(): Promise<NotificationActionResult> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { error } = await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("user_id", user.id)
          .eq("is_read", false)

        if (error) {
          return { success: false, error: error.message }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to mark all notifications as read"
      return { success: false, error: msg }
    }
  }

  revalidatePath("/", "layout")
  return { success: true }
}

export async function deleteNotificationAction(
  id: string
): Promise<NotificationActionResult> {
  if (!id) return { success: false, error: "Missing notification ID." }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { error } = await supabase
          .from("notifications")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id)

        if (error) {
          return { success: false, error: error.message }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete notification"
      return { success: false, error: msg }
    }
  }

  revalidatePath("/", "layout")
  return { success: true }
}
