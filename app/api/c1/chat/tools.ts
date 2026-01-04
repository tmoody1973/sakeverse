import type { ChatCompletionTool } from "openai/resources/chat/completions"

// Tool definitions for C1
export const tools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_sake_products",
      description: "Search the sake product catalog. Use when user wants to buy, try, or get specific sake recommendations.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query for sake" },
          maxPrice: { type: "number", description: "Maximum price in dollars" },
          category: { type: "string", description: "Sake category like Junmai, Ginjo, Daiginjo" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_wine_to_sake_recommendation",
      description: "Translate wine preferences to sake. Use when user mentions wine types like Pinot Noir, Chardonnay, Burgundy.",
      parameters: {
        type: "object",
        properties: {
          wineType: { type: "string", description: "The wine type the user enjoys" },
        },
        required: ["wineType"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_sake_knowledge",
      description: "Get educational info about sake brewing, history, regions. Use for how/what/why questions.",
      parameters: {
        type: "object",
        properties: {
          topic: { type: "string", description: "The sake topic to learn about" },
        },
        required: ["topic"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_temperature_guide",
      description: "Get sake serving temperature recommendations.",
      parameters: {
        type: "object",
        properties: {
          sakeType: { type: "string", description: "Type of sake (Daiginjo, Junmai, etc)" },
        },
        required: [],
      },
    },
  },
]

// Tool execution
export async function executeToolCall(name: string, args: any): Promise<string> {
  switch (name) {
    case "search_sake_products":
      return searchSakeProducts(args.query, args.maxPrice, args.category)
    case "get_wine_to_sake_recommendation":
      return getWineToSakeRecommendation(args.wineType)
    case "get_sake_knowledge":
      return getSakeKnowledge(args.topic)
    case "get_temperature_guide":
      return getTemperatureGuide(args.sakeType)
    default:
      return JSON.stringify({ error: "Unknown tool" })
  }
}

function searchSakeProducts(query: string, maxPrice?: number, category?: string): string {
  const products = [
    { name: "Dassai 23", brewery: "Asahi Shuzo", price: 85, category: "Junmai Daiginjo", region: "Yamaguchi" },
    { name: "Hakkaisan Tokubetsu", brewery: "Hakkaisan", price: 35, category: "Junmai", region: "Niigata" },
    { name: "Kubota Manju", brewery: "Asahi Shuzo", price: 65, category: "Junmai Daiginjo", region: "Niigata" },
    { name: "Tedorigawa Yamahai", brewery: "Yoshida Shuzo", price: 42, category: "Yamahai Junmai", region: "Ishikawa" },
    { name: "Dewazakura Oka", brewery: "Dewazakura", price: 28, category: "Ginjo", region: "Yamagata" },
  ]
  
  let filtered = products
  if (maxPrice) filtered = filtered.filter(p => p.price <= maxPrice)
  if (category) filtered = filtered.filter(p => p.category.toLowerCase().includes(category.toLowerCase()))
  
  return JSON.stringify({ products: filtered.slice(0, 3), query })
}

function getWineToSakeRecommendation(wineType: string): string {
  const mappings: Record<string, any> = {
    "pinot noir": { recommendation: "Koshu or Junmai", reasoning: "Earthy, savory notes", temperature: "Room temp or warm", sake: ["Tedorigawa Yamahai"] },
    "chardonnay": { recommendation: "Junmai or Kimoto/Yamahai", reasoning: "Fuller body, umami-rich", temperature: "Room temp", sake: ["Hakkaisan Tokubetsu"] },
    "sauvignon blanc": { recommendation: "Junmai Ginjo", reasoning: "Light, aromatic, crisp", temperature: "Chilled", sake: ["Dewazakura Oka"] },
    "cabernet": { recommendation: "Yamahai Junmai", reasoning: "Robust, full-bodied", temperature: "Room temp or warm", sake: ["Tedorigawa Yamahai"] },
    "burgundy": { recommendation: "Koshu or Junmai Ginjo", reasoning: "Elegance and complexity", temperature: "Room temp", sake: ["Kubota Manju"] },
    "champagne": { recommendation: "Sparkling Sake", reasoning: "Celebratory, carbonated", temperature: "Well chilled", sake: ["Hakkaisan Awa"] },
  }
  
  const key = wineType.toLowerCase()
  for (const [wine, data] of Object.entries(mappings)) {
    if (key.includes(wine)) return JSON.stringify({ wineType, ...data })
  }
  
  return JSON.stringify({ wineType, recommendation: "Junmai Ginjo", reasoning: "Versatile choice", temperature: "Chilled to room temp", sake: ["Dewazakura Oka"] })
}

async function getSakeKnowledge(topic: string): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY
  if (!geminiKey) return JSON.stringify({ topic, answer: "General sake knowledge available." })
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `You are a sake expert. Concise answer (2-3 paragraphs) about: ${topic}` }] }]
      })
    })
    
    if (!response.ok) throw new Error("API error")
    const data = await response.json()
    return JSON.stringify({ topic, answer: data.candidates?.[0]?.content?.parts?.[0]?.text || "No info found." })
  } catch {
    return JSON.stringify({ topic, answer: "I can share general knowledge about this topic." })
  }
}

function getTemperatureGuide(sakeType?: string): string {
  const temps = [
    { name: "Yukihie", celsius: 5, english: "Snow Cold", bestFor: "Premium Daiginjo" },
    { name: "Hana-bie", celsius: 10, english: "Flower Cold", bestFor: "Ginjo" },
    { name: "Suzu-bie", celsius: 15, english: "Cool Breeze", bestFor: "Junmai" },
    { name: "Jo-on", celsius: 20, english: "Room Temp", bestFor: "Aged sake" },
    { name: "Nurukan", celsius: 40, english: "Luke Warm", bestFor: "Junmai, Honjozo" },
    { name: "Atsukan", celsius: 50, english: "Hot", bestFor: "Yamahai" },
  ]
  
  let rec = "Most sake styles are versatile. Experiment!"
  if (sakeType) {
    const t = sakeType.toLowerCase()
    if (t.includes("daiginjo")) rec = "Daiginjo: serve chilled (5-15°C) for delicate aromatics."
    else if (t.includes("ginjo")) rec = "Ginjo: cool (10-15°C) for floral notes."
    else if (t.includes("yamahai") || t.includes("kimoto")) rec = "Traditional styles: warm (40-50°C) for rich umami."
    else if (t.includes("junmai")) rec = "Junmai: versatile - try multiple temperatures."
  }
  
  return JSON.stringify({ temperatures: temps, recommendation: rec, sakeType })
}
