// Import all podcast topics from JSON files to Convex
// Run with: npx ts-node scripts/import-podcast-topics.ts

import { ConvexHttpClient } from "convex/browser"
import { api } from "../convex/_generated/api"
import * as fs from "fs"
import * as path from "path"

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "https://loyal-orca-30.convex.cloud"

async function importAllTopics() {
  const client = new ConvexHttpClient(CONVEX_URL)
  
  const podcastsDir = path.join(__dirname, "../podcasts")
  
  // 1. Sake Stories
  console.log("Importing Sake Stories topics...")
  const sakeStoriesData = JSON.parse(
    fs.readFileSync(path.join(podcastsDir, "sake-stories-topics-v2.json"), "utf-8")
  )
  const ssTopics = sakeStoriesData.topic_categories.flatMap((cat: any) => cat.topics)
  const ssResult = await client.mutation(api.podcastTopics.importTopics, {
    series: "sake_stories",
    topics: ssTopics,
  })
  console.log(`  Sake Stories: ${ssResult.imported}/${ssResult.total} imported`)
  
  // 2. Pairing Lab
  console.log("Importing Pairing Lab topics...")
  const pairingLabData = JSON.parse(
    fs.readFileSync(path.join(podcastsDir, "pairing-lab-topics-v2.json"), "utf-8")
  )
  const plTopics = pairingLabData.topic_categories.flatMap((cat: any) => cat.topics)
  const plResult = await client.mutation(api.podcastTopics.importTopics, {
    series: "pairing_lab",
    topics: plTopics,
  })
  console.log(`  Pairing Lab: ${plResult.imported}/${plResult.total} imported`)
  
  // 3. The Bridge
  console.log("Importing The Bridge topics...")
  const bridgeData = JSON.parse(
    fs.readFileSync(path.join(podcastsDir, "the-bridge-topics.json"), "utf-8")
  )
  const brResult = await client.mutation(api.podcastTopics.importTopics, {
    series: "the_bridge",
    topics: bridgeData.topics,
  })
  console.log(`  The Bridge: ${brResult.imported}/${brResult.total} imported`)
  
  // 4. Brewing Secrets
  console.log("Importing Brewing Secrets topics...")
  const brewingData = JSON.parse(
    fs.readFileSync(path.join(podcastsDir, "brewing-secrets-topics.json"), "utf-8")
  )
  const bsResult = await client.mutation(api.podcastTopics.importTopics, {
    series: "brewing_secrets",
    topics: brewingData.topics,
  })
  console.log(`  Brewing Secrets: ${bsResult.imported}/${bsResult.total} imported`)
  
  console.log("\n✅ Import complete!")
  
  // Get final counts
  const counts = await client.query(api.podcastTopics.getSeriesCounts, {})
  console.log("\nTopic counts by series:")
  for (const [series, data] of Object.entries(counts)) {
    console.log(`  ${series}: ${(data as any).total} topics`)
  }
}

importAllTopics().catch(console.error)
