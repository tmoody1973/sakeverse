import type { RunnableToolFunctionWithParse } from "openai/lib/RunnableFunction.mjs"

// Tool definitions with product images and Tippsy URLs
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
        const products = [
          { 
            name: "Dassai 23", 
            brewery: "Asahi Shuzo", 
            price: 85, 
            category: "Junmai Daiginjo", 
            region: "Yamaguchi",
            image: "https://cdn.shopify.com/s/files/1/0274/5742/5270/products/dassai-23-junmai-daiginjo-720ml-702177.jpg",
            url: "https://www.tippsy.com/products/dassai-23",
            description: "Ultra-premium with 23% polishing ratio. Elegant, fruity, and refined."
          },
          { 
            name: "Hakkaisan Tokubetsu Junmai", 
            brewery: "Hakkaisan Brewery", 
            price: 35, 
            category: "Junmai", 
            region: "Niigata",
            image: "https://cdn.shopify.com/s/files/1/0274/5742/5270/products/hakkaisan-tokubetsu-junmai-720ml-412883.jpg",
            url: "https://www.tippsy.com/products/hakkaisan-tokubetsu-junmai",
            description: "Clean, crisp Niigata style. Perfect for beginners."
          },
          { 
            name: "Kubota Manju", 
            brewery: "Asahi Shuzo", 
            price: 65, 
            category: "Junmai Daiginjo", 
            region: "Niigata",
            image: "https://cdn.shopify.com/s/files/1/0274/5742/5270/products/kubota-manju-junmai-daiginjo-720ml-825991.jpg",
            url: "https://www.tippsy.com/products/kubota-manju",
            description: "Elegant and refined with delicate floral notes."
          },
          { 
            name: "Tedorigawa Yamahai Junmai", 
            brewery: "Yoshida Shuzo", 
            price: 42, 
            category: "Yamahai Junmai", 
            region: "Ishikawa",
            image: "https://cdn.shopify.com/s/files/1/0274/5742/5270/products/tedorigawa-yamahai-junmai-720ml-178542.jpg",
            url: "https://www.tippsy.com/products/tedorigawa-yamahai-junmai",
            description: "Rich umami, traditional brewing method. Great warm."
          },
          { 
            name: "Dewazakura Oka Ginjo", 
            brewery: "Dewazakura Brewery", 
            price: 28, 
            category: "Ginjo", 
            region: "Yamagata",
            image: "https://cdn.shopify.com/s/files/1/0274/5742/5270/products/dewazakura-oka-ginjo-720ml-702177.jpg",
            url: "https://www.tippsy.com/products/dewazakura-oka-ginjo",
            description: "Fruity and aromatic. Excellent value ginjo."
          },
          { 
            name: "Born Tokusen Junmai Daiginjo", 
            brewery: "Katoukichibee Shouten", 
            price: 55, 
            category: "Junmai Daiginjo", 
            region: "Fukui",
            image: "https://cdn.shopify.com/s/files/1/0274/5742/5270/products/born-tokusen-junmai-daiginjo-720ml.jpg",
            url: "https://www.tippsy.com/products/born-tokusen",
            description: "Aged sake with complex, nutty flavors. Wine lovers' favorite."
          },
        ]
        
        let filtered = products
        if (maxPrice) filtered = filtered.filter(p => p.price <= maxPrice)
        if (category) filtered = filtered.filter(p => p.category.toLowerCase().includes(category.toLowerCase()))
        
        return JSON.stringify({ 
          products: filtered.slice(0, 3), 
          query,
          displayInstructions: "Show each product as a card with image, name, brewery, price, description. Include TWO buttons: 'View on Tippsy' (links to URL) and 'Save to Library' (calls save_to_library)."
        })
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
        // This will be handled client-side via Convex
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
        // This will be handled client-side via Convex
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
      description: "Translate wine preferences to sake. Use when user mentions wine types like Pinot Noir, Chardonnay, Burgundy. Returns sake recommendations with images and links.",
      parse: (input: string) => JSON.parse(input),
      parameters: {
        type: "object",
        properties: {
          wineType: { type: "string", description: "The wine type the user enjoys" },
        },
        required: ["wineType"],
      },
      function: async ({ wineType }: { wineType: string }) => {
        const mappings: Record<string, any> = {
          "pinot noir": { 
            recommendation: "Koshu (aged sake) or Yamahai Junmai", 
            reasoning: "Earthy, savory notes similar to Burgundy Pinot", 
            temperature: "Room temp or slightly warm (35-40°C)",
            products: [
              { name: "Tedorigawa Yamahai", price: 42, image: "https://cdn.shopify.com/s/files/1/0274/5742/5270/products/tedorigawa-yamahai-junmai-720ml-178542.jpg", url: "https://www.tippsy.com/products/tedorigawa-yamahai-junmai" },
              { name: "Born Tokusen", price: 55, image: "https://cdn.shopify.com/s/files/1/0274/5742/5270/products/born-tokusen-junmai-daiginjo-720ml.jpg", url: "https://www.tippsy.com/products/born-tokusen" }
            ]
          },
          "chardonnay": { 
            recommendation: "Junmai or Kimoto/Yamahai", 
            reasoning: "Fuller body, umami-rich like oaked Chardonnay", 
            temperature: "Room temp or slightly chilled",
            products: [
              { name: "Hakkaisan Tokubetsu", price: 35, image: "https://cdn.shopify.com/s/files/1/0274/5742/5270/products/hakkaisan-tokubetsu-junmai-720ml-412883.jpg", url: "https://www.tippsy.com/products/hakkaisan-tokubetsu-junmai" }
            ]
          },
          "sauvignon blanc": { 
            recommendation: "Junmai Ginjo or Daiginjo", 
            reasoning: "Light, aromatic, crisp finish like SB", 
            temperature: "Chilled (10-15°C)",
            products: [
              { name: "Dewazakura Oka", price: 28, image: "https://cdn.shopify.com/s/files/1/0274/5742/5270/products/dewazakura-oka-ginjo-720ml-702177.jpg", url: "https://www.tippsy.com/products/dewazakura-oka-ginjo" },
              { name: "Dassai 23", price: 85, image: "https://cdn.shopify.com/s/files/1/0274/5742/5270/products/dassai-23-junmai-daiginjo-720ml-702177.jpg", url: "https://www.tippsy.com/products/dassai-23" }
            ]
          },
          "cabernet": { 
            recommendation: "Yamahai or Kimoto Junmai", 
            reasoning: "Robust, full-bodied with structure", 
            temperature: "Room temp or warm (40-45°C)",
            products: [
              { name: "Tedorigawa Yamahai", price: 42, image: "https://cdn.shopify.com/s/files/1/0274/5742/5270/products/tedorigawa-yamahai-junmai-720ml-178542.jpg", url: "https://www.tippsy.com/products/tedorigawa-yamahai-junmai" }
            ]
          },
          "burgundy": { 
            recommendation: "Koshu or elegant Junmai Ginjo", 
            reasoning: "Elegance and complexity like fine Burgundy", 
            temperature: "Room temp",
            products: [
              { name: "Kubota Manju", price: 65, image: "https://cdn.shopify.com/s/files/1/0274/5742/5270/products/kubota-manju-junmai-daiginjo-720ml-825991.jpg", url: "https://www.tippsy.com/products/kubota-manju" },
              { name: "Born Tokusen", price: 55, image: "https://cdn.shopify.com/s/files/1/0274/5742/5270/products/born-tokusen-junmai-daiginjo-720ml.jpg", url: "https://www.tippsy.com/products/born-tokusen" }
            ]
          },
          "champagne": { 
            recommendation: "Sparkling Sake", 
            reasoning: "Celebratory, effervescent experience", 
            temperature: "Well chilled (5-8°C)",
            products: [
              { name: "Hakkaisan Awa", price: 45, image: "https://cdn.shopify.com/s/files/1/0274/5742/5270/products/hakkaisan-awa-sparkling-360ml.jpg", url: "https://www.tippsy.com/products/hakkaisan-awa" }
            ]
          },
        }
        
        const key = wineType.toLowerCase()
        for (const [wine, data] of Object.entries(mappings)) {
          if (key.includes(wine)) {
            return JSON.stringify({ 
              wineType, 
              ...data,
              displayInstructions: "Show the recommendation with reasoning, then display product cards with images and 'View on Tippsy' links."
            })
          }
        }
        
        return JSON.stringify({ 
          wineType, 
          recommendation: "Junmai Ginjo", 
          reasoning: "Versatile choice for wine lovers", 
          temperature: "Chilled to room temp",
          products: [
            { name: "Dewazakura Oka", price: 28, image: "https://cdn.shopify.com/s/files/1/0274/5742/5270/products/dewazakura-oka-ginjo-720ml-702177.jpg", url: "https://www.tippsy.com/products/dewazakura-oka-ginjo" }
          ]
        })
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
]
