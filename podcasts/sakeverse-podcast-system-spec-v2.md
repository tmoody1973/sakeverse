# Sakéverse AI Podcast System - Updated Specification
## Version 2.0 Updates: Tippsy Products Table + Episode Blog Posts

**Version:** 2.0  
**Last Updated:** January 6, 2025  
**Changes:** Tippsy API → Tippsy Products Table, Added Episode Blog Posts with Product Recommendations

---

## Summary of Changes from v1.0

### 🔄 Key Updates

1. **Tippsy Integration Changed:**
   - Removed: Tippsy API integration
   - Added: `tippsyProducts` Convex table with full product catalog
   - Queries now run against local database instead of external API

2. **Episode Blog Posts Added:**
   - Each episode now generates an accompanying written blog post
   - Blog posts include embedded product recommendations
   - New pipeline step for post generation
   - New admin UI for post editing/approval

3. **Product Recommendations System:**
   - Episodes link to 3-5 recommended Tippsy products
   - Products are matched based on topic metadata
   - Affiliate/tracking links for conversion tracking

---

## Updated Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           EPISODE GENERATION PIPELINE                    │
│                                                                          │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌────────┐│
│  │  Topic   │ → │ Research │ → │  Script  │ → │  Audio   │ → │  Blog  ││
│  │ Selector │   │ Gatherer │   │Generator │   │Generator │   │  Post  ││
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘   └────────┘│
│       │              │              │              │              │      │
│       │              │              │              │              │      │
│  ┌────┴────┐   ┌────┴────┐   ┌────┴────┐   ┌────┴────┐   ┌────┴────┐  │
│  │ Topics  │   │  RAG +  │   │   LLM   │   │ Gemini  │   │   LLM   │  │
│  │   DB    │   │Perplexity│   │ Claude  │   │   TTS   │   │ + Tippsy│  │
│  │         │   │+Firecrawl│   │         │   │         │   │Products │  │
│  │         │   │+Tippsy DB│   │         │   │         │   │   DB    │  │
│  └─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Tippsy Products Table Schema

### 1.1 Database Schema Addition

```typescript
// convex/schema.ts - ADD TO EXISTING SCHEMA

// ============================================
// TIPPSY PRODUCTS TABLE (Replaces API)
// ============================================
tippsyProducts: defineTable({
  // Product Identification
  productId: v.string(),         // Tippsy product ID/SKU
  slug: v.string(),              // URL-safe slug
  
  // Basic Info
  name: v.string(),              // Full product name
  nameJapanese: v.optional(v.string()),
  
  // Brewery/Producer
  brewery: v.string(),
  breweryJapanese: v.optional(v.string()),
  brewerySlug: v.optional(v.string()),
  
  // Classification
  type: v.string(),              // e.g., "Junmai Daiginjo"
  category: v.string(),          // e.g., "junmai_daiginjo"
  subCategory: v.optional(v.string()),
  
  // Region
  prefecture: v.string(),
  prefectureCode: v.optional(v.string()),
  region: v.optional(v.string()), // Sub-region if applicable
  
  // Technical Specs
  polishingRatio: v.optional(v.number()),     // Seimaibuai %
  riceType: v.optional(v.string()),           // Yamada Nishiki, etc.
  yeast: v.optional(v.string()),
  abv: v.number(),                             // Alcohol %
  smv: v.optional(v.number()),                 // Sake Meter Value
  acidity: v.optional(v.number()),
  
  // Tasting Profile
  flavorProfile: v.array(v.string()),          // ["fruity", "dry", "rich"]
  aromaProfile: v.optional(v.array(v.string())),
  tastingNotes: v.string(),
  pairingsSuggested: v.array(v.string()),
  
  // Serving
  servingTemp: v.array(v.string()),            // ["chilled", "room", "warm"]
  servingTempRange: v.optional(v.object({
    min: v.number(),
    max: v.number(),
  })),
  
  // Pricing & Availability
  price: v.number(),                           // USD
  volume: v.number(),                          // ml
  available: v.boolean(),
  
  // URLs
  tippsyUrl: v.string(),                       // Full product URL
  imageUrl: v.string(),
  imageUrlLarge: v.optional(v.string()),
  
  // Metadata
  awards: v.optional(v.array(v.string())),
  vintageYear: v.optional(v.number()),
  limitedEdition: v.optional(v.boolean()),
  
  // Search Optimization
  searchTags: v.array(v.string()),             // Additional search terms
  
  // Timestamps
  lastSyncedAt: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_productId", ["productId"])
  .index("by_brewery", ["brewery"])
  .index("by_prefecture", ["prefecture"])
  .index("by_category", ["category"])
  .index("by_available", ["available"])
  .index("by_price", ["price"])
  .searchIndex("search_products", {
    searchField: "searchTags",
    filterFields: ["category", "prefecture", "brewery", "available"],
  }),

// ============================================
// EPISODE PRODUCTS TABLE (Recommendations)
// ============================================
episodeProducts: defineTable({
  episodeId: v.string(),
  productId: v.string(),
  
  // Recommendation Context
  relevanceScore: v.number(),        // 0-100 matching score
  recommendationType: v.union(
    v.literal("primary"),            // Main recommendation
    v.literal("alternative"),        // Budget/premium alternative
    v.literal("exploration")         // "If you want to go deeper"
  ),
  
  // Display
  displayOrder: v.number(),
  contextNote: v.optional(v.string()), // Why this product matches
  
  // Timestamps
  createdAt: v.number(),
})
  .index("by_episodeId", ["episodeId"])
  .index("by_productId", ["productId"]),
```

### 1.2 Product Query Functions

```typescript
// convex/integrations/tippsy-db.ts

import { query } from "./_generated/server";
import { v } from "convex/values";

// ============================================
// PRODUCT QUERIES (Replace API calls)
// ============================================

// Query products by criteria
export const queryProducts = query({
  args: {
    brewery: v.optional(v.string()),
    prefecture: v.optional(v.string()),
    category: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    flavorProfile: v.optional(v.array(v.string())),
    priceMin: v.optional(v.number()),
    priceMax: v.optional(v.number()),
    availableOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let products = await ctx.db.query("tippsyProducts");
    
    // Apply filters
    if (args.availableOnly !== false) {
      products = products.filter(p => p.available);
    }
    
    if (args.brewery) {
      products = products.filter(p => 
        p.brewery.toLowerCase().includes(args.brewery.toLowerCase())
      );
    }
    
    if (args.prefecture) {
      products = products.filter(p => 
        p.prefecture.toLowerCase() === args.prefecture.toLowerCase()
      );
    }
    
    if (args.category) {
      products = products.filter(p => p.category === args.category);
    }
    
    if (args.categories?.length) {
      products = products.filter(p => args.categories.includes(p.category));
    }
    
    if (args.flavorProfile?.length) {
      products = products.filter(p =>
        args.flavorProfile.some(flavor => 
          p.flavorProfile.includes(flavor)
        )
      );
    }
    
    if (args.priceMin !== undefined) {
      products = products.filter(p => p.price >= args.priceMin);
    }
    
    if (args.priceMax !== undefined) {
      products = products.filter(p => p.price <= args.priceMax);
    }
    
    // Apply limit
    const limit = args.limit ?? 10;
    return products.take(limit);
  },
});

// Full-text search products
export const searchProducts = query({
  args: {
    searchTerm: v.string(),
    filters: v.optional(v.object({
      category: v.optional(v.string()),
      prefecture: v.optional(v.string()),
      availableOnly: v.optional(v.boolean()),
    })),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let searchQuery = ctx.db
      .query("tippsyProducts")
      .withSearchIndex("search_products", q => 
        q.search("searchTags", args.searchTerm)
      );
    
    // Apply additional filters
    if (args.filters?.availableOnly) {
      searchQuery = searchQuery.filter(q => q.eq(q.field("available"), true));
    }
    
    const limit = args.limit ?? 10;
    return await searchQuery.take(limit);
  },
});

// Get products for a topic
export const getProductsForTopic = query({
  args: {
    topicId: v.string(),
  },
  handler: async (ctx, args) => {
    const topic = await ctx.db
      .query("topics")
      .withIndex("by_topicId", q => q.eq("topicId", args.topicId))
      .first();
    
    if (!topic) return [];
    
    const { series, metadata } = topic;
    
    // Build query based on series type
    let products = [];
    
    switch (series) {
      case "sake_stories":
        // Get brewery products
        if (metadata.brewery) {
          products = await ctx.db
            .query("tippsyProducts")
            .withIndex("by_brewery", q => q.eq("brewery", metadata.brewery))
            .filter(q => q.eq(q.field("available"), true))
            .take(10);
        }
        break;
        
      case "pairing_lab":
        // Get products matching pairing criteria
        if (metadata.sakeSolutionType) {
          products = await ctx.db
            .query("tippsyProducts")
            .withIndex("by_category", q => 
              q.eq("category", metadata.sakeSolutionType)
            )
            .filter(q => q.eq(q.field("available"), true))
            .take(10);
        }
        break;
        
      case "the_bridge":
        // Get products matching sake destination style
        if (metadata.sakeDestination?.region) {
          products = await ctx.db
            .query("tippsyProducts")
            .withIndex("by_prefecture", q => 
              q.eq("prefecture", metadata.sakeDestination.region)
            )
            .filter(q => q.eq(q.field("available"), true))
            .take(10);
        }
        break;
        
      case "brewing_secrets":
        // Search by certification terms or concepts
        const searchTerms = metadata.certificationTerms?.join(" ") || metadata.coreConcept;
        if (searchTerms) {
          products = await ctx.db
            .query("tippsyProducts")
            .withSearchIndex("search_products", q => 
              q.search("searchTags", searchTerms)
            )
            .filter(q => q.eq(q.field("available"), true))
            .take(10);
        }
        break;
    }
    
    return products;
  },
});
```

---

## 2. Updated Episodes Schema (With Blog Post)

### 2.1 Schema Changes

```typescript
// convex/schema.ts - UPDATED EPISODES TABLE

episodes: defineTable({
  // ... (all existing fields remain) ...
  
  // ============================================
  // NEW: BLOG POST FIELDS
  // ============================================
  
  // Blog Post Content
  blogPost: v.optional(v.object({
    // Content
    title: v.string(),
    subtitle: v.optional(v.string()),
    excerpt: v.string(),               // 1-2 sentence summary for previews
    content: v.string(),               // Full markdown content
    
    // SEO
    metaDescription: v.string(),
    keywords: v.array(v.string()),
    slug: v.string(),                  // URL slug
    
    // Media
    featuredImageUrl: v.optional(v.string()),
    featuredImageAlt: v.optional(v.string()),
    
    // Sections (structured content)
    sections: v.array(v.object({
      type: v.union(
        v.literal("intro"),
        v.literal("story"),
        v.literal("technical"),
        v.literal("tasting"),
        v.literal("pairing"),
        v.literal("recommendations"),
        v.literal("conclusion")
      ),
      heading: v.string(),
      content: v.string(),
    })),
    
    // Generation metadata
    version: v.number(),
    generatedAt: v.number(),
    wordCount: v.number(),
  })),
  
  // Blog approval workflow
  blogStatus: v.optional(v.union(
    v.literal("pending"),
    v.literal("generated"),
    v.literal("approved"),
    v.literal("rejected"),
    v.literal("published")
  )),
  blogApprovedAt: v.optional(v.number()),
  blogApprovedBy: v.optional(v.string()),
  blogPublishedAt: v.optional(v.number()),
  
  // ============================================
  // NEW: PRODUCT RECOMMENDATIONS
  // ============================================
  
  // Embedded product recommendations (denormalized for performance)
  recommendedProducts: v.optional(v.array(v.object({
    productId: v.string(),
    name: v.string(),
    brewery: v.string(),
    type: v.string(),
    price: v.number(),
    imageUrl: v.string(),
    tippsyUrl: v.string(),
    
    // Context
    recommendationType: v.union(
      v.literal("primary"),
      v.literal("alternative"),
      v.literal("exploration")
    ),
    contextNote: v.string(),      // "Featured in the episode", "Budget-friendly option"
    displayOrder: v.number(),
  }))),
  
  // ... (timestamps remain) ...
})
```

### 2.2 Updated Status Flow

```
queued → researching → research_complete → 
brief_generated → brief_approved → 
script_generated → script_approved → 
audio_generating → audio_complete →
blog_generated → blog_approved →        // NEW STEPS
published
```

---

## 3. Updated Generation Pipeline

### 3.1 Modified Pipeline with Blog Post Generation

```typescript
// convex/generation/pipeline.ts - UPDATED

export const runPipeline = internalAction({
  args: {
    jobId: v.string(),
    episodeId: v.string(),
    topicId: v.string(),
  },
  handler: async (ctx, { jobId, episodeId, topicId }) => {
    try {
      // ... (Steps 1-4 remain the same: Research, Brief, Script, Audio) ...
      
      // ========== STEP 5: PRODUCT MATCHING ==========
      await updateProgress(ctx, jobId, 80, "Matching products...");
      
      const topic = await ctx.runQuery(internal.topics.getByTopicId, { topicId });
      const matchedProducts = await matchProductsForEpisode(ctx, topic, research);
      
      await ctx.runMutation(internal.episodes.saveProducts, {
        episodeId,
        products: matchedProducts,
      });
      
      // ========== STEP 6: BLOG POST GENERATION ==========
      await updateProgress(ctx, jobId, 85, "Generating blog post...");
      
      const blogPost = await generateBlogPost(ctx, topic, research, script, matchedProducts);
      
      await ctx.runMutation(internal.episodes.saveBlogPost, {
        episodeId,
        blogPost,
      });
      
      // Check if auto-approve is enabled for blog
      const blogSettings = await ctx.runQuery(internal.settings.get, { key: "autoApproveBlog" });
      if (!blogSettings?.value) {
        await ctx.runMutation(internal.episodes.updateStatus, {
          episodeId,
          status: "blog_generated",
          blogStatus: "generated",
        });
        await updateProgress(ctx, jobId, 90, "Waiting for blog approval...");
        return;
      }
      
      // ========== STEP 7: FINALIZE ==========
      await updateProgress(ctx, jobId, 95, "Finalizing...");
      
      await ctx.runMutation(internal.episodes.updateStatus, {
        episodeId,
        status: "published",
        blogStatus: "published",
        publishedAt: Date.now(),
        blogPublishedAt: Date.now(),
      });
      
      // ... (rest of finalization) ...
      
    } catch (error) {
      // ... (error handling) ...
    }
  },
});

// ============================================
// PRODUCT MATCHING
// ============================================
async function matchProductsForEpisode(ctx, topic, research) {
  const products = [];
  
  // Get candidate products from Tippsy DB
  const candidates = await ctx.runQuery(internal.tippsy.getProductsForTopic, {
    topicId: topic.topicId,
  });
  
  if (candidates.length === 0) {
    // Fallback: search by topic title/keywords
    const fallbackCandidates = await ctx.runQuery(internal.tippsy.searchProducts, {
      searchTerm: `${topic.title} ${topic.metadata.brewery || ''} ${topic.metadata.prefecture || ''}`,
      filters: { availableOnly: true },
      limit: 10,
    });
    candidates.push(...fallbackCandidates);
  }
  
  // Score and rank candidates
  const scoredProducts = candidates.map(product => ({
    ...product,
    score: calculateRelevanceScore(topic, research, product),
  }));
  
  // Sort by score
  scoredProducts.sort((a, b) => b.score - a.score);
  
  // Select top products with diverse recommendation types
  const selected = [];
  
  // Primary recommendation (highest score)
  if (scoredProducts.length > 0) {
    selected.push({
      ...formatProductRecommendation(scoredProducts[0]),
      recommendationType: "primary",
      contextNote: generateContextNote(topic, scoredProducts[0], "primary"),
      displayOrder: 1,
    });
  }
  
  // Alternative (budget or premium option)
  const primaryPrice = scoredProducts[0]?.price || 50;
  const alternative = scoredProducts.find(p => 
    p.productId !== scoredProducts[0]?.productId &&
    (p.price < primaryPrice * 0.7 || p.price > primaryPrice * 1.5)
  );
  
  if (alternative) {
    const altType = alternative.price < primaryPrice ? "Budget-friendly" : "Premium upgrade";
    selected.push({
      ...formatProductRecommendation(alternative),
      recommendationType: "alternative",
      contextNote: `${altType}: ${alternative.name}`,
      displayOrder: 2,
    });
  }
  
  // Exploration (different style/region)
  const exploration = scoredProducts.find(p =>
    p.productId !== scoredProducts[0]?.productId &&
    p.productId !== alternative?.productId &&
    (p.category !== scoredProducts[0]?.category || p.prefecture !== scoredProducts[0]?.prefecture)
  );
  
  if (exploration) {
    selected.push({
      ...formatProductRecommendation(exploration),
      recommendationType: "exploration",
      contextNote: generateContextNote(topic, exploration, "exploration"),
      displayOrder: 3,
    });
  }
  
  return selected;
}

function calculateRelevanceScore(topic, research, product) {
  let score = 0;
  
  // Brewery match (for Sake Stories)
  if (topic.metadata.brewery && 
      product.brewery.toLowerCase().includes(topic.metadata.brewery.toLowerCase())) {
    score += 40;
  }
  
  // Prefecture match
  if (topic.metadata.prefecture && 
      product.prefecture.toLowerCase() === topic.metadata.prefecture.toLowerCase()) {
    score += 20;
  }
  
  // Category match (for Pairing Lab / Bridge)
  if (topic.metadata.sakeSolutionType && 
      product.category === topic.metadata.sakeSolutionType) {
    score += 30;
  }
  
  // Flavor profile match
  const topicFlavors = topic.researchSeeds?.keyThemes || [];
  const matchingFlavors = product.flavorProfile.filter(f => 
    topicFlavors.some(tf => tf.toLowerCase().includes(f.toLowerCase()))
  );
  score += matchingFlavors.length * 5;
  
  // Availability bonus
  if (product.available) {
    score += 10;
  }
  
  // Price reasonability (middle range preferred for primary)
  if (product.price >= 25 && product.price <= 60) {
    score += 5;
  }
  
  return score;
}

function formatProductRecommendation(product) {
  return {
    productId: product.productId,
    name: product.name,
    brewery: product.brewery,
    type: product.type,
    price: product.price,
    imageUrl: product.imageUrl,
    tippsyUrl: product.tippsyUrl,
  };
}

function generateContextNote(topic, product, type) {
  switch (topic.series) {
    case "sake_stories":
      if (type === "primary") {
        return `From ${product.brewery} - featured in this episode`;
      }
      return `Explore more from ${product.prefecture}`;
      
    case "pairing_lab":
      if (type === "primary") {
        return `Perfect for ${topic.metadata.food} pairing`;
      }
      return `Try this for a different pairing experience`;
      
    case "the_bridge":
      if (type === "primary") {
        return `Your sake match for ${topic.metadata.wineAnchor?.wine || 'this wine style'}`;
      }
      return `Another style worth exploring`;
      
    case "brewing_secrets":
      if (type === "primary") {
        return `Taste example of ${topic.metadata.coreConcept}`;
      }
      return `Compare and contrast`;
      
    default:
      return `Recommended selection`;
  }
}

// ============================================
// BLOG POST GENERATION
// ============================================
async function generateBlogPost(ctx, topic, research, script, products) {
  const seriesConfig = getBlogTemplate(topic.series);
  
  const prompt = `
You are writing a blog post to accompany a podcast episode about sake.

EPISODE DETAILS:
- Series: ${topic.series}
- Title: ${topic.title}
- Subtitle: ${topic.subtitle || ""}
- Narrative Hook: ${topic.narrativeHook}

PODCAST SCRIPT (for reference):
${script}

RESEARCH DATA:
${JSON.stringify(research, null, 2)}

RECOMMENDED PRODUCTS TO FEATURE:
${JSON.stringify(products, null, 2)}

BLOG POST REQUIREMENTS:

1. STRUCTURE:
   - Title: Engaging, SEO-friendly (different from episode title)
   - Subtitle: Compelling one-liner
   - Excerpt: 1-2 sentences for previews/cards
   - Sections: ${seriesConfig.sections.join(", ")}

2. CONTENT GUIDELINES:
   - Expand on topics only briefly covered in audio
   - Include information that benefits from being read (stats, charts, lists)
   - Add value beyond the audio - don't just transcribe
   - Target length: ${seriesConfig.wordCount} words
   - Tone: ${seriesConfig.tone}

3. PRODUCT INTEGRATION:
   - Naturally weave product recommendations into relevant sections
   - Include a dedicated "What to Try" section
   - For each product, explain WHY it's recommended for this topic
   - Use this format for products: **[Product Name](tippsyUrl)** - brief note

4. SEO REQUIREMENTS:
   - Include primary keyword 2-3 times naturally
   - Meta description: 150-160 characters
   - 5-8 relevant keywords

5. FORMATTING:
   - Use markdown
   - Include clear headings (##, ###)
   - Use bullet points sparingly
   - Include pull quotes from the audio where impactful

Return a JSON object with this structure:
{
  "title": "string",
  "subtitle": "string",
  "excerpt": "string",
  "content": "full markdown content",
  "metaDescription": "string",
  "keywords": ["array", "of", "strings"],
  "slug": "url-safe-slug",
  "sections": [
    { "type": "intro", "heading": "string", "content": "string" },
    ...
  ],
  "wordCount": number
}
`;

  const response = await callLLM(prompt);
  const blogData = JSON.parse(response);
  
  return {
    ...blogData,
    version: 1,
    generatedAt: Date.now(),
  };
}

function getBlogTemplate(series) {
  const templates = {
    sake_stories: {
      sections: ["intro", "story", "technical", "tasting", "recommendations", "conclusion"],
      wordCount: "800-1200",
      tone: "warm, narrative, educational",
    },
    pairing_lab: {
      sections: ["intro", "pairing", "technical", "recommendations", "conclusion"],
      wordCount: "600-900",
      tone: "playful, practical, experimental",
    },
    the_bridge: {
      sections: ["intro", "technical", "tasting", "recommendations", "conclusion"],
      wordCount: "700-1000",
      tone: "sophisticated, approachable, comparative",
    },
    brewing_secrets: {
      sections: ["intro", "technical", "tasting", "recommendations", "conclusion"],
      wordCount: "900-1400",
      tone: "educational, clear, detailed",
    },
  };
  
  return templates[series];
}
```

---

## 4. Updated Admin Interface

### 4.1 Episode Detail Page Updates

Add new tabs to the Episode Detail page:

```
[Overview] [Research] [Brief] [Script] [Audio] [Blog Post] [Products] [Analytics]
```

#### Blog Post Tab

```
┌─────────────────────────────────────────────────────────────────┐
│  BLOG POST                                      Status: Generated│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Title: The Village That Refused to Die                          │
│  Subtitle: How Dassai transformed sake and saved a community     │
│  Slug: /blog/dassai-village-refused-to-die                      │
│                                                                  │
│  ───────────────────────────────────────────────────────────    │
│                                                                  │
│  PREVIEW                                                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  [Rendered markdown preview of blog post]                  │ │
│  │                                                            │ │
│  │  In the remote mountains of Yamaguchi Prefecture,          │ │
│  │  where the population has dwindled to under 700 people,   │ │
│  │  a sake brewery defied every conventional rule...          │ │
│  │                                                            │ │
│  │  ## The Transformation                                     │ │
│  │  ...                                                       │ │
│  │                                                            │ │
│  │  ## What to Try                                            │ │
│  │  **Dassai 23** - The pinnacle of their craft...           │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  METADATA                                                        │
│  Word Count: 987 │ Generated: Jan 13, 2025 │ Version: 1         │
│                                                                  │
│  SEO                                                             │
│  Meta: "Discover how Dassai brewery transformed..."             │
│  Keywords: dassai, yamaguchi sake, junmai daiginjo, sake story  │
│                                                                  │
│  ACTIONS                                                         │
│  [Edit Post] [Regenerate] [Approve] [Reject]                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Products Tab

```
┌─────────────────────────────────────────────────────────────────┐
│  PRODUCT RECOMMENDATIONS                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  MATCHED PRODUCTS (3)                                            │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 🏆 PRIMARY                                                  │ │
│  │ ┌──────┐                                                   │ │
│  │ │ IMG  │  Dassai 23 Junmai Daiginjo                       │ │
│  │ │      │  Asahi Shuzo • Yamaguchi                          │ │
│  │ └──────┘  $85.00 • 720ml                                   │ │
│  │           Context: From Asahi Shuzo - featured in episode  │ │
│  │           Score: 95/100                                     │ │
│  │           [View on Tippsy ↗] [Remove] [Edit Context]       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 💡 ALTERNATIVE                                              │ │
│  │ ┌──────┐                                                   │ │
│  │ │ IMG  │  Dassai 45 Junmai Daiginjo                       │ │
│  │ │      │  Asahi Shuzo • Yamaguchi                          │ │
│  │ └──────┘  $42.00 • 720ml                                   │ │
│  │           Context: Budget-friendly entry to Dassai         │ │
│  │           Score: 88/100                                     │ │
│  │           [View on Tippsy ↗] [Remove] [Edit Context]       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 🔍 EXPLORATION                                              │ │
│  │ ┌──────┐                                                   │ │
│  │ │ IMG  │  Gangi Nosing Junmai Daiginjo                    │ │
│  │ │      │  Yaoshin Shuzo • Yamaguchi                        │ │
│  │ └──────┘  $55.00 • 720ml                                   │ │
│  │           Context: Another gem from Yamaguchi              │ │
│  │           Score: 72/100                                     │ │
│  │           [View on Tippsy ↗] [Remove] [Edit Context]       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ADD PRODUCT                                                     │
│  🔍 [Search Tippsy catalog...                              ]    │
│                                                                  │
│  [Refresh Matches] [Add Manual Product]                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Products Manager Page (New)

```
/admin/products - Tippsy Product Catalog Management
```

```
┌─────────────────────────────────────────────────────────────────┐
│  TIPPSY PRODUCT CATALOG                Last Sync: Jan 6, 2025   │
├─────────────────────────────────────────────────────────────────┤
│  [All Types ▼] [All Regions ▼] [In Stock ✓]     🔍 Search       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PRODUCTS (523 total, 487 in stock)                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Name           │ Brewery    │ Type    │ Price │ Stock │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ Dassai 23      │ Asahi Shuzo│ J.Daig. │ $85   │ ✅    │   │
│  │ Hakkaisan Snow │ Hakkaisan  │ J.Ginjo │ $35   │ ✅    │   │
│  │ Kubota Manju   │ Asahi Shuzo│ J.Daig. │ $65   │ ❌    │   │
│  │ ...            │            │         │       │       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ACTIONS                                                         │
│  [Import CSV] [Export CSV] [Sync from Tippsy] [Add Product]     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Public Episode Page Updates

### 5.1 Episode Detail Page with Blog Post

```
┌─────────────────────────────────────────────────────────────────┐
│  📖 SAKE STORIES                                                 │
│                                                                  │
│  The Village That Refused to Die                                 │
│  How Dassai transformed sake and saved a community               │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      🎧 LISTEN                             │ │
│  │                                                            │ │
│  │      ▶  ─────────●────────────────  4:32                 │ │
│  │                                                            │ │
│  │      🔊 ───●───────  │ 1x │ ⏪ │ ⏩                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [🎧 Listen] [📖 Read] [🍶 Products]    ← Tab navigation        │
│                                                                  │
│  ════════════════════════════════════════════════════════════   │
│                                                                  │
│  📖 THE STORY (Blog content rendered)                            │
│                                                                  │
│  In the remote mountains of Yamaguchi Prefecture, where the     │
│  population has dwindled to under 700 people, a sake brewery    │
│  defied every conventional rule to become one of the most       │
│  recognized names in the sake world...                          │
│                                                                  │
│  ## The Transformation                                           │
│  ...                                                             │
│                                                                  │
│  ────────────────────────────────────────────────────────────   │
│                                                                  │
│  🍶 TASTE THE STORY                                              │
│                                                                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │    [IMAGE]      │ │    [IMAGE]      │ │    [IMAGE]      │   │
│  │                 │ │                 │ │                 │   │
│  │  Dassai 23      │ │  Dassai 45      │ │  Gangi Nosing   │   │
│  │  $85            │ │  $42            │ │  $55            │   │
│  │                 │ │                 │ │                 │   │
│  │  Featured       │ │  Budget option  │ │  Also from      │   │
│  │                 │ │                 │ │  Yamaguchi      │   │
│  │ [Shop Tippsy →] │ │ [Shop Tippsy →] │ │ [Shop Tippsy →] │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│                                                                  │
│  ────────────────────────────────────────────────────────────   │
│                                                                  │
│  MORE EPISODES                                                   │
│  [Related episode cards...]                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Updated API Endpoints

### 6.1 New Admin Endpoints

```typescript
// ============================================
// BLOG POST ENDPOINTS
// ============================================

// Get episode blog post
GET /api/admin/episodes/:episodeId/blog

// Update episode blog post
PATCH /api/admin/episodes/:episodeId/blog
Body: { blogPost: BlogPostObject }

// Approve blog post
POST /api/admin/episodes/:episodeId/blog/approve

// Reject blog post
POST /api/admin/episodes/:episodeId/blog/reject
Body: { reason: string }

// Regenerate blog post
POST /api/admin/episodes/:episodeId/blog/regenerate

// ============================================
// PRODUCT ENDPOINTS
// ============================================

// Get episode products
GET /api/admin/episodes/:episodeId/products

// Update episode products
PATCH /api/admin/episodes/:episodeId/products
Body: { products: ProductRecommendation[] }

// Add product to episode
POST /api/admin/episodes/:episodeId/products
Body: { productId: string, recommendationType: string, contextNote: string }

// Remove product from episode
DELETE /api/admin/episodes/:episodeId/products/:productId

// Refresh product matches
POST /api/admin/episodes/:episodeId/products/refresh

// ============================================
// TIPPSY CATALOG ENDPOINTS
// ============================================

// List products with filters
GET /api/admin/products
Query params:
  - search: string
  - category: string
  - prefecture: string
  - available: boolean
  - page: number
  - limit: number

// Get single product
GET /api/admin/products/:productId

// Create product (manual add)
POST /api/admin/products
Body: TippsyProductInput

// Update product
PATCH /api/admin/products/:productId
Body: Partial<TippsyProductInput>

// Delete product
DELETE /api/admin/products/:productId

// Bulk import products
POST /api/admin/products/import
Body: { products: TippsyProductInput[] }

// Export products
GET /api/admin/products/export
Query params:
  - format: "csv" | "json"
```

### 6.2 New Public Endpoints

```typescript
// ============================================
// PUBLIC PODCAST ENDPOINTS (Updated)
// ============================================

// Get published episode with blog post and products
GET /api/podcasts/:episodeId
Response: {
  episode: Episode,
  blogPost: BlogPost,        // NEW
  products: ProductRecommendation[],  // NEW
  relatedEpisodes: Episode[],
}

// Record product click
POST /api/podcasts/:episodeId/product-click
Body: { productId: string }

// ============================================
// PUBLIC BLOG ENDPOINTS (New)
// ============================================

// List blog posts
GET /api/blog
Query params:
  - series: string
  - page: number
  - limit: number

// Get blog post by slug
GET /api/blog/:slug

// Blog RSS feed
GET /api/blog/feed.xml
```

---

## 7. Updated Environment Variables

```bash
# ... (existing variables) ...

# REMOVED
# TIPPSY_API_KEY=
# TIPPSY_API_SECRET=

# Note: Tippsy products are now stored in the Convex database
# Import products via CSV or manual entry in admin panel
```

---

## 8. Data Migration: Tippsy Products Import

### 8.1 CSV Import Format

```csv
productId,name,nameJapanese,brewery,breweryJapanese,type,category,prefecture,polishingRatio,riceType,abv,smv,acidity,flavorProfile,tastingNotes,pairingsSuggested,servingTemp,price,volume,available,tippsyUrl,imageUrl,awards,searchTags
dassai-23,Dassai 23 Junmai Daiginjo,獺祭23,Asahi Shuzo,旭酒造,Junmai Daiginjo,junmai_daiginjo,Yamaguchi,23,Yamada Nishiki,16,+3,1.1,"fruity,elegant,delicate","Refined and elegant with notes of melon, white peach, and subtle floral undertones","sashimi,light seafood,tempura","chilled,slightly_chilled",85,720,true,https://tippsy.com/products/dassai-23,https://tippsy.com/images/dassai-23.jpg,"IWC Gold 2023","dassai,yamaguchi,junmai daiginjo,yamada nishiki,premium"
```

### 8.2 Import Script

```typescript
// scripts/import-tippsy-products.ts

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import Papa from "papaparse";
import fs from "fs";

const client = new ConvexHttpClient(process.env.CONVEX_URL!);

async function importProducts(csvPath: string) {
  const csvContent = fs.readFileSync(csvPath, "utf-8");
  const { data } = Papa.parse(csvContent, { header: true });
  
  const products = data.map((row: any) => ({
    productId: row.productId,
    slug: row.productId,
    name: row.name,
    nameJapanese: row.nameJapanese || undefined,
    brewery: row.brewery,
    breweryJapanese: row.breweryJapanese || undefined,
    type: row.type,
    category: row.category,
    prefecture: row.prefecture,
    polishingRatio: row.polishingRatio ? parseInt(row.polishingRatio) : undefined,
    riceType: row.riceType || undefined,
    abv: parseFloat(row.abv),
    smv: row.smv ? parseInt(row.smv) : undefined,
    acidity: row.acidity ? parseFloat(row.acidity) : undefined,
    flavorProfile: row.flavorProfile?.split(",") || [],
    tastingNotes: row.tastingNotes,
    pairingsSuggested: row.pairingsSuggested?.split(",") || [],
    servingTemp: row.servingTemp?.split(",") || ["chilled"],
    price: parseFloat(row.price),
    volume: parseInt(row.volume),
    available: row.available === "true",
    tippsyUrl: row.tippsyUrl,
    imageUrl: row.imageUrl,
    awards: row.awards?.split(",").filter(Boolean) || [],
    searchTags: [
      row.name.toLowerCase(),
      row.brewery.toLowerCase(),
      row.prefecture.toLowerCase(),
      row.type.toLowerCase(),
      ...(row.searchTags?.split(",") || []),
    ],
    lastSyncedAt: Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }));
  
  // Batch import
  const batchSize = 50;
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    await client.mutation(api.products.bulkCreate, { products: batch });
    console.log(`Imported ${Math.min(i + batchSize, products.length)}/${products.length} products`);
  }
  
  console.log("Import complete!");
}

// Run: npx ts-node scripts/import-tippsy-products.ts products.csv
importProducts(process.argv[2]);
```

---

## 9. Updated File Structure

```
sakeverse/
├── convex/
│   ├── schema.ts                    # Updated with tippsyProducts, episodeProducts
│   ├── crons.ts
│   │
│   ├── topics/
│   ├── episodes/
│   │   ├── queries.ts               # Updated with blog/product queries
│   │   ├── mutations.ts             # Updated with blog/product mutations
│   │   └── helpers.ts
│   │
│   ├── products/                    # NEW: Product management
│   │   ├── queries.ts
│   │   ├── mutations.ts
│   │   └── helpers.ts
│   │
│   ├── generation/
│   │   ├── pipeline.ts              # Updated with blog generation step
│   │   ├── research.ts              # Updated to use Tippsy DB
│   │   ├── brief.ts
│   │   ├── script.ts
│   │   ├── audio.ts
│   │   ├── blog.ts                  # NEW: Blog post generation
│   │   └── products.ts              # NEW: Product matching
│   │
│   ├── integrations/
│   │   ├── gemini-rag.ts
│   │   ├── perplexity.ts
│   │   ├── firecrawl.ts
│   │   ├── tippsy-db.ts             # RENAMED: Was tippsy.ts (API), now DB queries
│   │   └── gemini-tts.ts
│   │
│   └── lib/
│
├── app/
│   ├── admin/
│   │   ├── topics/
│   │   ├── episodes/
│   │   │   └── [episodeId]/
│   │   │       └── page.tsx         # Updated with Blog/Products tabs
│   │   ├── products/                # NEW: Products manager
│   │   │   └── page.tsx
│   │   ├── pipeline/
│   │   ├── analytics/
│   │   └── settings/
│   │
│   ├── podcasts/
│   │   ├── page.tsx
│   │   └── [episodeId]/
│   │       └── page.tsx             # Updated with blog content and products
│   │
│   ├── blog/                        # NEW: Public blog listing
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   │
│   └── api/
│       ├── podcasts/
│       └── blog/                    # NEW: Blog API routes
│           └── feed.xml/
│
├── components/
│   ├── admin/
│   │   ├── BlogEditor.tsx           # NEW
│   │   ├── BlogPreview.tsx          # NEW
│   │   ├── ProductCard.tsx          # NEW
│   │   ├── ProductSearch.tsx        # NEW
│   │   └── ProductGrid.tsx          # NEW
│   │
│   └── podcasts/
│       ├── BlogContent.tsx          # NEW
│       ├── ProductRecommendations.tsx # NEW
│       └── ProductCard.tsx          # NEW
│
├── scripts/
│   └── import-tippsy-products.ts    # NEW: CSV import script
│
└── data/
    └── tippsy-products.csv          # NEW: Product catalog CSV
```

---

## 10. Summary of Changes

| Component | Before (v1.0) | After (v2.0) |
|-----------|---------------|--------------|
| Tippsy Integration | External API calls | Local Convex table |
| Episode Content | Audio + Transcript only | Audio + Transcript + Blog Post |
| Product Recommendations | None | 3-5 matched products per episode |
| Pipeline Steps | 5 steps | 7 steps (+ products + blog) |
| Admin Tabs | 6 tabs | 8 tabs (+ Blog Post + Products) |
| Public Routes | /podcasts/* | /podcasts/* + /blog/* |
| Env Variables | TIPPSY_API_KEY, TIPPSY_API_SECRET | (removed - data in DB) |

---

**END OF SPECIFICATION UPDATE**

*This document provides the incremental changes to implement Tippsy Products Table and Episode Blog Posts. All changes are designed to work with the existing Convex + Next.js architecture from v1.0.*
