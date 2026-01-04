import { mutation } from "./_generated/server"
import { v } from "convex/values"

// Import Tippsy sake products into Convex database
export const importTippsyProducts = mutation({
  args: {
    products: v.array(v.object({
      productName: v.string(),
      price: v.string(),
      size: v.union(v.string(), v.null()),
      description: v.string(),
      brand: v.union(v.string(), v.null()),
      brewery: v.union(v.string(), v.null()),
      category: v.string(),
      subcategory: v.optional(v.union(v.string(), v.null())),
      tasteProfile: v.union(v.string(), v.null()),
      riceVariety: v.optional(v.union(v.string(), v.null())),
      yeastVariety: v.optional(v.union(v.string(), v.null())),
      alcohol: v.union(v.string(), v.null()),
      rpr: v.optional(v.union(v.string(), v.null())),
      smv: v.optional(v.union(v.string(), v.null())),
      acidity: v.optional(v.union(v.string(), v.null())),
      servingTemperature: v.union(v.string(), v.null()),
      region: v.union(v.string(), v.null()),
      prefecture: v.union(v.string(), v.null()),
      tastingNotes: v.array(v.string()),
      foodPairings: v.array(v.string()),
      images: v.array(v.string()),
      reviewCount: v.union(v.number(), v.null()),
      averageRating: v.union(v.number(), v.null()),
      url: v.string(),
    }))
  },
  handler: async (ctx, args) => {
    const imported = []
    
    for (const product of args.products) {
      // Skip products with missing essential data
      if (!product.productName || !product.category) {
        console.log(`Skipping product with missing essential data: ${product.productName}`)
        continue
      }
      
      // Parse price to number (handle commas)
      const priceNum = parseFloat(product.price.replace(/[$,]/g, '')) || 0
      
      // Parse alcohol percentage
      const alcoholNum = product.alcohol ? parseFloat(product.alcohol.replace('%', '')) : 0
      
      // Parse SMV if available
      let smvNum = undefined
      if (product.smv) {
        smvNum = parseFloat(product.smv.replace('+', ''))
      }
      
      // Parse acidity if available
      let acidityNum = undefined
      if (product.acidity) {
        acidityNum = parseFloat(product.acidity)
      }
      
      // Parse RPR if available
      let rprNum = undefined
      if (product.rpr) {
        rprNum = parseFloat(product.rpr.replace('%', ''))
      }
      
      // Create Tippsy product entry with safe defaults
      const productId = await ctx.db.insert("tippsyProducts", {
        productName: product.productName,
        price: priceNum,
        size: product.size || "720 ml",
        description: product.description,
        brand: product.brand || "Unknown",
        brewery: product.brewery || "Unknown",
        category: product.category,
        subcategory: product.subcategory || undefined,
        tasteProfile: product.tasteProfile || "Balanced",
        riceVariety: product.riceVariety || undefined,
        yeastVariety: product.yeastVariety || undefined,
        alcohol: alcoholNum,
        rpr: rprNum,
        smv: smvNum,
        acidity: acidityNum,
        servingTemperature: product.servingTemperature || "Cold",
        region: product.region || "Japan",
        prefecture: product.prefecture || "Unknown",
        tastingNotes: product.tastingNotes,
        foodPairings: product.foodPairings,
        images: product.images,
        reviewCount: product.reviewCount || 0,
        averageRating: product.averageRating || 0,
        url: product.url,
        createdAt: Date.now(),
      })
      
      imported.push(productId)
    }
    
    return {
      imported: imported.length,
      ids: imported
    }
  },
})

// Get all Tippsy products for recommendations
export const getTippsyProducts = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("tippsyProducts")
      .collect()
  },
})

// Get sake recommendations based on preferences
export const getSakeRecommendations = mutation({
  args: {
    preferences: v.optional(v.object({
      category: v.optional(v.string()),
      priceRange: v.optional(v.object({
        min: v.number(),
        max: v.number(),
      })),
      tasteProfile: v.optional(v.string()),
      region: v.optional(v.string()),
    }))
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("tippsyProducts")
    
    if (args.preferences?.category) {
      query = query.filter((q) => q.eq(q.field("category"), args.preferences!.category))
    }
    
    if (args.preferences?.priceRange) {
      query = query.filter((q) => 
        q.and(
          q.gte(q.field("price"), args.preferences!.priceRange!.min),
          q.lte(q.field("price"), args.preferences!.priceRange!.max)
        )
      )
    }
    
    const products = await query.collect()
    
    // Filter by taste profile and region if specified
    let filtered = products
    
    if (args.preferences?.tasteProfile) {
      const profile = args.preferences.tasteProfile.toLowerCase()
      filtered = filtered.filter(p => 
        p.tasteProfile.toLowerCase().includes(profile)
      )
    }
    
    if (args.preferences?.region) {
      const region = args.preferences.region.toLowerCase()
      filtered = filtered.filter(p => 
        p.prefecture.toLowerCase().includes(region) ||
        p.region.toLowerCase().includes(region)
      )
    }
    
    // Sort by rating and return top 5
    return filtered
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 5)
  },
})

// Search Tippsy products by criteria
export const searchTippsyProducts = mutation({
  args: {
    query: v.optional(v.string()),
    category: v.optional(v.string()),
    priceRange: v.optional(v.object({
      min: v.number(),
      max: v.number(),
    })),
    tasteProfile: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let results = ctx.db.query("tippsyProducts")
    
    if (args.category) {
      results = results.filter((q) => q.eq(q.field("category"), args.category))
    }
    
    if (args.priceRange) {
      results = results.filter((q) => 
        q.and(
          q.gte(q.field("price"), args.priceRange!.min),
          q.lte(q.field("price"), args.priceRange!.max)
        )
      )
    }
    
    const products = await results.collect()
    
    // Filter by query text if provided
    if (args.query) {
      const query = args.query.toLowerCase()
      return products.filter(product => 
        product.productName.toLowerCase().includes(query) ||
        product.brewery.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.tastingNotes.some(note => note.toLowerCase().includes(query))
      )
    }
    
    return products
  },
})
