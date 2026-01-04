import { mutation, action, internalQuery } from "./_generated/server"
import { internal } from "./_generated/api"
import { v } from "convex/values"

// Import food pairing knowledge chunks
export const importFoodPairingKnowledge = mutation({
  args: {},
  handler: async (ctx) => {
    const chunks = [
      {
        topic: "Core Pairing Principles",
        keywords: ["sake pairing rules", "how to pair sake", "umami", "acidity", "food pairing basics", "complementary", "contrasting"],
        content: `Sake is exceptionally food-friendly due to its unique chemical composition. Unlike wine, sake has low acidity and no tannins, preventing metallic or bitter flavors with seafood. The key is its high concentration of amino acids, particularly glutamate (umami).

Two primary pairing approaches:
- COMPLEMENTARY: Match similar characteristics. Light sakes with lighter dishes, rich sakes with heavier dishes.
- CONTRASTING: Create balance with opposites. Crisp dry sake cuts through fried foods, sweet sake tempers spicy dishes.

General rule: If a food pairs well with steamed rice, it will pair well with sake.`,
        source: "RAG-Optimized Guide: Pairing Sake with Food",
        category: "food-pairing",
      },
      {
        topic: "Sake Styles for Food Pairing",
        keywords: ["sake types", "Junmai", "Ginjo", "Daiginjo", "Honjozo", "Nigori", "Kimoto", "Yamahai", "Koshu", "food affinity"],
        content: `Sake Style Food Pairing Guide:
- JUNMAI: Rich, savory, umami-driven → Earthy dishes, grilled meats, stews, cheese, mushrooms
- GINJO/DAIGINJO: Aromatic, fruity, floral → Light seafood, salads, sashimi, steamed vegetables
- HONJOZO: Light, crisp, versatile → Tempura, noodles, lightly seasoned dishes
- NIGORI: Cloudy, creamy, sweet → Spicy foods (Thai, Indian), rich desserts, creamy dishes
- KIMOTO/YAMAHAI: Complex, earthy, higher acidity → Fried chicken, steak, aged cheese, game meats
- KOSHU (Aged): Nutty, caramelized, sherry-like → Foie gras, strong cheese, chocolate, pâté
- SPARKLING: Bubbly, refreshing → Aperitifs, fried foods, fruit salads, light desserts`,
        source: "RAG-Optimized Guide: Pairing Sake with Food",
        category: "food-pairing",
      },
      {
        topic: "Fried Chicken Pairing",
        keywords: ["fried chicken", "karaage", "crispy chicken", "fried food", "southern fried"],
        content: `Pairing Goal: Cut through richness and complement savory flavors.

Best Sake Styles for Fried Chicken:
- KIMOTO/YAMAHAI: Higher acidity and robust, earthy flavor stands up to richness. Complexity complements savory notes of meat and crispy skin.
- HONJOZO: Crisp and dry, acts as palate cleanser, cutting through oiliness.
- SPARKLING SAKE: Carbonation provides palate-cleansing effect like beer or champagne.

Example: Southern-style fried chicken → Yamahai Junmai (earthy notes connect with herbs, acidity cuts richness)
Japanese karaage → Crisp Honjozo (classic effective choice)`,
        source: "RAG-Optimized Guide: Pairing Sake with Food",
        category: "food-pairing",
      },
      {
        topic: "Grilled Meats and BBQ Pairing",
        keywords: ["steak", "barbecue", "BBQ", "grilled meat", "yakitori", "burgers", "ribeye"],
        content: `Pairing Goal: Match smoky, robust flavors of the meat.

Best Sake Styles for Grilled Meats:
- JUNMAI: Full-bodied, especially served warm (nurukan), brings out savory umami of grilled steak or yakitori.
- KIMOTO/YAMAHAI: Robust and earthy character fits smoky barbecue flavors. Stands up to bold sauces.
- GENSHU (Undiluted): Higher alcohol and intense flavor for strongly flavored BBQ ribs or seasoned burgers.

Example: Grilled ribeye with soy and garlic → Room-temperature Junmai (umami amplifies seasoning)
Sweet smoky BBQ pork → Bold Yamahai (earthy counterpoint)`,
        source: "RAG-Optimized Guide: Pairing Sake with Food",
        category: "food-pairing",
      },
      {
        topic: "Spicy Food Pairing",
        keywords: ["spicy food", "Thai curry", "Indian curry", "Szechuan", "kimchi", "hot sauce", "chili"],
        content: `Pairing Goal: Tame the heat and complement aromatic spices.

Best Sake Styles for Spicy Food:
- NIGORI: Classic pairing! Creamy, cloudy texture and gentle sweetness coat palate, providing relief from chili heat. Perfect with Thai green curry or spicy Indian dishes.
- FRUITY GINJO: Prominent fruity notes (melon, pear, banana) with slightly off-dry profile balance heat and complement aromatic spices.
- LOW-ALCOHOL SAKE: Better for spicy food as high alcohol amplifies capsaicin burning sensation.

Example: Thai green curry → Chilled sweet Nigori (creamy sweetness soothes heat, complements coconut)
Spicy Korean kimchi → Fruity Junmai Ginjo (refreshing contrast)`,
        source: "RAG-Optimized Guide: Pairing Sake with Food",
        category: "food-pairing",
      },
      {
        topic: "Cheese and Charcuterie Pairing",
        keywords: ["cheese", "charcuterie", "cured meat", "prosciutto", "salami", "cheddar", "brie", "blue cheese"],
        content: `Pairing Goal: Complement salty, creamy, and funky flavors.

Sake and cheese are surprisingly perfect - both contain high lactic acid creating natural harmony. No tannins means no clash with cheese fats.

Best Sake Styles:
- JUNMAI: Savory, rice-forward notes versatile for hard cheeses (cheddar, Comté) and cured meats (prosciutto).
- KOSHU (Aged): Nutty, sherry-like notes phenomenal with strong blue cheeses and rich pâté.
- KIMOTO/YAMAHAI: Earthy, funky notes stand up to washed-rind cheeses and flavorful salamis.
- FRUITY GINJO: Delightful contrast to fresh soft cheeses like goat cheese or brie.

Example: Aged cheddar, prosciutto, walnuts → Room-temperature Junmai
Bold Stilton or Roquefort → Slightly chilled Koshu (unforgettable!)`,
        source: "RAG-Optimized Guide: Pairing Sake with Food",
        category: "food-pairing",
      },
      {
        topic: "Seafood Pairing",
        keywords: ["seafood", "fish", "sashimi", "oysters", "shrimp", "lobster", "grilled fish", "raw fish"],
        content: `Pairing Goal: Enhance umami and complement delicate flavors without off-notes.

Sake is arguably THE BEST beverage for seafood. Low iron content and no tannins prevent metallic taste with fish. Umami creates powerful synergy with shellfish.

Best Sake Styles:
- DAIGINJO/GINJO: For delicate raw fish (sashimi, crudo) - clean, fragrant, elegant. Enhances subtle sweetness without overpowering.
- DRY JUNMAI: For oysters and briny shellfish - good minerality. Umami bonds with amino acids creating richer flavor.
- HONJOZO: For cooked fish (grilled sea bass, tempura shrimp) - crisp, clean palate cleanser.

Example: Raw oysters → Crisp mineral-driven Junmai (classic sublime pairing)
Fatty tuna (toro) sashimi → Aromatic Junmai Daiginjo (cuts richness, complements delicate flavor)`,
        source: "RAG-Optimized Guide: Pairing Sake with Food",
        category: "food-pairing",
      },
      {
        topic: "Pizza and Pasta Pairing",
        keywords: ["pizza", "pasta", "Italian food", "tomato sauce", "cheese", "margherita", "carbonara"],
        content: `Pairing Goal: Complement umami of cheese and tomatoes, balance acidity.

Pizza and pasta with umami-rich cheese and tomatoes are surprisingly great sake partners!

Best Sake Styles:
- JUNMAI: Fantastic all-rounder! Inherent umami complements tomato sauce and cheese. Some earthy Junmai have mushroom/fennel notes - "Pizza Sake."
- KIMOTO/YAMAHAI: For rich creamy pasta (Carbonara, Alfredo) - higher acidity cuts richness, provides balancing earthiness.
- SPARKLING SAKE: For simple Margherita - bubbles and slight sweetness provide refreshing fun contrast.

Example: Classic pepperoni pizza → Robust room-temperature Junmai (matches intensity)
Creamy mushroom pasta → Complex Kimoto (enhances earthy mushroom flavors)`,
        source: "RAG-Optimized Guide: Pairing Sake with Food",
        category: "food-pairing",
      },
      {
        topic: "Desserts and Vegetables Pairing",
        keywords: ["dessert", "chocolate", "fruit", "cake", "vegetables", "salad", "roasted vegetables"],
        content: `Sake's versatility extends to both vegetables and desserts!

DESSERTS:
- KOSHU (Aged): Rich, nutty, caramelized notes perfect for chocolate, caramel, nut-based desserts. Like fine dessert wine.
- SWEET NIGORI: Can act as dessert itself or pair with fruit tarts, creamy puddings.
- UMESHU (Plum Sake): Sweet and tart, excellent with fruit-based desserts.

VEGETABLES/SALADS:
- FRUITY GINJO: Subtle sweetness and fruity notes balance vinaigrette acidity, softening sourness.
- JUNMAI: For roasted/grilled vegetables - earthy savory notes complement caramelized flavors.

Example: Dark chocolate torte → Koshu (luxurious decadent experience)
Green salad with citrus vinaigrette → Light fruity Junmai Ginjo (refreshing complementary)`,
        source: "RAG-Optimized Guide: Pairing Sake with Food",
        category: "food-pairing",
      },
    ]

    let imported = 0
    for (const chunk of chunks) {
      // Check if already exists
      const existing = await ctx.db
        .query("knowledgeChunks")
        .withIndex("by_topic", (q) => q.eq("topic", chunk.topic))
        .first()
      
      if (!existing) {
        await ctx.db.insert("knowledgeChunks", {
          ...chunk,
          createdAt: Date.now(),
        })
        imported++
      }
    }

    return { success: true, imported, total: chunks.length }
  },
})


// Search food pairing knowledge
export const searchFoodPairing = action({
  args: { 
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { query, limit = 3 }): Promise<any[]> => {
    try {
      // Generate embedding for query
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
      
      if (!response.ok) throw new Error("Embedding API error")
      
      const data = await response.json()
      const embedding = data.data[0].embedding
      
      // Vector search on knowledge chunks
      const results = await ctx.vectorSearch("knowledgeChunks", "by_embedding", {
        vector: embedding,
        limit: limit * 2,
        filter: (q: any) => q.eq("category", "food-pairing"),
      })
      
      // Fetch full documents
      const chunks: any[] = await ctx.runQuery(internal.foodPairing.fetchFoodPairingChunks, {
        ids: results.map(r => r._id)
      })
      
      // Parse content into structured format
      return chunks.slice(0, limit).map((chunk: any) => ({
        topic: chunk.topic,
        pairingGoal: extractPairingGoal(chunk.content),
        bestStyles: extractBestStyles(chunk.content),
        examplePairings: extractExamples(chunk.content),
        content: chunk.content,
      }))
      
    } catch (error) {
      console.error("Food pairing search error:", error)
      // Fallback to keyword search
      return await ctx.runQuery(internal.foodPairing.keywordSearchFoodPairing, { query, limit })
    }
  },
})

// Helper to fetch chunks by ID
export const fetchFoodPairingChunks = internalQuery({
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

// Keyword fallback search
export const keywordSearchFoodPairing = internalQuery({
  args: { query: v.string(), limit: v.number() },
  handler: async (ctx, { query, limit }) => {
    const chunks = await ctx.db
      .query("knowledgeChunks")
      .filter((q) => q.eq(q.field("category"), "food-pairing"))
      .collect()
    
    const queryLower = query.toLowerCase()
    const matches = chunks.filter(chunk => 
      chunk.keywords.some((k: string) => k.toLowerCase().includes(queryLower)) ||
      chunk.topic.toLowerCase().includes(queryLower) ||
      chunk.content.toLowerCase().includes(queryLower)
    )
    
    return matches.slice(0, limit).map(chunk => ({
      topic: chunk.topic,
      pairingGoal: extractPairingGoal(chunk.content),
      bestStyles: extractBestStyles(chunk.content),
      examplePairings: extractExamples(chunk.content),
      content: chunk.content,
    }))
  },
})

// Helper functions to parse content
function extractPairingGoal(content: string): string {
  const match = content.match(/Pairing Goal:\s*([^\n]+)/i)
  return match ? match[1].trim() : "Match intensity and complement flavors"
}

function extractBestStyles(content: string): string[] {
  const styles: string[] = []
  const lines = content.split('\n')
  for (const line of lines) {
    if (line.match(/^-\s*(JUNMAI|GINJO|DAIGINJO|HONJOZO|NIGORI|KIMOTO|YAMAHAI|KOSHU|SPARKLING)/i)) {
      const match = line.match(/^-\s*([^:]+)/)
      if (match) styles.push(match[1].trim())
    }
  }
  return styles.length > 0 ? styles : ["Junmai", "Ginjo"]
}

function extractExamples(content: string): string {
  const match = content.match(/Example:\s*([^\n]+)/i)
  return match ? match[1].trim() : ""
}
