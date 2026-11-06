import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { getUserNotifications } from "@/lib/notifications/service"

interface AppShellProps {
  children: React.ReactNode
}

export async function AppShell({ children }: AppShellProps) {
  let userEmail: string | null = null
  let userName: string | null = null
  let baseCurrency = "USD"

  const { notifications } = await getUserNotifications()

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        userEmail = user.email ?? null
        userName = (user.user_metadata?.full_name as string) ?? null

        const { data: profile } = await supabase
          .from("profiles")
          .select("default_currency")
          .eq("id", user.id)
          .single()

        if (profile?.default_currency) {
          baseCurrency = profile.default_currency
        }
      }
    } catch {
      // Graceful fallback to guest mode if network or session check fails
    }
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
