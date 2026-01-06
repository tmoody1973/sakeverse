import { action } from "./_generated/server"
import { api } from "./_generated/api"

// Import all topics from the JSON files
export const importAllTopics = action({
  args: {},
  handler: async (ctx) => {
    const results: Record<string, { imported: number; total: number }> = {}
    
    // Sake Stories - 85 topics
    const sakeStoriesData = await import("../podcasts/sake-stories-topics-v2.json")
    const ssTopics = sakeStoriesData.topic_categories.flatMap((cat: any) => cat.topics)
    results.sake_stories = await ctx.runMutation(api.podcastTopics.importTopics, {
      series: "sake_stories",
      topics: ssTopics,
    })
    
    // Pairing Lab - 98 topics
    const pairingLabData = await import("../podcasts/pairing-lab-topics-v2.json")
    const plTopics = pairingLabData.topic_categories.flatMap((cat: any) => cat.topics)
    results.pairing_lab = await ctx.runMutation(api.podcastTopics.importTopics, {
      series: "pairing_lab",
      topics: plTopics,
    })
    
    // The Bridge - 24 topics
    const bridgeData = await import("../podcasts/the-bridge-topics.json")
    results.the_bridge = await ctx.runMutation(api.podcastTopics.importTopics, {
      series: "the_bridge",
      topics: bridgeData.topics,
    })
    
    // Brewing Secrets - 24 topics
    const brewingData = await import("../podcasts/brewing-secrets-topics.json")
    results.brewing_secrets = await ctx.runMutation(api.podcastTopics.importTopics, {
      series: "brewing_secrets",
      topics: brewingData.topics,
    })
    
    return results
  },
})
