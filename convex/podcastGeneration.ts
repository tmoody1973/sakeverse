"use node"

import { action } from "./_generated/server"
import { api, internal } from "./_generated/api"
import { v } from "convex/values"

// Main episode generation action
export const generateEpisode = action({
  args: {
    topicId: v.string(),
  },
  handler: async (ctx, { topicId }): Promise<{ success: boolean; episodeId?: string; error?: string }> => {
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

      // 5. Mark as generated (audio/blog can be added later)
      await ctx.runMutation(internal.podcastEpisodes.updateStatus, {
        episodeId,
        status: "review",
      })

      // 6. Update topic status
      await ctx.runMutation(internal.podcastTopics.updateStatus, {
        topicId,
        status: "generated",
      })

      return { success: true, episodeId }
    } catch (error: any) {
      console.error("Generation error:", error)
      return { success: false, error: error.message }
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

  // 1. Gemini RAG queries
  for (const query of topic.researchQueries.geminiRag.slice(0, 2)) {
    try {
      const ragResult = await ctx.runAction(api.podcastRAG.queryBreweryKnowledge, { query })
      if (ragResult.chunks?.[0]?.content) {
        results.geminiResults.push(ragResult.chunks[0].content)
      }
    } catch (e) {
      console.error("RAG query failed:", e)
    }
  }

  // 2. Perplexity queries
  const perplexityKey = process.env.PERPLEXITY_API_KEY
  if (perplexityKey) {
    for (const query of topic.researchQueries.perplexity.slice(0, 2)) {
      try {
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
          }
        }
      } catch (e) {
        console.error("Perplexity query failed:", e)
      }
    }
  }

  // 3. Tippsy products (if brewery specified)
  if (topic.metadata?.brewery) {
    try {
      const products = await ctx.runQuery(api.sake.searchByBrewery, { 
        brewery: topic.metadata.brewery,
        limit: 5,
      })
      results.tippsyProducts = products || []
    } catch (e) {
      console.error("Tippsy query failed:", e)
    }
  }

  return results
}

// Generate script using Claude/Gemini
async function generateScript(ctx: any, topic: any, research: any) {
  const geminiKey = process.env.GEMINI_API_KEY
  if (!geminiKey) {
    throw new Error("GEMINI_API_KEY not configured")
  }

  const seriesPrompts: Record<string, string> = {
    sake_stories: `You are writing a podcast script for "Sake Stories" - a show about legendary sake breweries.
Tone: Warm, narrative, like a documentary. Single host speaking directly to listener.
Format: 8-12 minute episode (~1200-1800 words)
Structure: Hook → History → Transformation → Tasting notes → Conclusion`,

    pairing_lab: `You are writing a podcast script for "Pairing Lab" - a show about sake and food pairings.
Tone: Playful, experimental, practical. Single host.
Format: 6-10 minute episode (~900-1500 words)
Structure: Hook → The Challenge → The Solution → Experiment → Listener Action`,

    the_bridge: `You are writing a podcast script for "The Bridge" - helping wine lovers discover sake.
Tone: Sophisticated, approachable, comparative. Single host.
Format: 8-12 minute episode (~1200-1800 words)
Structure: Wine Anchor → Translation → Sake Destination → Tasting Journey`,

    brewing_secrets: `You are writing a podcast script for "Brewing Secrets" - technical sake education.
Tone: Educational, clear, detailed. Single host.
Format: 10-15 minute episode (~1500-2200 words)
Structure: Concept Introduction → Science → Practical Impact → Tasting Examples`,
  }

  const systemPrompt = seriesPrompts[topic.series] || seriesPrompts.sake_stories

  const prompt = `${systemPrompt}

TOPIC: ${topic.title}
SUBTITLE: ${topic.subtitle || ""}
NARRATIVE HOOK: ${topic.narrativeHook}

RESEARCH DATA:
${research.geminiResults.join("\n\n---\n\n")}

${research.perplexityResults.length > 0 ? `CURRENT NEWS/TRENDS:\n${research.perplexityResults.join("\n\n")}` : ""}

${research.tippsyProducts.length > 0 ? `AVAILABLE PRODUCTS:\n${research.tippsyProducts.map((p: any) => `- ${p.productName} (${p.brewery}) - $${p.price}`).join("\n")}` : ""}

Write a complete podcast script. Include:
1. Natural conversational flow (single host speaking to listener)
2. Pronunciation guides for Japanese terms in parentheses, e.g., "Junmai (JOON-my)"
3. Pauses marked with [PAUSE]
4. Emphasis marked with *asterisks*
5. Product mentions woven naturally

Return ONLY the script text, no metadata or formatting instructions.`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
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
