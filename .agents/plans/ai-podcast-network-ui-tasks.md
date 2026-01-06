# AI Podcast Network - UI Tasks

## Phase 6: Blog Post Generation

### Task 6.1: CREATE convex/podcasts/generation/blog.ts

```typescript
"use node"

import { action } from "../../_generated/server"
import { internal } from "../../_generated/api"
import { v } from "convex/values"

export const generateBlogPost = action({
  args: {
    episodeId: v.id("podcastEpisodes"),
  },
  handler: async (ctx, { episodeId }) => {
    const episode = await ctx.runQuery(internal.podcasts.episodes.getEpisode, { episodeId })
    if (!episode?.script) throw new Error("No script found")
    
    const topic = await ctx.runQuery(internal.podcasts.generation.researchInternal.getTopic, {
      topicId: episode.topicId,
    })
    
    const prompt = `
Convert this podcast script into a blog post.

SCRIPT:
${episode.script.content}

PRODUCTS TO FEATURE:
${JSON.stringify(episode.recommendedProducts || [], null, 2)}

REQUIREMENTS:
1. SEO-optimized title (different from episode title)
2. 150-160 character meta description
3. 800-1200 words
4. Include product recommendations naturally
5. Add "What to Try" section with product links
6. Use markdown formatting
7. Include key terms and definitions

Return JSON:
{
  "title": "string",
  "slug": "url-safe-slug",
  "excerpt": "1-2 sentence preview",
  "content": "full markdown",
  "metaDescription": "string",
  "keywords": ["array"],
  "wordCount": number
}
`

    // TODO: Call Claude API
    const blogData = {
      title: episode.title + " - Blog",
      slug: episode.topicId.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      excerpt: "Blog excerpt placeholder",
      content: "# Blog content\n\nPlaceholder...",
      metaDescription: "Meta description placeholder",
      keywords: ["sake", topic?.series || ""],
      wordCount: 100,
    }
    
    await ctx.runMutation(internal.podcasts.episodes.saveBlogPost, {
      episodeId,
      blogPost: {
        ...blogData,
        generatedAt: Date.now(),
      },
    })
    
    return { success: true }
  },
})
```

---

## Phase 7: Admin Interface

### Task 7.1: CREATE app/admin/podcasts/page.tsx

```typescript
import { AdminPodcastsContent } from "./AdminPodcastsContent"

export default function AdminPodcastsPage() {
  return <AdminPodcastsContent />
}
```

### Task 7.2: CREATE app/admin/podcasts/AdminPodcastsContent.tsx

```typescript
"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useState } from "react"
import Link from "next/link"

const SERIES = [
  { id: "sake_stories", name: "Sake Stories", icon: "📖", color: "bg-sakura-pink" },
  { id: "pairing_lab", name: "Pairing Lab", icon: "🍽️", color: "bg-sake-warm" },
  { id: "the_bridge", name: "The Bridge", icon: "🍷", color: "bg-plum-dark" },
  { id: "brewing_secrets", name: "Brewing Secrets", icon: "🔬", color: "bg-sake-mist" },
]

export function AdminPodcastsContent() {
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null)
  
  const stats = useQuery(api.podcasts.admin.getStats)
  const topics = useQuery(api.podcasts.topics.listBySeries, 
    selectedSeries ? { series: selectedSeries } : "skip"
  )
  const recentEpisodes = useQuery(api.podcasts.episodes.listRecent, { limit: 10 })
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Podcast Admin</h1>
        <Link 
          href="/admin/podcasts/generate"
          className="px-4 py-2 bg-sakura-pink border-2 border-ink rounded-lg shadow-[3px_3px_0px_#2D2D2D] hover:shadow-[4px_4px_0px_#2D2D2D] transition-all"
        >
          Generate Episode
        </Link>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {SERIES.map(series => (
          <button
            key={series.id}
            onClick={() => setSelectedSeries(series.id)}
            className={`p-4 rounded-xl border-2 border-ink shadow-[3px_3px_0px_#2D2D2D] ${
              selectedSeries === series.id ? series.color : "bg-white"
            }`}
          >
            <span className="text-2xl">{series.icon}</span>
            <p className="font-semibold mt-2">{series.name}</p>
            <p className="text-sm text-gray-600">
              {stats?.[series.id]?.topics || 0} topics
            </p>
            <p className="text-sm text-gray-600">
              {stats?.[series.id]?.episodes || 0} episodes
            </p>
          </button>
        ))}
      </div>
      
      {/* Topics List */}
      {selectedSeries && topics && (
        <div className="bg-white rounded-xl border-2 border-ink p-4">
          <h2 className="font-semibold mb-4">
            {SERIES.find(s => s.id === selectedSeries)?.name} Topics
          </h2>
          <div className="space-y-2">
            {topics.map(topic => (
              <div 
                key={topic._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{topic.title}</p>
                  <p className="text-sm text-gray-600">{topic.subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded ${
                    topic.status === "ready" ? "bg-green-100 text-green-800" :
                    topic.status === "generated" ? "bg-blue-100 text-blue-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {topic.status}
                  </span>
                  {topic.status === "ready" && (
                    <Link
                      href={`/admin/podcasts/generate?topic=${topic.topicId}`}
                      className="px-3 py-1 text-sm bg-sakura-pink rounded border border-ink"
                    >
                      Generate
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Recent Episodes */}
      <div className="bg-white rounded-xl border-2 border-ink p-4">
        <h2 className="font-semibold mb-4">Recent Episodes</h2>
        <div className="space-y-2">
          {recentEpisodes?.map(episode => (
            <Link
              key={episode._id}
              href={`/admin/podcasts/episodes/${episode._id}`}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <div>
                <p className="font-medium">{episode.title}</p>
                <p className="text-sm text-gray-600">{episode.series}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded ${
                episode.status === "published" ? "bg-green-100 text-green-800" :
                episode.status === "review" ? "bg-yellow-100 text-yellow-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {episode.status}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### Task 7.3: CREATE app/admin/podcasts/generate/page.tsx

Generation UI with topic selection and progress tracking.

---

## Phase 8: Public Interface

### Task 8.1: CREATE app/podcasts/page.tsx

```typescript
import { PodcastsContent } from "./PodcastsContent"

export default function PodcastsPage() {
  return <PodcastsContent />
}
```

### Task 8.2: CREATE app/podcasts/PodcastsContent.tsx

```typescript
"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import Link from "next/link"

const SHOWS = [
  { 
    id: "sake_stories", 
    name: "Sake Stories", 
    icon: "📖",
    description: "Legendary breweries and the people behind them",
    schedule: "Every Monday",
    color: "bg-sakura-pink",
  },
  { 
    id: "pairing_lab", 
    name: "Pairing Lab", 
    icon: "🍽️",
    description: "Unexpected sake and food combinations",
    schedule: "Every Wednesday",
    color: "bg-sake-warm",
  },
  { 
    id: "the_bridge", 
    name: "The Bridge", 
    icon: "🍷",
    description: "From wine lover to sake enthusiast",
    schedule: "Every Friday",
    color: "bg-plum-dark text-white",
  },
  { 
    id: "brewing_secrets", 
    name: "Brewing Secrets", 
    icon: "🔬",
    description: "The science and art of sake making",
    schedule: "1st & 15th of each month",
    color: "bg-sake-mist",
  },
]

export function PodcastsContent() {
  const latestEpisodes = useQuery(api.podcasts.public.getLatestEpisodes, { limit: 6 })
  const nowPlaying = useQuery(api.podcasts.public.getFeaturedEpisode)
  
  return (
    <div className="p-4 pb-24 space-y-6">
      <h1 className="text-2xl font-bold">Podcasts</h1>
      
      {/* Now Playing */}
      {nowPlaying && (
        <div className="bg-plum-dark text-white rounded-xl border-2 border-ink p-4 shadow-[4px_4px_0px_#2D2D2D]">
          <p className="text-xs uppercase tracking-wide opacity-80">Now Playing</p>
          <h2 className="text-xl font-bold mt-1">{nowPlaying.title}</h2>
          <p className="text-sm opacity-80 mt-1">{nowPlaying.series}</p>
          
          {/* Audio Player */}
          <div className="mt-4">
            <audio 
              src={nowPlaying.audio?.url} 
              controls 
              className="w-full"
            />
          </div>
        </div>
      )}
      
      {/* Shows */}
      <div>
        <h2 className="font-semibold mb-3">Browse Shows</h2>
        <div className="grid grid-cols-2 gap-3">
          {SHOWS.map(show => (
            <Link
              key={show.id}
              href={`/podcasts/${show.id}`}
              className={`p-4 rounded-xl border-2 border-ink shadow-[3px_3px_0px_#2D2D2D] ${show.color}`}
            >
              <span className="text-2xl">{show.icon}</span>
              <p className="font-semibold mt-2">{show.name}</p>
              <p className="text-xs mt-1 opacity-80">{show.schedule}</p>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Latest Episodes */}
      <div>
        <h2 className="font-semibold mb-3">Latest Episodes</h2>
        <div className="space-y-3">
          {latestEpisodes?.map(episode => (
            <Link
              key={episode._id}
              href={`/podcasts/${episode.series}/${episode._id}`}
              className="flex items-center gap-3 p-3 bg-white rounded-xl border-2 border-ink shadow-[2px_2px_0px_#2D2D2D]"
            >
              <span className="text-2xl">
                {SHOWS.find(s => s.id === episode.series)?.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{episode.title}</p>
                <p className="text-xs text-gray-600">
                  {episode.audio?.duration ? `${Math.round(episode.audio.duration / 60)} min` : ""}
                </p>
              </div>
              <button className="p-2 bg-sakura-pink rounded-full border border-ink">
                ▶
              </button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### Task 8.3: CREATE app/podcasts/[showSlug]/[episodeId]/page.tsx

Episode detail page with audio player, blog content, and product recommendations.

### Task 8.4: CREATE components/podcasts/AudioPlayer.tsx

Custom audio player with RetroUI styling.

### Task 8.5: CREATE components/podcasts/ProductRecommendations.tsx

Product cards linking to Tippsy.

---

## Navigation Updates

### Task 9.1: UPDATE components/layout/BottomNav.tsx

Add Podcasts link:
```typescript
{ href: "/podcasts", icon: Headphones, label: "Podcasts" }
```

### Task 9.2: UPDATE components/layout/Header.tsx

Add Podcasts to desktop nav.

---

## Convex Queries Needed

### Task 10.1: CREATE convex/podcasts/topics.ts

```typescript
import { query } from "../_generated/server"
import { v } from "convex/values"

export const listBySeries = query({
  args: { series: v.string() },
  handler: async (ctx, { series }) => {
    return await ctx.db
      .query("podcastTopics")
      .withIndex("by_series", q => q.eq("series", series))
      .order("asc")
      .collect()
  },
})

export const getByTopicId = query({
  args: { topicId: v.string() },
  handler: async (ctx, { topicId }) => {
    return await ctx.db
      .query("podcastTopics")
      .withIndex("by_topicId", q => q.eq("topicId", topicId))
      .first()
  },
})
```

### Task 10.2: CREATE convex/podcasts/episodes.ts

```typescript
import { query, mutation } from "../_generated/server"
import { v } from "convex/values"

export const listRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 10 }) => {
    return await ctx.db
      .query("podcastEpisodes")
      .order("desc")
      .take(limit)
  },
})

export const getBySeriesAndId = query({
  args: { 
    series: v.string(),
    episodeId: v.id("podcastEpisodes"),
  },
  handler: async (ctx, { episodeId }) => {
    return await ctx.db.get(episodeId)
  },
})

export const listBySeries = query({
  args: { series: v.string() },
  handler: async (ctx, { series }) => {
    return await ctx.db
      .query("podcastEpisodes")
      .withIndex("by_series", q => q.eq("series", series))
      .filter(q => q.eq(q.field("status"), "published"))
      .order("desc")
      .collect()
  },
})
```

### Task 10.3: CREATE convex/podcasts/public.ts

```typescript
import { query } from "../_generated/server"
import { v } from "convex/values"

export const getLatestEpisodes = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 6 }) => {
    return await ctx.db
      .query("podcastEpisodes")
      .filter(q => q.eq(q.field("status"), "published"))
      .order("desc")
      .take(limit)
  },
})

export const getFeaturedEpisode = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("podcastEpisodes")
      .filter(q => q.eq(q.field("status"), "published"))
      .order("desc")
      .first()
  },
})
```

---

## Final Checklist

- [ ] Schema added to convex/schema.ts
- [ ] Topic import script works
- [ ] Research pipeline aggregates data
- [ ] Script generation produces valid output
- [ ] Audio generation uploads to storage
- [ ] Blog post generation works
- [ ] Admin UI shows topics and episodes
- [ ] Admin can trigger generation
- [ ] Public podcast hub displays shows
- [ ] Episode player works
- [ ] Product recommendations display
- [ ] Navigation updated
