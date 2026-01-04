import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

// Import breweries from JSON data
export const importBreweries = mutation({
  args: {
    breweries: v.array(v.any())
  },
  handler: async (ctx, { breweries }) => {
    let imported = 0
    
    for (const b of breweries) {
      // Check if already exists
      const existing = await ctx.db
        .query("sakeBreweries")
        .withIndex("by_name", (q) => q.eq("breweryName", b.brewery_name))
        .first()
      
      if (!existing) {
        await ctx.db.insert("sakeBreweries", {
          breweryName: b.brewery_name || "Unknown",
          japaneseName: b.japanese_name || undefined,
          prefecture: b.prefecture || "Unknown",
          region: b.region || "Unknown",
          address: b.address || undefined,
          phone: b.phone || undefined,
          website: b.website || undefined,
          foundationYear: b.foundation_year || undefined,
          mainBrands: b.main_brands || [],
          productsCount: b.products_count,
          sakeTypesProduced: b.sake_types_produced,
          riceVarietiesUsed: b.rice_varieties_used,
          description: b.description || b.history || undefined,
          createdAt: Date.now(),
        })
        imported++
      }
    }
    
    return { success: true, imported, total: breweries.length }
  },
})

// Get all breweries
export const getAllBreweries = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("sakeBreweries").collect()
  },
})

// Get breweries by prefecture
export const getBreweriesByPrefecture = query({
  args: { prefecture: v.string() },
  handler: async (ctx, { prefecture }) => {
    return await ctx.db
      .query("sakeBreweries")
      .withIndex("by_prefecture", (q) => q.eq("prefecture", prefecture))
      .collect()
  },
})

// Get breweries by region
export const getBreweriesByRegion = query({
  args: { region: v.string() },
  handler: async (ctx, { region }) => {
    return await ctx.db
      .query("sakeBreweries")
      .withIndex("by_region", (q) => q.eq("region", region))
      .collect()
  },
})

// Search breweries by name
export const searchBreweries = query({
  args: { query: v.string() },
  handler: async (ctx, { query }) => {
    const all = await ctx.db.query("sakeBreweries").collect()
    const q = query.toLowerCase()
    return all.filter(b => 
      b.breweryName.toLowerCase().includes(q) ||
      b.japaneseName?.toLowerCase().includes(q) ||
      b.mainBrands.some(brand => brand.toLowerCase().includes(q))
    )
  },
})
