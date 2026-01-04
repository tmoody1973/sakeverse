import type { ChatCompletionTool } from "openai/resources/chat/completions"

// Tool definitions for C1 to call our RAG sources
export const sakeTools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_sake_products",
      description: "Search the sake product catalog for recommendations. Use when user wants to buy, try, or get specific sake recommendations.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query describing what kind of sake the user wants" },
          maxPrice: { type: "number", description: "Maximum price in dollars" },
          category: { type: "string", description: "Sake category like Junmai, Ginjo, Daiginjo, Nigori" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_wine_to_sake_recommendation",
      description: "Translate wine preferences to sake recommendations. Use when user mentions ANY wine type like Pinot Noir, Chardonnay, Burgundy, Cabernet, etc.",
      parameters: {
        type: "object",
        properties: {
          wineType: { type: "string", description: "The wine type or style the user enjoys" },
        },
        required: ["wineType"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_sake_knowledge",
      description: "Get educational information about sake brewing, history, regions, types, or culture. Use for how, what, why, explain questions about sake.",
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
      description: "Get sake serving temperature recommendations. Use when user asks about temperature, warming, or chilling sake.",
      parameters: {
        type: "object",
        properties: {
          sakeType: { type: "string", description: "The type of sake (e.g., Daiginjo, Junmai, Honjozo)" },
        },
        required: [],
      },
    },
  },
]

// Tool implementations
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

async function searchSakeProducts(query: string, maxPrice?: number, category?: string): Promise<string> {
  // Return curated product data
  const products = [
    { name: "Dassai 23", brewery: "Asahi Shuzo", price: 85, category: "Junmai Daiginjo", region: "Yamaguchi", description: "Ultra-premium with 23% polishing ratio" },
    { name: "Hakkaisan Tokubetsu", brewery: "Hakkaisan", price: 35, category: "Junmai", region: "Niigata", description: "Clean, crisp Niigata style" },
    { name: "Kubota Manju", brewery: "Asahi Shuzo", price: 65, category: "Junmai Daiginjo", region: "Niigata", description: "Elegant and refined" },
    { name: "Tedorigawa Yamahai", brewery: "Yoshida Shuzo", price: 42, category: "Yamahai Junmai", region: "Ishikawa", description: "Rich umami, traditional method" },
    { name: "Dewazakura Oka", brewery: "Dewazakura", price: 28, category: "Ginjo", region: "Yamagata", description: "Fruity and aromatic, great value" },
  ]
  
  let filtered = products
  if (maxPrice) {
    filtered = filtered.filter(p => p.price <= maxPrice)
  }
  if (category) {
    filtered = filtered.filter(p => p.category.toLowerCase().includes(category.toLowerCase()))
  }
  
  return JSON.stringify({ products: filtered.slice(0, 3), query })
}

function getWineToSakeRecommendation(wineType: string): string {
  const mappings: Record<string, any> = {
    "pinot noir": {
      recommendation: "Koshu (aged sake) or well-balanced Junmai",
      reasoning: "Koshu has sherry-like notes of nuts and caramel that appeal to Pinot Noir lovers who enjoy earthy, savory notes.",
      temperature: "Room temperature or slightly warm (35-40°C)",
      specificSake: ["Tedorigawa Yamahai", "Born Tokusen"],
    },
    "chardonnay": {
      recommendation: "Junmai or Kimoto/Yamahai",
      reasoning: "Fuller body and savory, umami-rich flavor profile appeals to oaked Chardonnay drinkers.",
      temperature: "Room temperature or slightly chilled",
      specificSake: ["Hakkaisan Tokubetsu Junmai", "Masumi Okuden Kantsukuri"],
    },
    "sauvignon blanc": {
      recommendation: "Junmai Ginjo or Junmai Daiginjo",
      reasoning: "Light, aromatic, clean crisp finish similar to refreshing white wine. Fruity notes of green apple, melon, pear.",
      temperature: "Chilled (10-15°C)",
      specificSake: ["Dewazakura Oka", "Dassai 45"],
    },
    "cabernet": {
      recommendation: "Yamahai or Kimoto Junmai",
      reasoning: "Robust, full-bodied with higher acidity and umami. Earthy, savory notes match bold red wine lovers.",
      temperature: "Room temperature or warm (40-45°C)",
      specificSake: ["Tedorigawa Yamahai", "Daishichi Kimoto"],
    },
    "burgundy": {
      recommendation: "Koshu (aged sake) or elegant Junmai Ginjo",
      reasoning: "Burgundy lovers appreciate elegance and complexity. Koshu offers earthy, nutty depth.",
      temperature: "Room temperature",
      specificSake: ["Born Tokusen", "Kubota Manju"],
    },
    "champagne": {
      recommendation: "Sparkling Sake",
      reasoning: "Direct comparison - secondary fermentation creates carbonation. Celebratory experience.",
      temperature: "Well chilled (5-8°C)",
      specificSake: ["Hakkaisan Awa", "Mio Sparkling"],
    },
  }
  
  const key = wineType.toLowerCase()
  for (const [wine, data] of Object.entries(mappings)) {
    if (key.includes(wine)) {
      return JSON.stringify({ wineType, ...data })
    }
  }
  
  return JSON.stringify({
    wineType,
    recommendation: "Junmai Ginjo",
    reasoning: "A versatile choice that appeals to most wine drinkers with its balance of fruit, acidity, and clean finish.",
    temperature: "Chilled to room temperature",
    specificSake: ["Dewazakura Oka", "Hakkaisan Tokubetsu"],
  })
}

async function getSakeKnowledge(topic: string): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY
  if (!geminiKey) {
    return JSON.stringify({ topic, answer: "I can share general knowledge about this topic." })
  }
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a sake expert. Provide a concise, informative answer (2-3 paragraphs max) about: ${topic}. Focus on practical knowledge that helps someone appreciate sake better.`
          }]
        }]
      })
    })
    
    if (!response.ok) throw new Error("API error")
    
    const data = await response.json()
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "No information found."
    return JSON.stringify({ topic, answer })
  } catch {
    return JSON.stringify({ topic, answer: "I can share what I know about this topic based on my expertise." })
  }
}

function getTemperatureGuide(sakeType?: string): string {
  const temperatures = [
    { name: "Yukihie (雪冷え)", celsius: 5, english: "Snow Cold", bestFor: "Premium Daiginjo" },
    { name: "Hana-bie (花冷え)", celsius: 10, english: "Flower Cold", bestFor: "Ginjo, aromatic sakes" },
    { name: "Suzu-bie (涼冷え)", celsius: 15, english: "Cool Breeze", bestFor: "Versatile Junmai" },
    { name: "Jo-on (常温)", celsius: 20, english: "Room Temp", bestFor: "Aged sake, Koshu" },
    { name: "Nurukan (ぬる燗)", celsius: 40, english: "Luke Warm", bestFor: "Junmai, Honjozo" },
    { name: "Atsukan (熱燗)", celsius: 50, english: "Hot", bestFor: "Robust Yamahai" },
  ]
  
  let recommendation = "Most sake styles are versatile across temperatures. Experiment to find your preference!"
  if (sakeType) {
    const type = sakeType.toLowerCase()
    if (type.includes("daiginjo")) {
      recommendation = "Daiginjo is best served chilled (5-15°C) to preserve delicate aromatics."
    } else if (type.includes("ginjo")) {
      recommendation = "Ginjo shines at cool temperatures (10-15°C) where floral notes emerge."
    } else if (type.includes("junmai") && !type.includes("ginjo")) {
      recommendation = "Junmai is versatile - try it at multiple temperatures to discover how flavors transform."
    } else if (type.includes("yamahai") || type.includes("kimoto")) {
      recommendation = "Traditional styles like Yamahai/Kimoto develop rich umami when warmed (40-50°C)."
    }
  }
  
  return JSON.stringify({ temperatures, recommendation, sakeType })
}
