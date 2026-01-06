"use client"

import { useAudioPlayer } from "@/hooks/useAudioPlayer"
import { X } from "lucide-react"
import AudioPlayer from "react-h5-audio-player"
import "react-h5-audio-player/lib/styles.css"

export function GlobalAudioPlayer() {
  const { currentEpisode, clear } = useAudioPlayer()

  if (!currentEpisode) return null

  const seriesName = currentEpisode.series.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-plum-dark to-purple-900 text-white border-t-2 border-ink shadow-lg">
      <div className="max-w-7xl mx-auto">
        {/* Episode Info + Close */}
        <div className="flex items-center justify-between px-4 pt-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/70 uppercase tracking-wide">{seriesName}</p>
            <p className="font-medium truncate">{currentEpisode.title}</p>
          </div>
          <button
            onClick={clear}
            className="p-2 hover:bg-white/10 rounded-full transition-colors ml-2"
            aria-label="Close player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Player */}
        <AudioPlayer
          src={currentEpisode.audioUrl}
          autoPlay
          showJumpControls={false}
          showDownloadProgress={false}
          showFilledProgress
          customAdditionalControls={[]}
          customVolumeControls={[]}
          layout="horizontal-reverse"
          className="!bg-transparent !shadow-none [&_.rhap_main-controls-button]:!text-white [&_.rhap_progress-filled]:!bg-sakura-pink [&_.rhap_progress-indicator]:!bg-white [&_.rhap_time]:!text-white/80 [&_.rhap_progress-bar]:!bg-white/30"
        />
      </div>
    </div>
  )
}
