"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { useState } from "react"

// Badge data for the guide
const LEVELS = [
  { level: 1, xp: 0, title: "Sake Curious", image: "/badges/sake-curious.png" },
  { level: 2, xp: 100, title: "Sake Novice", image: "/badges/sake-novice.png" },
  { level: 3, xp: 300, title: "Sake Student", image: "/badges/sake-student.png" },
  { level: 4, xp: 600, title: "Sake Enthusiast", image: "/badges/sake-enthusist.png" },
  { level: 5, xp: 1000, title: "Sake Connoisseur", image: "/badges/sake-connosieur.png" },
  { level: 6, xp: 1500, title: "Sake Expert", image: "/badges/sake-expert.png" },
  { level: 7, xp: 2500, title: "Sake Master", image: "/badges/sake-master.png" },
  { level: 8, xp: 4000, title: "Sake Sensei", image: "/badges/sake-sensei.png" },
  { level: 9, xp: 6000, title: "Sake Legend", image: "/badges/sake-legend.png" },
  { level: 10, xp: 10000, title: "Sake Grandmaster", image: "/badges/sake-grandmaster.png" },
]

const XP_REWARDS = [
  { action: "Read a chapter", xp: 25 },
  { action: "Pass a quiz", xp: 50 },
  { action: "Perfect quiz score", xp: 100 },
]

export default function LearnContent() {
  const { user } = useUser()
  const [showGuide, setShowGuide] = useState(false)
  const courses = useQuery(api.learn.courses.listPublishedCourses, {})
  const categories = useQuery(api.learn.courses.getCategories)
  const userProgress = useQuery(
    api.learn.progress.getUserCourseList,
    user?.id ? { clerkId: user.id } : "skip"
  )
  const stats = useQuery(
    api.gamification.getUserStats,
    user?.id ? { clerkId: user.id } : "skip"
  )

  if (!courses || !categories) {
    return (
      <div className="min-h-screen bg-sakura-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-sakura-light rounded w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-sakura-light rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const inProgress = userProgress?.inProgress || []

  return (
    <div className="min-h-screen bg-sakura-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header with XP */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-ink flex items-center gap-3">
              🍶 Learn Sake
            </h1>
            <p className="text-gray-600 mt-2">
              Master the art of sake with guided courses
            </p>
          </div>
          
          {/* XP Badge */}
          <button 
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-3 bg-white border-2 border-ink rounded-xl p-3 shadow-retro hover:shadow-retro-lg transition-all"
          >
            {stats?.image && (
              <img src={stats.image} alt={stats.title || ""} className="w-12 h-12 rounded-full" />
            )}
            <div className="text-left">
              <div className="font-bold text-ink">{stats?.title || "Sake Curious"}</div>
              <div className="text-sm text-gray-600">{stats?.xp || 0} XP</div>
            </div>
          </button>
        </div>

        {/* XP Guide Modal */}
        {showGuide && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowGuide(false)}>
            <div className="bg-white border-3 border-ink rounded-xl shadow-retro-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b-2 border-ink flex justify-between items-center">
                <h2 className="text-2xl font-bold text-ink">🏆 XP & Badges Guide</h2>
                <button onClick={() => setShowGuide(false)} className="text-2xl hover:opacity-70">×</button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* How to Earn XP */}
                <div>
                  <h3 className="font-bold text-lg text-ink mb-3">How to Earn XP</h3>
                  <div className="space-y-2">
                    {XP_REWARDS.map((reward, i) => (
                      <div key={i} className="flex justify-between items-center bg-sakura-light rounded-lg p-3">
                        <span>{reward.action}</span>
                        <span className="font-bold text-plum">+{reward.xp} XP</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* All Badges */}
                <div>
                  <h3 className="font-bold text-lg text-ink mb-3">All Badges</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {LEVELS.map((level) => {
                      const isUnlocked = (stats?.xp || 0) >= level.xp
                      return (
                        <div 
                          key={level.level} 
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
                            isUnlocked ? "border-matcha bg-matcha/10" : "border-gray-200 opacity-60"
                          }`}
                        >
                          <img 
                            src={level.image} 
                            alt={level.title} 
                            className={`w-12 h-12 rounded-full ${!isUnlocked && "grayscale"}`}
                          />
                          <div>
                            <div className="font-medium text-ink">{level.title}</div>
                            <div className="text-xs text-gray-500">{level.xp.toLocaleString()} XP</div>
                          </div>
                          {isUnlocked && <span className="ml-auto text-matcha">✓</span>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Continue Learning */}
        {inProgress.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-ink mb-4">Continue Learning</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgress.filter(Boolean).map((course) => (
                <CourseCard key={course!._id} course={course!} progress={course!.progress} />
              ))}
            </div>
          </section>
        )}

        {/* Categories */}
        <section>
          <div className="flex gap-2 flex-wrap mb-6">
            <button className="px-4 py-2 bg-sakura-pink text-ink font-medium rounded-full border-2 border-ink shadow-retro-sm">
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                className="px-4 py-2 bg-white text-ink font-medium rounded-full border-2 border-ink hover:bg-sakura-light transition-colors"
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* All Courses */}
        <section>
          <h2 className="text-xl font-semibold text-ink mb-4">Explore Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const progress = userProgress?.all?.find(p => p.courseId === course._id)
              return (
                <CourseCard 
                  key={course._id} 
                  course={course} 
                  progress={progress?.percentage}
                />
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}

function CourseCard({ 
  course, 
  progress 
}: { 
  course: {
    _id: string
    slug: string
    title: string
    description: string
    category: string
    estimatedMinutes: number
    chapterCount: number
    enrollmentCount: number
    coverImage?: string
  }
  progress?: number 
}) {
  const categoryIcons: Record<string, string> = {
    fundamentals: "🌱",
    brewing: "🏭",
    tasting: "👅",
    pairing: "🍽️",
    regions: "🗾",
    "wine-bridge": "🍷",
  }

  return (
    <Link href={`/learn/${course.slug}`}>
      <div className="bg-white border-3 border-ink rounded-xl shadow-retro hover:shadow-retro-lg hover:-translate-y-1 transition-all cursor-pointer overflow-hidden">
        {/* Cover */}
        {course.coverImage ? (
          <div className="h-40 overflow-hidden">
            <img 
              src={course.coverImage} 
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-32 bg-gradient-to-br from-sakura-pink to-sakura-light flex items-center justify-center">
            <span className="text-5xl">{categoryIcons[course.category] || "📚"}</span>
          </div>
        )}
        
        {/* Content */}
        <div className="p-4 space-y-3">
          <span className="inline-block px-2 py-1 bg-sakura-light text-xs font-medium rounded-full border border-ink">
            {course.category.toUpperCase()}
          </span>
          
          <h3 className="font-bold text-lg text-ink">{course.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>📖 {course.chapterCount} chapters</span>
            <span>⏱️ {course.estimatedMinutes} min</span>
          </div>

          {/* Progress bar */}
          {progress !== undefined && progress > 0 && (
            <div className="space-y-1">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-matcha rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{progress}% complete</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
