import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

// XP rewards
const XP_REWARDS = {
  CHAPTER_READ: 25,
  QUIZ_PASSED: 50,
  QUIZ_PERFECT: 100,
  COURSE_COMPLETED: 200,
}

// Level thresholds
const LEVELS = [
  { level: 1, xp: 0, title: "Sake Curious" },
  { level: 2, xp: 100, title: "Sake Novice" },
  { level: 3, xp: 300, title: "Sake Student" },
  { level: 4, xp: 600, title: "Sake Enthusiast" },
  { level: 5, xp: 1000, title: "Sake Connoisseur" },
  { level: 6, xp: 1500, title: "Sake Expert" },
  { level: 7, xp: 2500, title: "Sake Master" },
  { level: 8, xp: 4000, title: "Sake Sensei" },
  { level: 9, xp: 6000, title: "Sake Legend" },
  { level: 10, xp: 10000, title: "Sake Grandmaster" },
]

function getLevelFromXP(xp: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) return LEVELS[i]
  }
  return LEVELS[0]
}

function getNextLevel(currentLevel: number) {
  return LEVELS.find(l => l.level === currentLevel + 1) || null
}

// Get user stats
export const getUserStats = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first()
    
    if (!user) return null
    
    const currentLevel = getLevelFromXP(user.xp)
    const nextLevel = getNextLevel(currentLevel.level)
    const xpToNext = nextLevel ? nextLevel.xp - user.xp : 0
    const progress = nextLevel 
      ? ((user.xp - currentLevel.xp) / (nextLevel.xp - currentLevel.xp)) * 100
      : 100
    
    return {
      xp: user.xp,
      level: currentLevel.level,
      title: currentLevel.title,
      nextLevel: nextLevel?.level || null,
      nextTitle: nextLevel?.title || null,
      xpToNext,
      progress: Math.round(progress),
      streak: user.streak,
    }
  },
})

// Award XP to user
export const awardXP = mutation({
  args: {
    clerkId: v.string(),
    amount: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, { clerkId, amount, reason }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first()
    
    if (!user) return { success: false, message: "User not found" }
    
    const newXP = user.xp + amount
    const oldLevel = getLevelFromXP(user.xp)
    const newLevel = getLevelFromXP(newXP)
    const leveledUp = newLevel.level > oldLevel.level
    
    await ctx.db.patch(user._id, {
      xp: newXP,
      level: newLevel.level,
      updatedAt: Date.now(),
    })
    
    return {
      success: true,
      xpAwarded: amount,
      reason,
      newXP,
      leveledUp,
      newLevel: leveledUp ? newLevel : null,
    }
  },
})

// Get XP rewards config (for display)
export const getXPRewards = query({
  handler: () => XP_REWARDS,
})

// Get all levels (for display)
export const getLevels = query({
  handler: () => LEVELS,
})


// Debug: List all users (admin only)
export const listAllUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect()
    return users.map(u => ({ 
      clerkId: u.clerkId, 
      email: u.email, 
      xp: u.xp, 
      level: u.level 
    }))
  },
})


// Fix levels for all users based on XP
export const fixAllLevels = mutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect()
    for (const user of users) {
      const xp = user.xp
      const level = xp >= 10000 ? 10 : xp >= 6000 ? 9 : xp >= 4000 ? 8 : 
                   xp >= 2500 ? 7 : xp >= 1500 ? 6 : xp >= 1000 ? 5 :
                   xp >= 600 ? 4 : xp >= 300 ? 3 : xp >= 100 ? 2 : 1
      if (user.level !== level) {
        await ctx.db.patch(user._id, { level })
      }
    }
    return { fixed: users.length }
  },
})
