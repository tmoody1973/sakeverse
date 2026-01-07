"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Play, Clock } from "lucide-react"

const SERIES_INFO: Record<string, { name: string; image: string; description: string }> = {
  sake_stories: {
    name: "Sake Stories",
    image: "/sake-stories.jpg",
    description: "Deep dives into legendary breweries, the people behind the sake, and the stories that shaped Japanese brewing culture."
  },
  pairing_lab: {
    name: "Pairing Lab",
    image: "/pairing-lab.jpg",
    description: "Exploring unexpected food and sake combinations. From pizza to tacos, discover how sake pairs with cuisines around the world."
  },
  the_bridge: {
    name: "The Bridge",
    image: "/the-bridge.jpg",
    description: "For wine lovers curious about sake. We translate wine knowledge into sake discoveries you'll love."
  },
  brewing_secrets: {
    name: "Brewing Secrets",
    image: "/brewing-secrets.jpg",
    description: "The science and craft behind sake making. Kimoto, yamahai, polishing ratios - demystified."
  },
}

export function SeriesContent() {
  const params = useParams()
  const series = params.series as string
  
  const episodes = useQuery(api.podcastEpisodes.listBySeries, { series })
  const publishedEpisodes = episodes?.filter(e => e.status === "published") || []
  
  const info = SERIES_INFO[series]

  if (!info) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Show not found.</p>
        <Link href="/podcasts" className="text-sakura-pink underline mt-2 inline-block">
          Back to Podcasts
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sakura-light to-white pb-24">
      {/* Header */}
      <div className="p-4">
        <Link href="/podcasts" className="flex items-center gap-2 text-gray-600 hover:text-ink">
          <ArrowLeft className="w-5 h-5" />
          All Shows
        </Link>
      </div>

      {/* Show Hero */}
      <div className="px-4 pb-6">
        <div className="relative w-full h-48 rounded-2xl border-3 border-ink shadow-[4px_4px_0px_#2D2D2D] overflow-hidden mb-4">
          <Image
            src={info.image}
            alt={info.name}
            fill
            className="object-cover"
          />
        </div>
        <h1 className="text-3xl font-bold">{info.name}</h1>
        <p className="text-gray-600 mt-2">{info.description}</p>
        <p className="text-sm text-gray-500 mt-3">
          {publishedEpisodes.length} episode{publishedEpisodes.length !== 1 ? "s" : ""} • From Sakécosm
        </p>
      </div>

      {/* Episodes List */}
      <div className="px-4">
        <h2 className="font-semibold mb-3">Episodes</h2>
        
        {publishedEpisodes.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-ink shadow-[3px_3px_0px_#2D2D2D] p-6 text-center">
            <p className="text-gray-500">No episodes yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {publishedEpisodes.map((episode) => (
              <Link
                key={episode._id}
                href={`/podcasts/${series}/${episode._id}`}
                className="block bg-white rounded-xl border-2 border-ink shadow-[3px_3px_0px_#2D2D2D] p-4 hover:shadow-[4px_4px_0px_#2D2D2D] hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden border-2 border-ink flex-shrink-0">
                    <Image
                      src={info.image}
                      alt={info.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Play className="w-5 h-5 text-white" fill="white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Episode {episode.episodeNumber}</p>
                    <p className="font-semibold">{episode.title}</p>
                    {episode.subtitle && (
                      <p className="text-sm text-gray-600 truncate">{episode.subtitle}</p>
                    )}
                    {episode.audio && (
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.floor(episode.audio.duration / 60)}:{String(episode.audio.duration % 60).padStart(2, "0")}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
