import { mutation, query, internalMutation, internalQuery } from "./_generated/server"
import { v } from "convex/values"

// Internal query to get episode
export const getByIdInternal = internalQuery({
  args: { episodeId: v.id("podcastEpisodes") },
  handler: async (ctx, { episodeId }) => {
    return await ctx.db.get(episodeId)
  },
})

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

// Update audio
export const updateAudio = internalMutation({
  args: {
    episodeId: v.id("podcastEpisodes"),
    audio: v.object({
      storageId: v.id("_storage"),
      url: v.string(),
      duration: v.number(),
      format: v.string(),
      generatedAt: v.number(),
    }),
  },
  handler: async (ctx, { episodeId, audio }) => {
    await ctx.db.patch(episodeId, {
      audio,
      status: "review", // Ready for admin review
      updatedAt: Date.now(),
    })
  },
})

// Publish episode
export const publish = mutation({
  args: {
    episodeId: v.id("podcastEpisodes"),
  },
  handler: async (ctx, { episodeId }) => {
    await ctx.db.patch(episodeId, {
      status: "published",
      publishedAt: Date.now(),
      updatedAt: Date.now(),
    })
  },
})

// Unpublish episode
export const unpublish = mutation({
  args: {
    episodeId: v.id("podcastEpisodes"),
  },
  handler: async (ctx, { episodeId }) => {
    await ctx.db.patch(episodeId, {
      status: "review",
      publishedAt: undefined,
      updatedAt: Date.now(),
    })
  },
})

// Get published episodes for public view
export const listPublished = query({
  args: { 
    series: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { series, limit = 20 }) => {
    let q = ctx.db.query("podcastEpisodes")
      .filter(q => q.eq(q.field("status"), "published"))
    
    if (series) {
      q = q.filter(q => q.eq(q.field("series"), series))
    }
    
    return await q.order("desc").take(limit)
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

// Delete episode
export const deleteEpisode = mutation({
  args: { episodeId: v.id("podcastEpisodes") },
  handler: async (ctx, { episodeId }) => {
    const episode = await ctx.db.get(episodeId)
    if (episode?.audio?.storageId) {
      await ctx.storage.delete(episode.audio.storageId)
    }
    await ctx.db.delete(episodeId)
  },
})

// Cancel generation (sets status to cancelled)
export const cancelGeneration = mutation({
  args: { episodeId: v.id("podcastEpisodes") },
  handler: async (ctx, { episodeId }) => {
    const episode = await ctx.db.get(episodeId)
    if (episode && episode.status === "generating") {
      await ctx.db.patch(episodeId, {
        status: "cancelled",
        updatedAt: Date.now(),
      })
      return { success: true }
    }
    return { success: false, reason: "Episode not in generating state" }
  },
})

// Check if cancelled (for TTS to poll)
export const isCancelled = internalQuery({
  args: { episodeId: v.id("podcastEpisodes") },
  handler: async (ctx, { episodeId }) => {
    const episode = await ctx.db.get(episodeId)
    return episode?.status === "cancelled"
  },
})
