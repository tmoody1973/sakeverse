"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useUser } from "@clerk/nextjs"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Id } from "@/convex/_generated/dataModel"

export default function ChapterContent() {
  const { slug, chapter } = useParams()
  const { user } = useUser()
  const [showQuiz, setShowQuiz] = useState(false)
  
  const course = useQuery(api.learn.courses.getCourseBySlug, { slug: slug as string })
  const chapterData = useQuery(
    api.learn.courses.getChapter,
    { courseSlug: slug as string, chapterOrder: parseInt(chapter as string) }
  )
  const quiz = useQuery(
    api.learn.quizzes.getChapterQuiz,
    chapterData ? { chapterId: chapterData._id } : "skip"
  )
  
  const markRead = useMutation(api.learn.progress.markChapterRead)

  // Mark as read when reaching bottom
  useEffect(() => {
    if (!user?.id || !course || !chapterData) return
    
    const handleScroll = () => {
      const scrolled = window.scrollY + window.innerHeight
      const total = document.documentElement.scrollHeight
      if (scrolled >= total - 100) {
        markRead({ clerkId: user.id, courseId: course._id, chapterId: chapterData._id })
      }
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [user?.id, course, chapterData, markRead])

  if (!course || !chapterData) {
    return (
      <div className="min-h-screen bg-sakura-white p-6">
        <div className="max-w-3xl mx-auto animate-pulse space-y-6">
          <div className="h-8 bg-sakura-light rounded w-48" />
          <div className="h-96 bg-sakura-light rounded-xl" />
        </div>
      </div>
    )
  }

  const chapterNum = parseInt(chapter as string)
  const hasNext = chapterNum < course.chapterCount
  const hasPrev = chapterNum > 1

  return (
    <div className="min-h-screen bg-sakura-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b-2 border-ink z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href={`/learn/${slug}`} className="text-plum hover:underline">
            ← {course.title}
          </Link>
          <span className="text-sm text-gray-500">
            Chapter {chapterNum} of {course.chapterCount}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-ink">{chapterData.title}</h1>
          {chapterData.description && (
            <p className="text-gray-600 mt-2">{chapterData.description}</p>
          )}
        </div>

        {/* Learning Objectives */}
        {chapterData.learningObjectives.length > 0 && (
          <div className="bg-sakura-light border-2 border-ink rounded-xl p-4">
            <h3 className="font-bold text-ink mb-2">Learning Objectives</h3>
            <ul className="space-y-1 text-sm">
              {chapterData.learningObjectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-plum">•</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Content Blocks */}
        <div className="space-y-6">
          {chapterData.contentBlocks.map((block) => (
            <ContentBlock key={block.id} block={block} />
          ))}
        </div>

        {/* Key Terms */}
        {chapterData.keyTerms.length > 0 && (
          <div className="bg-white border-3 border-ink rounded-xl p-6 shadow-retro">
            <h3 className="font-bold text-ink mb-4">📝 Key Terms</h3>
            <div className="space-y-3">
              {chapterData.keyTerms.map((term, i) => (
                <div key={i} className="border-b border-gray-200 pb-3 last:border-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-ink">{term.term}</span>
                    {term.pronunciation && (
                      <span className="text-sm text-gray-500">({term.pronunciation})</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{term.definition}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quiz CTA */}
        {quiz && !showQuiz && (
          <div className="bg-plum text-white border-3 border-ink rounded-xl p-6 shadow-retro text-center">
            <h3 className="font-bold text-xl mb-2">Ready to test your knowledge?</h3>
            <p className="text-white/80 mb-4">Take the chapter quiz to check your understanding</p>
            <button
              onClick={() => setShowQuiz(true)}
              className="px-6 py-3 bg-white text-plum font-bold rounded-lg border-2 border-ink shadow-retro hover:shadow-retro-lg hover:-translate-y-0.5 transition-all"
            >
              Take Quiz
            </button>
          </div>
        )}

        {/* Quiz */}
        {showQuiz && quiz && (
          <QuizPlayer 
            quiz={quiz} 
            onComplete={() => setShowQuiz(false)}
          />
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-8 border-t-2 border-ink">
          {hasPrev ? (
            <Link
              href={`/learn/${slug}/${chapterNum - 1}`}
              className="px-4 py-2 bg-white text-ink font-medium rounded-lg border-2 border-ink hover:bg-sakura-light transition-colors"
            >
              ← Previous
            </Link>
          ) : <div />}
          
          {hasNext ? (
            <Link
              href={`/learn/${slug}/${chapterNum + 1}`}
              className="px-4 py-2 bg-sakura-pink text-ink font-medium rounded-lg border-2 border-ink shadow-retro hover:shadow-retro-lg transition-all"
            >
              Next Chapter →
            </Link>
          ) : (
            <Link
              href={`/learn/${slug}`}
              className="px-4 py-2 bg-matcha text-white font-medium rounded-lg border-2 border-ink shadow-retro hover:shadow-retro-lg transition-all"
            >
              Back to Course
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

function ContentBlock({ block }: { block: { id: string; type: string; content: unknown } }) {
  switch (block.type) {
    case "text":
      return <p className="text-gray-700 leading-relaxed whitespace-pre-line">{block.content as string}</p>
    
    case "heading":
      return <h2 className="text-2xl font-bold text-ink mt-8">{block.content as string}</h2>
    
    case "callout": {
      const data = typeof block.content === "string" ? JSON.parse(block.content) : block.content
      const variants: Record<string, string> = {
        tip: "bg-matcha/10 border-matcha",
        info: "bg-sake-mist border-plum",
        warning: "bg-sake-warm border-yuzu-500",
      }
      return (
        <div className={`p-4 rounded-xl border-2 ${variants[data.variant] || variants.info}`}>
          <p className="text-gray-700">{data.text}</p>
        </div>
      )
    }
    
    case "key_terms": {
      const terms = typeof block.content === "string" ? JSON.parse(block.content) : block.content
      return (
        <div className="bg-sakura-light rounded-xl p-4 space-y-2">
          {(terms as Array<{term: string; pronunciation?: string; definition: string}>).map((t, i) => (
            <div key={i}>
              <span className="font-bold">{t.term}</span>
              {t.pronunciation && <span className="text-gray-500 text-sm"> ({t.pronunciation})</span>}
              <span className="text-gray-600"> — {t.definition}</span>
            </div>
          ))}
        </div>
      )
    }
    
    case "wine_bridge": {
      const data = typeof block.content === "string" ? JSON.parse(block.content) : block.content
      return (
        <div className="bg-gradient-to-r from-plum/10 to-sakura-light border-2 border-plum rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🍷</span>
            <span className="font-bold text-plum">Wine Bridge</span>
          </div>
          <p className="text-gray-700">
            <span className="font-medium">{data.wine}</span> → <span className="font-medium">{data.sake}</span>
          </p>
          <p className="text-sm text-gray-600 mt-1">{data.reason}</p>
        </div>
      )
    }
    
    default:
      return <p className="text-gray-700">{String(block.content)}</p>
  }
}

function QuizPlayer({ 
  quiz, 
  onComplete 
}: { 
  quiz: { 
    _id: Id<"quizzes">
    title: string
    passingScore: number
    questions: Array<{
      _id: Id<"questions">
      question: string
      options: Array<{ id: string; text: string }>
      correctAnswers: string[]
      explanation: string
      points: number
    }>
  }
  onComplete: () => void
}) {
  const { user } = useUser()
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState<{ score: number; maxScore: number; passed: boolean } | null>(null)
  
  const submitQuiz = useMutation(api.learn.quizzes.submitQuizAttempt)

  const question = quiz.questions[currentQ]
  const selectedAnswers = answers[question._id] || []

  const handleSelect = (optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [question._id]: [optionId]
    }))
  }

  const handleSubmit = async () => {
    if (!user?.id) return
    
    const formattedAnswers = quiz.questions.map(q => ({
      questionId: q._id,
      selectedAnswers: answers[q._id] || []
    }))
    
    const res = await submitQuiz({
      clerkId: user.id,
      quizId: quiz._id,
      answers: formattedAnswers
    })
    
    setResult(res)
    setShowResult(true)
  }

  if (showResult && result) {
    return (
      <div className="bg-white border-3 border-ink rounded-xl p-6 shadow-retro text-center">
        <div className="text-6xl mb-4">
          {result.passed ? "🎉" : "📚"}
        </div>
        <h3 className="text-2xl font-bold text-ink mb-2">
          {result.passed ? "Quiz Passed!" : "Keep Learning!"}
        </h3>
        <p className="text-gray-600 mb-4">
          You scored {result.score}/{result.maxScore} ({Math.round((result.score/result.maxScore)*100)}%)
        </p>
        <p className="text-sm text-gray-500 mb-6">
          {result.passed 
            ? "Great job! You can move on to the next chapter." 
            : `You need ${quiz.passingScore}% to pass. Review the material and try again!`}
        </p>
        <button
          onClick={onComplete}
          className="px-6 py-3 bg-sakura-pink text-ink font-bold rounded-lg border-2 border-ink shadow-retro"
        >
          {result.passed ? "Continue" : "Review Chapter"}
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white border-3 border-ink rounded-xl shadow-retro overflow-hidden">
      {/* Progress */}
      <div className="bg-sakura-light px-6 py-3 border-b-2 border-ink">
        <div className="flex justify-between text-sm">
          <span className="font-medium">{quiz.title}</span>
          <span>Question {currentQ + 1} of {quiz.questions.length}</span>
        </div>
        <div className="h-2 bg-white rounded-full mt-2 overflow-hidden">
          <div 
            className="h-full bg-sakura-pink transition-all"
            style={{ width: `${((currentQ + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="p-6 space-y-4">
        <h3 className="text-lg font-bold text-ink">{question.question}</h3>
        
        <div className="space-y-2">
          {question.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedAnswers.includes(opt.id)
                  ? "border-sakura-pink bg-sakura-light"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {opt.text}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <button
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
            className="px-4 py-2 text-gray-600 disabled:opacity-50"
          >
            ← Back
          </button>
          
          {currentQ < quiz.questions.length - 1 ? (
            <button
              onClick={() => setCurrentQ(currentQ + 1)}
              disabled={selectedAnswers.length === 0}
              className="px-6 py-2 bg-sakura-pink text-ink font-medium rounded-lg border-2 border-ink disabled:opacity-50"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < quiz.questions.length}
              className="px-6 py-2 bg-matcha text-white font-medium rounded-lg border-2 border-ink disabled:opacity-50"
            >
              Submit Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
