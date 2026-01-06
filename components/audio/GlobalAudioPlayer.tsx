"use client"

import { useEffect, useRef } from "react"
import { useAudioPlayer } from "@/hooks/useAudioPlayer"
import { Play, Pause, X, Volume2 } from "lucide-react"

export function GlobalAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const { 
    currentEpisode, 
    isPlaying, 
    currentTime,
    duration,
    toggle, 
    pause,
    setCurrentTime, 
    setDuration,
    clear 
  } = useAudioPlayer()

  // Sync audio element with state
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentEpisode) return

    audio.src = currentEpisode.audioUrl
    audio.currentTime = currentTime
    
    if (isPlaying) {
      audio.play().catch(console.error)
    }
  }, [currentEpisode?.id])

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.play().catch(console.error)
    } else {
      audio.pause()
    }
  }, [isPlaying])

  // Update time
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => setDuration(audio.duration)
    const handleEnded = () => pause()

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [])

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    setCurrentTime(time)
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (!currentEpisode) return null

  const seriesName = currentEpisode.series.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())

  return (
    <>
      <audio ref={audioRef} preload="metadata" />
      
      {/* Desktop Player - Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-plum-dark to-purple-900 text-white border-t-3 border-ink shadow-lg hidden md:block">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button
              onClick={toggle}
              className="w-12 h-12 bg-white text-plum-dark rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform flex-shrink-0"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            {/* Episode Info */}
            <div className="flex-shrink-0 min-w-0 max-w-xs">
              <p className="font-medium truncate">{currentEpisode.title}</p>
              <p className="text-sm text-white/70">{seriesName}</p>
            </div>

            {/* Progress Bar */}
            <div className="flex-1 flex items-center gap-3">
              <span className="text-sm text-white/70 w-12 text-right">{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-2 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md"
              />
              <span className="text-sm text-white/70 w-12">{formatTime(duration)}</span>
            </div>

            {/* Volume Icon */}
            <Volume2 className="w-5 h-5 text-white/70 flex-shrink-0" />

            {/* Close */}
            <button
              onClick={clear}
              className="p-2 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Player - Compact floating bar */}
      <div className="fixed bottom-16 left-2 right-2 z-50 bg-gradient-to-r from-plum-dark to-purple-900 text-white rounded-xl border-2 border-ink shadow-lg md:hidden">
        <div className="p-3">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={toggle}
              className="w-10 h-10 bg-white text-plum-dark rounded-full flex items-center justify-center shadow-md flex-shrink-0"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{currentEpisode.title}</p>
              <p className="text-xs text-white/70">{seriesName}</p>
            </div>

            {/* Close */}
            <button onClick={clear} className="p-1.5 hover:bg-white/10 rounded-full flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-white/70">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1.5 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
            />
            <span className="text-xs text-white/70">{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </>
  )
}
