import { action } from "./_generated/server"
import { v } from "convex/values"

// Search real-time web content about sake using Perplexity API
export const searchWebContent = action({
  args: {
    query: v.string(),
    focus: v.optional(v.string()) // "news", "reviews", "breweries", "events"
  },
  handler: async (ctx, { query, focus }) => {
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY
    if (!perplexityApiKey || perplexityApiKey === 'placeholder') {
      throw new Error("PERPLEXITY_API_KEY not found in environment")
    }

    try {
      // Enhance query with sake context
      let enhancedQuery = query
      if (focus === "news") {
        enhancedQuery = `Latest sake news and releases: ${query}`
      } else if (focus === "reviews") {
        enhancedQuery = `Sake reviews and ratings: ${query}`
      } else if (focus === "breweries") {
        enhancedQuery = `Japanese sake brewery information: ${query}`
      } else if (focus === "events") {
        enhancedQuery = `Sake events and tastings: ${query}`
      } else {
        enhancedQuery = `Japanese sake information: ${query}`
      }

      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${perplexityApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sonar",
          messages: [
            {
              role: "system",
              content: `You are a sake expert providing current, accurate information about Japanese sake. 
              Focus on:
              - Current sake market trends and new releases
              - Brewery news and updates
              - Sake events and tastings
              - Expert reviews and ratings
              - Regional sake characteristics
              - Food pairing recommendations
              
              Provide specific, actionable information with sources when possible.
              Keep responses concise but informative for voice agent consumption.`
            },
            {
              role: "user",
              content: enhancedQuery
            }
          ],
          max_tokens: 800,
          temperature: 0.3
        })
      })

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`)
      }

      const result = await response.json()
      
      const answer = result.choices?.[0]?.message?.content || "No current information found."
      const citations = result.citations || []
      
      return {
        query: enhancedQuery,
        answer,
        citations,
        source: "Perplexity API - Real-time Web Search",
        focus: focus || "general",
        timestamp: Date.now()
      }
      
    } catch (error) {
      console.error("Perplexity API error:", error)
      return {
        query,
        answer: "I'm sorry, I couldn't access current web information at the moment. Please try again later.",
        citations: [],
        source: "Error",
        focus: focus || "general",
        timestamp: Date.now()
      }
    }
  },
})
