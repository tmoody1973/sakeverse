"use node"

import { action } from "./_generated/server"

// Get sake news from Perplexity with structured output
export const fetchSakeNews = action({
  args: {},
  handler: async () => {
    const apiKey = process.env.PERPLEXITY_API_KEY
    if (!apiKey) {
      return { headlines: [], error: "API key not configured" }
    }

    try {
      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sonar",
          messages: [
            {
              role: "user",
              content: "Give me 3 recent news headlines about Japanese sake industry, sake competitions, new sake releases, or sake trends in 2024-2026. Focus on interesting news for sake enthusiasts. Include the source URL for each headline."
            }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "sake_news",
              schema: {
                type: "object",
                properties: {
                  headlines: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        snippet: { type: "string" },
                        emoji: { type: "string" },
                        url: { type: "string" }
                      },
                      required: ["title", "snippet", "emoji", "url"]
                    }
                  }
                },
                required: ["headlines"]
              },
              strict: true
            }
          }
        }),
      })

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content
      if (content) {
        return JSON.parse(content)
      }
      return { headlines: [] }
    } catch (e: any) {
      console.error("Sake news fetch error:", e)
      return { headlines: [], error: e.message }
    }
  },
})
