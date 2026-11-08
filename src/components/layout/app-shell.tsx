import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { getAuthenticatedUser, getUserProfile } from "@/lib/supabase/server"
import { getUserNotifications, type NotificationItem } from "@/lib/notifications/service"

interface AppShellProps {
  children: React.ReactNode
}

export async function AppShell({ children }: AppShellProps) {
  let userEmail: string | null = null
  let userName: string | null = null
  let baseCurrency = "USD"
  let notifications: NotificationItem[] = []

  const user = await getAuthenticatedUser()

  if (user) {
    userEmail = user.email ?? null
    userName = (user.user_metadata?.full_name as string) ?? null

    // Parallel fetch: profile and notifications
    const [profile, notifResult] = await Promise.all([
      getUserProfile(user.id),
      getUserNotifications(),
    ])

    if (profile?.default_currency) {
      baseCurrency = profile.default_currency
    }
    notifications = notifResult.notifications
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Persistent Desktop Sidebar */}
      <Sidebar userEmail={userEmail} userName={userName} />

      {/* Main App Wrapper (offset on md+ screens) */}
      <div className="flex flex-col min-h-screen md:pl-64 transition-[padding] duration-200">
        {/* Top Header */}
        <Header
          userEmail={userEmail}
          userName={userName}
          baseCurrency={baseCurrency}
          notifications={notifications}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 pb-12 focus:outline-none" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  )
}
