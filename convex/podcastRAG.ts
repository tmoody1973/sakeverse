"use node"

import { action, internalAction } from "./_generated/server"
import { v } from "convex/values"

// Upload a document to Gemini File API and create a corpus for RAG
export const uploadBreweryHistories = internalAction({
  args: {},
  handler: async () => {
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY not found")
    }

    // Read the brewery histories file
    const fs = await import("fs")
    const path = await import("path")
    
    // Note: This won't work in Convex cloud - need to upload via script
    // This is a placeholder showing the API structure
    
    return {
      message: "Use the upload script instead - Convex actions can't read local files",
      instructions: [
        "1. Go to https://aistudio.google.com/",
        "2. Create a new corpus named 'sakecosm-brewery-knowledge'",
        "3. Upload podcasts/brewery_histories_only.md",
        "4. Copy the corpus resource name",
        "5. Set GEMINI_CORPUS_NAME env var in Convex"
      ]
    }
  },
})

// Query the Gemini corpus for brewery/sake knowledge
export const queryBreweryKnowledge = action({
  args: {
    query: v.string(),
    focusArea: v.optional(v.union(
      v.literal("wine_matching"),
      v.literal("brewery_history"),
      v.literal("general")
    )),
    topK: v.optional(v.number()),
  },
  handler: async (ctx, { query, focusArea = "general", topK = 5 }) => {
    const geminiApiKey = process.env.GEMINI_API_KEY
    const fileUris = process.env.GEMINI_FILE_URIS // Now supports multiple files
    
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY not found")
    }
    
    // If no files configured, fall back to general Gemini
    if (!fileUris) {
      console.log("No GEMINI_FILE_URIS configured, using general knowledge")
      return await queryGeneralKnowledge(geminiApiKey, query)
    }

    try {
      // Build system instruction based on focus area
      let systemInstruction = `You are a sake expert. `
      let queryPrefix = ""
      
      if (focusArea === "wine_matching") {
        systemInstruction += `Focus on wine-to-sake translations using scientific correlations. Provide specific brand recommendations.`
        queryPrefix = "Based on the wine-to-sake guide, "
      } else if (focusArea === "brewery_history") {
        systemInstruction += `Focus on brewery histories, regional characteristics, and traditional brewing methods.`
        queryPrefix = "Based on the brewery histories, "
      } else {
        systemInstruction += `Use all available knowledge to provide comprehensive sake information.`
        queryPrefix = "Based on the uploaded documents, "
      }

      // Parse file URIs
      const uris = fileUris.split(',').map((uri: string) => uri.trim())
      
      // Build file data parts
      const fileParts = uris.map((uri: string) => ({
        fileData: {
          mimeType: "text/markdown",
          fileUri: uri,
        }
      }))

      // Use Gemini with the uploaded files as context
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                ...fileParts,
                {
                  text: `${queryPrefix}answer this question: ${query}

Be specific and cite details from the documents. If the information isn't in the documents, say so.`
                }
              ]
            }],
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            },
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 1500,
            },
          }),
        }
      )

      if (!response.ok) {
        const error = await response.text()
        console.error("Gemini RAG query failed:", error)
        return await queryGeneralKnowledge(geminiApiKey, query)
      }

      const result = await response.json()
      const answer = result.candidates?.[0]?.content?.parts?.[0]?.text || ""

      return {
        query,
        chunks: [{ content: answer, score: 1.0, source: "brewery_histories" }],
        source: "Gemini File RAG - Brewery Histories",
        timestamp: Date.now(),
      }
    } catch (error) {
      console.error("RAG query error:", error)
      return await queryGeneralKnowledge(geminiApiKey, query)
    }
  },
})

// Fallback to general Gemini knowledge
async function queryGeneralKnowledge(apiKey: string, query: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a sake expert. Answer this question about sake breweries, brewing, or Japanese sake culture: ${query}
            
Be specific and detailed. Include brewery names, regions, and technical details when relevant.`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000,
        },
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`)
  }

  const result = await response.json()
  const answer = result.candidates?.[0]?.content?.parts?.[0]?.text || ""

  return {
    query,
    chunks: [{ content: answer, score: 1.0, source: "gemini-general" }],
    source: "Gemini General Knowledge",
    timestamp: Date.now(),
  }
}
