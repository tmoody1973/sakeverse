import { query } from "./_generated/server"
import { v } from "convex/values"

// Normalize prefecture name (remove " Ken", " Fu", " prefecture" suffixes)
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
