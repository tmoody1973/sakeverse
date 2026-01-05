"use client"

import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Mic, MapPin, BookOpen, TrendingUp } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { LandingPage } from "@/components/landing/LandingPage"

const DashboardContent = dynamic(
  () => import("@/components/dashboard/DashboardContent").then(mod => mod.DashboardContent),
  { ssr: false, loading: () => <div className="animate-pulse text-gray-500">Loading...</div> }
)

export default function HomeContent() {
  const { isSignedIn, isLoaded, user } = useUser()

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-gray-500">Loading...</div>
    </div>
  }

  if (!isSignedIn) {
    return <LandingPage />
  }

  return (
    <div className="container-retro py-8 space-y-8">
      {/* Welcome Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8 bg-gradient-to-br from-sakura-pink to-petal-light">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl mb-2">
                  Welcome back, {user?.firstName || "Sake Explorer"}! 🌸
                </CardTitle>
                <p className="text-gray-600">
                  Ready to discover your next favorite sake?
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-plum-dark">Level 3</div>
                <div className="text-sm text-gray-600">340 XP</div>
                <div className="flex items-center mt-1 justify-end">
                  <div className="text-sm text-gray-600 mr-2">7 day streak</div>
                  <div className="text-lg">🔥</div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-plum-dark">12</div>
                <div className="text-sm text-gray-600">Sake Tried</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-plum-dark">4</div>
                <div className="text-sm text-gray-600">Badges</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-plum-dark">3</div>
                <div className="text-sm text-gray-600">Regions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-plum-dark">80%</div>
                <div className="text-sm text-gray-600">Course Progress</div>
              </div>
            </div>
            
            {/* News + Featured Sake */}
            <DashboardContent />
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="accent" className="h-16 flex-col" asChild>
                  <Link href="/kiki">
                    <Mic className="h-6 w-6 mb-1" />
                    <span className="text-xs">Ask Kiki</span>
                  </Link>
                </Button>
                <Button variant="secondary" className="h-16 flex-col" asChild>
                  <Link href="/discover">
                    <TrendingUp className="h-6 w-6 mb-1" />
                    <span className="text-xs">Discover</span>
                  </Link>
                </Button>
                <Button variant="secondary" className="h-16 flex-col" asChild>
                  <Link href="/map">
                    <MapPin className="h-6 w-6 mb-1" />
                    <span className="text-xs">Map</span>
                  </Link>
                </Button>
                <Button variant="secondary" className="h-16 flex-col" asChild>
                  <Link href="/learn">
                    <BookOpen className="h-6 w-6 mb-1" />
                    <span className="text-xs">Learn</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Kiki CTA */}
          <Card className="bg-sake-mist">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white border-2 border-ink flex items-center justify-center shadow-retro-sm">
                  <Mic className="h-6 w-6 text-plum-dark" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-ink">Chat with Kiki</h3>
                  <p className="text-sm text-gray-600">Your AI sake sommelier</p>
                </div>
              </div>
              <Button variant="primary" className="w-full mt-4" asChild>
                <Link href="/kiki">Start Conversation</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
