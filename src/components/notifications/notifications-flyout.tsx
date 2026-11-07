"use client"

import * as React from "react"
import { useTransition } from "react"
import Link from "next/link"
import {
  type NotificationItem,
} from "@/lib/notifications/types"
import {
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
  deleteNotificationAction,
} from "@/lib/notifications/actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Info,
  CheckCheck,
  ExternalLink,
  Trash2,
} from "lucide-react"

interface NotificationsFlyoutProps {
  initialNotifications?: NotificationItem[]
}

export function NotificationsFlyout({
  initialNotifications = [],
}: NotificationsFlyoutProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(initialNotifications)
  const [filter, setFilter] = React.useState<"all" | "unread">("all")
  const [isPending, startTransition] = useTransition()
  const popoverRef = React.useRef<HTMLDivElement>(null)

  const unreadCount = React.useMemo(() => {
    return notifications.filter((n) => !n.isRead).length
  }, [notifications])

  // Close popover when clicking outside or pressing Escape
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen])

  const handleToggleOpen = () => {
    setIsOpen((prev) => !prev)
  }

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )

    startTransition(async () => {
      await markNotificationAsReadAction(id)
    })
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))

    startTransition(async () => {
      await markAllNotificationsAsReadAction()
    })
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications((prev) => prev.filter((n) => n.id !== id))

    startTransition(async () => {
      await deleteNotificationAction(id)
    })
  }

  const filteredNotifications = React.useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((n) => !n.isRead)
    }
    return notifications
  }, [notifications, filter])

  const getTypeIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "action_required":
        return <AlertTriangle className="size-3.5 text-rose-600 dark:text-rose-400" />
      case "warning":
        return <AlertCircle className="size-3.5 text-amber-600 dark:text-amber-400" />
      case "reminder":
        return <Clock className="size-3.5 text-blue-600 dark:text-blue-400" />
      case "info":
      default:
        return <Info className="size-3.5 text-emerald-600 dark:text-emerald-400" />
    }
  }

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Bell Trigger Button */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleToggleOpen}
        aria-label={`Notifications (${unreadCount} unread)`}
        aria-expanded={isOpen}
        className="relative text-muted-foreground hover:text-foreground cursor-pointer"
        title="Financial Notifications & Reminders"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex size-4 -translate-y-0.5 translate-x-0.5 items-center justify-center rounded-full bg-emerald-600 text-[9px] font-bold text-white ring-2 ring-background">
            {unreadCount}
          </span>
        )}
      </Button>

      {/* Flyout Popover Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card shadow-lg z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
          {/* Header */}
          <div className="border-b border-border bg-muted/30 px-3.5 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="success" className="text-[10px] px-1.5 py-0 h-4">
                  {unreadCount} new
                </Badge>
              )}
            </div>

            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="xs"
                onClick={handleMarkAllAsRead}
                disabled={isPending}
                className="gap-1 text-[11px] text-muted-foreground hover:text-foreground h-6 px-1.5"
              >
                <CheckCheck className="size-3" />
                <span>Mark all read</span>
              </Button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="border-b border-border/60 bg-background px-3 py-1.5 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
                filter === "all"
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
                filter === "unread"
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications Feed */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-border/60">
            {filteredNotifications.length === 0 ? (
              <div className="py-10 text-center text-xs text-muted-foreground space-y-1.5">
                <CheckCircle2 className="size-6 mx-auto text-emerald-600/70" />
                <p className="font-medium text-foreground">All caught up!</p>
                <p className="text-[11px]">No notifications in this filter.</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 space-y-1.5 transition-colors group text-xs ${
                    notif.isRead
                      ? "bg-card hover:bg-muted/30 opacity-75"
                      : "bg-muted/15 hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      <div className="mt-0.5 shrink-0">
                        {getTypeIcon(notif.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-foreground truncate">
                          {notif.title}
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                          {notif.message}
                        </p>
                      </div>
                    </div>

                    {!notif.isRead && (
                      <span className="size-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5 ring-2 ring-background" />
                    )}
                  </div>

                  {/* Actions & Timestamp Footer */}
                  <div className="flex items-center justify-between pt-1 text-[10px] text-muted-foreground pl-5">
                    <span>{notif.createdAt}</span>

                    <div className="flex items-center gap-1">
                      {notif.actionUrl && (
                        <Link
                          href={notif.actionUrl}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 font-medium text-primary hover:underline pr-1"
                        >
                          <span>Review</span>
                          <ExternalLink className="size-2.5" />
                        </Link>
                      )}

                      {!notif.isRead && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={(e) => handleMarkAsRead(notif.id, e)}
                          title="Mark as read"
                          className="h-5 w-5 text-muted-foreground hover:text-foreground"
                        >
                          <CheckCheck className="size-3" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => handleDelete(notif.id, e)}
                        title="Dismiss"
                        className="h-5 w-5 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
