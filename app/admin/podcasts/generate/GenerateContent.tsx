"use client"

import { useQuery, useAction, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Play, Loader2, CheckCircle, XCircle, FileText, Mic, BookOpen } from "lucide-react"

type GenerationStep = "idle" | "research" | "script" | "audio" | "blog" | "complete" | "error"

export function GenerateContent() {
  const searchParams = useSearchParams()
  const topicIdParam = searchParams.get("topic")
  
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(topicIdParam)
  const [step, setStep] = useState<GenerationStep>("idle")
  const [progress, setProgress] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  
  const topic = useQuery(
    api.podcastTopics.getByTopicId,
    selectedTopicId ? { topicId: selectedTopicId } : "skip"
  )
  
  const generateEpisode = useAction(api.podcastGeneration.generateEpisode)

  const addProgress = (msg: string) => {
    setProgress(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`])
  }

  const handleGenerate = async () => {
    if (!selectedTopicId || !topic) return
    
    setStep("research")
    setProgress([])
    setError(null)
    
    try {
      addProgress("Starting episode generation...")
      addProgress(`Topic: ${topic.title}`)
      
      const result = await generateEpisode({ topicId: selectedTopicId })
      
      if (result.success) {
        setStep("complete")
        addProgress("✅ Episode generated successfully!")
      } else {
        throw new Error(result.error || "Generation failed")
      }
    } catch (e: any) {
      setStep("error")
      setError(e.message)
      addProgress(`❌ Error: ${e.message}`)
    }
  }

  return (
    <div className="p-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/podcasts"
          className="p-2 bg-white border-2 border-ink rounded-lg hover:bg-gray-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Generate Episode</h1>
          <p className="text-sm text-gray-600">Create a new podcast episode from a topic</p>
        </div>
      </div>

      {/* Topic Selection */}
      {!selectedTopicId ? (
        <div className="bg-white rounded-xl border-2 border-ink p-6">
          <p className="text-gray-600">Select a topic from the admin dashboard to generate an episode.</p>
          <Link 
            href="/admin/podcasts"
            className="inline-block mt-4 px-4 py-2 bg-sakura-pink border-2 border-ink rounded-lg"
          >
            Browse Topics
          </Link>
        </div>
      ) : topic ? (
        <>
          {/* Topic Info */}
          <div className="bg-white rounded-xl border-2 border-ink shadow-[3px_3px_0px_#2D2D2D] p-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs uppercase tracking-wide text-gray-500">{topic.series.replace("_", " ")}</span>
                <h2 className="text-xl font-bold mt-1">{topic.title}</h2>
                <p className="text-gray-600 mt-1">{topic.subtitle}</p>
                <p className="text-sm text-gray-500 mt-3 italic">"{topic.narrativeHook}"</p>
              </div>
              <span className={`px-3 py-1 text-sm rounded-full ${
                topic.status === "ready" ? "bg-green-100 text-green-800" :
                topic.status === "generated" ? "bg-blue-100 text-blue-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {topic.status}
              </span>
            </div>
            
            {/* Research Queries Preview */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-medium mb-2">Research Queries:</p>
              <div className="flex flex-wrap gap-2">
                {topic.researchQueries.geminiRag.slice(0, 3).map((q, i) => (
                  <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                    RAG: {q}
                  </span>
                ))}
                {topic.researchQueries.perplexity.slice(0, 2).map((q, i) => (
                  <span key={i} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">
                    Web: {q}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Generation Controls */}
          <div className="bg-white rounded-xl border-2 border-ink shadow-[3px_3px_0px_#2D2D2D] p-6">
            <h3 className="font-semibold mb-4">Generation Pipeline</h3>
            
            {/* Steps */}
            <div className="flex items-center gap-2 mb-6">
              {[
                { id: "research", label: "Research", icon: FileText },
                { id: "script", label: "Script", icon: BookOpen },
                { id: "audio", label: "Audio", icon: Mic },
                { id: "blog", label: "Blog", icon: FileText },
              ].map((s, i) => {
                const Icon = s.icon
                const isActive = step === s.id
                const isComplete = ["research", "script", "audio", "blog", "complete"].indexOf(step) > 
                                   ["research", "script", "audio", "blog"].indexOf(s.id)
                
                return (
                  <div key={s.id} className="flex items-center">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                      isActive ? "bg-sakura-pink border-2 border-ink" :
                      isComplete ? "bg-green-100" :
                      "bg-gray-100"
                    }`}>
                      {isActive ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isComplete ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Icon className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm">{s.label}</span>
                    </div>
                    {i < 3 && <div className="w-4 h-0.5 bg-gray-300 mx-1" />}
                  </div>
                )
              })}
            </div>

            {/* Generate Button */}
            {step === "idle" && topic.status === "ready" && (
              <button
                onClick={handleGenerate}
                className="flex items-center gap-2 px-6 py-3 bg-sakura-pink border-2 border-ink rounded-lg shadow-[3px_3px_0px_#2D2D2D] hover:shadow-[4px_4px_0px_#2D2D2D] transition-all font-semibold"
              >
                <Play className="w-5 h-5" />
                Generate Episode
              </button>
            )}

            {step === "complete" && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Episode generated successfully!</span>
              </div>
            )}

            {step === "error" && (
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {/* Progress Log */}
            {progress.length > 0 && (
              <div className="mt-4 p-4 bg-gray-900 text-green-400 rounded-lg font-mono text-sm max-h-48 overflow-y-auto">
                {progress.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl border-2 border-ink p-6">
          <p className="text-gray-600">Loading topic...</p>
        </div>
      )}
    </div>
  )
}
