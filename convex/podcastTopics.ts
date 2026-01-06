import { mutation, query, internalMutation } from "./_generated/server"
import { v } from "convex/values"

// Import topics from JSON data
export const importTopics = mutation({
  args: {
    series: v.string(),
    topics: v.array(v.any()),
  },
  handler: async (ctx, { series, topics }) => {
    const now = Date.now()
    let imported = 0
    
    for (const topic of topics) {
      const topicId = topic.topic_id || topic.topicId
      
      // Check if already exists
      const existing = await ctx.db
        .query("podcastTopics")
        .withIndex("by_topicId", q => q.eq("topicId", topicId))
        .first()
      
      if (existing) continue
      
      await ctx.db.insert("podcastTopics", {
        topicId,
        series,
        title: topic.title,
        subtitle: topic.subtitle || null,
        narrativeHook: topic.narrativeHook,
        difficulty: topic.difficulty || "beginner",
        tier: topic.tier || 1,
        status: topic.status || "ready",
        metadata: {
          // Sake Stories fields
          brewery: topic.brewery,
          brand: topic.brand,
          prefecture: topic.prefecture,
          prefectureCode: topic.prefectureCode,
          region: topic.region,
          keyThemes: topic.keyThemes,
          historicalPeriod: topic.historicalPeriod,
          notableFigures: topic.notableFigures,
          signatureProducts: topic.signatureProducts,
          tippsyProducts: topic.tippsyProducts,
          // Pairing Lab fields
          food: topic.food,
          foodCategory: topic.foodCategory,
          pairingChallenge: topic.pairingChallenge,
          sakeSolutionType: topic.sakeSolutionType,
          experimentSummary: topic.experimentSummary,
          listenerAction: topic.listenerAction,
          // The Bridge fields
          category: topic.category,
          wineAnchor: topic.metadata?.wineAnchor,
          sakeDestination: topic.metadata?.sakeDestination,
          evolutionPath: topic.evolutionPath,
          // Brewing Secrets fields
          coreConcept: topic.metadata?.coreConcept,
          certificationModule: topic.metadata?.certificationModule,
          certificationTerms: topic.metadata?.certificationTerms,
          learningObjectives: topic.learningObjectives,
          demonstrationBottles: topic.demonstrationBottles,
          certificationCorner: topic.certificationCorner,
        },
        researchSeeds: topic.researchSeeds || {
          keyThemes: topic.keyThemes || [],
          historicalPeriod: topic.historicalPeriod,
          notableFigures: topic.notableFigures,
        },
        researchQueries: {
          geminiRag: topic.researchQueries?.geminiRag || [],
          perplexity: topic.researchQueries?.perplexity || [],
          firecrawlUrls: topic.researchQueries?.firecrawlUrls || [],
          tippsyQuery: topic.researchQueries?.tippsyQuery || null,
        },
        connections: topic.connections,
        createdAt: now,
        updatedAt: now,
      })
      imported++
    }
    
    return { imported, total: topics.length }
  },
})

// List topics by series
export const listBySeries = query({
  args: { series: v.string() },
  handler: async (ctx, { series }) => {
    return await ctx.db
      .query("podcastTopics")
      .withIndex("by_series", q => q.eq("series", series))
      .collect()
  },
})

// Get topic counts per series
export const getSeriesCounts = query({
  args: {},
  handler: async (ctx) => {
    const allTopics = await ctx.db.query("podcastTopics").collect()
    
    const counts: Record<string, { total: number; ready: number; generated: number }> = {}
    
    for (const topic of allTopics) {
      if (!counts[topic.series]) {
        counts[topic.series] = { total: 0, ready: 0, generated: 0 }
      }
      counts[topic.series].total++
      if (topic.status === "ready") counts[topic.series].ready++
      if (topic.status === "generated") counts[topic.series].generated++
    }
    
    return counts
  },
})

// Get single topic
export const getByTopicId = query({
  args: { topicId: v.string() },
  handler: async (ctx, { topicId }) => {
    return await ctx.db
      .query("podcastTopics")
      .withIndex("by_topicId", q => q.eq("topicId", topicId))
      .first()
  },
})

// Update topic status (internal)
export const updateStatus = internalMutation({
  args: {
    topicId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, { topicId, status }) => {
    const topic = await ctx.db
      .query("podcastTopics")
      .withIndex("by_topicId", q => q.eq("topicId", topicId))
      .first()
    
    if (topic) {
      await ctx.db.patch(topic._id, {
        status,
        updatedAt: Date.now(),
      })
    }
  },
})
