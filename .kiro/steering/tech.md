# Technical Architecture

## Technology Stack
**Frontend**: Next.js 15 (App Router), TypeScript, React 19, Tailwind CSS
**Backend**: Convex (realtime database, serverless functions, file storage)
**Authentication**: Clerk (sign-in/sign-up with RetroUI styling, onboarding flow)
**Voice Agent**: OpenAI Realtime API (WebRTC) with function tools
**Dynamic UI**: Thesys C1 with Claude Sonnet 4 (`c1/anthropic/claude-sonnet-4/v-20251130`)
**RAG System**: OpenAI Embeddings (vector search), Gemini File Search (PDFs), Perplexity API (live web)
**Maps**: Mapbox GL JS with react-map-gl
**Podcast TTS**: Gemini 2.5 Flash TTS + lamejs MP3 encoding
**Styling**: RetroUI neobrutalism + cherry blossom theme

## Architecture Overview

```
User Interface
├── Landing Page (logged-out marketing)
├── Voice Chat (OpenAI Realtime WebRTC with function tools)
├── C1 Chat (Thesys streaming with tool calling)
├── Learn Pages (courses, chapters, quizzes)
├── Podcast Player (public episodes)
├── Japan Map (Mapbox GL with prefectures)
├── Library Page (Convex realtime)
└── Admin Dashboard (course + podcast generation)
         │
         ▼
    Query Router
├── Wine preference → Wine-to-Sake RAG (13 chunks)
├── Food pairing → Food Pairing RAG (9 chunks)
├── Product search → Vector Search (104 products)
├── Knowledge → Gemini File Search (5 PDFs)
├── Current info → Perplexity API
├── Prefecture info → Perplexity (cached)
└── Visual UI → Thesys C1
         │
         ▼
    Convex Backend
├── sakeProducts (with embeddings)
├── knowledgeChunks (wine-to-sake, food pairing)
├── userLibrary (session-based)
├── users (preferences, onboarding status)
├── courses, chapters, quizzes, questions
├── userCourseProgress, quizAttempts
├── podcastTopics, podcastEpisodes
├── prefectureDescriptions (cached)
└── sakeBreweries (50+ breweries)
```

## Key Technical Decisions

### Learning System
- Perplexity API for course generation (switched from Gemini due to rate limits)
- Content blocks system for flexible chapter content (text, callouts, wine bridges, key terms)
- XP awarded on first completion only (prevents gaming)
- Auto-publish courses for better demo UX

### AI Podcast Network
- **Two-host format**: TOJI (杜氏 master brewer) + KOJI (麹 catalyst) - sake terminology names
- **This American Life style**: Acts, cold opens, reflective moments, natural conversation
- **Gemini 2.5 Flash TTS**: Multi-voice support (Kore for TOJI, Puck for KOJI)
- **lamejs for MP3**: Pure JS encoder works in Convex cloud (no ffmpeg binary needed)
- **Pipeline**: Topic → Research (RAG + Perplexity) → Script → TTS segments → MP3 combine

### Interactive Map
- Mapbox GL with GeoJSON prefecture polygons
- Color coding: Pink = has breweries, Gray = no data
- Perplexity-generated descriptions cached in `prefectureDescriptions` table
- Prefecture name normalization for database matching

### Voice Agent with Function Tools
- OpenAI Realtime API GA format with `session.type: 'realtime'`
- Direct tool calling: `search_sake`, `get_food_pairing`, `wine_to_sake`
- Voice API routes: `/api/voice/search`, `/api/voice/pairing`, `/api/voice/wine-to-sake`

### C1Chat Integration
- C1Chat component handles chat UI, streaming, and message history
- Voice controls overlay on top of C1Chat
- Tools: `search_sake_products`, `get_wine_to_sake_recommendation`, `get_food_pairing`, `save_to_library`

### Authentication & Onboarding
- Clerk for sign-in/sign-up with RetroUI styled pages
- JWT Template configured for Convex authentication
- Clerk webhook syncs users to Convex on create/update/delete
- 4-step onboarding: experience level, taste preferences, food preferences, wine preferences

### Gamification
- XP rewards: 25 (chapter), 50 (quiz pass), 100 (perfect score)
- 10 levels: Sake Curious → Sake Grandmaster (0-10,000 XP)
- Real-time XP display in header

## Environment Variables
**Convex**: OPENAI_API_KEY, GEMINI_API_KEY, PERPLEXITY_API_KEY, GEMINI_FILE_URI
**Next.js**: NEXT_PUBLIC_CONVEX_URL, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, THESYS_API_KEY, NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

## Development Environment
**Required**: Node.js 18+, Convex CLI
**Local Dev**: `npx convex dev` + `npm run dev`

## Code Standards
- TypeScript strict mode
- Functional components with hooks
- Server Components where appropriate
- RetroUI CSS classes for consistent styling
- Dynamic imports with `ssr: false` for auth-dependent components
