"use client"

import { useState } from "react"
import { useAction, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import Link from "next/link"

const categories = [
  { value: "fundamentals", label: "🌱 Fundamentals" },
  { value: "brewing", label: "🏭 Brewing" },
  { value: "tasting", label: "👅 Tasting" },
  { value: "pairing", label: "🍽️ Food Pairing" },
  { value: "regions", label: "🗾 Regions" },
  { value: "wine-bridge", label: "🍷 Wine Bridge" },
]

export default function AdminLearnContent() {
  const [topic, setTopic] = useState("")
  const [chapterCount, setChapterCount] = useState(4)
  const [category, setCategory] = useState("fundamentals")
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<{ title: string; slug: string } | null>(null)
  const [error, setError] = useState("")

  const generateCourse = useAction(api.learn.generation.generateFullCourse)
  const courses = useQuery(api.learn.courses.listPublishedCourses, {})

  const handleGenerate = async () => {
    if (!topic.trim()) return
    
    setIsGenerating(true)
    setError("")
    setResult(null)
    
    try {
      const res = await generateCourse({ topic, chapterCount, category })
      setResult({ title: res.title, slug: res.slug })
      setTopic("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-sakura-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <Link href="/learn" className="text-plum hover:underline">← Back to Learn</Link>
          <h1 className="text-3xl font-bold text-ink mt-4">🎓 Course Generator</h1>
          <p className="text-gray-600 mt-2">Generate AI-powered sake courses using Gemini + Perplexity</p>
        </div>

        {/* Generator Form */}
        <div className="bg-white border-3 border-ink rounded-xl shadow-retro p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Course Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Understanding Junmai Sake, Temperature and Serving, Regional Styles of Niigata"
              className="w-full px-4 py-3 border-2 border-ink rounded-lg focus:outline-none focus:ring-2 focus:ring-sakura-pink"
              disabled={isGenerating}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border-2 border-ink rounded-lg focus:outline-none focus:ring-2 focus:ring-sakura-pink"
                disabled={isGenerating}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">Chapters</label>
              <select
                value={chapterCount}
                onChange={(e) => setChapterCount(parseInt(e.target.value))}
                className="w-full px-4 py-3 border-2 border-ink rounded-lg focus:outline-none focus:ring-2 focus:ring-sakura-pink"
                disabled={isGenerating}
              >
                {[3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n} chapters (~{n * 15} min)</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="w-full px-6 py-4 bg-sakura-pink text-ink font-bold rounded-lg border-2 border-ink shadow-retro hover:shadow-retro-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Generating course... (this takes 1-2 minutes)
              </span>
            ) : (
              "🚀 Generate Course"
            )}
          </button>

          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {result && (
            <div className="p-4 bg-matcha/20 border-2 border-matcha rounded-lg">
              <p className="font-bold text-ink">✅ Course created!</p>
              <p className="text-gray-600 mt-1">{result.title}</p>
              <Link 
                href={`/learn/${result.slug}`}
                className="inline-block mt-3 text-plum hover:underline font-medium"
              >
                View course →
              </Link>
            </div>
          )}
        </div>

        {/* Existing Courses */}
        <div className="bg-white border-3 border-ink rounded-xl shadow-retro p-6">
          <h2 className="text-xl font-bold text-ink mb-4">Existing Courses</h2>
          {courses?.length === 0 ? (
            <p className="text-gray-500">No courses yet. Generate your first one above!</p>
          ) : (
            <div className="space-y-3">
              {courses?.map((course) => (
                <div key={course._id} className="flex items-center justify-between p-3 bg-sakura-light rounded-lg">
                  <div>
                    <p className="font-medium text-ink">{course.title}</p>
                    <p className="text-sm text-gray-500">{course.chapterCount} chapters • {course.category}</p>
                  </div>
                  <Link 
                    href={`/learn/${course.slug}`}
                    className="text-plum hover:underline text-sm"
                  >
                    View →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
