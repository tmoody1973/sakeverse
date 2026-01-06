"use node"

import { action } from "./_generated/server"
import { api, internal } from "./_generated/api"
import { v } from "convex/values"

type GenerationResult = {
  success: boolean
  episodeId?: string
  error?: string
}

// Main episode generation action - full pipeline
export const generateEpisode = action({
  args: {
    topicId: v.string(),
    generateAudio: v.optional(v.boolean()), // Default true
  },
  handler: async (ctx, { topicId, generateAudio = true }): Promise<GenerationResult> => {
    try {
      // 1. Get topic
      const topic = await ctx.runQuery(api.podcastTopics.getByTopicId, { topicId })
      if (!topic) {
        return { success: false, error: "Topic not found" }
      }

      // 2. Create episode record
      const episodeId = await ctx.runMutation(internal.podcastEpisodes.create, {
        topicId,
        series: topic.series,
        title: topic.title,
        subtitle: topic.subtitle || "",
        description: topic.narrativeHook,
      })

      // 3. Research phase
      console.log("Starting research phase...")
      const research = await gatherResearch(ctx, topic)
      
      await ctx.runMutation(internal.podcastEpisodes.updateResearch, {
        episodeId,
        research,
      })

      // 4. Script generation
      console.log("Generating script...")
      const script = await generateScript(ctx, topic, research)
      
      await ctx.runMutation(internal.podcastEpisodes.updateScript, {
        episodeId,
        script,
      })

      // 5. Audio generation (optional)
      if (generateAudio) {
        console.log("Generating audio...")
        const audioResult = await ctx.runAction(api.podcastTTS.generateAudio, { episodeId })
        if (!audioResult.success) {
          console.error("Audio generation failed:", audioResult.error)
          // Continue without audio - can retry later
        }
      }

      // 6. Update topic status
      await ctx.runMutation(internal.podcastTopics.updateStatus, {
        topicId,
        status: "generated",
      })

      // Episode stays in "review" status until admin approves
      return { success: true, episodeId: episodeId as string }
    } catch (error: unknown) {
      console.error("Generation error:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  },
})

// Gather research from multiple sources
async function gatherResearch(ctx: any, topic: any) {
  const results = {
    geminiResults: [] as string[],
    perplexityResults: [] as string[],
    tippsyProducts: [] as any[],
    aggregatedAt: Date.now(),
  }

  const geminiApiKey = process.env.GEMINI_API_KEY
  const fileUri = process.env.GEMINI_FILE_URI

  // 1. Gemini RAG queries (direct API call, not via runAction)
  const ragQueries = topic.researchQueries?.geminiRag || []
  if (geminiApiKey && ragQueries.length > 0) {
    for (const query of ragQueries.slice(0, 2)) {
      try {
        const ragResult = await queryGeminiRAG(geminiApiKey, fileUri, query)
        if (ragResult) {
          results.geminiResults.push(ragResult)
        }
      } catch (e) {
        console.error("RAG query failed (continuing):", e)
      }
    }
  }

  // 2. Perplexity queries for current news/trends
  const perplexityKey = process.env.PERPLEXITY_API_KEY
  const perplexityQueries = topic.researchQueries?.perplexity || []
  console.log(`Perplexity: ${perplexityQueries.length} queries, key: ${perplexityKey ? "set" : "missing"}`)
  
  if (perplexityKey && perplexityQueries.length > 0) {
    for (const query of perplexityQueries.slice(0, 2)) {
      try {
        console.log(`Perplexity query: ${query}`)
        const response = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${perplexityKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "sonar",
            messages: [{ role: "user", content: query }],
          }),
        })
        
        if (response.ok) {
          const data = await response.json()
          const content = data.choices?.[0]?.message?.content
          if (content) {
            results.perplexityResults.push(content)
            console.log(`Perplexity result: ${content.substring(0, 100)}...`)
          }
        } else {
          console.error(`Perplexity error: ${response.status}`)
        }
      } catch (e) {
        console.error("Perplexity query failed (continuing):", e)
      }
    }
  }

  // 3. Tippsy products - search by brewery, brand, or topic keywords
  try {
    let products: any[] = []
    
    // Try brewery first
    if (topic.metadata?.brewery) {
      products = await ctx.runQuery(api.sake.searchByBrewery, { 
        brewery: topic.metadata.brewery,
        limit: 5,
      }) || []
    }
    
    // If no products, try semantic search with topic title
    if (products.length === 0) {
      const searchQuery = topic.metadata?.brand || topic.metadata?.sakeSolutionType || topic.title
      products = await ctx.runQuery(api.sake.searchSake, { 
        query: searchQuery,
        limit: 5,
      }) || []
    }
    
    results.tippsyProducts = products
    console.log(`Found ${products.length} Tippsy products for topic`)
  } catch (e) {
    console.error("Tippsy query failed:", e)
  }

  return results
}

// Generate script using Claude/Gemini
async function generateScript(ctx: any, topic: any, research: any) {
  const geminiKey = process.env.GEMINI_API_KEY
  if (!geminiKey) {
    throw new Error("GEMINI_API_KEY not configured")
  }

  const prompt = `You are writing a podcast script in the style of "This American Life" - intimate, narrative-driven storytelling about sake.

**STYLE GUIDE (This American Life inspired):**
- Open with a compelling anecdote or moment that hooks the listener
- Use "acts" to structure the story (Act One, Act Two, etc.)
- Mix personal stories with broader themes
- Include moments of surprise, humor, and genuine emotion
- The host (TOJI) guides us through with warmth and curiosity
- Co-host (KOJI) represents the listener - asks the questions we're all thinking
- Pause for reflection. Let moments breathe.
- End with a takeaway that resonates beyond just sake

**TWO HOSTS:**
- TOJI (杜氏 - master brewer): The storyteller and guide. Warm, thoughtful, occasionally wry. Like Ira Glass meets a sake sommelier.
- KOJI (麹 - the catalyst): The everyman. Curious, sometimes skeptical, brings levity. Asks "wait, really?" and "but why?"

**FORMAT:**
- 10-15 minutes (~1500-2000 words)
- Structure: Cold open → Theme introduction → Act One → Act Two → Conclusion
- Natural conversation, not scripted Q&A
- Include [PAUSE] for dramatic beats
- Pronunciation guides: "Junmai (JOON-my)"

**IMPORTANT - SAKE RECOMMENDATIONS:**
You MUST naturally weave in specific sake recommendations from the products below. When mentioning a sake:
- Say the full product name
- Mention the price so listeners know it's accessible
- Describe the tasting notes in conversational language
- Explain WHY this sake relates to the topic

TOPIC: ${topic.title}
SUBTITLE: ${topic.subtitle || ""}
NARRATIVE HOOK: ${topic.narrativeHook}

RESEARCH DATA:
${research.geminiResults.join("\n\n---\n\n")}

${research.perplexityResults.length > 0 ? `CURRENT CONTEXT:\n${research.perplexityResults.join("\n\n")}` : ""}

${research.tippsyProducts.length > 0 ? `
**SAKE PRODUCTS TO RECOMMEND (use these exact details):**
${research.tippsyProducts.map((p: any) => `
• ${p.productName || p.name}
  - Brewery: ${p.brewery}
  - Category: ${p.category}
  - Price: $${p.price}
  - Alcohol: ${p.alcohol}%
  - Description: ${p.description}
  - Rating: ${p.averageRating}/5
`).join("\n")}
` : ""}

Write the script. Each line must start with either "TOJI:" or "KOJI:". 

CRITICAL: Include at least 2-3 specific sake recommendations from the products above, with their prices and tasting notes woven naturally into the conversation. Make listeners want to try these sakes!`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000,
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Script generation failed: ${error}`)
  }

  const result = await response.json()
  const scriptContent = result.candidates?.[0]?.content?.parts?.[0]?.text || ""
  
  const wordCount = scriptContent.split(/\s+/).length
  const estimatedDuration = Math.ceil(wordCount / 150) // ~150 words per minute

  return {
    content: scriptContent,
    wordCount,
    estimatedDuration,
    generatedAt: Date.now(),
  }
}


// Direct Gemini RAG query (avoids runAction from action issue)
async function queryGeminiRAG(apiKey: string, fileUri: string | undefined, query: string): Promise<string | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
  
  const contents = fileUri ? [{
    parts: [
      { fileData: { mimeType: "text/markdown", fileUri } },
      { text: `Based on the brewery histories document, answer: ${query}\n\nBe specific with brewery names, dates, and details.` }
    ]
  }] : [{
    parts: [{ text: `You are a sake expert. Answer: ${query}` }]
  }]

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: { temperature: 0.2, maxOutputTokens: 1500 },
    }),
  })

  if (!response.ok) {
    console.error("Gemini RAG error:", response.status)
    return null
  }

  const result = await response.json()
  return result.candidates?.[0]?.content?.parts?.[0]?.text || null
}
