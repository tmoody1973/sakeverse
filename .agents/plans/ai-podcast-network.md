# Feature: AI Podcast Network for Sakécosm

The following plan should be complete, but validate documentation and codebase patterns before implementing.

## Feature Description

Build a complete AI-powered podcast generation system with 4 shows (Sake Stories, Pairing Lab, The Bridge, Brewing Secrets). The system generates episodes from curated topics using multi-source research (Gemini RAG, Perplexity, Firecrawl), creates scripts via LLM, converts to audio via Gemini TTS, and publishes with accompanying blog posts and product recommendations.

## User Story

As a sake enthusiast,
I want to listen to AI-generated educational podcasts about sake,
So that I can learn about breweries, pairings, and brewing techniques while commuting or relaxing.

As an admin,
I want to generate podcast episodes from curated topics,
So that I can build a content library without manual recording.

## Problem Statement

Users want educational sake content in audio format. Manual podcast production is expensive and time-consuming. The existing topic research data (85+ Sake Stories, 98+ Pairing Lab, 24+ Bridge, 24+ Brewing Secrets topics) needs a pipeline to become consumable audio content.

## Solution Statement

Build a multi-stage generation pipeline:
1. Topic selection from pre-curated JSON files
2. Multi-source research aggregation (Gemini RAG + Perplexity + Firecrawl + Tippsy DB)
3. Script generation via Claude
4. Audio generation via Gemini TTS
5. Blog post generation with product recommendations
6. Admin approval workflow
7. Public podcast player and blog pages

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: High
**Primary Systems Affected**: Convex backend, Admin UI, Public podcast pages, Audio storage
**Dependencies**: Gemini API (TTS + RAG), Perplexity API, Firecrawl, Convex file storage

---

## CONTEXT REFERENCES

### Relevant Codebase Files - MUST READ BEFORE IMPLEMENTING

- `convex/schema.ts` - Existing schema patterns, has basic `podcasts` table already
- `convex/dashboard.ts` - Pattern for Perplexity API calls with caching
- `convex/map.ts` - Pattern for Perplexity integration with Convex actions
- `convex/newsCache.ts` - Pattern for internal queries/mutations (Node.js action limitation)
- `convex/learn/generation.ts` - Pattern for AI content generation if exists
- `app/admin/learn/AdminLearnContent.tsx` - Admin UI patterns
- `app/learn/LearnContent.tsx` - Public content display patterns
- `components/map/JapanMap.tsx` - Client component patterns

### Research Documents - MUST READ

- `/podcasts/sakeverse-podcast-system-spec-v2.md` - Complete system specification
- `/podcasts/audio-brief-system-guide.md` - TTS and pipeline architecture guide
- `/podcasts/sake-stories-topics-v2.json` - 85 brewery topics with metadata
- `/podcasts/pairing-lab-topics-v2.json` - 98 food pairing topics
- `/podcasts/the-bridge-topics.json` - 24 wine-to-sake bridge topics
- `/podcasts/brewing-secrets-topics.json` - 24 technical brewing topics

### New Files to Create

```
convex/
├── podcasts/
│   ├── schema.ts          # Extended podcast schema (topics, episodes, products)
│   ├── topics.ts          # Topic queries and mutations
│   ├── episodes.ts        # Episode CRUD
│   ├── generation/
│   │   ├── pipeline.ts    # Main generation orchestrator
│   │   ├── research.ts    # Multi-source research aggregation
│   │   ├── script.ts      # Script generation
│   │   ├── audio.ts       # Gemini TTS integration
│   │   ├── blog.ts        # Blog post generation
│   │   └── products.ts    # Product matching
│   └── public.ts          # Public queries for podcast pages

app/
├── podcasts/
│   ├── page.tsx           # Podcast hub (all shows)
│   ├── PodcastsContent.tsx
│   ├── [showSlug]/
│   │   ├── page.tsx       # Show page (episode list)
│   │   └── [episodeId]/
│   │       ├── page.tsx   # Episode player + blog
│   │       └── EpisodeContent.tsx
├── admin/
│   └── podcasts/
│       ├── page.tsx       # Admin podcast dashboard
│       ├── AdminPodcastsContent.tsx
│       ├── topics/
│       │   └── page.tsx   # Topic browser
│       ├── episodes/
│       │   └── [id]/
│       │       └── page.tsx  # Episode editor
│       └── generate/
│           └── page.tsx   # Generation UI

components/
├── podcasts/
│   ├── AudioPlayer.tsx    # Custom audio player
│   ├── EpisodeCard.tsx    # Episode preview card
│   ├── ShowCard.tsx       # Show/series card
│   ├── ProductRecommendations.tsx
│   └── BlogContent.tsx    # Rendered blog post
```

### Patterns to Follow

**Convex Action Pattern (Node.js for external APIs):**
```typescript
// convex/podcasts/generation/research.ts
"use node"
import { action } from "../../_generated/server"
import { internal } from "../../_generated/api"

export const aggregateResearch = action({
  args: { topicId: v.string() },
  handler: async (ctx, { topicId }) => {
    // Call external APIs here
    // Save results via internal mutation
    await ctx.runMutation(internal.podcasts.episodes.saveResearch, { ... })
  }
})
```

**Internal Query/Mutation Pattern (for Node.js actions):**
```typescript
// convex/podcasts/episodesInternal.ts (NOT "use node")
import { internalMutation, internalQuery } from "../_generated/server"

export const saveResearch = internalMutation({ ... })
export const getEpisode = internalQuery({ ... })
```

**Admin UI Pattern:**
```typescript
// app/admin/podcasts/AdminPodcastsContent.tsx
"use client"
import { useQuery, useMutation, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
```

---

## IMPLEMENTATION PLAN

### Phase 1: Database Schema

Add podcast-specific tables to Convex schema:
- `podcastTopics` - Imported from JSON files
- `podcastEpisodes` - Generated episodes with all content
- `episodeProducts` - Product recommendations per episode
- `generationJobs` - Track async generation progress

### Phase 2: Topic Import

Create import scripts to load topic JSON files into Convex:
- Import all 4 series topic files
- Validate topic structure
- Create admin UI to browse topics

### Phase 3: Research Pipeline

Build multi-source research aggregation:
- Gemini RAG queries (sake books)
- Perplexity API (current news/trends)
- Firecrawl (brewery websites)
- Tippsy DB queries (product matching)

### Phase 4: Script Generation

Create script generation with Claude:
- Series-specific prompts and formats
- Conversational tone for audio
- Include product mentions naturally

### Phase 5: Audio Generation

Integrate Gemini TTS:
- Convert scripts to audio
- Upload to Convex file storage
- Generate audio metadata (duration, etc.)

### Phase 6: Blog Post Generation

Generate accompanying written content:
- SEO-optimized blog posts
- Embedded product recommendations
- Markdown rendering

### Phase 7: Admin Interface

Build admin dashboard:
- Topic browser with filters
- Episode generation trigger
- Approval workflow
- Edit capabilities

### Phase 8: Public Interface

Build public podcast pages:
- Podcast hub with all shows
- Episode player with blog content
- Product recommendation cards

---

## STEP-BY-STEP TASKS

See `ai-podcast-network-tasks.md` for detailed task breakdown.

---

## TESTING STRATEGY

### Unit Tests
- Topic import validation
- Research aggregation mocking
- Script generation output format

### Integration Tests
- Full pipeline with test topic
- Audio file upload/retrieval
- Product matching accuracy

### Manual Validation
- Listen to generated audio quality
- Review blog post readability
- Check product relevance

---

## VALIDATION COMMANDS

### Level 1: TypeScript
```bash
cd /Users/tarikmoody/Documents/Projects/dynamous-kiro-hackathon && npx tsc --noEmit
```

### Level 2: Convex Deploy
```bash
cd /Users/tarikmoody/Documents/Projects/dynamous-kiro-hackathon && npx convex dev --once
```

### Level 3: Build
```bash
cd /Users/tarikmoody/Documents/Projects/dynamous-kiro-hackathon && npm run build
```

### Level 4: Manual Testing
- Import topics: `npx convex run podcasts/import:importAllTopics`
- Generate test episode: Use admin UI
- Play audio: Visit `/podcasts/sake-stories/[episodeId]`

---

## ACCEPTANCE CRITERIA

- [ ] All 4 topic JSON files imported to Convex
- [ ] Admin can browse topics by series
- [ ] Admin can trigger episode generation
- [ ] Research aggregates from multiple sources
- [ ] Scripts generate in correct format per series
- [ ] Audio generates via Gemini TTS
- [ ] Audio uploads to Convex storage
- [ ] Blog posts generate with products
- [ ] Admin approval workflow works
- [ ] Public podcast hub displays shows
- [ ] Episode player plays audio
- [ ] Blog content renders with products
- [ ] Product cards link to Tippsy

---

## ENVIRONMENT VARIABLES NEEDED

```bash
# Already have
PERPLEXITY_API_KEY=...
GEMINI_API_KEY=...

# May need to add
FIRECRAWL_API_KEY=...  # For brewery website scraping
GEMINI_CORPUS_NAME=...  # Gemini File Search corpus ID
```

---

## PRE-IMPLEMENTATION SETUP

### Step 1: Upload Brewery Histories to Gemini File Search

The file `/podcasts/brewery_histories_only.md` (223KB, 68 brewery histories) must be uploaded to Gemini File Search for RAG queries.

**Option A: Google AI Studio (Easiest)**
1. Go to https://aistudio.google.com/
2. Click "New Prompt" → "Create new corpus"
3. Name it "sakecosm-sake-knowledge"
4. Upload `brewery_histories_only.md`
5. Copy the corpus name/ID to `GEMINI_CORPUS_NAME` env var

**Option B: API Upload**
```typescript
// scripts/upload-to-gemini-rag.ts
import { GoogleGenerativeAI } from "@google/generative-ai"
import fs from "fs"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

async function uploadToCorpus() {
  // Create corpus
  const corpus = await genAI.createCorpus({
    displayName: "sakecosm-sake-knowledge",
  })
  
  // Upload file
  const content = fs.readFileSync("podcasts/brewery_histories_only.md", "utf-8")
  await corpus.createDocument({
    displayName: "brewery-histories",
    content: { text: content },
  })
  
  console.log("Corpus ID:", corpus.name)
  // Save this to GEMINI_CORPUS_NAME
}

uploadToCorpus()
```

**Files to upload to Gemini RAG (future):**
- `brewery_histories_only.md` ✅ (68 breweries)
- Any sake books/PDFs you have
- Regional sake guides

### Step 2: Import Topic JSON Files to Convex

Run after schema is deployed:
```bash
npx convex run podcasts/import:importAllTopics
```

This imports:
- `sake-stories-topics-v2.json` → 70 topics ✅ IMPORTED
- `pairing-lab-topics-v2.json` → 96 topics ✅ IMPORTED
- `the-bridge-topics.json` → 12 topics ✅ IMPORTED
- `brewing-secrets-topics.json` → 16 topics ✅ IMPORTED

**Total: 194 podcast topics imported and ready for generation**

---

## NOTES

### Key Decisions
1. **Two-tier architecture**: Fast content generation + async media processing
2. **Convex file storage**: Use Convex for audio files (simpler than S3)
3. **Series-specific prompts**: Each show has unique tone and format
4. **Product matching**: Use existing `tippsyProducts` table with vector search

### Risks
1. **Gemini TTS quality**: May need voice tuning
2. **Generation time**: Full pipeline may take 2-5 minutes per episode
3. **API costs**: Perplexity + Gemini costs per episode

### Future Enhancements
- RSS feed generation
- Apple/Spotify podcast distribution
- User favorites and playlists
- Episode comments/ratings

---

## CONFIDENCE SCORE: 7/10

High complexity feature with multiple external API integrations. Schema and patterns are well-documented in spec files. Main risks are API integration edge cases and audio quality tuning.
