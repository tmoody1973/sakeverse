# AI Podcast Network - Detailed Tasks

## Phase 1: Database Schema

### Task 1.1: CREATE convex/podcasts/schema-additions.ts

Add to `convex/schema.ts`:

```typescript
// Podcast Topics (imported from JSON)
podcastTopics: defineTable({
  topicId: v.string(),           // e.g., "ss-topic-001"
  series: v.string(),            // "sake_stories" | "pairing_lab" | "the_bridge" | "brewing_secrets"
  title: v.string(),
  subtitle: v.optional(v.string()),
  narrativeHook: v.string(),
  difficulty: v.string(),        // "beginner" | "intermediate" | "advanced"
  tier: v.number(),
  status: v.string(),            // "ready" | "draft" | "generated"
  
  // Series-specific metadata (flexible)
  metadata: v.any(),             // Brewery info, food info, wine anchor, etc.
  
  // Research configuration
  researchSeeds: v.object({
    keyThemes: v.array(v.string()),
    historicalPeriod: v.optional(v.string()),
    notableFigures: v.optional(v.array(v.string())),
  }),
  researchQueries: v.object({
    geminiRag: v.array(v.string()),
    perplexity: v.array(v.string()),
    firecrawlUrls: v.array(v.string()),
    tippsyQuery: v.optional(v.any()),
  }),
  
  // Connections
  connections: v.optional(v.object({
    learningModule: v.optional(v.string()),
    badge: v.optional(v.string()),
    relatedEpisodes: v.optional(v.array(v.string())),
  })),
  
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_topicId", ["topicId"])
  .index("by_series", ["series"])
  .index("by_status", ["status"])
  .index("by_series_tier", ["series", "tier"]),

// Podcast Episodes
podcastEpisodes: defineTable({
  topicId: v.string(),
  series: v.string(),
  episodeNumber: v.number(),
  
  // Content
  title: v.string(),
  subtitle: v.optional(v.string()),
  description: v.string(),
  
  // Research data
  research: v.optional(v.object({
    geminiResults: v.array(v.string()),
    perplexityResults: v.array(v.string()),
    firecrawlResults: v.array(v.string()),
    tippsyProducts: v.array(v.any()),
    aggregatedAt: v.number(),
  })),
  
  // Script
  script: v.optional(v.object({
    content: v.string(),
    wordCount: v.number(),
    estimatedDuration: v.number(),
    generatedAt: v.number(),
  })),
  
  // Audio
  audio: v.optional(v.object({
    storageId: v.id("_storage"),
    url: v.string(),
    duration: v.number(),
    format: v.string(),
    generatedAt: v.number(),
  })),
  
  // Blog post
  blogPost: v.optional(v.object({
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    content: v.string(),
    metaDescription: v.string(),
    keywords: v.array(v.string()),
    wordCount: v.number(),
    generatedAt: v.number(),
  })),
  
  // Product recommendations
  recommendedProducts: v.optional(v.array(v.object({
    productId: v.string(),
    name: v.string(),
    brewery: v.string(),
    type: v.string(),
    price: v.number(),
    imageUrl: v.string(),
    tippsyUrl: v.string(),
    recommendationType: v.string(),
    contextNote: v.string(),
    displayOrder: v.number(),
  }))),
  
  // Status workflow
  status: v.string(),  // "queued" | "researching" | "scripting" | "audio_generating" | "blog_generating" | "review" | "published"
  
  // Approval
  approvedBy: v.optional(v.string()),
  approvedAt: v.optional(v.number()),
  publishedAt: v.optional(v.number()),
  
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_topicId", ["topicId"])
  .index("by_series", ["series"])
  .index("by_status", ["status"])
  .index("by_series_episode", ["series", "episodeNumber"]),

// Generation Jobs (track async progress)
podcastGenerationJobs: defineTable({
  episodeId: v.id("podcastEpisodes"),
  status: v.string(),  // "pending" | "running" | "completed" | "failed"
  currentStep: v.string(),
  progress: v.number(),  // 0-100
  error: v.optional(v.string()),
  startedAt: v.number(),
  completedAt: v.optional(v.number()),
})
  .index("by_episode", ["episodeId"])
  .index("by_status", ["status"]),
```

**VALIDATE**: `npx convex dev --once`

---

## Phase 2: Topic Import

### Task 2.1: CREATE convex/podcasts/import.ts

```typescript
import { mutation, action } from "../_generated/server"
import { v } from "convex/values"

// Import topics from JSON data
export const importTopics = mutation({
  args: {
    series: v.string(),
    topics: v.array(v.any()),
  },
  handler: async (ctx, { series, topics }) => {
    const now = Date.now()
    
    for (const topic of topics) {
      // Check if already exists
      const existing = await ctx.db
        .query("podcastTopics")
        .withIndex("by_topicId", q => q.eq("topicId", topic.topic_id || topic.topicId))
        .first()
      
      if (existing) continue
      
      await ctx.db.insert("podcastTopics", {
        topicId: topic.topic_id || topic.topicId,
        series,
        title: topic.title,
        subtitle: topic.subtitle,
        narrativeHook: topic.narrativeHook,
        difficulty: topic.difficulty,
        tier: topic.tier,
        status: topic.status || "ready",
        metadata: topic.metadata || {
          brewery: topic.brewery,
          brand: topic.brand,
          prefecture: topic.prefecture,
          food: topic.food,
          foodCategory: topic.foodCategory,
          // ... other series-specific fields
        },
        researchSeeds: topic.researchSeeds,
        researchQueries: topic.researchQueries,
        connections: topic.connections,
        createdAt: now,
        updatedAt: now,
      })
    }
    
    return { imported: topics.length }
  },
})
```

### Task 2.2: CREATE scripts/import-podcast-topics.ts

```typescript
// Run with: npx ts-node scripts/import-podcast-topics.ts
import { ConvexHttpClient } from "convex/browser"
import { api } from "../convex/_generated/api"
import sakeStories from "../podcasts/sake-stories-topics-v2.json"
import pairingLab from "../podcasts/pairing-lab-topics-v2.json"
import theBridge from "../podcasts/the-bridge-topics.json"
import brewingSecrets from "../podcasts/brewing-secrets-topics.json"

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

async function importAll() {
  // Sake Stories
  const ssTopics = sakeStories.topic_categories.flatMap(cat => cat.topics)
  await client.mutation(api.podcasts.import.importTopics, {
    series: "sake_stories",
    topics: ssTopics,
  })
  console.log(`Imported ${ssTopics.length} Sake Stories topics`)
  
  // Pairing Lab
  const plTopics = pairingLab.topic_categories.flatMap(cat => cat.topics)
  await client.mutation(api.podcasts.import.importTopics, {
    series: "pairing_lab", 
    topics: plTopics,
  })
  console.log(`Imported ${plTopics.length} Pairing Lab topics`)
  
  // The Bridge
  await client.mutation(api.podcasts.import.importTopics, {
    series: "the_bridge",
    topics: theBridge.topics,
  })
  console.log(`Imported ${theBridge.topics.length} Bridge topics`)
  
  // Brewing Secrets
  await client.mutation(api.podcasts.import.importTopics, {
    series: "brewing_secrets",
    topics: brewingSecrets.topics,
  })
  console.log(`Imported ${brewingSecrets.topics.length} Brewing Secrets topics`)
}

importAll()
```

**VALIDATE**: `npx convex run podcasts/import:importTopics --args '{"series":"test","topics":[]}'`

---

## Phase 3: Research Pipeline

### Task 3.1: CREATE convex/podcasts/generation/researchInternal.ts

```typescript
// NOT "use node" - for internal queries/mutations
import { internalMutation, internalQuery } from "../../_generated/server"
import { v } from "convex/values"

export const getTopic = internalQuery({
  args: { topicId: v.string() },
  handler: async (ctx, { topicId }) => {
    return await ctx.db
      .query("podcastTopics")
      .withIndex("by_topicId", q => q.eq("topicId", topicId))
      .first()
  },
})

export const saveResearch = internalMutation({
  args: {
    episodeId: v.id("podcastEpisodes"),
    research: v.object({
      geminiResults: v.array(v.string()),
      perplexityResults: v.array(v.string()),
      firecrawlResults: v.array(v.string()),
      tippsyProducts: v.array(v.any()),
      aggregatedAt: v.number(),
    }),
  },
  handler: async (ctx, { episodeId, research }) => {
    await ctx.db.patch(episodeId, {
      research,
      status: "scripting",
      updatedAt: Date.now(),
    })
  },
})
```

### Task 3.2: CREATE convex/podcasts/generation/research.ts

```typescript
"use node"

import { action } from "../../_generated/server"
import { internal } from "../../_generated/api"
import { v } from "convex/values"

export const aggregateResearch = action({
  args: { 
    episodeId: v.id("podcastEpisodes"),
    topicId: v.string(),
  },
  handler: async (ctx, { episodeId, topicId }) => {
    const topic = await ctx.runQuery(internal.podcasts.generation.researchInternal.getTopic, { topicId })
    if (!topic) throw new Error("Topic not found")
    
    const results = {
      geminiResults: [] as string[],
      perplexityResults: [] as string[],
      firecrawlResults: [] as string[],
      tippsyProducts: [] as any[],
      aggregatedAt: Date.now(),
    }
    
    // 1. Gemini RAG queries
    for (const query of topic.researchQueries.geminiRag) {
      try {
        // TODO: Implement Gemini File Search
        // const result = await queryGeminiRAG(query)
        // results.geminiResults.push(result)
      } catch (e) {
        console.error("Gemini RAG error:", e)
      }
    }
    
    // 2. Perplexity queries
    const perplexityKey = process.env.PERPLEXITY_API_KEY
    if (perplexityKey) {
      for (const query of topic.researchQueries.perplexity) {
        try {
          const response = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${perplexityKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "sonar",
              messages: [{ role: "user", content: query }],
            }),
          })
          const data = await response.json()
          results.perplexityResults.push(data.choices?.[0]?.message?.content || "")
        } catch (e) {
          console.error("Perplexity error:", e)
        }
      }
    }
    
    // 3. Firecrawl (brewery websites)
    // TODO: Implement Firecrawl integration
    
    // 4. Tippsy products
    if (topic.researchQueries.tippsyQuery) {
      const products = await ctx.runQuery(internal.podcasts.generation.researchInternal.searchTippsyProducts, {
        query: topic.researchQueries.tippsyQuery,
      })
      results.tippsyProducts = products
    }
    
    // Save research
    await ctx.runMutation(internal.podcasts.generation.researchInternal.saveResearch, {
      episodeId,
      research: results,
    })
    
    return results
  },
})
```

**VALIDATE**: `npx convex dev --once`

---

## Phase 4: Script Generation

### Task 4.1: CREATE convex/podcasts/generation/script.ts

```typescript
"use node"

import { action } from "../../_generated/server"
import { internal } from "../../_generated/api"
import { v } from "convex/values"

const SERIES_PROMPTS = {
  sake_stories: `You are writing a podcast script for "Sake Stories" - a show about legendary sake breweries.
Tone: Warm, narrative, like a documentary
Format: 8-12 minute episode
Structure: Hook → History → Transformation → Tasting notes → Conclusion`,

  pairing_lab: `You are writing a podcast script for "Pairing Lab" - a show about sake and food pairings.
Tone: Playful, experimental, practical
Format: 6-10 minute episode
Structure: Hook → The Challenge → The Solution → Experiment → Listener Action`,

  the_bridge: `You are writing a podcast script for "The Bridge" - helping wine lovers discover sake.
Tone: Sophisticated, approachable, comparative
Format: 8-12 minute episode
Structure: Wine Anchor → Translation → Sake Destination → Tasting Journey`,

  brewing_secrets: `You are writing a podcast script for "Brewing Secrets" - technical sake education.
Tone: Educational, clear, detailed
Format: 10-15 minute episode
Structure: Concept Introduction → Science → Practical Impact → Tasting Examples`,
}

export const generateScript = action({
  args: {
    episodeId: v.id("podcastEpisodes"),
  },
  handler: async (ctx, { episodeId }) => {
    const episode = await ctx.runQuery(internal.podcasts.episodes.getEpisode, { episodeId })
    if (!episode) throw new Error("Episode not found")
    
    const topic = await ctx.runQuery(internal.podcasts.generation.researchInternal.getTopic, { 
      topicId: episode.topicId 
    })
    if (!topic) throw new Error("Topic not found")
    
    const systemPrompt = SERIES_PROMPTS[topic.series as keyof typeof SERIES_PROMPTS]
    
    const prompt = `
${systemPrompt}

TOPIC: ${topic.title}
SUBTITLE: ${topic.subtitle || ""}
NARRATIVE HOOK: ${topic.narrativeHook}

RESEARCH DATA:
${JSON.stringify(episode.research, null, 2)}

Write a complete podcast script. Include:
1. Natural conversational flow (single host)
2. Pronunciation guides for Japanese terms in parentheses
3. Pauses marked with [PAUSE]
4. Emphasis marked with *asterisks*
5. Product mentions woven naturally

Return ONLY the script text, no metadata.
`

    // TODO: Call Claude API
    const script = "Generated script placeholder..."
    
    await ctx.runMutation(internal.podcasts.episodes.saveScript, {
      episodeId,
      script: {
        content: script,
        wordCount: script.split(/\s+/).length,
        estimatedDuration: Math.ceil(script.split(/\s+/).length / 150), // ~150 wpm
        generatedAt: Date.now(),
      },
    })
    
    return { success: true }
  },
})
```

---

## Phase 5: Audio Generation

### Task 5.1: CREATE convex/podcasts/generation/audio.ts

```typescript
"use node"

import { action } from "../../_generated/server"
import { internal } from "../../_generated/api"
import { v } from "convex/values"

export const generateAudio = action({
  args: {
    episodeId: v.id("podcastEpisodes"),
  },
  handler: async (ctx, { episodeId }) => {
    const episode = await ctx.runQuery(internal.podcasts.episodes.getEpisode, { episodeId })
    if (!episode?.script) throw new Error("No script found")
    
    const geminiKey = process.env.GEMINI_API_KEY
    if (!geminiKey) throw new Error("GEMINI_API_KEY not configured")
    
    // Call Gemini TTS API
    // TODO: Implement actual Gemini TTS call
    // const audioBuffer = await generateTTS(episode.script.content)
    
    // Upload to Convex storage
    // const storageId = await ctx.storage.store(audioBuffer)
    // const url = await ctx.storage.getUrl(storageId)
    
    // Placeholder for now
    await ctx.runMutation(internal.podcasts.episodes.saveAudio, {
      episodeId,
      audio: {
        storageId: "placeholder" as any,
        url: "https://example.com/audio.mp3",
        duration: episode.script.estimatedDuration * 60,
        format: "mp3",
        generatedAt: Date.now(),
      },
    })
    
    return { success: true }
  },
})
```

---

## Phase 6-8: See ai-podcast-network-ui-tasks.md

Remaining tasks for blog generation, admin UI, and public pages are in the companion file.

---

## Quick Start Commands

```bash
# 1. Add schema changes
# Edit convex/schema.ts manually

# 2. Deploy schema
npx convex dev --once

# 3. Import topics
npx ts-node scripts/import-podcast-topics.ts

# 4. Verify import
npx convex run podcasts/topics:listBySeriesCount
```
