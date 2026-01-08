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

// Search sake knowledge using uploaded files (brewery histories + wine-to-sake guide)
export const searchSakeKnowledge = action({
  args: {
    query: v.string(),
    focusArea: v.optional(v.union(
      v.literal("wine_matching"),
      v.literal("brewery_history"),
      v.literal("general")
    )),
    limit: v.optional(v.number())
  },
  handler: async (ctx, { query, focusArea = "general", limit = 3 }) => {
    const geminiApiKey = process.env.GEMINI_API_KEY
    const fileUris = process.env.GEMINI_FILE_URIS // Comma-separated URIs
    
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY not found in environment")
    }

    try {
      // Build system instruction based on focus area
      let systemInstruction = `You are a sake expert with deep knowledge of Japanese sake culture, brewing, and tasting.`
      
      if (focusArea === "wine_matching") {
        systemInstruction += ` Focus on wine-to-sake translations, using scientific correlations between wine varietals and sake styles. Provide specific brand recommendations when possible.`
      } else if (focusArea === "brewery_history") {
        systemInstruction += ` Focus on brewery histories, regional characteristics, and traditional brewing methods.`
      }
      
      systemInstruction += ` Provide specific, detailed, and accurate information based on the uploaded knowledge base.`

      const requestBody: any = {
        contents: [{
          parts: [{
            text: query
          }]
        }],
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000
        }
      }

      // Add file URIs if available
      if (fileUris) {
        const uris = fileUris.split(',').map((uri: string) => uri.trim())
        requestBody.contents[0].parts.push(
          ...uris.map((uri: string) => ({
            fileData: {
              fileUri: uri,
              mimeType: "text/markdown"
            }
          }))
        )
      }

      const searchResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody)
        }
      )

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
        source: fileUris ? "Gemini RAG - Uploaded Knowledge Base" : "Gemini AI - General Knowledge",
        focusArea,
        timestamp: Date.now()
      }
      
    } catch (error) {
      console.error("Gemini API error:", error)
      return {
        query,
        answer: "I'm sorry, I couldn't access the sake knowledge at the moment. Please try again later.",
        source: "Error",
        focusArea,
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
