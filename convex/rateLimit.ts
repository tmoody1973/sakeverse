import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Rate limit configuration
const RATE_LIMITS = {
  voice: {
    maxRequests: 20, // 20 voice requests per hour
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  text: {
    maxRequests: 50, // 50 text messages per hour
    windowMs: 60 * 60 * 1000, // 1 hour
  },
};

export const checkRateLimit = mutation({
  args: {
    userId: v.string(),
    type: v.union(v.literal("voice"), v.literal("text")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const config = RATE_LIMITS[args.type];
    
    // Find existing rate limit record
    const existing = await ctx.db
      .query("rateLimits")
      .withIndex("by_user_type", (q) => 
        q.eq("userId", args.userId).eq("type", args.type)
      )
      .first();

    if (!existing) {
      // First request - create new record
      await ctx.db.insert("rateLimits", {
        userId: args.userId,
        type: args.type,
        count: 1,
        windowStart: now,
        lastRequest: now,
      });
      
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: now + config.windowMs,
      };
    }

    // Check if window has expired
    const windowExpired = now - existing.windowStart > config.windowMs;
    
    if (windowExpired) {
      // Reset window
      await ctx.db.patch(existing._id, {
        count: 1,
        windowStart: now,
        lastRequest: now,
      });
      
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: now + config.windowMs,
      };
    }

    // Check if limit exceeded
    if (existing.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: existing.windowStart + config.windowMs,
        message: `Rate limit exceeded. You can make ${config.maxRequests} ${args.type} requests per hour. Try again in ${Math.ceil((existing.windowStart + config.windowMs - now) / 60000)} minutes.`,
      };
    }

    // Increment count
    await ctx.db.patch(existing._id, {
      count: existing.count + 1,
      lastRequest: now,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - existing.count - 1,
      resetAt: existing.windowStart + config.windowMs,
    };
  },
});

export const getRateLimitStatus = query({
  args: {
    userId: v.string(),
    type: v.union(v.literal("voice"), v.literal("text")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const config = RATE_LIMITS[args.type];
    
    const existing = await ctx.db
      .query("rateLimits")
      .withIndex("by_user_type", (q) => 
        q.eq("userId", args.userId).eq("type", args.type)
      )
      .first();

    if (!existing) {
      return {
        remaining: config.maxRequests,
        resetAt: now + config.windowMs,
        isLimited: false,
      };
    }

    const windowExpired = now - existing.windowStart > config.windowMs;
    
    if (windowExpired) {
      return {
        remaining: config.maxRequests,
        resetAt: now + config.windowMs,
        isLimited: false,
      };
    }

    return {
      remaining: Math.max(0, config.maxRequests - existing.count),
      resetAt: existing.windowStart + config.windowMs,
      isLimited: existing.count >= config.maxRequests,
    };
  },
});

// Admin function to reset rate limits
export const resetRateLimit = mutation({
  args: {
    userId: v.string(),
    type: v.optional(v.union(v.literal("voice"), v.literal("text"))),
  },
  handler: async (ctx, args) => {
    if (args.type) {
      // Reset specific type
      const existing = await ctx.db
        .query("rateLimits")
        .withIndex("by_user_type", (q) => 
          q.eq("userId", args.userId).eq("type", args.type!)
        )
        .first();
      
      if (existing) {
        await ctx.db.delete(existing._id);
      }
    } else {
      // Reset all types for user
      const allRecords = await ctx.db.query("rateLimits").collect();
      const userRecords = allRecords.filter(r => r.userId === args.userId);
      
      for (const record of userRecords) {
        await ctx.db.delete(record._id);
      }
    }
    
    return { success: true };
  },
});
