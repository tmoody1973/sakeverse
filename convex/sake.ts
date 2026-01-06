import { query } from "./_generated/server";
import { v } from "convex/values";

// Get all sake with optional filtering
export const getAllSake = query({
  args: {
    limit: v.optional(v.number()),
    type: v.optional(v.string()),
    region: v.optional(v.id("regions")),
    brewery: v.optional(v.id("breweries")),
    priceMin: v.optional(v.number()),
    priceMax: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("sake");

    // Apply filters
    if (args.type) {
      query = query.filter((q) => q.eq(q.field("type"), args.type));
    }
    if (args.region) {
      query = query.filter((q) => q.eq(q.field("region"), args.region));
    }
    if (args.brewery) {
      query = query.filter((q) => q.eq(q.field("brewery"), args.brewery));
    }
    if (args.priceMin !== undefined) {
      query = query.filter((q) => q.gte(q.field("price"), args.priceMin!));
    }
    if (args.priceMax !== undefined) {
      query = query.filter((q) => q.lte(q.field("price"), args.priceMax!));
    }

    let results = await query.collect();

    // Filter by tags if provided
    if (args.tags && args.tags.length > 0) {
      results = results.filter(sake => 
        args.tags!.some(tag => sake.tags.includes(tag))
      );
    }

    // Apply limit
    if (args.limit) {
      results = results.slice(0, args.limit);
    }

    return results;
  },
});

// Get sake by ID with related data
export const getSakeById = query({
  args: { id: v.id("sake") },
  handler: async (ctx, args) => {
    const sake = await ctx.db.get(args.id);
    if (!sake) return null;

    // Get brewery info
    const brewery = await ctx.db.get(sake.brewery);
    
    // Get region info
    const region = await ctx.db.get(sake.region);

    // Get similar sake (same type and region)
    const similarSake = await ctx.db
      .query("sake")
      .filter((q) => 
        q.and(
          q.eq(q.field("type"), sake.type),
          q.eq(q.field("region"), sake.region),
          q.neq(q.field("_id"), sake._id)
        )
      )
      .take(4);

    return {
      sake,
      brewery,
      region,
      similarSake,
    };
  },
});

// Search sake by name or description
export const searchSake = query({
  args: { 
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const searchTerm = args.searchTerm.toLowerCase();

    const allSake = await ctx.db.query("sake").collect();
    
    const results = allSake
      .filter(sake => 
        sake.name.toLowerCase().includes(searchTerm) ||
        (sake.nameJapanese && sake.nameJapanese.toLowerCase().includes(searchTerm)) ||
        (sake.description && sake.description.toLowerCase().includes(searchTerm)) ||
        sake.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
      .slice(0, limit);

    return results;
  },
});

// Get sake recommendations based on user preferences
export const getRecommendations = query({
  args: { 
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    const user = await ctx.db.get(args.userId);
    if (!user) return [];

    const userPrefs = user.preferences.tastePreferences;
    
    // Get all sake
    const allSake = await ctx.db.query("sake").collect();
    
    // Calculate compatibility scores
    const scoredSake = allSake.map(sake => {
      const tasteProfile = sake.tasteProfile;
      
      // Calculate taste similarity (lower difference = higher score)
      const sweetnessScore = 5 - Math.abs(userPrefs.sweetness - tasteProfile.sweetness);
      const acidityScore = 5 - Math.abs(userPrefs.acidity - tasteProfile.acidity);
      const richnessScore = 5 - Math.abs(userPrefs.richness - tasteProfile.richness);
      const umamiScore = 5 - Math.abs(userPrefs.umami - tasteProfile.umami);
      
      const totalScore = (sweetnessScore + acidityScore + richnessScore + umamiScore) / 4;
      
      return {
        ...sake,
        compatibilityScore: totalScore,
      };
    });

    // Sort by compatibility and return top results
    return scoredSake
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, limit);
  },
});

// Get sake by type
export const getSakeByType = query({
  args: { 
    type: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    return await ctx.db
      .query("sake")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .take(limit);
  },
});

// Get featured sake (high ratings, popular)
export const getFeaturedSake = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 8;
    
    const allSake = await ctx.db.query("sake").collect();
    
    // Sort by rating and popularity
    const featured = allSake
      .filter(sake => sake.ratings.average >= 4.0 && sake.ratings.count >= 10)
      .sort((a, b) => {
        // Weighted score: rating * log(count) for popularity
        const scoreA = a.ratings.average * Math.log(a.ratings.count + 1);
        const scoreB = b.ratings.average * Math.log(b.ratings.count + 1);
        return scoreB - scoreA;
      })
      .slice(0, limit);

    return featured;
  },
});


// Get featured Tippsy products for dashboard
export const getFeaturedTippsyProducts = query({
  args: {},
  handler: async (ctx) => {
    const allProducts = await ctx.db.query("tippsyProducts").take(50)
    
    // Shuffle and take 3
    const shuffled = [...allProducts].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 3).map(p => ({
      name: p.productName,
      brewery: p.brewery,
      price: p.price,
      category: p.category,
      image: (p as any).images?.[0] || '',
      url: (p as any).url || '',
    }))
  },
});


// Search Tippsy products by brewery name
export const searchByBrewery = query({
  args: {
    brewery: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { brewery, limit = 5 }) => {
    const products = await ctx.db
      .query("tippsyProducts")
      .collect()
    
    // Filter by brewery name (case-insensitive partial match)
    const filtered = products.filter(p => 
      p.brewery.toLowerCase().includes(brewery.toLowerCase())
    )
    
    return filtered.slice(0, limit)
  },
})
