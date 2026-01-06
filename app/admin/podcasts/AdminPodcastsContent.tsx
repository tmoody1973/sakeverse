"use client"

import { useQuery, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useState } from "react"
import Link from "next/link"
import { Headphones, BookOpen, Utensils, Wine, FlaskConical, Play, RefreshCw } from "lucide-react"

const SERIES = [
  { id: "sake_stories", name: "Sake Stories", icon: BookOpen, color: "bg-sakura-pink", desc: "Brewery histories" },
  { id: "pairing_lab", name: "Pairing Lab", icon: Utensils, color: "bg-amber-200", desc: "Food pairings" },
  { id: "the_bridge", name: "The Bridge", icon: Wine, color: "bg-purple-200", desc: "Wine to sake" },
  { id: "brewing_secrets", name: "Brewing Secrets", icon: FlaskConical, color: "bg-blue-200", desc: "Technical deep dives" },
]

export function AdminPodcastsContent() {
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null)
  const [testingRAG, setTestingRAG] = useState(false)
  const [ragResult, setRagResult] = useState<string | null>(null)
  
  const counts = useQuery(api.podcastTopics.getSeriesCounts)
  const topics = useQuery(
    api.podcastTopics.listBySeries,
    selectedSeries ? { series: selectedSeries } : "skip"
  )
  const testRAG = useAction(api.podcastRAG.queryBreweryKnowledge)

  const handleTestRAG = async () => {
    setTestingRAG(true)
    setRagResult(null)
    try {
      const result = await testRAG({ query: "Tell me about Hakkaisan brewery" })
      setRagResult(result.chunks[0]?.content || "No result")
    } catch (e: any) {
      setRagResult(`Error: ${e.message}`)
    }
    setTestingRAG(false)
  }

  const totalTopics = counts 
    ? Object.values(counts).reduce((sum, c) => sum + c.total, 0)
    : 0

  return (
    <div className="p-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Headphones className="w-8 h-8 text-plum-dark" />
          <div>
            <h1 className="text-2xl font-bold">Podcast Admin</h1>
            <p className="text-sm text-gray-600">{totalTopics} topics ready for generation</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/podcasts/episodes"
            className="flex items-center gap-2 px-4 py-2 bg-sakura-pink border-2 border-ink rounded-lg shadow-[3px_3px_0px_#2D2D2D] hover:shadow-[4px_4px_0px_#2D2D2D] transition-all font-medium"
          >
            <Play className="w-4 h-4" />
            View Episodes
          </Link>
          <button
            onClick={handleTestRAG}
            disabled={testingRAG}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-ink rounded-lg shadow-[3px_3px_0px_#2D2D2D] hover:shadow-[4px_4px_0px_#2D2D2D] transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${testingRAG ? "animate-spin" : ""}`} />
          Test RAG
        </button>
        </div>
      </div>

      {/* RAG Test Result */}
      {ragResult && (
        <div className="p-4 bg-gray-50 rounded-xl border-2 border-ink text-sm">
          <p className="font-semibold mb-2">RAG Test Result:</p>
          <p className="text-gray-700 whitespace-pre-wrap">{ragResult.slice(0, 500)}...</p>
        </div>
      )}

      {/* Series Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {SERIES.map(series => {
          const Icon = series.icon
          const seriesCounts = counts?.[series.id]
          const isSelected = selectedSeries === series.id
          
          return (
            <button
              key={series.id}
              onClick={() => setSelectedSeries(isSelected ? null : series.id)}
              className={`p-4 rounded-xl border-2 border-ink shadow-[3px_3px_0px_#2D2D2D] transition-all text-left ${
                isSelected ? series.color : "bg-white hover:bg-gray-50"
              }`}
            >
              <Icon className="w-6 h-6 mb-2" />
              <p className="font-semibold">{series.name}</p>
              <p className="text-xs text-gray-600 mb-2">{series.desc}</p>
              <div className="flex items-center justify-between text-sm">
                <span>{seriesCounts?.total || 0} topics</span>
                <span className="text-green-600">{seriesCounts?.ready || 0} ready</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Topics List */}
      {selectedSeries && topics && (
        <div className="bg-white rounded-xl border-2 border-ink shadow-[3px_3px_0px_#2D2D2D] overflow-hidden">
          <div className="p-4 border-b-2 border-ink bg-gray-50">
            <h2 className="font-semibold">
              {SERIES.find(s => s.id === selectedSeries)?.name} Topics ({topics.length})
            </h2>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {topics.map((topic, i) => (
              <div 
                key={topic._id}
                className={`flex items-center justify-between p-4 ${
                  i !== topics.length - 1 ? "border-b border-gray-200" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{topic.title}</p>
                  <p className="text-sm text-gray-600 truncate">{topic.subtitle}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Tier {topic.tier} • {topic.difficulty}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    topic.status === "ready" ? "bg-green-100 text-green-800" :
                    topic.status === "generated" ? "bg-blue-100 text-blue-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {topic.status}
                  </span>
                  {topic.status === "ready" && (
                    <Link
                      href={`/admin/podcasts/generate?topic=${topic.topicId}`}
                      className="p-2 bg-sakura-pink rounded-lg border border-ink hover:shadow-[2px_2px_0px_#2D2D2D] transition-all"
                    >
                      <Play className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {!selectedSeries && (
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-xl border-2 border-ink">
            <p className="text-3xl font-bold">{totalTopics}</p>
            <p className="text-sm text-gray-600">Total Topics</p>
          </div>
          <div className="p-4 bg-white rounded-xl border-2 border-ink">
            <p className="text-3xl font-bold text-green-600">
              {counts ? Object.values(counts).reduce((sum, c) => sum + c.ready, 0) : 0}
            </p>
            <p className="text-sm text-gray-600">Ready to Generate</p>
          </div>
          <div className="p-4 bg-white rounded-xl border-2 border-ink">
            <p className="text-3xl font-bold text-blue-600">
              {counts ? Object.values(counts).reduce((sum, c) => sum + c.generated, 0) : 0}
            </p>
            <p className="text-sm text-gray-600">Episodes Generated</p>
          </div>
        </div>
      )}
    </div>
  )
}
