"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"

export default function LearnContent() {
  const { user } = useUser()
  const courses = useQuery(api.learn.courses.listPublishedCourses, {})
  const categories = useQuery(api.learn.courses.getCategories)
  const userProgress = useQuery(
    api.learn.progress.getUserCourseList,
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
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-ink flex items-center gap-3">
            🍶 Learn Sake
          </h1>
          <p className="text-gray-600 mt-2">
            Master the art of sake with guided courses
          </p>
        </div>

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
        <div className="h-32 bg-gradient-to-br from-sakura-pink to-sakura-light flex items-center justify-center">
          <span className="text-5xl">{categoryIcons[course.category] || "📚"}</span>
        </div>
        
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
