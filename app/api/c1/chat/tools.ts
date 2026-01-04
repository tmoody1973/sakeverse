import type { RunnableToolFunctionWithParse } from "openai/lib/RunnableFunction.mjs"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

// Tool definitions that query the real Tippsy database
export const tools: RunnableToolFunctionWithParse<any>[] = [
  {
    type: "function",
    function: {
      name: "search_sake_products",
      description: "Search the sake product catalog. Use when user wants to buy, try, or get specific sake recommendations. Returns products with images and purchase links.",
      parse: (input: string) => JSON.parse(input),
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query for sake" },
          maxPrice: { type: "number", description: "Maximum price in dollars" },
          category: { type: "string", description: "Sake category like Junmai, Ginjo, Daiginjo" },
        },
        required: ["query"],
      },
      function: async ({ query, maxPrice, category }: { query: string; maxPrice?: number; category?: string }) => {
        try {
          const products = await convex.action(api.embeddings.semanticSearch, {
            query,
            limit: 5,
            priceRange: maxPrice ? { min: 0, max: maxPrice } : undefined,
            category,
          })
          
          const formatted = products.map((p: any) => ({
            name: p.productName,
            brewery: p.brewery,
            price: p.price,
            category: p.category,
            region: p.prefecture || p.region,
            image: p.imageUrl,
            url: p.productUrl,
            description: p.tasteProfile || p.description,
          }))
          
          return JSON.stringify({ 
            products: formatted.slice(0, 3), 
            query,
            displayInstructions: "Show each product as a card with image, name, brewery, price, description. Include TWO buttons: 'View on Tippsy' (links to URL) and 'Save to Library' (calls save_to_library)."
          })
        } catch (error) {
          console.error("Search error:", error)
          return JSON.stringify({ products: [], query, error: "Search temporarily unavailable" })
        }
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "save_to_library",
      description: "Save a sake to the user's personal library/wishlist. Use when user wants to save, bookmark, or remember a sake for later.",
      parse: (input: string) => JSON.parse(input),
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Sake name" },
          brewery: { type: "string", description: "Brewery name" },
          price: { type: "number", description: "Price in dollars" },
          category: { type: "string", description: "Sake category" },
          region: { type: "string", description: "Region/prefecture" },
          image: { type: "string", description: "Image URL" },
          url: { type: "string", description: "Tippsy product URL" },
        },
        required: ["name", "brewery", "price", "category", "region", "image", "url"],
      },
      function: async (sake: any) => {
        return JSON.stringify({ 
          action: "save_to_library",
          sake,
          message: `${sake.name} has been saved to your library! You can view your saved sake anytime by asking "show my library" or visiting the Library page.`
        })
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "get_user_library",
      description: "Get the user's saved sake library. Use when user asks to see their saved sake, library, wishlist, or bookmarks.",
      parse: (input: string) => JSON.parse(input),
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
      function: async () => {
        return JSON.stringify({ 
          action: "get_library",
          displayInstructions: "Display the user's saved sake as cards with images. If empty, suggest some sake to save."
        })
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "get_wine_to_sake_recommendation",
      description: "Translate wine preferences to sake. Use when user mentions wine types like Pinot Noir, Chardonnay, Burgundy.",
      parse: (input: string) => JSON.parse(input),
      parameters: {
        type: "object",
        properties: {
          wineType: { type: "string", description: "The wine type the user enjoys" },
        },
        required: ["wineType"],
      },
      function: async ({ wineType }: { wineType: string }) => {
        try {
          // Query wine-to-sake knowledge from Convex
          const results = await convex.action(api.wineToSake.searchWineToSake, { query: wineType, limit: 1 })
          
          if (results.length > 0) {
            const match = results[0]
            // Also get matching products from database
            const products = await convex.action(api.embeddings.semanticSearch, {
              query: `${match.sakeRecommendation} ${match.sakeCharacteristics}`,
              limit: 2,
            })
            
            const formatted = products.map((p: any) => ({
              name: p.productName,
              price: p.price,
              image: p.imageUrl,
              url: p.productUrl,
            }))
            
            return JSON.stringify({
              wineType,
              recommendation: match.sakeRecommendation,
              reasoning: match.whyItWorks,
              temperature: match.servingTemperature,
              products: formatted,
              displayInstructions: "Show the recommendation with reasoning, then display product cards with images and 'View on Tippsy' links."
            })
          }
          
          // Fallback for unknown wine types
          return JSON.stringify({ 
            wineType, 
            recommendation: "Junmai Ginjo", 
            reasoning: "Versatile choice for wine lovers - aromatic and balanced",
            temperature: "Chilled to room temp",
            products: []
          })
        } catch (error) {
          console.error("Wine-to-sake error:", error)
          return JSON.stringify({ wineType, recommendation: "Junmai Ginjo", reasoning: "Versatile choice for wine lovers" })
        }
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "get_sake_knowledge",
      description: "Get educational info about sake brewing, history, regions. Use for how/what/why questions.",
      parse: (input: string) => JSON.parse(input),
      parameters: {
        type: "object",
        properties: {
          topic: { type: "string", description: "The sake topic to learn about" },
        },
        required: ["topic"],
      },
      function: async ({ topic }: { topic: string }) => {
        const geminiKey = process.env.GEMINI_API_KEY
        if (!geminiKey) return JSON.stringify({ topic, answer: "General sake knowledge available." })
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: `You are a sake expert. Give a detailed, engaging answer (3-4 paragraphs) about: ${topic}. Include interesting facts and practical tips.` }] }] })
          })
          if (!response.ok) throw new Error("API error")
          const data = await response.json()
          return JSON.stringify({ topic, answer: data.candidates?.[0]?.content?.parts?.[0]?.text || "No info found." })
        } catch {
          return JSON.stringify({ topic, answer: "I can share general knowledge about this topic." })
        }
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "get_temperature_guide",
      description: "Get sake serving temperature recommendations with visual guide.",
      parse: (input: string) => JSON.parse(input),
      parameters: {
        type: "object",
        properties: {
          sakeType: { type: "string", description: "Type of sake (Daiginjo, Junmai, etc)" },
        },
        required: [],
      },
      function: async ({ sakeType }: { sakeType?: string }) => {
        const temps = [
          { name: "雪冷え Yukihie", celsius: 5, english: "Snow Cold", bestFor: "Premium Daiginjo", color: "#E3F2FD" },
          { name: "花冷え Hana-bie", celsius: 10, english: "Flower Cold", bestFor: "Ginjo, aromatic", color: "#E8F5E9" },
          { name: "涼冷え Suzu-bie", celsius: 15, english: "Cool Breeze", bestFor: "Versatile Junmai", color: "#FFF3E0" },
          { name: "常温 Jo-on", celsius: 20, english: "Room Temp", bestFor: "Aged sake, Koshu", color: "#FFF8E1" },
          { name: "ぬる燗 Nurukan", celsius: 40, english: "Luke Warm", bestFor: "Junmai, Honjozo", color: "#FFECB3" },
          { name: "熱燗 Atsukan", celsius: 50, english: "Hot", bestFor: "Robust Yamahai", color: "#FFCCBC" },
        ]
        
        let recommendation = "Most sake styles are versatile across temperatures. Experiment to discover how flavors transform!"
        if (sakeType) {
          const t = sakeType.toLowerCase()
          if (t.includes("daiginjo")) recommendation = "Daiginjo: Serve chilled (5-15°C) to preserve delicate floral and fruity aromatics."
          else if (t.includes("ginjo")) recommendation = "Ginjo: Cool temperatures (10-15°C) let the elegant floral notes shine."
          else if (t.includes("yamahai") || t.includes("kimoto")) recommendation = "Traditional Yamahai/Kimoto: Warming (40-50°C) brings out rich umami and earthy depth."
          else if (t.includes("junmai")) recommendation = "Junmai: Incredibly versatile - try the same bottle at different temps to see how it transforms!"
        }
        
        return JSON.stringify({ 
          temperatures: temps, 
          recommendation, 
          sakeType,
          displayInstructions: "Show as a visual temperature scale or table with Japanese names, temperatures, and best sake types for each."
        })
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "get_food_pairing",
      description: "Get sake pairing recommendations for specific foods or dishes. Use when user asks what sake goes with a food, or how to pair sake with a meal.",
      parse: (input: string) => JSON.parse(input),
      parameters: {
        type: "object",
        properties: {
          food: { type: "string", description: "The food or dish to pair with sake" },
        },
        required: ["food"],
      },
      function: async ({ food }: { food: string }) => {
        try {
          // Query food pairing knowledge from Convex
          const results = await convex.action(api.foodPairing.searchFoodPairing, { query: food, limit: 1 })
          
          if (results.length > 0) {
            const match = results[0]
            // Get matching products
            const products = await convex.action(api.embeddings.semanticSearch, {
              query: match.bestStyles.join(" "),
              limit: 2,
            })
            
            const formatted = products.map((p: any) => ({
              name: p.productName,
              price: p.price,
              url: p.productUrl,
            }))
            
            return JSON.stringify({
              food,
              goal: match.pairingGoal,
              bestStyles: match.bestStyles,
              example: match.examplePairings,
              products: formatted,
              displayInstructions: "Show pairing goal, recommended sake styles as a list, and example pairings. Include product card if available."
            })
          }
          
          // Default response
          return JSON.stringify({
            food,
            goal: "Match intensity and complement flavors",
            bestStyles: ["Junmai (versatile, savory)", "Ginjo (aromatic, lighter dishes)", "Yamahai (rich, hearty dishes)"],
            tip: "General rule: If it pairs well with steamed rice, it pairs well with sake!",
            displayInstructions: "Provide general pairing guidance based on the food's characteristics."
          })
        } catch (error) {
          console.error("Food pairing error:", error)
          return JSON.stringify({ food, bestStyles: ["Junmai", "Ginjo"], tip: "Match intensity of food with sake body." })
        }
      },
      strict: true,
    },
  },
]
