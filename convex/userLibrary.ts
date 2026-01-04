import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Save a sake to user's library
export const saveSake = mutation({
  args: {
    clerkId: v.optional(v.string()),
    sessionId: v.string(), // For anonymous users
    sake: v.object({
      name: v.string(),
      brewery: v.string(),
      price: v.number(),
      category: v.string(),
      region: v.string(),
      image: v.string(),
      url: v.string(),
      description: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userLibrary")
      .withIndex("by_session_sake", (q) => 
        q.eq("sessionId", args.sessionId).eq("sakeName", args.sake.name)
      )
      .first()
    
    if (existing) {
      return { success: false, message: "Already in library" }
    }

    await ctx.db.insert("userLibrary", {
      clerkId: args.clerkId,
      sessionId: args.sessionId,
      sakeName: args.sake.name,
      brewery: args.sake.brewery,
      price: args.sake.price,
      category: args.sake.category,
      region: args.sake.region,
      image: args.sake.image,
      url: args.sake.url,
      description: args.sake.description,
      savedAt: Date.now(),
    })

    return { success: true, message: `${args.sake.name} saved to library!` }
  },
})

// Remove sake from library
export const removeSake = mutation({
  args: {
    sessionId: v.string(),
    sakeName: v.string(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("userLibrary")
      .withIndex("by_session_sake", (q) => 
        q.eq("sessionId", args.sessionId).eq("sakeName", args.sakeName)
      )
      .first()
    
    if (item) {
      await ctx.db.delete(item._id)
      return { success: true, message: "Removed from library" }
    }
    return { success: false, message: "Not found in library" }
  },
})

// Get user's library
export const getLibrary = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("userLibrary")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .collect()
    
    return items
  },
})

// Check if sake is in library
export const isInLibrary = query({
  args: {
    sessionId: v.string(),
    sakeName: v.string(),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("userLibrary")
      .withIndex("by_session_sake", (q) => 
        q.eq("sessionId", args.sessionId).eq("sakeName", args.sakeName)
      )
      .first()
    
    return !!item
  },
})
