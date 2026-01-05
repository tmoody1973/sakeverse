import { query, mutation } from "../_generated/server"
import { v } from "convex/values"

export const listPublishedCourses = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { category, search, limit = 20 }) => {
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect()
    
    let filtered = courses
    if (category && category !== "all") {
      filtered = filtered.filter(c => c.category === category)
    }
    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(s) ||
        c.description.toLowerCase().includes(s)
      )
    }
    
    return filtered.slice(0, limit)
  },
})

export const getCourseBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first()
  },
})

export const getCourseWithChapters = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const course = await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first()
    
    if (!course) return null
    
    const chapters = await ctx.db
      .query("chapters")
      .withIndex("by_course", (q) => q.eq("courseId", course._id))
      .collect()
    
    // Sort by order
    chapters.sort((a, b) => a.order - b.order)
    
    return { ...course, chapters }
  },
})

export const getCourseChapters = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, { courseId }) => {
    const chapters = await ctx.db
      .query("chapters")
      .withIndex("by_course", (q) => q.eq("courseId", courseId))
      .collect()
    return chapters.sort((a, b) => a.order - b.order)
  },
})

export const getChapter = query({
  args: { 
    courseSlug: v.string(),
    chapterOrder: v.number()
  },
  handler: async (ctx, { courseSlug, chapterOrder }) => {
    const course = await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", courseSlug))
      .first()
    
    if (!course) return null
    
    const chapter = await ctx.db
      .query("chapters")
      .withIndex("by_course_order", (q) => 
        q.eq("courseId", course._id).eq("order", chapterOrder)
      )
      .first()
    
    if (!chapter) return null
    
    // Get total chapters for navigation
    const totalChapters = await ctx.db
      .query("chapters")
      .withIndex("by_course", (q) => q.eq("courseId", course._id))
      .collect()
    
    return {
      ...chapter,
      course,
      totalChapters: totalChapters.length,
      hasNext: chapterOrder < totalChapters.length,
      hasPrev: chapterOrder > 1
    }
  },
})

export const getCategories = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("learnCategories")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect()
  },
})

// Admin: Create course
export const createCourse = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    category: v.string(),
    estimatedMinutes: v.number(),
    learningOutcomes: v.array(v.string()),
    generatedBy: v.union(v.literal("ai"), v.literal("manual")),
    aiPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("courses", {
      ...args,
      tags: [],
      chapterCount: 0,
      status: "published",
      publishedAt: Date.now(),
      enrollmentCount: 0,
      completionCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  },
})

// Admin: Publish course
export const publishCourse = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, { courseId }) => {
    await ctx.db.patch(courseId, {
      status: "published",
      publishedAt: Date.now(),
      updatedAt: Date.now(),
    })
  },
})

// Admin: Create chapter
export const createChapter = mutation({
  args: {
    courseId: v.id("courses"),
    order: v.number(),
    title: v.string(),
    description: v.optional(v.string()),
    contentBlocks: v.array(v.object({
      id: v.string(),
      type: v.string(),
      content: v.any(),
    })),
    learningObjectives: v.array(v.string()),
    keyTerms: v.array(v.object({
      term: v.string(),
      pronunciation: v.optional(v.string()),
      definition: v.string(),
    })),
    estimatedMinutes: v.number(),
  },
  handler: async (ctx, args) => {
    const chapterId = await ctx.db.insert("chapters", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    
    // Update course chapter count
    const course = await ctx.db.get(args.courseId)
    if (course) {
      await ctx.db.patch(args.courseId, {
        chapterCount: course.chapterCount + 1,
        updatedAt: Date.now(),
      })
    }
    
    return chapterId
  },
})

// Update chapter count after generation
export const updateChapterCount = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, { courseId }) => {
    const chapters = await ctx.db
      .query("chapters")
      .withIndex("by_course", (q) => q.eq("courseId", courseId))
      .collect()
    
    await ctx.db.patch(courseId, {
      chapterCount: chapters.length,
      updatedAt: Date.now(),
    })
  },
})


// Publish all draft courses (admin utility)
export const publishAllDrafts = mutation({
  handler: async (ctx) => {
    const drafts = await ctx.db
      .query("courses")
      .filter((q) => q.eq(q.field("status"), "draft"))
      .collect()
    
    for (const course of drafts) {
      await ctx.db.patch(course._id, {
        status: "published",
        publishedAt: Date.now(),
      })
    }
    return { published: drafts.length }
  },
})
