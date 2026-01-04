import { action, internalAction } from "./_generated/server"
import { v } from "convex/values"

// Create a File Search Store and upload PDFs
export const setupSakeKnowledgeBase = internalAction({
  args: {},
  handler: async (ctx) => {
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY not found in environment")
    }

    try {
      // Create File Search Store
      const storeResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/fileSearchStores?key=${geminiApiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: "Sake Knowledge Base"
        })
      })

      if (!storeResponse.ok) {
        throw new Error(`Failed to create File Search Store: ${storeResponse.status}`)
      }

      const store = await storeResponse.json()
      console.log("Created File Search Store:", store.name)
      
      return {
        message: "File Search Store created successfully",
        storeName: store.name,
        displayName: store.displayName
      }
      
    } catch (error) {
      console.error("Error setting up knowledge base:", error)
      throw error
    }
  },
})

// Search sake knowledge using File Search Store
export const searchSakeKnowledge = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, { query, limit = 3 }) => {
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY not found in environment")
    }

    // For now, use general Gemini knowledge since File Search Store needs setup
    try {
      const searchResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a sake expert with deep knowledge of Japanese sake culture, brewing, and tasting. Answer this question: ${query}
              
              Focus on:
              - Traditional brewing methods and styles (Junmai, Ginjo, Daiginjo, etc.)
              - Regional characteristics and flavor profiles
              - Food pairing recommendations
              - Wine-to-sake comparisons and recommendations
              - Cultural and historical context
              - Temperature serving recommendations
              
              Provide specific, detailed, and accurate information.`
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1000
          }
        })
      })

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text()
        console.error("Gemini API error details:", errorText)
        throw new Error(`Gemini API error: ${searchResponse.status}`)
      }

      const searchResult = await searchResponse.json()
      
      // Extract the response text
      const responseText = searchResult.candidates?.[0]?.content?.parts?.[0]?.text || "No information found."
      
      return {
        query,
        answer: responseText,
        source: "Gemini AI - Sake Knowledge",
        timestamp: Date.now()
      }
      
    } catch (error) {
      console.error("Gemini API error:", error)
      return {
        query,
        answer: "I'm sorry, I couldn't access the sake knowledge at the moment. Please try again later.",
        source: "Error",
        timestamp: Date.now()
      }
    }
  },
})

// Get status of File Search Stores
export const getSakeKnowledgeStatus = action({
  args: {},
  handler: async (ctx) => {
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY not found in environment")
    }

    try {
      // List File Search Stores
      const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/fileSearchStores?key=${geminiApiKey}`)

      if (!listResponse.ok) {
        throw new Error(`Failed to list stores: ${listResponse.status}`)
      }

      const listResult = await listResponse.json()
      
      return {
        totalStores: listResult.fileSearchStores?.length || 0,
        stores: listResult.fileSearchStores?.map((store: any) => ({
          name: store.name,
          displayName: store.displayName,
          createTime: store.createTime,
          updateTime: store.updateTime
        })) || []
      }
      
    } catch (error) {
      console.error("Error getting store status:", error)
      return {
        totalStores: 0,
        stores: [],
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }
  },
})
