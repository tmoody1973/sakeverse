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
import { FoodPairingExpandable } from "@/components/dashboard/FoodPairingExpandable"

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
  
  const library = useQuery(api.userLibrary.getLibrary, 
    userId ? { clerkId: userId } : "skip"
  )
  
  const stats = useQuery(api.gamification.getUserStats,
    userId ? { clerkId: userId } : "skip"
  )
  
  const courseProgress = useQuery(api.learn.progress.getUserCourseList,
    userId ? { clerkId: userId } : "skip"
  )
  
  const recommendations = useQuery(api.recommendations.getPersonalizedRecommendations,
    userId ? { clerkId: userId } : "skip"
  )
  
  const latestEpisode = useQuery(api.podcastEpisodes.listPublished, { limit: 1 })
  
  // Get first wine preference for the tip (case-insensitive matching)
  const winePrefs = preferences?.winePreferences || []
  const wineMapKeys = Object.keys(wineToSakeMap)
  const primaryWine = winePrefs.find(w => {
    if (w === "None" || w === "none") return false
    return wineMapKeys.some(key => key.toLowerCase() === w.toLowerCase())
  })
  // Find the properly cased key
  const matchedKey = primaryWine ? wineMapKeys.find(k => k.toLowerCase() === primaryWine.toLowerCase()) : null
  const wineRec = matchedKey ? wineToSakeMap[matchedKey] : null
  
  // Calculate stats
  const sakeTried = library?.length || 0
  // Get course that's actually in progress (not 100% complete)
  const allInProgress = courseProgress?.inProgress || []
  const inProgressCourses = allInProgress.filter(
    (c) => c && c.progress !== undefined && c.progress < 100
  )
  const currentCourse = inProgressCourses[0] as { _id: string; title: string; slug: string; progress: number } | undefined
  const coursesInProgress = inProgressCourses.length
  const displayWine = matchedKey || primaryWine

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
              <div className="text-right flex items-center gap-3">
                {stats?.image && (
                  <img 
                    src={stats.image} 
                    alt={stats.title || "Badge"} 
                    className="w-16 h-16 rounded-full border-2 border-ink shadow-retro-sm"
                  />
                )}
                <div>
                  <div className="text-lg font-bold text-plum-dark">
                    {stats?.title || "Sake Curious"}
                  </div>
                  <div className="text-sm text-gray-600">
                    Level {stats?.level || 1} • {stats?.xp || 0} XP
                  </div>
                  {stats?.nextTitle && (
                    <div className="text-xs text-gray-500">
                      {stats.xpToNext} XP to {stats.nextTitle}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-plum-dark">{sakeTried}</div>
                <div className="text-sm text-gray-600">Sake Saved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-plum-dark">{stats?.level || 1}</div>
                <div className="text-sm text-gray-600">Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-plum-dark">{coursesInProgress}</div>
                <div className="text-sm text-gray-600">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-plum-dark">{currentCourse?.progress || 0}%</div>
                <div className="text-sm text-gray-600">Progress</div>
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
              {currentCourse ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl">🌱</div>
                    <div>
                      <div className="font-semibold">{currentCourse.title}</div>
                      <div className="text-sm text-gray-600">{currentCourse.progress}% complete</div>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${currentCourse.progress}%` }}></div>
                  </div>
                  <Button variant="primary" size="sm" className="w-full" asChild>
                    <Link href={`/learn/${currentCourse.slug}`}>Continue Learning</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Start your sake learning journey!</p>
                  <Button variant="primary" size="sm" className="w-full" asChild>
                    <Link href="/learn">Browse Courses</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Wine-to-Sake Tip */}
          <Card className="bg-gradient-to-br from-plum-dark/10 to-sakura-light border-plum-dark/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🍷</div>
                <div>
                  {displayWine && wineRec ? (
                    <>
                      <p className="text-xs text-plum-dark font-medium mb-1">Based on your {displayWine} preference</p>
                      <p className="text-sm text-ink font-semibold">Try {wineRec.sake}</p>
                      <p className="text-xs text-gray-600 mt-1">{wineRec.reason}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-plum-dark font-medium mb-1">Wine-to-Sake Bridge</p>
                      <p className="text-sm text-ink font-semibold">Set your wine preferences</p>
                      <Link href="/settings" className="text-xs text-plum-dark hover:underline mt-1 inline-block">
                        Update in Settings →
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Food Pairing of the Day */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <span>🍜</span> Food Pairings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FoodPairingExpandable />
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
      {latestEpisode && latestEpisode[0] && (
        <Card className="bg-plum-dark text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-sake-warm rounded-lg flex items-center justify-center text-2xl">
                  {latestEpisode[0].series === "sake_stories" ? "📖" : 
                   latestEpisode[0].series === "pairing_lab" ? "🍽️" :
                   latestEpisode[0].series === "the_bridge" ? "🍷" : "🔬"}
                </div>
                <div>
                  <Badge variant="secondary" className="mb-2">Latest Episode</Badge>
                  <h3 className="text-xl font-bold mb-1">
                    {latestEpisode[0].series === "sake_stories" ? "Sake Stories" : 
                     latestEpisode[0].series === "pairing_lab" ? "Pairing Lab" :
                     latestEpisode[0].series === "the_bridge" ? "The Bridge" : "Brewing Secrets"}
                  </h3>
                  <p className="text-gray-300">{latestEpisode[0].title}</p>
                  <div className="text-sm text-gray-400 mt-1">
                    {latestEpisode[0].audio?.duration ? `${Math.round(latestEpisode[0].audio.duration / 60)} min` : ""} • Episode {latestEpisode[0].episodeNumber}
                  </div>
                </div>
              </div>
              <Button variant="secondary" asChild>
                <Link href={`/podcasts/${latestEpisode[0].series}/${latestEpisode[0]._id}`}>
                  <Play className="h-4 w-4 mr-2" />
                  Listen
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
          {recommendations && recommendations.length > 0 ? (
            recommendations.map((sake) => (
              <Card key={sake._id} className="group cursor-pointer">
                <CardContent className="p-4">
                  <div className="aspect-square bg-sakura-light rounded-lg flex items-center justify-center mb-3 group-hover:bg-petal-light transition-colors relative overflow-hidden">
                    {sake.image ? (
                      <img src={sake.image} alt={sake.productName} className="w-full h-full object-contain p-2" />
                    ) : (
                      <span className="text-4xl">🍶</span>
                    )}
                    <Badge variant="primary" className="absolute top-2 left-2 text-xs">
                      {sake.category}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-ink group-hover:text-plum-dark transition-colors line-clamp-2">
                      {sake.productName}
                    </h3>
                    <p className="text-sm text-gray-600">{sake.brand}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-plum-dark">${sake.price.toFixed(2)}</span>
                      {sake.tasteProfile && (
                        <span className="text-xs text-gray-500 truncate max-w-[100px]">{sake.tasteProfile}</span>
                      )}
                    </div>
                    {sake.url && (
                      <a href={sake.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="primary" size="sm" className="w-full">
                          View on Tippsy
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              <p>Complete your preferences to get personalized recommendations!</p>
              <Link href="/settings" className="text-plum-dark hover:underline mt-2 inline-block">
                Update Preferences →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
