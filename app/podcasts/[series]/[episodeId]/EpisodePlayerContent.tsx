"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Play, Pause, SkipBack, SkipForward } from "lucide-react"
import { Id } from "@/convex/_generated/dataModel"

export function EpisodePlayerContent() {
  const params = useParams()
  const episodeId = params.episodeId as Id<"podcastEpisodes">
  const series = params.series as string
  
  const episode = useQuery(api.podcastEpisodes.getById, { episodeId })
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener("timeupdate", () => {
        setCurrentTime(audioRef.current?.currentTime || 0)
      })
      audioRef.current.addEventListener("loadedmetadata", () => {
        setDuration(audioRef.current?.duration || 0)
      })
      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false)
      })
    }
  }, [episode?.audio?.url])

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

  const handlePlayPause = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
    setCurrentTime(time)
  }

  const skip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sakura-light to-white pb-24">
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
          {series.replace("_", " ")}
        </p>
        <h1 className="text-2xl font-bold mt-1">{episode.title}</h1>
        {episode.subtitle && (
          <p className="text-gray-600 mt-1">{episode.subtitle}</p>
        )}
      </div>

      {/* Audio Player */}
      {episode.audio && (
        <div className="mx-4 bg-white rounded-2xl border-2 border-ink shadow-[4px_4px_0px_#2D2D2D] p-6">
          <audio ref={audioRef} src={episode.audio.url} preload="metadata" />
          
          {/* Progress Bar */}
          <div className="mb-4">
            <input
              type="range"
              min={0}
              max={duration || episode.audio.duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sakura-pink"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration || episode.audio.duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => skip(-15)}
              className="p-3 hover:bg-gray-100 rounded-full transition-colors"
            >
              <SkipBack className="w-6 h-6" />
            </button>
            
            <button
              onClick={handlePlayPause}
              className="w-16 h-16 bg-sakura-pink rounded-full border-2 border-ink shadow-[3px_3px_0px_#2D2D2D] flex items-center justify-center hover:shadow-[4px_4px_0px_#2D2D2D] transition-all"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </button>
            
            <button
              onClick={() => skip(30)}
              className="p-3 hover:bg-gray-100 rounded-full transition-colors"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Description */}
      <div className="p-4 mt-6">
        <h2 className="font-semibold mb-2">About this episode</h2>
        <p className="text-gray-600">{episode.description}</p>
      </div>
    </div>
  )
}
