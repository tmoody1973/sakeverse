import { query, mutation } from "../_generated/server"
import { v } from "convex/values"

export const getUserProgress = query({
  args: { 
    clerkId: v.string(),
    courseId: v.id("courses")
  },
  handler: async (ctx, { clerkId, courseId }) => {
    return await ctx.db
      .query("userCourseProgress")
      .withIndex("by_user_course", (q) => 
        q.eq("clerkId", clerkId).eq("courseId", courseId)
      )
      .first()
  },
})

export const getUserCourses = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const progress = await ctx.db
      .query("userCourseProgress")
      .withIndex("by_user", (q) => q.eq("clerkId", clerkId))
      .collect()
    
    // Get course details for each
    const coursesWithProgress = await Promise.all(
      progress.map(async (p) => {
        const course = await ctx.db.get(p.courseId)
        return { ...p, course }
      })
    )
    
    return {
      inProgress: coursesWithProgress.filter(c => c.status === "in_progress"),
      completed: coursesWithProgress.filter(c => c.status === "completed"),
    }
  },
})

export const startCourse = mutation({
  args: {
    clerkId: v.string(),
    courseId: v.id("courses"),
  },
  handler: async (ctx, { clerkId, courseId }) => {
    // Check if already started
    const existing = await ctx.db
      .query("userCourseProgress")
      .withIndex("by_user_course", (q) => 
        q.eq("clerkId", clerkId).eq("courseId", courseId)
      )
      .first()
    
    if (existing) return existing._id
    
    // Create new progress
    const progressId = await ctx.db.insert("userCourseProgress", {
      clerkId,
      courseId,
      status: "in_progress",
      readChapterIds: [],
      passedQuizIds: [],
      totalTimeSpent: 0,
      startedAt: Date.now(),
      completedAt: undefined,
      updatedAt: Date.now(),
    })
    
    // Increment enrollment count
    const course = await ctx.db.get(courseId)
    if (course) {
      await ctx.db.patch(courseId, {
        enrollmentCount: course.enrollmentCount + 1,
      })
    }
    
    return progressId
  },
})

export const markChapterRead = mutation({
  args: {
    clerkId: v.string(),
    courseId: v.id("courses"),
    chapterId: v.id("chapters"),
  },
  handler: async (ctx, { clerkId, courseId, chapterId }) => {
    const progress = await ctx.db
      .query("userCourseProgress")
      .withIndex("by_user_course", (q) => 
        q.eq("clerkId", clerkId).eq("courseId", courseId)
      )
      .first()
    
    if (!progress) return { success: false }
    
    // Add chapter if not already read
    if (!progress.readChapterIds.includes(chapterId)) {
      await ctx.db.patch(progress._id, {
        readChapterIds: [...progress.readChapterIds, chapterId],
        updatedAt: Date.now(),
      })
    }
    
    return { success: true, xpEarned: 10 }
  },
})

export const getProgressWithQuizStatus = query({
  args: {
    clerkId: v.string(),
    courseId: v.id("courses"),
  },
  handler: async (ctx, { clerkId, courseId }) => {
    const progress = await ctx.db
      .query("userCourseProgress")
      .withIndex("by_user_course", (q) => 
        q.eq("clerkId", clerkId).eq("courseId", courseId)
      )
      .first()
    
    // Get all quizzes for this course
    const quizzes = await ctx.db
      .query("quizzes")
      .withIndex("by_course", (q) => q.eq("courseId", courseId))
      .collect()
    
    const chapterQuizzes = quizzes.filter(q => q.type === "chapter_review")
    const finalExam = quizzes.find(q => q.type === "course_final")
    
    const passedQuizIds = progress?.passedQuizIds || []
    
    return {
      progress,
      chapterQuizzes: chapterQuizzes.map(q => ({
        ...q,
        passed: passedQuizIds.includes(q._id)
      })),
      finalExam: finalExam ? {
        ...finalExam,
        passed: passedQuizIds.includes(finalExam._id),
        unlocked: chapterQuizzes.every(q => passedQuizIds.includes(q._id))
      } : null,
    }
  },
})

export const getCourseQuizStatus = query({
  args: {
    clerkId: v.string(),
    courseId: v.id("courses"),
  },
  handler: async (ctx, { clerkId, courseId }) => {
    // Get all quizzes for this course
    const quizzes = await ctx.db
      .query("quizzes")
      .withIndex("by_course", (q) => q.eq("courseId", courseId))
      .collect()
    
    // Get user's passed quizzes
    const progress = await ctx.db
      .query("userCourseProgress")
      .withIndex("by_user_course", (q) => 
        q.eq("clerkId", clerkId).eq("courseId", courseId)
      )
      .first()
    
    const passedQuizIds = progress?.passedQuizIds || []
    
    // Separate chapter quizzes and final exam
    const chapterQuizzes = quizzes
      .filter(q => q.type === "chapter_review")
      .map(q => ({
        chapterId: q.chapterId!,
        passed: passedQuizIds.includes(q._id)
      }))
    
    const finalExam = quizzes.find(q => q.type === "course_final")
    const finalExamPassed = finalExam ? passedQuizIds.includes(finalExam._id) : false
    
    // Can take final exam if all chapter quizzes passed
    const allChapterQuizzesPassed = chapterQuizzes.every(q => q.passed)
    
    return {
      chapterQuizzes,
      finalExamPassed,
      canTakeFinalExam: allChapterQuizzesPassed,
    }
  },
})

export const getUserCourseList = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const progress = await ctx.db
      .query("userCourseProgress")
      .withIndex("by_user", (q) => q.eq("clerkId", clerkId))
      .collect()
    
    const inProgress = await Promise.all(
      progress
        .filter(p => p.status === "in_progress")
        .map(async (p) => {
          const course = await ctx.db.get(p.courseId)
          if (!course) return null
          const chapters = await ctx.db
            .query("chapters")
            .withIndex("by_course", (q) => q.eq("courseId", p.courseId))
            .collect()
          const percent = chapters.length > 0 
            ? Math.round((p.readChapterIds.length / chapters.length) * 100)
            : 0
          return { ...course, progress: percent }
        })
    )
    
    const all = await Promise.all(
      progress.map(async (p) => {
        const chapters = await ctx.db
          .query("chapters")
          .withIndex("by_course", (q) => q.eq("courseId", p.courseId))
          .collect()
        return {
          courseId: p.courseId,
          percentage: chapters.length > 0 
            ? Math.round((p.readChapterIds.length / chapters.length) * 100)
            : 0
        }
      })
    )
    
    return {
      inProgress: inProgress.filter(Boolean),
      all,
    }
  },
})
