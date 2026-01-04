"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Mic, BookOpen, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Discover", href: "/discover", icon: Search },
  { name: "Yuki", href: "/yuki", icon: Mic },
  { name: "Learn", href: "/learn", icon: BookOpen },
  { name: "Profile", href: "/profile", icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t-3 border-ink bg-white">
      <div className="grid grid-cols-5 h-16">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-colors",
                isActive
                  ? "bg-sakura-pink text-plum-dark"
                  : "text-gray-600 hover:text-ink hover:bg-sakura-light"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "animate-pulse")} />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
