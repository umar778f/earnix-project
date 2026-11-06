"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

const emptySubscribe = () => () => {}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isMounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  if (!isMounted) {
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Toggle theme"
        className="text-muted-foreground"
      >
        <Sun className="size-4" />
      </Button>
    )
  }

  const isDark = theme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}
