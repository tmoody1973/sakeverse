import { internalAction, internalMutation, action } from "./_generated/server"
import { internal } from "./_generated/api"
import { v } from "convex/values"

// Wine-to-Sake knowledge chunks (pre-chunked for RAG)
const WINE_SAKE_CHUNKS = [
  {
    topic: "Light White Wine to Sake",
    keywords: ["Sauvignon Blanc", "Pinot Grigio", "light white wine", "Junmai Ginjo", "Junmai Daiginjo", "crisp", "dry", "aromatic"],
    content: `Wine Preference: Light-bodied, crisp white wines (e.g., Sauvignon Blanc, Pinot Grigio).
Sake Recommendation: Junmai Ginjo or Junmai Daiginjo.
Reasoning: These sakes are typically light, aromatic, and have a clean, crisp finish, similar to the experience of drinking a refreshing white wine. They often have fruity notes of green apple, melon, and pear.`,
    category: "wine-to-sake"
  },
  {
    topic: "Full White Wine to Sake",
    keywords: ["Chardonnay", "Viognier", "full-bodied white wine", "Junmai", "Kimoto", "Yamahai", "rich", "savory", "umami"],
    content: `Wine Preference: Full-bodied, rich white wines (e.g., Chardonnay, Viognier).
Sake Recommendation: Junmai or Kimoto/Yamahai.
Reasoning: These sakes have a fuller body and a more savory, umami-rich flavor profile that can appeal to drinkers of oaked Chardonnay. Kimoto and Yamahai methods produce even richer, more complex, and sometimes slightly funky flavors.`,
    category: "wine-to-sake"
  },
  {
    topic: "Light Red Wine to Sake - Pinot Noir",
    keywords: ["Pinot Noir", "Gamay", "light red wine", "Koshu", "aged sake", "Junmai", "earthy", "savory"],
    content: `Wine Preference: Light-bodied, low-tannin red wines (e.g., Pinot Noir, Gamay).
Sake Recommendation: Koshu (aged sake) or a well-balanced Junmai.
Reasoning: Koshu, with its sherry-like notes of nuts and caramel, can appeal to those who enjoy the earthy and sometimes savory notes of Pinot Noir. A well-balanced Junmai can also offer a satisfying richness without being overpowering.`,
    category: "wine-to-sake"
  },
  {
    topic: "Full Red Wine to Sake",
    keywords: ["Cabernet Sauvignon", "Syrah", "full-bodied red wine", "Yamahai", "Kimoto Junmai", "robust", "umami", "earthy"],
    content: `Wine Preference: Full-bodied, high-tannin red wines (e.g., Cabernet Sauvignon, Syrah).
Sake Recommendation: Yamahai or Kimoto Junmai.
Reasoning: These traditional methods produce robust, full-bodied sakes with higher acidity and umami. Their earthy, sometimes gamy, and savory notes can be a good match for those who appreciate the bold, complex flavors of a full-bodied red wine.`,
    category: "wine-to-sake"
  },
  {
    topic: "Sweet Dessert Wine to Sake",
    keywords: ["Riesling", "Moscato", "Sauternes", "dessert wine", "Nigori", "Koshu", "sweet", "creamy", "aged"],
    content: `Wine Preference: Sweet/Dessert Wines (e.g., Riesling, Moscato, Sauternes).
Sake Recommendation: Nigori or Koshu.
Reasoning: Nigori sake is coarsely filtered, leaving some rice sediment, which gives it a creamy texture and a gentle sweetness. Koshu, with its rich, sweet, and savory notes of dried fruit, caramel, and soy sauce, can be a fascinating alternative to a complex dessert wine.`,
    category: "wine-to-sake"
  },
  {
    topic: "Sparkling Wine to Sake",
    keywords: ["Champagne", "Prosecco", "sparkling wine", "sparkling sake", "carbonated", "celebratory"],
    content: `Wine Preference: Sparkling Wines (e.g., Champagne, Prosecco).
Sake Recommendation: Sparkling Sake.
Reasoning: This is the most direct comparison. Sparkling sake is made in a similar way to sparkling wine, with a secondary fermentation in the bottle to create carbonation. It can range from sweet to dry and offers a similar celebratory and refreshing experience.`,
    category: "wine-to-sake"
  },
  {
    topic: "Rosé Wine to Sake",
    keywords: ["Rosé wine", "rosé sake", "red sake", "cherry", "plum"],
    content: `Wine Preference: Rosé Wines.
Sake Recommendation: Rosé Sake or Red Sake.
Reasoning: Rosé sake gets its color from a special type of red yeast. These sakes often have notes of cherry and plum, with a balance of sweetness and acidity that will be familiar to rosé wine drinkers. Red sake, made with black rice, offers a unique and flavorful alternative.`,
    category: "wine-to-sake"
  },
  {
    topic: "Earthy Savory Wine to Sake",
    keywords: ["Italian reds", "French whites", "earthy wine", "savory wine", "Kimoto", "Yamahai", "umami", "mushroom", "soy sauce"],
    content: `Wine Preference: Earthy, savory wines (e.g., Italian reds, some French whites).
Sake Recommendation: Kimoto or Yamahai.
Reasoning: These traditional methods create sakes with a rich, umami-driven flavor profile. They can have notes of mushroom, soy sauce, and grain, which will appeal to those who enjoy savory and earthy wines.`,
    category: "wine-to-sake"
  },
  {
    topic: "Sherry to Sake",
    keywords: ["Sherry", "Koshu", "aged sake", "nutty", "caramelized", "soy sauce"],
    content: `Wine Preference: Sherry.
Sake Recommendation: Koshu (aged sake).
Reasoning: Koshu develops nutty, caramelized, and soy sauce-like flavors through aging, which are very similar to the flavors found in many sherries. This makes it an excellent and intriguing alternative.`,
    category: "wine-to-sake"
  },
  {
    topic: "Port to Sake",
    keywords: ["Port", "sweet Nigori", "Koshu", "creamy", "sweet", "dried fruit", "spice"],
    content: `Wine Preference: Port.
Sake Recommendation: Sweet Nigori or Koshu.
Reasoning: A sweet, rich Nigori can offer a similar creamy texture and sweetness to a Ruby Port. A complex Koshu can provide a flavor experience reminiscent of a Tawny Port, with its notes of dried fruit, nuts, and spice.`,
    category: "wine-to-sake"
  },
  {
    topic: "Burgundy to Sake",
    keywords: ["Burgundy", "Pinot Noir", "elegant", "earthy", "Junmai", "Koshu", "aged sake"],
    content: `Wine Preference: Burgundy (Pinot Noir from Burgundy region).
Sake Recommendation: Koshu (aged sake) or elegant Junmai Ginjo.
Reasoning: Burgundy lovers appreciate elegance, earthiness, and complexity. Koshu offers similar earthy, nutty complexity while a refined Junmai Ginjo provides the elegance and subtle fruit notes that Burgundy enthusiasts enjoy.`,
    category: "wine-to-sake"
  },
  {
    topic: "Wine Characteristics Overview",
    keywords: ["wine", "characteristics", "body", "acidity", "sweetness", "tannin"],
    content: `Key Wine Characteristics:
- Body: The perceived weight and texture in the mouth (light, medium, full-bodied)
- Acidity: Tartness or sourness providing freshness and structure (low, medium, high)
- Sweetness: Level of residual sugar (bone-dry to very sweet)
- Tannin: Compound in red wines creating drying sensation (low, medium, high)`,
    category: "wine-to-sake"
  },
  {
    topic: "Sake Characteristics Overview",
    keywords: ["sake", "characteristics", "body", "acidity", "sweetness", "dryness", "polishing ratio", "SMV", "Nihonshudo"],
    content: `Key Sake Characteristics:
- Body: Similar to wine, sake can be light, medium, or full-bodied
- Acidity: Contributes to crispness and structure, balances sweetness
- Sweetness/Dryness: Measured by Sake Meter Value (SMV/Nihonshudo). Positive = drier, Negative = sweeter
- Polishing Ratio: Percentage of rice remaining after polishing. Lower ratio (e.g., 50%) = more refined, aromatic (Daiginjo). Higher ratio = more robust, rice-forward (Junmai)
- Aromatics: Range from fruity/floral (ginjo-ka) to savory/earthy`,
    category: "wine-to-sake"
  }
]

// Import wine-to-sake knowledge chunks
export const importWineToSakeKnowledge = internalAction({
  args: {},
  handler: async (ctx) => {
    const openaiKey = process.env.OPENAI_API_KEY
    if (!openaiKey) {
      throw new Error("OPENAI_API_KEY not found")
    }

    let imported = 0
    
    for (const chunk of WINE_SAKE_CHUNKS) {
      try {
        // Generate embedding for the chunk
        const embeddingText = `${chunk.topic} ${chunk.keywords.join(" ")} ${chunk.content}`
        
        const response = await fetch("https://api.openai.com/v1/embeddings", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openaiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "text-embedding-ada-002",
            input: embeddingText,
          }),
        })
        
        if (!response.ok) {
          console.error(`OpenAI API error: ${response.status}`)
          continue
        }
        
        const data = await response.json()
        const embedding = data.data[0].embedding
        
        // Store the chunk with embedding
        await ctx.runMutation(internal.wineToSake.storeKnowledgeChunk, {
          topic: chunk.topic,
          keywords: chunk.keywords,
          content: chunk.content,
          category: chunk.category,
          source: "RAG-Optimized Guide: Wine to Sake Preferences",
          embedding,
        })
        
        imported++
        console.log(`Imported: ${chunk.topic}`)
        
      } catch (error) {
        console.error(`Error importing ${chunk.topic}:`, error)
      }
    }
    
    return { message: `Imported ${imported} wine-to-sake knowledge chunks` }
  },
})

// Store a knowledge chunk
export const storeKnowledgeChunk = internalMutation({
  args: {
    topic: v.string(),
    keywords: v.array(v.string()),
    content: v.string(),
    category: v.string(),
    source: v.string(),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    // Check if chunk already exists
    const existing = await ctx.db
      .query("knowledgeChunks")
      .withIndex("by_topic", (q) => q.eq("topic", args.topic))
      .first()
    
    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        ...args,
        createdAt: existing.createdAt,
      })
      return existing._id
    }
    
    // Create new
    return await ctx.db.insert("knowledgeChunks", {
      ...args,
      createdAt: Date.now(),
    })
  },
})

// Search wine-to-sake knowledge
export const searchWineToSake = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { query, limit = 3 }): Promise<any[]> => {
    const openaiKey = process.env.OPENAI_API_KEY
    if (!openaiKey) {
      throw new Error("OPENAI_API_KEY not found")
    }

    try {
      // Generate embedding for query
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiKey}`,
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
      
      // Vector search on knowledge chunks
      const results = await ctx.vectorSearch("knowledgeChunks", "by_embedding", {
        vector: embedding,
        limit,
        filter: (q) => q.eq("category", "wine-to-sake")
      })
      
      // Fetch full documents
      const chunks: any[] = await ctx.runQuery(internal.wineToSake.fetchChunks, {
        ids: results.map(r => r._id)
      })
      
      return chunks
      
    } catch (error) {
      console.error("Wine-to-sake search error:", error)
      return []
    }
  },
})

// Fetch chunks by IDs
import { internalQuery } from "./_generated/server"

export const fetchChunks = internalQuery({
  args: { ids: v.array(v.id("knowledgeChunks")) },
  handler: async (ctx, { ids }) => {
    const results = []
    for (const id of ids) {
      const chunk = await ctx.db.get(id)
      if (chunk) results.push(chunk)
    }
    return results
  },
})
