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
    return cached ? { tips: cached.tips, imageUrl: cached.imageUrl } : null;
  },
});

// Save tips to cache
export const saveTips = mutation({
  args: { 
    dishId: v.string(), 
    tips: v.string(),
    imageUrl: v.optional(v.string())
  },
  handler: async (ctx, { dishId, tips, imageUrl }) => {
    const existing = await ctx.db
      .query("pairingTipsCache")
      .withIndex("by_dish", (q) => q.eq("dishId", dishId))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, { tips, imageUrl, createdAt: Date.now() });
    } else {
      await ctx.db.insert("pairingTipsCache", {
        dishId,
        tips,
        imageUrl,
        createdAt: Date.now(),
      });
    }
  },
});

// Get tips with image - check cache first, then fetch from Perplexity
export const getPairingTips = action({
  args: { 
    dishId: v.string(),
    dishName: v.string(),
    sakeType: v.string()
  },
  handler: async (ctx, { dishId, dishName, sakeType }): Promise<{ tips: string; imageUrl?: string }> => {
    // Check cache first
    const cached = await ctx.runQuery(api.pairingTips.getCachedTips, { dishId });
    if (cached) {
      return cached;
    }

    const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
    if (!perplexityApiKey) {
      return { tips: `${sakeType} sake pairs wonderfully with ${dishName}.` };
    }

    try {
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
              role: "user",
              content: `Write a detailed guide for pairing ${sakeType} sake with ${dishName}. Include:

## Why This Pairing Works
Explain the flavor science behind why ${sakeType} complements ${dishName}.

## Tasting Notes
Describe the specific flavors in both the sake and dish that harmonize.

## Serving Suggestions
- Ideal sake temperature
- Portion recommendations
- Timing tips

## Pro Tips
Share 2-3 expert tips for maximizing this pairing experience.`
            }
          ],
          max_tokens: 1500,
          temperature: 0.3,
          return_images: true
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Perplexity error:", response.status, errorText);
        throw new Error(`Perplexity API error: ${response.status}`);
      }

      const result = await response.json();
      
      const tips = result.choices?.[0]?.message?.content || `${sakeType} pairs well with ${dishName}.`;
      
      // Extract image URL - Perplexity uses "image_url" not "url"
      let imageUrl: string | undefined;
      if (result.images && result.images.length > 0) {
        imageUrl = result.images[0].image_url || result.images[0].url || result.images[0];
      }

      // Cache the result
      if (tips && !tips.includes("cannot provide")) {
        await ctx.runMutation(api.pairingTips.saveTips, { dishId, tips, imageUrl });
      }

      return { tips, imageUrl };
    } catch (error) {
      return { tips: `${sakeType} sake pairs wonderfully with ${dishName}. The umami and subtle sweetness of sake complements the dish's flavors.` };
    }
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
