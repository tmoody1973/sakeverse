import { query } from "./_generated/server"
import { v } from "convex/values"

// Map wine preferences to sake characteristics
const wineToSakeStyle: Record<string, { categories: string[]; tastes: string[] }> = {
  "Pinot Noir": { categories: ["Junmai"], tastes: ["earthy", "umami", "smooth"] },
  "Chardonnay": { categories: ["Junmai", "Junmai Ginjo"], tastes: ["rich", "full-bodied", "creamy"] },
  "Cabernet": { categories: ["Junmai"], tastes: ["bold", "robust", "dry"] },
  "Sauvignon Blanc": { categories: ["Junmai Ginjo", "Ginjo"], tastes: ["crisp", "refreshing", "light"] },
  "Riesling": { categories: ["Nigori", "Junmai"], tastes: ["fruity", "sweet", "aromatic"] },
  "Champagne": { categories: ["Sparkling"], tastes: ["bubbly", "celebratory", "crisp"] },
  "Rosé": { categories: ["Junmai Ginjo", "Ginjo"], tastes: ["floral", "delicate", "light"] },
}

export const getPersonalizedRecommendations = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    // Get user preferences
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first()
    
    if (!user) return []
    
    const winePrefs = user.preferences?.winePreferences || []
    const foodPrefs = user.preferences?.foodPreferences || []
    const tastePrefs = user.preferences?.tastePreferences
    
    // Build preferred categories and keywords
    const preferredCategories = new Set<string>()
    const preferredKeywords = new Set<string>()
    
    // From wine preferences
    for (const wine of winePrefs) {
      const style = wineToSakeStyle[wine]
      if (style) {
        style.categories.forEach(c => preferredCategories.add(c))
        style.tastes.forEach(t => preferredKeywords.add(t.toLowerCase()))
      }
    }
    
    // From taste preferences (numeric sliders)
    if (tastePrefs) {
      if (tastePrefs.sweetness > 3) preferredKeywords.add("sweet")
      if (tastePrefs.sweetness < 2) preferredKeywords.add("dry")
      if (tastePrefs.acidity > 3) preferredKeywords.add("crisp")
      if (tastePrefs.richness > 3) {
        preferredKeywords.add("rich")
        preferredCategories.add("Junmai")
      }
      if (tastePrefs.richness < 2) {
        preferredKeywords.add("light")
        preferredCategories.add("Ginjo")
      }
      if (tastePrefs.umami > 3) {
        preferredKeywords.add("umami")
        preferredCategories.add("Junmai")
      }
    }
    
    // Default if no preferences
    if (preferredCategories.size === 0) {
      preferredCategories.add("Junmai")
      preferredCategories.add("Junmai Ginjo")
    }
    
    // Get all products
    const allProducts = await ctx.db.query("tippsyProducts").collect()
    
    // Score each product
    const scored = allProducts.map(product => {
      let score = 0
      
      // Category match
      if (preferredCategories.has(product.category)) score += 10
      if (product.subcategory && preferredCategories.has(product.subcategory)) score += 5
      
      // Keyword match in description/taste profile
      const text = `${product.description} ${product.tasteProfile} ${product.tastingNotes.join(" ")}`.toLowerCase()
      for (const keyword of preferredKeywords) {
        if (text.includes(keyword)) score += 3
      }
      
      // Food pairing match
      for (const food of foodPrefs) {
        if (product.foodPairings.some(p => p.toLowerCase().includes(food.toLowerCase()))) {
          score += 5
        }
      }
      
      // Boost highly rated products
      if (product.averageRating >= 4.5) score += 3
      if (product.averageRating >= 4.0) score += 1
      
      // Add randomness for daily variety (based on date)
      const today = new Date().toDateString()
      const hash = (product._id + today).split("").reduce((a, b) => a + b.charCodeAt(0), 0)
      score += (hash % 5)
      
      return { product, score }
    })
    
    // Sort by score and return top 4
    scored.sort((a, b) => b.score - a.score)
    
    return scored.slice(0, 4).map(s => ({
      _id: s.product._id,
      productName: s.product.productName,
      brand: s.product.brand,
      category: s.product.category,
      price: s.product.price,
      image: s.product.images[0] || null,
      tasteProfile: s.product.tasteProfile,
      url: s.product.url,
    }))
  },
})
