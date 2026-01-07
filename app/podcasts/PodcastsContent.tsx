"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import Link from "next/link"
import { Headphones, Play } from "lucide-react"
import Image from "next/image"

const SHOWS = [
  { id: "sake_stories", name: "Sake Stories", image: "/sake-stories.jpg", desc: "Legendary breweries and their stories" },
  { id: "pairing_lab", name: "Pairing Lab", image: "/pairing-lab.jpg", desc: "Unexpected sake & food combinations" },
  { id: "the_bridge", name: "The Bridge", image: "/the-bridge.jpg", desc: "From wine lover to sake enthusiast" },
  { id: "brewing_secrets", name: "Brewing Secrets", image: "/brewing-secrets.jpg", desc: "The science of sake making" },
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
          const showEpisodes = episodes?.filter(e => e.series === show.id) || []
          
          return (
            <Link
              key={show.id}
              href={`/podcasts/${show.id}`}
              className="rounded-xl border-2 border-ink shadow-[3px_3px_0px_#2D2D2D] overflow-hidden bg-white hover:shadow-[4px_4px_0px_#2D2D2D] hover:-translate-y-0.5 transition-all"
            >
              <div className="relative h-28">
                <Image
                  src={show.image}
                  alt={show.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-3">
                <p className="font-semibold">{show.name}</p>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{show.desc}</p>
                <p className="text-xs text-gray-500 mt-2">{showEpisodes.length} episodes</p>
              </div>
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
              
              return (
                <Link
                  key={episode._id}
                  href={`/podcasts/${episode.series}/${episode._id}`}
                  className="flex items-center gap-4 p-3 bg-white rounded-xl border-2 border-ink shadow-[2px_2px_0px_#2D2D2D] hover:shadow-[3px_3px_0px_#2D2D2D] transition-all"
                >
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden border-2 border-ink flex-shrink-0">
                    <Image
                      src={show?.image || "/sake-stories.jpg"}
                      alt={show?.name || "Podcast"}
                      fill
                      className="object-cover"
                    />
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
                  <button className="p-3 bg-sakura-pink rounded-full border-2 border-ink flex-shrink-0">
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
