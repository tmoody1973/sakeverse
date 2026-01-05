import { query, action, mutation } from "./_generated/server"
import { v } from "convex/values"
import { api } from "./_generated/api"

// Normalize prefecture name
function normalizePrefecture(name: string): string {
  return name
    .replace(/ Ken$/i, "")
    .replace(/ Fu$/i, "")
    .replace(/ To$/i, "")
    .replace(/ prefecture$/i, "")
    .trim()
}

// Prefecture data with brewery counts
export const getPrefectureStats = query({
  args: {},
  handler: async (ctx) => {
    const breweries = await ctx.db.query("sakeBreweries").collect()
    const products = await ctx.db.query("tippsyProducts").collect()
    
    const stats: Record<string, { breweryCount: number; productCount: number }> = {}
    
    for (const b of breweries) {
      const pref = normalizePrefecture(b.prefecture)
      if (!stats[pref]) stats[pref] = { breweryCount: 0, productCount: 0 }
      stats[pref].breweryCount++
    }
    
    for (const p of products) {
      const pref = normalizePrefecture(p.prefecture)
      if (!stats[pref]) stats[pref] = { breweryCount: 0, productCount: 0 }
      stats[pref].productCount++
    }
    
    return stats
  },
})

// Get breweries by normalized prefecture name
export const getBreweriesByPrefectureNormalized = query({
  args: { prefecture: v.string() },
  handler: async (ctx, { prefecture }) => {
    const all = await ctx.db.query("sakeBreweries").collect()
    const normalized = normalizePrefecture(prefecture)
    return all.filter(b => normalizePrefecture(b.prefecture) === normalized)
  },
})

// Get products by normalized prefecture name
export const getProductsByPrefecture = query({
  args: { prefecture: v.string() },
  handler: async (ctx, { prefecture }) => {
    const all = await ctx.db.query("tippsyProducts").collect()
    const normalized = normalizePrefecture(prefecture)
    return all.filter(p => normalizePrefecture(p.prefecture) === normalized).slice(0, 6)
  },
})

// Get cached prefecture description
export const getPrefectureDescription = query({
  args: { prefecture: v.string() },
  handler: async (ctx, { prefecture }) => {
    const normalized = normalizePrefecture(prefecture)
    return await ctx.db
      .query("prefectureDescriptions")
      .withIndex("by_prefecture", (q) => q.eq("prefecture", normalized))
      .first()
  },
})

// Store prefecture description
export const storePrefectureDescription = mutation({
  args: {
    prefecture: v.string(),
    overview: v.string(),
    sakeStyle: v.string(),
    famousBreweries: v.array(v.string()),
    keyCharacteristics: v.array(v.string()),
    recommendedSake: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const normalized = normalizePrefecture(args.prefecture)
    
    // Check if already exists
    const existing = await ctx.db
      .query("prefectureDescriptions")
      .withIndex("by_prefecture", (q) => q.eq("prefecture", normalized))
      .first()
    
    if (existing) {
      return existing._id
    }
    
    return await ctx.db.insert("prefectureDescriptions", {
      prefecture: normalized,
      overview: args.overview,
      sakeStyle: args.sakeStyle,
      famousBreweries: args.famousBreweries,
      keyCharacteristics: args.keyCharacteristics,
      recommendedSake: args.recommendedSake,
      createdAt: Date.now(),
    })
  },
})

// Generate prefecture description using Perplexity
export const generatePrefectureDescription = action({
  args: { prefecture: v.string() },
  handler: async (ctx, { prefecture }): Promise<{
    prefecture: string
    overview: string
    sakeStyle: string
    famousBreweries: string[]
    keyCharacteristics: string[]
    recommendedSake: string[]
    createdAt: number
  }> => {
    const normalized = normalizePrefecture(prefecture)
    
    // Check cache first
    const cached = await ctx.runQuery(api.map.getPrefectureDescription, { prefecture: normalized })
    if (cached) {
      return {
        prefecture: cached.prefecture,
        overview: cached.overview,
        sakeStyle: cached.sakeStyle,
        famousBreweries: cached.famousBreweries,
        keyCharacteristics: cached.keyCharacteristics,
        recommendedSake: cached.recommendedSake,
        createdAt: cached.createdAt,
      }
    }
    
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY
    if (!perplexityApiKey) {
      throw new Error("PERPLEXITY_API_KEY not configured")
    }
    
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${perplexityApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "system",
            content: `You are a sake expert. Respond ONLY with valid JSON, no markdown or extra text.`
          },
          {
            role: "user",
            content: `Tell me about ${normalized} prefecture in Japan and its sake breweries. Return JSON with this exact structure:
{
  "overview": "2-3 sentence overview of the prefecture's sake history and importance",
  "sakeStyle": "1-2 sentences describing the regional sake style",
  "famousBreweries": ["brewery1", "brewery2", "brewery3"],
  "keyCharacteristics": ["characteristic1", "characteristic2", "characteristic3"],
  "recommendedSake": ["sake1", "sake2", "sake3"]
}`
          }
        ],
        max_tokens: 600,
        temperature: 0.3,
      }),
    })
    
    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`)
    }
    
    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ""
    
    // Parse JSON from response
    let parsed
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content)
    } catch {
      // Fallback if parsing fails
      parsed = {
        overview: content.slice(0, 300),
        sakeStyle: "Traditional regional style",
        famousBreweries: [],
        keyCharacteristics: [],
        recommendedSake: [],
      }
    }
    
    // Store in cache
    await ctx.runMutation(api.map.storePrefectureDescription, {
      prefecture: normalized,
      overview: parsed.overview || "",
      sakeStyle: parsed.sakeStyle || "",
      famousBreweries: parsed.famousBreweries || [],
      keyCharacteristics: parsed.keyCharacteristics || [],
      recommendedSake: parsed.recommendedSake || [],
    })
    
    return {
      prefecture: normalized,
      ...parsed,
      createdAt: Date.now(),
    }
  },
})
