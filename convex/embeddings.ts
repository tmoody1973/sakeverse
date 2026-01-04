import { internalAction, internalMutation, internalQuery, mutation, query, action } from "./_generated/server"
import { internal } from "./_generated/api"
import { v } from "convex/values"

// Generate embeddings for all products (using action for fetch)
export const generateEmbeddings = internalAction({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.runQuery(internal.embeddings.getProductsWithoutEmbeddings)
    
    for (const product of products) {
      // Create comprehensive search text
      const searchText = [
        product.productName,
        product.brewery,
        product.category,
        product.subcategory || "",
        product.tasteProfile,
        product.description,
        product.region,
        product.prefecture,
        product.riceVariety || "",
        product.yeastVariety || "",
        ...product.tastingNotes,
        ...product.foodPairings,
        `$${product.price}`,
        product.price < 40 ? "affordable budget cheap" : "",
        product.price > 100 ? "premium expensive luxury" : "",
        product.alcohol > 16 ? "strong high alcohol" : "mild smooth",
      ].filter(Boolean).join(" ")
      
      try {
        // Generate embedding using OpenAI
        const response = await fetch("https://api.openai.com/v1/embeddings", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "text-embedding-ada-002",
            input: searchText,
          }),
        })
        
        if (!response.ok) {
          console.error(`OpenAI API error: ${response.status}`)
          continue
        }
        
        const data = await response.json()
        const embedding = data.data[0].embedding
        
        // Update product with embedding
        await ctx.runMutation(internal.embeddings.updateProductEmbedding, {
          productId: product._id,
          embedding,
          searchText,
        })
        
        console.log(`Generated embedding for: ${product.productName}`)
        
      } catch (error) {
        console.error(`Error generating embedding for ${product.productName}:`, error)
      }
    }
    
    return { message: "Embeddings generation complete" }
  },
})

// Helper queries and mutations
export const getProductsWithoutEmbeddings = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("tippsyProducts")
      .filter((q) => q.eq(q.field("embedding"), undefined))
      .collect()
  },
})

export const updateProductEmbedding = internalMutation({
  args: {
    productId: v.id("tippsyProducts"),
    embedding: v.array(v.float64()),
    searchText: v.string(),
  },
  handler: async (ctx, { productId, embedding, searchText }) => {
    await ctx.db.patch(productId, {
      embedding,
      searchText,
    })
  },
})

// Proper Convex vector search
export const semanticSearch: any = action({
  args: { 
    query: v.string(), 
    limit: v.optional(v.number()),
    priceRange: v.optional(v.object({
      min: v.number(),
      max: v.number(),
    })),
    category: v.optional(v.string()),
  },
  handler: async (ctx, { query, limit = 5, priceRange, category }): Promise<any> => {
    try {
      // Generate embedding for user query
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "text-embedding-ada-002",
          input: query,
        }),
      })
      
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }
      
      const data = await response.json()
      const embedding = data.data[0].embedding
      
      // Build filter for vector search
      let filter = undefined
      if (priceRange && category) {
        filter = (q: any) => q.and(
          q.gte("price", priceRange.min),
          q.lte("price", priceRange.max),
          q.eq("category", category)
        )
      } else if (priceRange) {
        filter = (q: any) => q.and(
          q.gte("price", priceRange.min),
          q.lte("price", priceRange.max)
        )
      } else if (category) {
        filter = (q: any) => q.eq("category", category)
      }
      
      // Perform vector search using Convex native API
      const results = await ctx.vectorSearch("tippsyProducts", "by_embedding", {
        vector: embedding,
        limit: limit * 2, // Get more for potential filtering
        filter
      })
      
      // Load the actual documents
      const products: any = await ctx.runQuery(internal.embeddings.fetchSearchResults, {
        ids: results.map(r => r._id)
      })
      
      return products.slice(0, limit)
      
    } catch (error) {
      console.error("Vector search error:", error)
      // Fallback to enhanced text search
      return await ctx.runMutation(internal.embeddings.textSearchFallback, {
        query,
        limit,
        priceRange,
        category
      })
    }
  },
})

// Helper to fetch search results
export const fetchSearchResults = internalQuery({
  args: { ids: v.array(v.id("tippsyProducts")) },
  handler: async (ctx, { ids }) => {
    const results = []
    for (const id of ids) {
      const product = await ctx.db.get(id)
      if (product) results.push(product)
    }
    return results
  },
})

// Text search fallback
export const textSearchFallback = internalMutation({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    priceRange: v.optional(v.object({
      min: v.number(),
      max: v.number(),
    })),
    category: v.optional(v.string()),
  },
  handler: async (ctx, { query, limit = 5, priceRange, category }) => {
    // Enhanced text search logic (same as before)
    const queryLower = query.toLowerCase()
    
    let results = await ctx.db.query("tippsyProducts").collect()
    
    // Score products based on text matching
    const scoredResults = results.map(product => {
      let score = 0
      
      if (product.productName.toLowerCase().includes(queryLower)) score += 10
      if (product.category.toLowerCase().includes(queryLower)) score += 8
      if (product.brewery.toLowerCase().includes(queryLower)) score += 6
      if (product.description.toLowerCase().includes(queryLower)) score += 4
      if (product.tasteProfile.toLowerCase().includes(queryLower)) score += 5
      
      product.tastingNotes.forEach(note => {
        if (note.toLowerCase().includes(queryLower)) score += 3
      })
      
      if (queryLower.includes("budget") && product.price < 50) score += 5
      if (queryLower.includes("premium") && product.price > 100) score += 5
      if (queryLower.includes("beginner") && product.category === "Junmai") score += 5
      
      return { product, score }
    })
    
    let filteredResults = scoredResults.filter(r => r.score > 0)
    
    if (priceRange) {
      filteredResults = filteredResults.filter(r => 
        r.product.price >= priceRange.min && r.product.price <= priceRange.max
      )
    }
    
    if (category) {
      filteredResults = filteredResults.filter(r => 
        r.product.category.toLowerCase().includes(category.toLowerCase())
      )
    }
    
    return filteredResults
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => r.product)
  },
})

// Check embedding status
export const getEmbeddingStatus = query({
  args: {},
  handler: async (ctx) => {
    const total = await ctx.db.query("tippsyProducts").collect()
    const withEmbeddings = total.filter(p => p.embedding)
    
    return {
      total: total.length,
      withEmbeddings: withEmbeddings.length,
      percentage: Math.round((withEmbeddings.length / total.length) * 100)
    }
  },
})
