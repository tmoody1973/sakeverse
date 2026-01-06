import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Cached pairing tips from Perplexity
  pairingTipsCache: defineTable({
    dishId: v.string(),
    tips: v.string(),
    createdAt: v.number(),
  }).index("by_dish", ["dishId"]),

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
      experienceLevel: v.optional(v.string()),
      wineProfile: v.optional(v.array(v.string())),
      winePreferences: v.optional(v.array(v.string())),
      foodPreferences: v.optional(v.array(v.string())),
      tastePreferences: v.object({
        sweetness: v.number(),
        acidity: v.number(),
        richness: v.number(),
        umami: v.number(),
      }),
      temperaturePreference: v.string(),
      spiceLevel: v.string(),
      onboardingComplete: v.optional(v.boolean()),
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

  // ============================================
  // LEARNING SYSTEM TABLES (Enhanced)
  // ============================================

  courses: defineTable({
    slug: v.string(),
    title: v.string(),
    subtitle: v.optional(v.string()),
    description: v.string(),
    coverImage: v.optional(v.string()),
    category: v.string(),
    tags: v.array(v.string()),
    learningOutcomes: v.array(v.string()),
    estimatedMinutes: v.number(),
    chapterCount: v.number(),
    generatedBy: v.union(v.literal("ai"), v.literal("manual")),
    aiPrompt: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
    publishedAt: v.optional(v.number()),
    enrollmentCount: v.number(),
    completionCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_category", ["category"]),

  chapters: defineTable({
    courseId: v.id("courses"),
    order: v.number(),
    title: v.string(),
    description: v.optional(v.string()),
    contentBlocks: v.array(v.object({
      id: v.string(),
      type: v.string(),
      content: v.any(),
    })),
    learningObjectives: v.array(v.string()),
    keyTerms: v.array(v.object({
      term: v.string(),
      pronunciation: v.optional(v.string()),
      definition: v.string(),
    })),
    estimatedMinutes: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_course", ["courseId"])
    .index("by_course_order", ["courseId", "order"]),

  quizzes: defineTable({
    courseId: v.id("courses"),
    chapterId: v.optional(v.id("chapters")),
    type: v.union(v.literal("chapter_review"), v.literal("course_final")),
    title: v.string(),
    passingScore: v.number(),
    createdAt: v.number(),
  })
    .index("by_course", ["courseId"])
    .index("by_chapter", ["chapterId"]),

  questions: defineTable({
    quizId: v.id("quizzes"),
    order: v.number(),
    type: v.union(v.literal("multiple_choice"), v.literal("true_false")),
    question: v.string(),
    options: v.array(v.object({
      id: v.string(),
      text: v.string(),
    })),
    correctAnswers: v.array(v.string()),
    explanation: v.string(),
    points: v.number(),
    createdAt: v.number(),
  })
    .index("by_quiz", ["quizId"]),

  userCourseProgress: defineTable({
    clerkId: v.string(),
    courseId: v.id("courses"),
    status: v.union(v.literal("not_started"), v.literal("in_progress"), v.literal("completed")),
    readChapterIds: v.array(v.id("chapters")),
    passedQuizIds: v.array(v.id("quizzes")),
    totalTimeSpent: v.number(),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_user", ["clerkId"])
    .index("by_user_course", ["clerkId", "courseId"]),

  quizAttempts: defineTable({
    clerkId: v.string(),
    quizId: v.id("quizzes"),
    courseId: v.id("courses"),
    score: v.number(),
    maxScore: v.number(),
    percentage: v.number(),
    passed: v.boolean(),
    answers: v.array(v.object({
      questionId: v.id("questions"),
      selectedAnswers: v.array(v.string()),
      isCorrect: v.boolean(),
    })),
    attemptNumber: v.number(),
    completedAt: v.number(),
  })
    .index("by_user", ["clerkId"])
    .index("by_user_quiz", ["clerkId", "quizId"]),

  learnCategories: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    displayOrder: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_active", ["isActive"]),

  // User Progress (legacy - keeping for compatibility)
  userProgress: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    completedLessons: v.array(v.string()),
    currentLesson: v.optional(v.string()),
    progress: v.number(),
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

  // User Sake Library (saved/wishlist)
  userLibrary: defineTable({
    clerkId: v.optional(v.string()),
    sessionId: v.string(),
    sakeName: v.string(),
    brewery: v.string(),
    price: v.number(),
    category: v.string(),
    region: v.string(),
    image: v.string(),
    url: v.string(),
    description: v.optional(v.string()),
    savedAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_session_sake", ["sessionId", "sakeName"])
    .index("by_clerk", ["clerkId"]),

  // Japanese Sake Breweries (imported data)
  sakeBreweries: defineTable({
    breweryName: v.string(),
    japaneseName: v.optional(v.string()),
    prefecture: v.string(),
    region: v.string(),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    foundationYear: v.optional(v.number()),
    mainBrands: v.array(v.string()),
    productsCount: v.optional(v.number()),
    sakeTypesProduced: v.optional(v.array(v.string())),
    riceVarietiesUsed: v.optional(v.array(v.string())),
    description: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_prefecture", ["prefecture"])
    .index("by_region", ["region"])
    .index("by_name", ["breweryName"]),

  // Cached sake news
  sakeNewsCache: defineTable({
    date: v.string(), // YYYY-MM-DD
    headlines: v.array(v.object({
      title: v.string(),
      snippet: v.string(),
      emoji: v.string(),
      url: v.string(),
    })),
    createdAt: v.number(),
  })
    .index("by_date", ["date"]),

  // Cached prefecture descriptions from Perplexity
  prefectureDescriptions: defineTable({
    prefecture: v.string(),
    overview: v.string(),
    sakeStyle: v.string(),
    famousBreweries: v.array(v.string()),
    keyCharacteristics: v.array(v.string()),
    recommendedSake: v.array(v.string()),
    createdAt: v.number(),
  })
    .index("by_prefecture", ["prefecture"]),

  // ============================================
  // PODCAST SYSTEM TABLES
  // ============================================

  // Podcast Topics (imported from JSON files)
  podcastTopics: defineTable({
    topicId: v.string(),
    series: v.string(),
    title: v.string(),
    subtitle: v.optional(v.string()),
    narrativeHook: v.string(),
    difficulty: v.string(),
    tier: v.number(),
    status: v.string(),
    metadata: v.any(),
    researchSeeds: v.object({
      keyThemes: v.array(v.string()),
      historicalPeriod: v.optional(v.string()),
      notableFigures: v.optional(v.array(v.string())),
    }),
    researchQueries: v.object({
      geminiRag: v.array(v.string()),
      perplexity: v.array(v.string()),
      firecrawlUrls: v.array(v.string()),
      tippsyQuery: v.optional(v.any()),
    }),
    connections: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_topicId", ["topicId"])
    .index("by_series", ["series"])
    .index("by_status", ["status"])
    .index("by_series_tier", ["series", "tier"]),

  // Podcast Episodes (generated content)
  podcastEpisodes: defineTable({
    topicId: v.string(),
    series: v.string(),
    episodeNumber: v.number(),
    title: v.string(),
    subtitle: v.optional(v.string()),
    description: v.string(),
    research: v.optional(v.any()),
    script: v.optional(v.object({
      content: v.string(),
      wordCount: v.number(),
      estimatedDuration: v.number(),
      generatedAt: v.number(),
    })),
    audio: v.optional(v.object({
      storageId: v.id("_storage"),
      url: v.string(),
      duration: v.number(),
      format: v.string(),
      generatedAt: v.number(),
    })),
    blogPost: v.optional(v.object({
      title: v.string(),
      slug: v.string(),
      excerpt: v.string(),
      content: v.string(),
      metaDescription: v.string(),
      keywords: v.array(v.string()),
      wordCount: v.number(),
      generatedAt: v.number(),
    })),
    recommendedProducts: v.optional(v.array(v.object({
      productId: v.string(),
      name: v.string(),
      brewery: v.string(),
      type: v.string(),
      price: v.number(),
      imageUrl: v.string(),
      tippsyUrl: v.string(),
      recommendationType: v.string(),
      contextNote: v.string(),
      displayOrder: v.number(),
    }))),
    status: v.string(),
    approvedBy: v.optional(v.string()),
    approvedAt: v.optional(v.number()),
    publishedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_topicId", ["topicId"])
    .index("by_series", ["series"])
    .index("by_status", ["status"])
    .index("by_published", ["publishedAt"]),

  // Generation Jobs (track async progress)
  podcastGenerationJobs: defineTable({
    episodeId: v.id("podcastEpisodes"),
    status: v.string(),
    currentStep: v.string(),
    progress: v.number(),
    error: v.optional(v.string()),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_episode", ["episodeId"])
    .index("by_status", ["status"]),
});
