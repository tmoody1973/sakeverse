import { mutation, query, internalMutation } from "./_generated/server"
import { v } from "convex/values"

// Create a new episode
export const create = internalMutation({
  args: {
    topicId: v.string(),
    series: v.string(),
    title: v.string(),
    subtitle: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    // Get next episode number for series
    const existingEpisodes = await ctx.db
      .query("podcastEpisodes")
      .withIndex("by_series", q => q.eq("series", args.series))
      .collect()
    
    const episodeNumber = existingEpisodes.length + 1
    const now = Date.now()

    return await ctx.db.insert("podcastEpisodes", {
      topicId: args.topicId,
      series: args.series,
      episodeNumber,
      title: args.title,
      subtitle: args.subtitle,
      description: args.description,
      status: "generating",
      createdAt: now,
      updatedAt: now,
    })
  },
})

// Update research data
export const updateResearch = internalMutation({
  args: {
    episodeId: v.id("podcastEpisodes"),
    research: v.any(),
  },
  handler: async (ctx, { episodeId, research }) => {
    await ctx.db.patch(episodeId, {
      research,
      status: "scripting",
      updatedAt: Date.now(),
    })
  },
})

// Update script
export const updateScript = internalMutation({
  args: {
    episodeId: v.id("podcastEpisodes"),
    script: v.object({
      content: v.string(),
      wordCount: v.number(),
      estimatedDuration: v.number(),
      generatedAt: v.number(),
    }),
  },
  handler: async (ctx, { episodeId, script }) => {
    await ctx.db.patch(episodeId, {
      script,
      updatedAt: Date.now(),
    })
  },
})

// Update status
export const updateStatus = internalMutation({
  args: {
    episodeId: v.id("podcastEpisodes"),
    status: v.string(),
  },
  handler: async (ctx, { episodeId, status }) => {
    await ctx.db.patch(episodeId, {
      status,
      updatedAt: Date.now(),
    })
  },
})

// List recent episodes
export const listRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 10 }) => {
    return await ctx.db
      .query("podcastEpisodes")
      .order("desc")
      .take(limit)
  },
})

// Get episode by ID
export const getById = query({
  args: { episodeId: v.id("podcastEpisodes") },
  handler: async (ctx, { episodeId }) => {
    return await ctx.db.get(episodeId)
  },
})

// List by series
export const listBySeries = query({
  args: { series: v.string() },
  handler: async (ctx, { series }) => {
    return await ctx.db
      .query("podcastEpisodes")
      .withIndex("by_series", q => q.eq("series", series))
      .order("desc")
      .collect()
  },
})
