"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import Link from "next/link"
import { Headphones, BookOpen, Utensils, Wine, FlaskConical, Play } from "lucide-react"

const SHOWS = [
  { id: "sake_stories", name: "Sake Stories", icon: BookOpen, color: "bg-sakura-pink", desc: "Legendary breweries and their stories" },
  { id: "pairing_lab", name: "Pairing Lab", icon: Utensils, color: "bg-amber-200", desc: "Unexpected sake & food combinations" },
  { id: "the_bridge", name: "The Bridge", icon: Wine, color: "bg-purple-200", desc: "From wine lover to sake enthusiast" },
  { id: "brewing_secrets", name: "Brewing Secrets", icon: FlaskConical, color: "bg-blue-200", desc: "The science of sake making" },
]

export function PodcastsContent() {
  const episodes = useQuery(api.podcastEpisodes.listPublished, { limit: 20 })

  return (
    <div className="p-4 pb-24 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Headphones className="w-8 h-8 text-plum-dark" />
        <div>
          <h1 className="text-2xl font-bold">Podcasts</h1>
          <p className="text-sm text-gray-600">AI-generated sake education</p>
        </div>
      </div>

      {/* Shows */}
      <div className="grid grid-cols-2 gap-3">
        {SHOWS.map(show => {
          const Icon = show.icon
          const showEpisodes = episodes?.filter(e => e.series === show.id) || []
          
          return (
            <Link
              key={show.id}
              href={`/podcasts/${show.id}`}
              className={`p-4 rounded-xl border-2 border-ink shadow-[3px_3px_0px_#2D2D2D] ${show.color} hover:shadow-[4px_4px_0px_#2D2D2D] transition-all`}
            >
              <Icon className="w-6 h-6 mb-2" />
              <p className="font-semibold">{show.name}</p>
              <p className="text-xs text-gray-700 mt-1">{show.desc}</p>
              <p className="text-xs text-gray-600 mt-2">{showEpisodes.length} episodes</p>
            </Link>
          )
        })}
      </div>

      {/* Latest Episodes */}
      <div>
        <h2 className="font-semibold mb-3">Latest Episodes</h2>
        {!episodes || episodes.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-ink p-6 text-center text-gray-500">
            No episodes published yet. Check back soon!
          </div>
        ) : (
          <div className="space-y-3">
            {episodes.map(episode => {
              const show = SHOWS.find(s => s.id === episode.series)
              const Icon = show?.icon || BookOpen
              
              return (
                <Link
                  key={episode._id}
                  href={`/podcasts/${episode.series}/${episode._id}`}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-ink shadow-[2px_2px_0px_#2D2D2D] hover:shadow-[3px_3px_0px_#2D2D2D] transition-all"
                >
                  <div className={`p-3 rounded-lg ${show?.color || "bg-gray-100"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{episode.title}</p>
                    <p className="text-sm text-gray-600 truncate">{episode.subtitle}</p>
                    {episode.audio && (
                      <p className="text-xs text-gray-400 mt-1">
                        {Math.floor(episode.audio.duration / 60)} min
                      </p>
                    )}
                  </div>
                  <button className="p-3 bg-sakura-pink rounded-full border-2 border-ink">
                    <Play className="w-4 h-4" />
                  </button>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
