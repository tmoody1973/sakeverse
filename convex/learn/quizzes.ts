import { query, mutation } from "../_generated/server"
import { v } from "convex/values"

export const getQuiz = query({
  args: { quizId: v.id("quizzes") },
  handler: async (ctx, { quizId }) => {
    const quiz = await ctx.db.get(quizId)
    if (!quiz) return null
    
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_quiz", (q) => q.eq("quizId", quizId))
      .collect()
    
    // Sort by order
    questions.sort((a, b) => a.order - b.order)
    
    return { ...quiz, questions }
  },
})

export const getChapterQuiz = query({
  args: { chapterId: v.id("chapters") },
  handler: async (ctx, { chapterId }) => {
    const quiz = await ctx.db
      .query("quizzes")
      .withIndex("by_chapter", (q) => q.eq("chapterId", chapterId))
      .first()
    
    if (!quiz) return null
    
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_quiz", (q) => q.eq("quizId", quiz._id))
      .collect()
    
    questions.sort((a, b) => a.order - b.order)
    
    return { ...quiz, questions }
  },
})

export const submitQuizAttempt = mutation({
  args: {
    clerkId: v.string(),
    quizId: v.id("quizzes"),
    answers: v.array(v.object({
      questionId: v.id("questions"),
      selectedAnswers: v.array(v.string()),
    })),
  },
  handler: async (ctx, { clerkId, quizId, answers }) => {
    const quiz = await ctx.db.get(quizId)
    if (!quiz) throw new Error("Quiz not found")
    
    // Get questions to check answers
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_quiz", (q) => q.eq("quizId", quizId))
      .collect()
    
    // Calculate score
    let score = 0
    let maxScore = 0
    const gradedAnswers = answers.map(answer => {
      const question = questions.find(q => q._id === answer.questionId)
      if (!question) return { ...answer, isCorrect: false }
      
      maxScore += question.points
      const isCorrect = 
        answer.selectedAnswers.length === question.correctAnswers.length &&
        answer.selectedAnswers.every(a => question.correctAnswers.includes(a))
      
      if (isCorrect) score += question.points
      
      return { ...answer, isCorrect }
    })
    
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
    const passed = percentage >= quiz.passingScore
    
    // Count previous attempts
    const previousAttempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user_quiz", (q) => q.eq("clerkId", clerkId).eq("quizId", quizId))
      .collect()
    
    // Save attempt
    await ctx.db.insert("quizAttempts", {
      clerkId,
      quizId,
      courseId: quiz.courseId,
      score,
      maxScore,
      percentage,
      passed,
      answers: gradedAnswers,
      attemptNumber: previousAttempts.length + 1,
      completedAt: Date.now(),
    })
    
    // If passed, update user progress
    if (passed) {
      const progress = await ctx.db
        .query("userCourseProgress")
        .withIndex("by_user_course", (q) => 
          q.eq("clerkId", clerkId).eq("courseId", quiz.courseId)
        )
        .first()
      
      if (progress && !progress.passedQuizIds.includes(quizId)) {
        await ctx.db.patch(progress._id, {
          passedQuizIds: [...progress.passedQuizIds, quizId],
          updatedAt: Date.now(),
        })
        
        // Check if course is now complete (all quizzes passed including final)
        const allQuizzes = await ctx.db
          .query("quizzes")
          .withIndex("by_course", (q) => q.eq("courseId", quiz.courseId))
          .collect()
        
        const newPassedIds = [...progress.passedQuizIds, quizId]
        const allPassed = allQuizzes.every(q => newPassedIds.includes(q._id))
        
        if (allPassed) {
          await ctx.db.patch(progress._id, {
            status: "completed",
            completedAt: Date.now(),
          })
          
          // Increment course completion count
          const course = await ctx.db.get(quiz.courseId)
          if (course) {
            await ctx.db.patch(quiz.courseId, {
              completionCount: course.completionCount + 1,
            })
          }
        }
      }
    }
    
    // Award XP if passed (first time only)
    let xpEarned = 0
    if (passed && previousAttempts.filter(a => a.passed).length === 0) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
        .first()
      
      if (user) {
        xpEarned = percentage === 100 ? 100 : 50 // Bonus for perfect score
        const newXP = user.xp + xpEarned
        const newLevel = newXP >= 10000 ? 10 : newXP >= 6000 ? 9 : newXP >= 4000 ? 8 : 
                         newXP >= 2500 ? 7 : newXP >= 1500 ? 6 : newXP >= 1000 ? 5 :
                         newXP >= 600 ? 4 : newXP >= 300 ? 3 : newXP >= 100 ? 2 : 1
        await ctx.db.patch(user._id, {
          xp: newXP,
          level: newLevel,
          updatedAt: Date.now(),
        })
      }
    }
    
    return {
      score,
      maxScore,
      percentage,
      passed,
      answers: gradedAnswers,
      xpEarned,
    }
  },
})

// Admin: Create quiz
export const createQuiz = mutation({
  args: {
    courseId: v.id("courses"),
    chapterId: v.optional(v.id("chapters")),
    type: v.union(v.literal("chapter_review"), v.literal("course_final")),
    title: v.string(),
    passingScore: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("quizzes", {
      ...args,
      createdAt: Date.now(),
    })
  },
})

// Admin: Create question
export const createQuestion = mutation({
  args: {
    quizId: v.id("quizzes"),
    order: v.number(),
    type: v.union(v.literal("multiple_choice"), v.literal("true_false")),
    question: v.string(),
    options: v.array(v.object({
      id: v.string(),
      text: v.string(),
    })),
    correctAnswers: v.array(v.string()),
    explanation: v.string(),
    points: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("questions", {
      ...args,
      createdAt: Date.now(),
    })
  },
})
