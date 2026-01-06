"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useEffect } from "react"
import { ArrowLeft, Play, Pause, SkipBack, SkipForward } from "lucide-react"
import { Id } from "@/convex/_generated/dataModel"
import { useAudioPlayer } from "@/hooks/useAudioPlayer"

export function EpisodePlayerContent() {
  const params = useParams()
  const episodeId = params.episodeId as Id<"podcastEpisodes">
  const series = params.series as string
  
  const episode = useQuery(api.podcastEpisodes.getById, { episodeId })
  const { currentEpisode, isPlaying, currentTime, duration, setEpisode, toggle, setCurrentTime } = useAudioPlayer()

  // Check if this episode is currently playing
  const isThisEpisode = currentEpisode?.id === episodeId
  const isThisPlaying = isThisEpisode && isPlaying

  if (!episode) {
    return <div className="p-6">Loading...</div>
  }

  if (episode.status !== "published") {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">This episode is not available.</p>
        <Link href="/podcasts" className="text-sakura-pink underline mt-2 inline-block">
          Back to Podcasts
        </Link>
      </div>
    )
  }

  const handlePlay = () => {
    if (!episode.audio?.url) return
    
    if (isThisEpisode) {
      toggle()
    } else {
      setEpisode({
        id: episodeId,
        title: episode.title,
        series: episode.series,
        audioUrl: episode.audio.url,
        duration: episode.audio.duration,
      })
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const displayTime = isThisEpisode ? currentTime : 0
  const displayDuration = isThisEpisode ? duration : (episode.audio?.duration || 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-sakura-light to-white pb-32">
      {/* Header */}
      <div className="p-4">
        <Link href="/podcasts" className="flex items-center gap-2 text-gray-600 hover:text-ink">
          <ArrowLeft className="w-5 h-5" />
          Back to Podcasts
        </Link>
      </div>

      {/* Episode Info */}
      <div className="px-4 pb-6">
        <p className="text-sm text-plum-dark font-medium uppercase tracking-wide">
          {series.replace(/_/g, " ")}
        </p>
        <h1 className="text-2xl font-bold mt-1">{episode.title}</h1>
        {episode.subtitle && (
          <p className="text-gray-600 mt-1">{episode.subtitle}</p>
        )}
      </div>

      {/* Play Button Card */}
      {episode.audio && (
        <div className="mx-4 bg-white rounded-2xl border-2 border-ink shadow-[4px_4px_0px_#2D2D2D] p-6">
          {/* Progress (if playing this episode) */}
          {isThisEpisode && (
            <div className="mb-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sakura-pink transition-all"
                  style={{ width: `${(displayTime / displayDuration) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formatTime(displayTime)}</span>
                <span>{formatTime(displayDuration)}</span>
              </div>
            </div>
          )}

          {/* Play Button */}
          <div className="flex items-center justify-center">
            <button
              onClick={handlePlay}
              className="w-20 h-20 bg-sakura-pink rounded-full border-2 border-ink shadow-[3px_3px_0px_#2D2D2D] flex items-center justify-center hover:shadow-[4px_4px_0px_#2D2D2D] hover:-translate-y-0.5 transition-all"
            >
              {isThisPlaying ? (
                <Pause className="w-10 h-10" />
              ) : (
                <Play className="w-10 h-10 ml-1" />
              )}
            </button>
          </div>

          {!isThisEpisode && (
            <p className="text-center text-sm text-gray-500 mt-3">
              {formatTime(episode.audio.duration)} • Tap to play
            </p>
          )}
        </div>
      )}

      {/* Description */}
      <div className="p-4 mt-6">
        <h2 className="font-semibold mb-2">About this episode</h2>
        <p className="text-gray-600">{episode.description}</p>
      </div>

      {/* Script Preview */}
      {episode.script && (
        <div className="p-4">
          <h2 className="font-semibold mb-2">Transcript</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-4 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
              {episode.script.content}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
