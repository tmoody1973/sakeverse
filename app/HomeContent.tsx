"use client"

import { useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Mic, Play, MapPin, BookOpen, TrendingUp, Star } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { LandingPage } from "@/components/landing/LandingPage"

const DashboardContent = dynamic(
  () => import("@/components/dashboard/DashboardContent").then(mod => mod.DashboardContent),
  { ssr: false, loading: () => <div className="animate-pulse text-gray-500">Loading...</div> }
)

// Wine to sake mapping
const wineToSakeMap: Record<string, { sake: string; reason: string }> = {
  "Pinot Noir": { sake: "aged Junmai or Koshu", reason: "Similar earthy, elegant notes" },
  "Chardonnay": { sake: "Junmai with Kimoto", reason: "Rich, full-bodied character" },
  "Cabernet": { sake: "Yamahai Junmai", reason: "Bold, structured flavors" },
  "Sauvignon Blanc": { sake: "Junmai Ginjo", reason: "Crisp, refreshing finish" },
  "Riesling": { sake: "Nigori or sweet Junmai", reason: "Fruity, aromatic profile" },
  "Champagne": { sake: "Sparkling Sake", reason: "Celebratory bubbles" },
  "Rosé": { sake: "light Junmai Ginjo", reason: "Delicate, floral notes" },
}

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

  return <Dashboard userId={user?.id} />
}

function Dashboard({ userId }: { userId?: string }) {
  const preferences = useQuery(api.users.getUserPreferences, 
    userId ? { clerkId: userId } : "skip"
  )
  
  // Get session ID for library
  const [sessionId, setSessionId] = useState<string | null>(null)
  useEffect(() => {
    let id = sessionStorage.getItem('sakeverse-session')
    if (!id) {
      id = crypto.randomUUID()
      sessionStorage.setItem('sakeverse-session', id)
    }
    setSessionId(id)
  }, [])
  
  const library = useQuery(api.userLibrary.getLibrary, 
    sessionId ? { sessionId } : "skip"
  )
  
  // Get first wine preference for the tip
  const winePrefs = preferences?.winePreferences || []
  const primaryWine = winePrefs.find(w => w !== "None") || null
  const wineRec = primaryWine ? wineToSakeMap[primaryWine] : null

  return (
    <div className="container-retro py-8 space-y-8">
      {/* Welcome Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8 bg-gradient-to-br from-sakura-pink to-petal-light">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl mb-2">
                  Welcome back! 🌸
                </CardTitle>
                <p className="text-gray-600">
                  Ready to discover your next favorite sake?
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-plum-dark">Level 3</div>
                <div className="text-sm text-gray-600">340 XP</div>
                <div className="flex items-center mt-1">
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
                <Button variant="primary" className="h-16 flex-col" asChild>
                  <Link href="/discover">
                    <Star className="h-6 w-6 mb-1" />
                    <span className="text-xs">Discover</span>
                  </Link>
                </Button>
                <Button variant="secondary" className="h-16 flex-col" asChild>
                  <Link href="/map">
                    <MapPin className="h-6 w-6 mb-1" />
                    <span className="text-xs">Explore Map</span>
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

          {/* Current Course */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Course</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="text-2xl">🌱</div>
                  <div>
                    <div className="font-semibold">Sake Fundamentals</div>
                    <div className="text-sm text-gray-600">Lesson 8 of 10</div>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: "80%" }}></div>
                </div>
                <Button variant="primary" size="sm" className="w-full">
                  Continue Learning
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Wine-to-Sake Tip - only show if user has wine preferences */}
          {primaryWine && wineRec && (
            <Card className="bg-gradient-to-br from-plum-dark/10 to-sakura-light border-plum-dark/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🍷</div>
                  <div>
                    <p className="text-xs text-plum-dark font-medium mb-1">Based on your {primaryWine} preference</p>
                    <p className="text-sm text-ink font-semibold">Try {wineRec.sake}</p>
                    <p className="text-xs text-gray-600 mt-1">{wineRec.reason}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Food Pairing of the Day */}
          <Card className="bg-gradient-to-br from-sake-warm/30 to-white">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🍜</div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Tonight's Pairing</p>
                  <p className="text-sm text-ink font-semibold">Ramen + Junmai Ginjo</p>
                  <p className="text-xs text-gray-600 mt-1">Rich broth meets clean finish</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Library Preview */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-ink">Your Library</span>
                <Link href="/library" className="text-xs text-plum-dark hover:underline">View all →</Link>
              </div>
              {library && library.length > 0 ? (
                <div className="space-y-2">
                  {library.slice(0, 2).map((sake, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-sakura-light/50 rounded-lg">
                      {sake.image ? (
                        <img src={sake.image} alt={sake.sakeName} className="w-8 h-8 object-contain" />
                      ) : (
                        <span className="text-lg">🍶</span>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{sake.sakeName}</p>
                        <p className="text-xs text-gray-500">{sake.category || "Sake"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">No saved sake yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Featured Podcast */}
      <Card className="bg-plum-dark text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-sake-warm rounded-lg flex items-center justify-center text-2xl">
                🍽️
              </div>
              <div>
                <Badge variant="secondary" className="mb-2">Now Playing</Badge>
                <h3 className="text-xl font-bold mb-1">Pairing Lab</h3>
                <p className="text-gray-300">Korean BBQ and Sake—Why It Works</p>
                <div className="text-sm text-gray-400 mt-1">15 min • Episode 12</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="secondary" size="icon">
                <Play className="h-4 w-4" />
              </Button>
              <div className="text-sm text-gray-400">5:23 / 15:00</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kiki CTA */}
      <Card className="bg-sake-mist">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl border-2 border-ink shadow-retro">
                🎤
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Chat with Kiki</h3>
                <p className="text-gray-600">Your AI sake sommelier (利き酒) is ready to help you discover new flavors</p>
              </div>
            </div>
            <Button variant="accent" size="lg" className="voice-pulse" asChild>
              <Link href="/kiki">
                <Mic className="h-5 w-5 mr-2" />
                Start Conversation
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold">Recommended for You</h2>
          <Button variant="ghost" asChild>
            <Link href="/discover">
              View All
              <TrendingUp className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Sake Cards */}
          {[
            {
              name: "Dassai 23",
              brewery: "Asahi Shuzo",
              region: "Yamaguchi",
              type: "Junmai Daiginjo",
              price: "$85",
              image: "🍶",
              rating: 4.8,
              compatibility: 95,
            },
            {
              name: "Hakkaisan",
              brewery: "Hakkaisan Brewery",
              region: "Niigata",
              type: "Junmai Ginjo",
              price: "$32",
              image: "🍶",
              rating: 4.6,
              compatibility: 88,
            },
            {
              name: "Kubota Manju",
              brewery: "Asahi-shuzo",
              region: "Niigata",
              type: "Junmai Daiginjo",
              price: "$45",
              image: "🍶",
              rating: 4.7,
              compatibility: 92,
            },
            {
              name: "Juyondai",
              brewery: "Takagi Shuzo",
              region: "Yamagata",
              type: "Junmai",
              price: "$120",
              image: "🍶",
              rating: 4.9,
              compatibility: 89,
            },
          ].map((sake, index) => (
            <Card key={index} className="group cursor-pointer">
              <CardContent className="p-4">
                <div className="aspect-square bg-sakura-light rounded-lg flex items-center justify-center text-4xl mb-3 group-hover:bg-petal-light transition-colors relative">
                  {sake.image}
                  <Badge 
                    variant="primary"
                    className="absolute top-2 left-2 text-xs"
                  >
                    {sake.type.split(' ')[0]}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-ink group-hover:text-plum-dark transition-colors">
                    {sake.name}
                  </h3>
                  <p className="text-sm text-gray-600">{sake.region}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-plum-dark">{sake.price}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 fill-current text-yellow-500" />
                      <span className="text-xs text-gray-600">{sake.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="success" size="sm">
                      {sake.compatibility}% match
                    </Badge>
                    <Button variant="primary" size="sm">
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
