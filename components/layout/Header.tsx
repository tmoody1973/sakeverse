"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Badge } from "@/components/ui/Badge"
import { Search, Mic, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { UserButton, useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useState, FormEvent } from "react"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Discover", href: "/discover" },
  { name: "Podcasts", href: "/podcasts" },
  { name: "Map", href: "/map" },
  { name: "Learn", href: "/learn" },
]

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { isSignedIn, isLoaded, user } = useUser()
  const [searchQuery, setSearchQuery] = useState("")
  const stats = useQuery(
    api.gamification.getUserStats,
    user?.id ? { clerkId: user.id } : "skip"
  )

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/discover?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b-3 border-ink bg-sakura-pink">
      <div className="container mx-auto flex h-16 items-center px-4 lg:px-8">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center flex-shrink-0"
          aria-label="Sakécosm Home"
        >
          <img 
            src="/sakecosm-logo.svg" 
            alt="Sakécosm" 
            className="h-8 md:h-9 w-auto"
          />
        </Link>

        {/* Desktop Navigation - only show for logged-in users */}
        {isSignedIn && (
          <nav className="hidden md:flex items-center ml-10 space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-plum-dark whitespace-nowrap",
                  pathname === item.href
                    ? "text-plum-dark font-semibold"
                    : "text-ink"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        )}

        {/* Search Bar (Desktop) - only for logged-in */}
        {isSignedIn && (
          <form onSubmit={handleSearch} className="hidden lg:flex items-center flex-1 max-w-sm ml-12">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sake, breweries, regions..."
                className="pl-10 bg-white"
              />
            </div>
          </form>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-3 ml-auto">
          {/* Voice Agent Button - only for logged-in */}
          {isSignedIn && (
            <Button
              variant="accent"
              size="icon"
              className="relative"
              asChild
            >
              <Link href="/kiki">
                <Mic className="h-4 w-4" />
                <Badge 
                  variant="success" 
                  size="sm" 
                  className="absolute -top-1 -right-1 h-3 w-3 p-0 text-xs"
                >
                  •
                </Badge>
              </Link>
            </Button>
          )}

          {/* User Menu */}
          {isSignedIn ? (
            <div className="flex items-center space-x-3">
              <Link 
                href="/settings" 
                className="hidden sm:block text-right hover:opacity-80 transition-opacity"
              >
                <div className="text-sm font-medium text-ink">
                  {user?.firstName || "User"}
                </div>
                <div className="text-xs text-gray-600">
                  {stats ? `Lvl ${stats.level} • ${stats.xp} XP` : "Loading..."}
                </div>
              </Link>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 border-2 border-ink rounded-full shadow-retro-sm"
                  }
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Link label="Preferences" labelIcon={<span>⚙️</span>} href="/settings" />
                </UserButton.MenuItems>
              </UserButton>
            </div>
          ) : (
            <div className="hidden sm:flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button variant="primary" size="sm" asChild>
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Search Bar - only for logged-in */}
      {isSignedIn && (
        <div className="lg:hidden border-t-2 border-ink bg-sakura-light p-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sake..."
              className="pl-10 bg-white"
            />
          </form>
        </div>
      )}
    </header>
  )
}
