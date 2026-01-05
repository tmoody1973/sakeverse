"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useUser } from "@clerk/nextjs"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

export default function CourseContent() {
  const { slug } = useParams()
  const router = useRouter()
  const { user } = useUser()
  
  const course = useQuery(api.learn.courses.getCourseBySlug, { slug: slug as string })
  const chapters = useQuery(
    api.learn.courses.getCourseChapters,
    course ? { courseId: course._id } : "skip"
  )
  const progress = useQuery(
    api.learn.progress.getUserProgress,
    user?.id && course ? { clerkId: user.id, courseId: course._id } : "skip"
  )
  const quizStatus = useQuery(
    api.learn.progress.getCourseQuizStatus,
    user?.id && course ? { clerkId: user.id, courseId: course._id } : "skip"
  )
  
  const startCourse = useMutation(api.learn.progress.startCourse)

  if (!course) {
    return (
      <div className="min-h-screen bg-sakura-white p-6">
        <div className="max-w-4xl mx-auto animate-pulse space-y-6">
          <div className="h-8 bg-sakura-light rounded w-32" />
          <div className="h-48 bg-sakura-light rounded-xl" />
        </div>
      </div>
    )
  }

  const handleStart = async () => {
    if (!user?.id) {
      router.push("/sign-in")
      return
    }
    await startCourse({ clerkId: user.id, courseId: course._id })
    router.push(`/learn/${slug}/1`)
  }

  const progressPercent = progress 
    ? Math.round((progress.readChapterIds.length / (chapters?.length || 1)) * 100)
    : 0

  return (
    <div className="min-h-screen bg-sakura-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back link */}
        <Link href="/learn" className="text-plum hover:underline flex items-center gap-2">
          ← Back to Courses
        </Link>

        {/* Header */}
        <div className="bg-white border-3 border-ink rounded-xl shadow-retro p-6 space-y-4">
          <span className="inline-block px-3 py-1 bg-sakura-light text-sm font-medium rounded-full border border-ink">
            {course.category.toUpperCase()}
          </span>
          
          <h1 className="text-3xl font-bold text-ink">{course.title}</h1>
          {course.subtitle && (
            <p className="text-lg text-gray-600">{course.subtitle}</p>
          )}
          <p className="text-gray-600">{course.description}</p>
          
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span>📖 {course.chapterCount} chapters</span>
            <span>⏱️ {course.estimatedMinutes} min</span>
            <span>👥 {course.enrollmentCount} enrolled</span>
          </div>

          {/* Progress or Start */}
          {progress ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Your Progress</span>
                <span className="font-medium">{progressPercent}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-matcha rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <button
                onClick={() => router.push(`/learn/${slug}/1`)}
                className="mt-4 px-6 py-3 bg-sakura-pink text-ink font-bold rounded-lg border-2 border-ink shadow-retro hover:shadow-retro-lg hover:-translate-y-0.5 transition-all"
              >
                Continue Learning
              </button>
            </div>
          ) : (
            <button
              onClick={handleStart}
              className="px-6 py-3 bg-sakura-pink text-ink font-bold rounded-lg border-2 border-ink shadow-retro hover:shadow-retro-lg hover:-translate-y-0.5 transition-all"
            >
              Start Course
            </button>
          )}
        </div>

        {/* Learning Outcomes */}
        <div className="bg-white border-3 border-ink rounded-xl shadow-retro p-6">
          <h2 className="text-xl font-bold text-ink mb-4">What You&apos;ll Learn</h2>
          <ul className="space-y-2">
            {course.learningOutcomes.map((outcome, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-matcha">✓</span>
                <span className="text-gray-700">{outcome}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Chapter List */}
        <div className="bg-white border-3 border-ink rounded-xl shadow-retro overflow-hidden">
          <h2 className="text-xl font-bold text-ink p-6 border-b-2 border-ink">
            Course Outline
          </h2>
          <div className="divide-y-2 divide-ink">
            {chapters?.map((chapter) => {
              const isRead = progress?.readChapterIds.includes(chapter._id)
              const quizPassed = quizStatus?.chapterQuizzes.find(
                q => q.chapterId === chapter._id
              )?.passed

              return (
                <Link
                  key={chapter._id}
                  href={`/learn/${slug}/${chapter.order}`}
                  className="flex items-center justify-between p-4 hover:bg-sakura-light transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isRead ? "bg-matcha text-white" : "bg-gray-200 text-gray-600"
                    }`}>
                      {isRead ? "✓" : chapter.order}
                    </span>
                    <div>
                      <h3 className="font-medium text-ink">{chapter.title}</h3>
                      <p className="text-sm text-gray-500">{chapter.estimatedMinutes} min</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {quizPassed !== undefined && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        quizPassed 
                          ? "bg-matcha text-white" 
                          : "bg-gray-200 text-gray-600"
                      }`}>
                        {quizPassed ? "✓ Quiz" : "○ Quiz"}
                      </span>
                    )}
                    <span className="text-gray-400">→</span>
                  </div>
                </Link>
              )
            })}
            
            {/* Final Exam */}
            <div className={`flex items-center justify-between p-4 ${
              quizStatus?.canTakeFinalExam ? "hover:bg-sakura-light cursor-pointer" : "opacity-50"
            }`}>
              <div className="flex items-center gap-4">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  quizStatus?.finalExamPassed 
                    ? "bg-matcha text-white" 
                    : "bg-plum text-white"
                }`}>
                  🎓
                </span>
                <div>
                  <h3 className="font-medium text-ink">Final Exam</h3>
                  <p className="text-sm text-gray-500">
                    {quizStatus?.canTakeFinalExam 
                      ? "Test your knowledge" 
                      : "Pass all chapter quizzes first"}
                  </p>
                </div>
              </div>
              {quizStatus?.finalExamPassed && (
                <span className="text-xs px-2 py-1 rounded-full bg-matcha text-white">
                  ✓ Passed
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
