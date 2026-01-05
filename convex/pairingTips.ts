import { action, query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Get cached tips
export const getCachedTips = query({
  args: { dishId: v.string() },
  handler: async (ctx, { dishId }) => {
    const cached = await ctx.db
      .query("pairingTipsCache")
      .withIndex("by_dish", (q) => q.eq("dishId", dishId))
      .first();
    return cached?.tips || null;
  },
});

// Save tips to cache
export const saveTips = mutation({
  args: { dishId: v.string(), tips: v.string() },
  handler: async (ctx, { dishId, tips }) => {
    // Check if already exists
    const existing = await ctx.db
      .query("pairingTipsCache")
      .withIndex("by_dish", (q) => q.eq("dishId", dishId))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, { tips, createdAt: Date.now() });
    } else {
      await ctx.db.insert("pairingTipsCache", {
        dishId,
        tips,
        createdAt: Date.now(),
      });
    }
  },
});

// Get tips - check cache first, then fetch from Perplexity
export const getPairingTips = action({
  args: { 
    dishId: v.string(),
    dishName: v.string(),
    sakeType: v.string()
  },
  handler: async (ctx, { dishId, dishName, sakeType }): Promise<string> => {
    // Check cache first
    const cached: string | null = await ctx.runQuery(api.pairingTips.getCachedTips, { dishId });
    if (cached) {
      return cached;
    }

    // Fetch from Perplexity
    const result: { answer: string } = await ctx.runAction(api.perplexityAPI.searchWebContent, {
      query: `Japanese sake pairing tips: How to pair ${sakeType} sake with ${dishName}. What flavors complement each other?`,
      focus: "reviews"
    });

    // Cache the result if successful (and not an error response)
    if (result.answer && 
        !result.answer.includes("cannot provide") && 
        !result.answer.includes("couldn't access") &&
        !result.answer.includes("no data")) {
      await ctx.runMutation(api.pairingTips.saveTips, {
        dishId,
        tips: result.answer
      });
      return result.answer;
    }

    // Fallback response if Perplexity fails
    return `${sakeType} sake pairs wonderfully with ${dishName}. The umami and subtle sweetness of sake complements the dish's flavors, creating a harmonious balance.`;
  },
});


// Clear all cached tips (admin use)
export const clearAllTips = mutation({
  handler: async (ctx) => {
    const all = await ctx.db.query("pairingTipsCache").collect();
    for (const tip of all) {
      await ctx.db.delete(tip._id);
    }
    return { deleted: all.length };
  },
});
