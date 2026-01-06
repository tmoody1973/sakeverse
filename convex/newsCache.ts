import { internalMutation, internalQuery } from "./_generated/server"
import { v } from "convex/values"

// Get today's date as YYYY-MM-DD
function getTodayDate(): string {
  return new Date().toISOString().split("T")[0]
}

// Internal query to check cache
export const getCachedNews = internalQuery({
  args: {},
  handler: async (ctx) => {
    const today = getTodayDate()
    return await ctx.db
      .query("sakeNewsCache")
      .withIndex("by_date", (q) => q.eq("date", today))
      .first()
  },
})

// Internal mutation to save cache
export const saveCachedNews = internalMutation({
  args: {
    date: v.string(),
    headlines: v.array(v.object({
      title: v.string(),
      snippet: v.string(),
      emoji: v.string(),
      url: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("sakeNewsCache", {
      date: args.date,
      headlines: args.headlines,
      createdAt: Date.now(),
    })
  },
})
