"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import Link from "next/link"
import { ArrowLeft, Play, CheckCircle, Clock, Eye } from "lucide-react"

export function EpisodePreviewContent() {
  const episodes = useQuery(api.podcastEpisodes.listRecent, { limit: 50 })

  const reviewEpisodes = episodes?.filter(e => e.status === "review") || []
  const publishedEpisodes = episodes?.filter(e => e.status === "published") || []
  const generatingEpisodes = episodes?.filter(e => e.status === "generating" || e.status === "scripting") || []
  const cancelledEpisodes = episodes?.filter(e => e.status === "cancelled") || []

  return (
    <div className="p-6 space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Link href="/admin/podcasts" className="p-2 bg-white border-2 border-ink rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Episodes</h1>
      </div>

      {/* In Progress */}
      {generatingEpisodes.length > 0 && (
        <Section title="Generating" icon={<Clock className="w-5 h-5 text-yellow-600" />}>
          {generatingEpisodes.map(ep => (
            <EpisodeRow key={ep._id} episode={ep} />
          ))}
        </Section>
      )}

      {/* Cancelled */}
      {cancelledEpisodes.length > 0 && (
        <Section title="Cancelled" icon={<Clock className="w-5 h-5 text-gray-400" />}>
          {cancelledEpisodes.map(ep => (
            <EpisodeRow key={ep._id} episode={ep} />
          ))}
        </Section>
      )}

      {/* Ready for Review */}
      <Section title="Ready for Review" icon={<Eye className="w-5 h-5 text-blue-600" />} count={reviewEpisodes.length}>
        {reviewEpisodes.length === 0 ? (
          <p className="text-gray-500 p-4">No episodes pending review</p>
        ) : (
          reviewEpisodes.map(ep => <EpisodeRow key={ep._id} episode={ep} />)
        )}
      </Section>

      {/* Published */}
      <Section title="Published" icon={<CheckCircle className="w-5 h-5 text-green-600" />} count={publishedEpisodes.length}>
        {publishedEpisodes.length === 0 ? (
          <p className="text-gray-500 p-4">No published episodes yet</p>
        ) : (
          publishedEpisodes.map(ep => <EpisodeRow key={ep._id} episode={ep} />)
        )}
      </Section>
    </div>
  )
}

function Section({ title, icon, count, children }: { title: string; icon: React.ReactNode; count?: number; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border-2 border-ink shadow-[3px_3px_0px_#2D2D2D]">
      <div className="flex items-center gap-2 p-4 border-b-2 border-ink bg-gray-50 rounded-t-xl">
        {icon}
        <h2 className="font-semibold">{title}</h2>
        {count !== undefined && <span className="text-sm text-gray-500">({count})</span>}
      </div>
      <div className="divide-y divide-gray-200">
        {children}
      </div>
    </div>
  )
}

function EpisodeRow({ episode }: { episode: any }) {
  return (
    <Link
      href={`/admin/podcasts/episodes/${episode._id}`}
      className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{episode.title}</p>
        <p className="text-sm text-gray-600">{episode.series.replace("_", " ")} • Episode {episode.episodeNumber}</p>
        {episode.audio && (
          <p className="text-xs text-gray-400 mt-1">
            {Math.floor(episode.audio.duration / 60)}:{String(episode.audio.duration % 60).padStart(2, "0")} duration
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {episode.audio && (
          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Audio Ready</span>
        )}
        {episode.script && !episode.audio && (
          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Script Only</span>
        )}
        <Play className="w-4 h-4 text-gray-400" />
      </div>
    </Link>
  )
}
