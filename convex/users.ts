import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create or update user from Clerk webhook
export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        avatar: args.avatar,
        updatedAt: Date.now(),
      });
      return existingUser._id;
    }

    // Create new user with default preferences
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      avatar: args.avatar,
      level: 1,
      xp: 0,
      streak: 0,
      lastActive: Date.now(),
      preferences: {
        tastePreferences: {
          sweetness: 3,
          acidity: 3,
          richness: 3,
          umami: 3,
        },
        temperaturePreference: "cold",
        spiceLevel: "mild",
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});

// Get user profile by Clerk ID
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

// Update user preferences
export const updateUserPreferences = mutation({
  args: {
    userId: v.id("users"),
    preferences: v.object({
      wineProfile: v.optional(v.array(v.string())),
      tastePreferences: v.object({
        sweetness: v.number(),
        acidity: v.number(),
        richness: v.number(),
        umami: v.number(),
      }),
      temperaturePreference: v.string(),
      spiceLevel: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      preferences: args.preferences,
      updatedAt: Date.now(),
    });
  },
});

// Update user activity (XP, level, streak)
export const updateUserActivity = mutation({
  args: {
    userId: v.id("users"),
    xpGained: v.number(),
    activity: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const newXp = user.xp + args.xpGained;
    const newLevel = Math.floor(newXp / 100) + 1; // 100 XP per level

    // Update streak logic
    const now = Date.now();
    const lastActive = user.lastActive;
    const daysSinceLastActive = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
    
    let newStreak = user.streak;
    if (daysSinceLastActive === 1) {
      newStreak += 1; // Continue streak
    } else if (daysSinceLastActive > 1) {
      newStreak = 1; // Reset streak
    }
    // If same day, keep current streak

    await ctx.db.patch(args.userId, {
      xp: newXp,
      level: newLevel,
      streak: newStreak,
      lastActive: now,
      updatedAt: now,
    });

    return { newXp, newLevel, newStreak };
  },
});

// Get user stats and progress
export const getUserStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    // Get user badges
    const badges = await ctx.db
      .query("userBadges")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get course progress
    const courseProgress = await ctx.db
      .query("userProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get regional progress
    const regionalProgress = await ctx.db
      .query("userRegionalProgress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Get sake interactions
    const sakeInteractions = await ctx.db
      .query("userSakeInteractions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const sakeTried = sakeInteractions.filter(i => i.interactionType === "tried").length;
    const sakeRated = sakeInteractions.filter(i => i.interactionType === "rated").length;

    return {
      user,
      stats: {
        badgeCount: badges.length,
        coursesCompleted: courseProgress.filter(c => c.progress === 100).length,
        coursesInProgress: courseProgress.filter(c => c.progress > 0 && c.progress < 100).length,
        regionsExplored: regionalProgress.length,
        regionsMastered: regionalProgress.filter(r => r.masteryLevel === "Master").length,
        sakeTried,
        sakeRated,
      },
    };
  },
});


// Save user preferences from onboarding
export const saveUserPreferences = mutation({
  args: {
    clerkId: v.string(),
    preferences: v.object({
      experienceLevel: v.string(),
      tastePreferences: v.object({
        sweetness: v.number(),
        richness: v.number(),
      }),
      foodPreferences: v.array(v.string()),
      winePreferences: v.array(v.string()),
      onboardingComplete: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (user) {
      await ctx.db.patch(user._id, {
        preferences: {
          ...user.preferences,
          experienceLevel: args.preferences.experienceLevel,
          tastePreferences: {
            ...user.preferences.tastePreferences,
            sweetness: args.preferences.tastePreferences.sweetness,
            richness: args.preferences.tastePreferences.richness,
          },
          foodPreferences: args.preferences.foodPreferences,
          winePreferences: args.preferences.winePreferences,
          onboardingComplete: args.preferences.onboardingComplete,
        },
        updatedAt: Date.now(),
      });
      return user._id;
    }

    // Create user if doesn't exist
    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: "",
      name: "",
      level: 1,
      xp: 0,
      streak: 0,
      lastActive: Date.now(),
      preferences: {
        experienceLevel: args.preferences.experienceLevel,
        tastePreferences: {
          sweetness: args.preferences.tastePreferences.sweetness,
          acidity: 3,
          richness: args.preferences.tastePreferences.richness,
          umami: 3,
        },
        foodPreferences: args.preferences.foodPreferences,
        winePreferences: args.preferences.winePreferences,
        temperaturePreference: "cold",
        spiceLevel: "mild",
        onboardingComplete: args.preferences.onboardingComplete,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get user preferences
export const getUserPreferences = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    return user?.preferences || null;
  },
});


// Upsert user from Clerk webhook
export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: `${args.firstName} ${args.lastName}`.trim() || args.email,
        avatar: args.imageUrl,
        updatedAt: Date.now(),
      });
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: `${args.firstName} ${args.lastName}`.trim() || args.email,
      avatar: args.imageUrl,
      level: 1,
      xp: 0,
      streak: 0,
      lastActive: Date.now(),
      preferences: {
        tastePreferences: {
          sweetness: 3,
          acidity: 3,
          richness: 3,
          umami: 3,
        },
        temperaturePreference: "cold",
        spiceLevel: "mild",
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Delete user from Clerk webhook
export const deleteUser = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    
    if (user) {
      await ctx.db.delete(user._id);
    }
  },
});
