"use client"

import { useQuery, useMutation, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, Play, Pause, CheckCircle, RefreshCw, Globe, EyeOff, Trash2, XCircle } from "lucide-react"
import { Id } from "@/convex/_generated/dataModel"

export function EpisodeDetailContent() {
  const params = useParams()
  const router = useRouter()
  const episodeId = params.id as Id<"podcastEpisodes">
  
  const episode = useQuery(api.podcastEpisodes.getById, { episodeId })
  const publish = useMutation(api.podcastEpisodes.publish)
  const unpublish = useMutation(api.podcastEpisodes.unpublish)
  const deleteEpisode = useMutation(api.podcastEpisodes.deleteEpisode)
  const cancelGeneration = useMutation(api.podcastEpisodes.cancelGeneration)
  const regenerateAudio = useAction(api.podcastTTS.generateAudio)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)

  if (!episode) {
    return <div className="p-6">Loading...</div>
  }

  const handlePlayPause = () => {
    if (!episode.audio?.url) return
    
    if (!audioElement) {
      const audio = new Audio(episode.audio.url)
      audio.onended = () => setIsPlaying(false)
      setAudioElement(audio)
      audio.play()
      setIsPlaying(true)
    } else if (isPlaying) {
      audioElement.pause()
      setIsPlaying(false)
    } else {
      audioElement.play()
      setIsPlaying(true)
    }
  }

  const handlePublish = async () => {
    await publish({ episodeId })
  }

  const handleUnpublish = async () => {
    await unpublish({ episodeId })
  }

  const handleDelete = async () => {
    if (!confirm("Delete this episode? This cannot be undone.")) return
    setIsDeleting(true)
    await deleteEpisode({ episodeId })
    router.push("/admin/podcasts/episodes")
  }

  const handleCancel = async () => {
    setIsCancelling(true)
    await cancelGeneration({ episodeId })
    setIsCancelling(false)
  }

  const handleRegenerateAudio = async () => {
    setIsRegenerating(true)
    try {
      await regenerateAudio({ episodeId })
    } catch (e) {
      console.error("Regenerate failed:", e)
    }
    setIsRegenerating(false)
  }

  return (
    <div className="p-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/podcasts/episodes" className="p-2 bg-white border-2 border-ink rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-sm text-gray-500">{episode.series.replace("_", " ")} • Episode {episode.episodeNumber}</p>
            <h1 className="text-2xl font-bold">{episode.title}</h1>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          episode.status === "published" ? "bg-green-100 text-green-800" :
          episode.status === "review" ? "bg-blue-100 text-blue-800" :
          "bg-yellow-100 text-yellow-800"
        }`}>
          {episode.status}
        </span>
      </div>

      {/* Audio Player */}
      {episode.audio && (
        <div className="bg-gradient-to-r from-plum-dark to-purple-800 text-white rounded-xl border-2 border-ink shadow-[4px_4px_0px_#2D2D2D] p-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePlayPause}
              className="w-16 h-16 bg-white text-plum-dark rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
            </button>
            <div className="flex-1">
              <p className="font-semibold text-lg">Preview Audio</p>
              <p className="text-white/70 text-sm">
                Duration: {Math.floor(episode.audio.duration / 60)}:{String(episode.audio.duration % 60).padStart(2, "0")}
                {" • "}Format: {episode.audio.format.toUpperCase()}
              </p>
            </div>
            <button
              onClick={handleRegenerateAudio}
              disabled={isRegenerating}
              className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRegenerating ? "animate-spin" : ""}`} />
              Regenerate
            </button>
          </div>
        </div>
      )}

      {/* Generating Status with Cancel */}
      {episode.status === "generating" && (
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-yellow-600 animate-spin" />
            <p className="text-yellow-800 font-medium">Generating episode...</p>
          </div>
          <button
            onClick={handleCancel}
            disabled={isCancelling}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-red-600"
          >
            <XCircle className="w-4 h-4" />
            {isCancelling ? "Cancelling..." : "Cancel"}
          </button>
        </div>
      )}

      {/* Cancelled Status */}
      {episode.status === "cancelled" && (
        <div className="bg-gray-100 border-2 border-gray-400 rounded-xl p-4">
          <p className="text-gray-700">Generation was cancelled. You can delete this episode or try regenerating.</p>
        </div>
      )}

      {/* No Audio Warning */}
      {!episode.audio && episode.script && episode.status !== "generating" && episode.status !== "cancelled" && (
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 flex items-center justify-between">
          <p className="text-yellow-800">Audio not generated yet</p>
          <button
            onClick={handleRegenerateAudio}
            disabled={isRegenerating}
            className="px-4 py-2 bg-yellow-400 text-yellow-900 rounded-lg font-medium flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRegenerating ? "animate-spin" : ""}`} />
            Generate Audio
          </button>
        </div>
      )}

      {/* Script Preview */}
      {episode.script && (
        <div className="bg-white rounded-xl border-2 border-ink shadow-[3px_3px_0px_#2D2D2D]">
          <div className="p-4 border-b-2 border-ink bg-gray-50 rounded-t-xl flex items-center justify-between">
            <h2 className="font-semibold">Script</h2>
            <span className="text-sm text-gray-500">
              {episode.script.wordCount} words • ~{episode.script.estimatedDuration} min
            </span>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
              {episode.script.content}
            </pre>
          </div>
        </div>
      )}

      {/* Publish Actions */}
      <div className="flex items-center gap-4">
        {episode.status === "review" && (
          <button
            onClick={handlePublish}
            className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white border-2 border-ink rounded-lg shadow-[3px_3px_0px_#2D2D2D] hover:shadow-[4px_4px_0px_#2D2D2D] transition-all font-semibold"
          >
            <Globe className="w-5 h-5" />
            Publish Episode
          </button>
        )}
        
        {episode.status === "published" && (
          <>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Published</span>
              {episode.publishedAt && (
                <span className="text-sm text-gray-500">
                  on {new Date(episode.publishedAt).toLocaleDateString()}
                </span>
              )}
            </div>
            <button
              onClick={handleUnpublish}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <EyeOff className="w-4 h-4" />
              Unpublish
            </button>
            <Link
              href={`/podcasts/${episode.series}/${episode._id}`}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              View Public Page →
            </Link>
          </>
        )}

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors ml-auto"
        >
          <Trash2 className="w-4 h-4" />
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      {/* Research Data (collapsed) */}
      {episode.research && (
        <details className="bg-white rounded-xl border-2 border-ink">
          <summary className="p-4 cursor-pointer font-semibold">Research Data</summary>
          <div className="p-4 border-t border-gray-200 text-sm">
            <pre className="whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(episode.research, null, 2)}
            </pre>
          </div>
        </details>
      )}
    </div>
  )
}
