"use client"

import { ReactNode, useEffect, useState } from "react"
import { Providers } from "@/lib/convex"
import { Header } from "@/components/layout/Header"
import { BottomNav } from "@/components/layout/BottomNav"

export function AppShell({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="h-16 bg-sakura-pink border-b-3 border-ink" />
        <main className="flex-1">{children}</main>
      </div>
    )
  }

  return (
    <Providers>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 mobile-nav-offset">
          {children}
        </main>
        <BottomNav />
      </div>
    </Providers>
  )
}
