import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User Management
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
    level: v.number(),
    xp: v.number(),
    streak: v.number(),
    lastActive: v.number(),
    preferences: v.object({
      wineProfile: v.optional(v.array(v.string())), // ["Pinot Noir", "Burgundy", "Elegant"]
      tastePreferences: v.object({
        sweetness: v.number(), // 1-5 scale
        acidity: v.number(),
        richness: v.number(),
        umami: v.number(),
      }),
      temperaturePreference: v.string(), // "cold", "room", "warm"
      spiceLevel: v.string(), // "mild", "medium", "bold"
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  // Tippsy Sake Products (simplified for import)
  tippsyProducts: defineTable({
    productName: v.string(),
    price: v.number(),
    size: v.string(),
    description: v.string(),
    brand: v.string(),
    brewery: v.string(),
    category: v.string(),
    subcategory: v.optional(v.string()),
    tasteProfile: v.string(),
    riceVariety: v.optional(v.string()),
    yeastVariety: v.optional(v.string()),
    alcohol: v.number(),
    rpr: v.optional(v.number()),
    smv: v.optional(v.number()),
    acidity: v.optional(v.number()),
    servingTemperature: v.string(),
    region: v.string(),
    prefecture: v.string(),
    tastingNotes: v.array(v.string()),
    foodPairings: v.array(v.string()),
    images: v.array(v.string()),
    reviewCount: v.number(),
    averageRating: v.number(),
    url: v.string(),
    createdAt: v.number(),
    // Vector search fields
    embedding: v.optional(v.array(v.float64())),
    searchText: v.optional(v.string()),
  })
    .index("by_category", ["category"])
    .index("by_brewery", ["brewery"])
    .index("by_prefecture", ["prefecture"])
    .index("by_price", ["price"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["category", "price", "prefecture"]
    }),
  sake: defineTable({
    name: v.string(),
    nameJapanese: v.optional(v.string()),
    brewery: v.id("breweries"),
    region: v.id("regions"),
    type: v.string(), // "Junmai", "Ginjo", "Daiginjo", etc.
    subtype: v.optional(v.string()), // "Yamahai", "Kimoto", "Nigori", etc.
    rice: v.optional(v.string()), // "Yamada Nishiki", etc.
    polishRatio: v.optional(v.number()), // 23, 50, etc.
    abv: v.optional(v.number()),
    price: v.optional(v.number()),
    volume: v.optional(v.number()), // ml
    description: v.optional(v.string()),
    tasteProfile: v.object({
      sweetness: v.number(), // 1-5 scale
      acidity: v.number(),
      richness: v.number(),
      umami: v.number(),
      body: v.string(), // "light", "medium", "full"
      finish: v.string(), // "short", "medium", "long"
    }),
    servingTemperature: v.object({
      min: v.number(), // Celsius
      max: v.number(),
      optimal: v.number(),
      style: v.string(), // "Yuki-bie", "Hana-bie", etc.
    }),
    foodPairings: v.array(v.string()),
    tags: v.array(v.string()), // ["Fruity", "Elegant", "Bold"]
    imageUrl: v.optional(v.string()),
    tippsy: v.optional(v.object({
      id: v.string(),
      url: v.string(),
      inStock: v.boolean(),
      lastUpdated: v.number(),
    })),
    ratings: v.object({
      average: v.number(),
      count: v.number(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_brewery", ["brewery"])
    .index("by_region", ["region"])
    .index("by_type", ["type"])
    .index("by_price", ["price"]),

  // Breweries
  breweries: defineTable({
    name: v.string(),
    nameJapanese: v.optional(v.string()),
    region: v.id("regions"),
    established: v.optional(v.number()),
    description: v.optional(v.string()),
    specialties: v.array(v.string()), // Types they're known for
    philosophy: v.optional(v.string()),
    website: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    location: v.object({
      prefecture: v.string(),
      city: v.optional(v.string()),
      coordinates: v.optional(v.object({
        lat: v.number(),
        lng: v.number(),
      })),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_region", ["region"])
    .index("by_prefecture", ["location.prefecture"]),

  // Regions (Prefectures)
  regions: defineTable({
    name: v.string(),
    nameJapanese: v.string(),
    prefecture: v.string(),
    characteristics: v.object({
      climate: v.string(),
      water: v.string(),
      rice: v.array(v.string()),
      style: v.string(), // "Tanrei Karakuchi", etc.
    }),
    description: v.string(),
    mapData: v.object({
      coordinates: v.object({
        lat: v.number(),
        lng: v.number(),
      }),
      bounds: v.object({
        north: v.number(),
        south: v.number(),
        east: v.number(),
        west: v.number(),
      }),
    }),
    breweryCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_prefecture", ["prefecture"]),

  // Learning System
  courses: defineTable({
    title: v.string(),
    description: v.string(),
    level: v.string(), // "Beginner", "Intermediate", "Advanced"
    icon: v.string(),
    color: v.string(),
    prerequisites: v.array(v.id("courses")),
    lessons: v.array(v.object({
      id: v.string(),
      title: v.string(),
      description: v.string(),
      content: v.string(),
      quiz: v.optional(v.array(v.object({
        question: v.string(),
        options: v.array(v.string()),
        correct: v.number(),
        explanation: v.string(),
      }))),
      xpReward: v.number(),
    })),
    totalXp: v.number(),
    estimatedTime: v.number(), // minutes
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // User Progress
  userProgress: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    completedLessons: v.array(v.string()),
    currentLesson: v.optional(v.string()),
    progress: v.number(), // 0-100
    xpEarned: v.number(),
    startedAt: v.number(),
    lastAccessedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_course", ["courseId"])
    .index("by_user_course", ["userId", "courseId"]),

  // Badges
  badges: defineTable({
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    color: v.string(),
    category: v.string(), // "Learning", "Discovery", "Regional", "Social"
    requirements: v.object({
      type: v.string(), // "course_complete", "sake_tried", "region_explored"
      target: v.union(v.string(), v.number()),
      count: v.optional(v.number()),
    }),
    rarity: v.string(), // "Common", "Rare", "Epic", "Legendary"
    xpReward: v.number(),
    createdAt: v.number(),
  }),

  // User Badges
  userBadges: defineTable({
    userId: v.id("users"),
    badgeId: v.id("badges"),
    earnedAt: v.number(),
    progress: v.optional(v.number()), // For progressive badges
  })
    .index("by_user", ["userId"])
    .index("by_badge", ["badgeId"]),

  // Podcasts
  podcasts: defineTable({
    title: v.string(),
    show: v.string(), // "Sake Stories", "Pairing Lab", etc.
    episode: v.number(),
    description: v.string(),
    duration: v.number(), // seconds
    audioUrl: v.string(),
    transcript: v.optional(v.string()),
    topics: v.array(v.string()),
    relatedSake: v.array(v.id("sake")),
    relatedRegions: v.array(v.id("regions")),
    generatedBy: v.object({
      model: v.string(),
      prompt: v.string(),
      sources: v.array(v.string()),
    }),
    publishedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_show", ["show"])
    .index("by_published", ["publishedAt"]),

  // Voice Sessions
  voiceSessions: defineTable({
    userId: v.id("users"),
    sessionId: v.string(),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    duration: v.optional(v.number()), // seconds
    messages: v.array(v.object({
      role: v.string(), // "user" | "assistant"
      content: v.string(),
      timestamp: v.number(),
      audioUrl: v.optional(v.string()),
    })),
    context: v.object({
      currentSake: v.optional(v.id("sake")),
      currentRegion: v.optional(v.id("regions")),
      userIntent: v.optional(v.string()),
      recommendations: v.array(v.id("sake")),
    }),
    dynamicComponents: v.array(v.object({
      type: v.string(),
      props: v.any(),
      timestamp: v.number(),
    })),
    satisfaction: v.optional(v.number()), // 1-5 rating
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_session", ["sessionId"]),

  // User Sake Interactions
  userSakeInteractions: defineTable({
    userId: v.id("users"),
    sakeId: v.id("sake"),
    interactionType: v.string(), // "viewed", "liked", "tried", "purchased", "rated"
    rating: v.optional(v.number()), // 1-5 stars
    notes: v.optional(v.string()),
    temperature: v.optional(v.number()),
    pairing: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_sake", ["sakeId"])
    .index("by_interaction", ["interactionType"]),

  // Regional Progress
  userRegionalProgress: defineTable({
    userId: v.id("users"),
    regionId: v.id("regions"),
    sakeTried: v.array(v.id("sake")),
    breweriesExplored: v.array(v.id("breweries")),
    progress: v.number(), // 0-100
    masteryLevel: v.string(), // "Novice", "Explorer", "Connoisseur", "Master"
    unlockedAt: v.number(),
    masteredAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_region", ["regionId"]),

  // Knowledge Chunks for RAG
  knowledgeChunks: defineTable({
    topic: v.string(),
    keywords: v.array(v.string()),
    content: v.string(),
    source: v.string(),
    category: v.string(), // "wine-to-sake", "brewing", "regions", etc.
    embedding: v.optional(v.array(v.float64())),
    createdAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_topic", ["topic"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["category"]
    }),
});
