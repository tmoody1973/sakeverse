# Technical Architecture

## Technology Stack
**Frontend**: Next.js 15 (App Router), TypeScript, React 19, Tailwind CSS
**Backend**: Convex (realtime database, serverless functions, file storage)
**Authentication**: Clerk (sign-in/sign-up with RetroUI styling, onboarding flow)
**Voice Agent**: OpenAI Realtime API (WebRTC) with function tools
**Dynamic UI**: Thesys C1 with Claude Sonnet 4 (`c1/anthropic/claude-sonnet-4/v-20251130`)
**RAG System**: OpenAI Embeddings (vector search), Gemini File Search (PDFs), Perplexity API (live web)
**Maps**: Mapbox GL JS with react-map-gl
**Podcast TTS**: Gemini 2.5 Flash TTS with WAV output (switched from MP3 due to lamejs Node.js 22 issues)
**Audio Player**: react-h5-audio-player for reliable playback with progress tracking
**Image Generation**: Gemini 2.5 Flash Image for AI-generated course covers (Stardew Valley pixel art style)
**Fonts**: Inter (body), Space Grotesk (display), Noto Sans JP (Japanese), Silkscreen (pixel stats)
**Styling**: RetroUI neobrutalism + cherry blossom theme

## Architecture Overview

```
User Interface
├── Landing Page (logged-out marketing)
├── Voice Chat (OpenAI Realtime WebRTC with function tools)
├── C1 Chat (Thesys streaming with tool calling)
├── Learn Pages (courses, chapters, quizzes)
├── Podcast Player (public episodes with react-h5-audio-player)
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
- **AI-generated course covers**: Gemini 2.5 Flash Image creates Stardew Valley pixel art style images
- **Convex file storage**: Images stored in Convex storage (base64 too large for string fields)
- **Expert tips enhancement**: Perplexity max_tokens increased to 1000, structured prompts with headers

### AI Podcast Network
- **Two-host format**: TOJI (杜氏 master brewer) + KOJI (麹 catalyst) - sake terminology names
- **This American Life style**: Acts, cold opens, reflective moments, natural conversation
- **Gemini 2.5 Flash TTS**: Multi-voice support (Kore for TOJI, Puck for KOJI)
- **WAV format**: Switched from MP3 due to lamejs `MPEGMode is not defined` bug in Node.js 22
- **Two-step generation**: Script and audio generation separated to avoid Convex nested action limitation
- **4000 char chunking**: TTS requests chunked at newlines to preserve dialogue structure
- **Cancel support**: Episodes can be cancelled mid-generation via status check before each TTS chunk
- **Pipeline**: Topic → Research (RAG + Perplexity) → Script → TTS segments → WAV combine

### Interactive Map
- Mapbox GL with GeoJSON prefecture polygons
- Color coding: Pink = has breweries, Gray = no data
- Perplexity-generated descriptions cached in `prefectureDescriptions` table
- Prefecture name normalization for database matching

### Voice Agent with Function Tools
- OpenAI Realtime API GA format with `session.type: 'realtime'`
- Direct tool calling: `search_sake`, `get_food_pairing`, `wine_to_sake`
- Voice API routes: `/api/voice/search`, `/api/voice/pairing`, `/api/voice/wine-to-sake`
- **Clean disconnect**: Explicitly stops all AudioBufferSourceNodes on disconnect (closing AudioContext alone doesn't stop queued audio)

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
- **Silkscreen pixel font**: Dashboard stats use retro pixel font for numbers
- **Circular stat badges**: Stats displayed in white circles with RetroUI borders and shadows

## Key Technical Learnings

### Convex Limitations
- **No nested actions**: Cannot call `ctx.runAction()` from within an action - causes cryptic "performAsyncSyscall" errors
- **Solution**: Separate into distinct user-triggered steps (e.g., generate script, then generate audio)

### Convex Runtime Limitations
- **No Buffer class**: `Buffer.from(base64, 'base64')` doesn't work in Convex actions
- **Solution**: Use `atob()` and `Uint8Array` for base64 decoding
- **String field size limits**: Base64 images (~2MB) too large for string fields
- **Solution**: Use Convex file storage for large binary data

### Audio Processing
- **lamejs Node.js 22 bug**: `MPEGMode is not defined` - no pure JS MP3 encoder works reliably in modern Node
- **WAV vs MP3 tradeoff**: WAV files ~10x larger but 100% reliable; MP3 encoding requires native binaries
- **Audio source cleanup**: Must explicitly call `source.stop()` on all AudioBufferSourceNodes to stop playback

### TTS Rate Limits
- **Gemini TTS**: ~4000-5000 character limit per request
- **500 errors**: Indicate rate limiting or server overload
- **Chunking strategy**: Split at newlines to preserve dialogue structure

### API Response Structures
- **Perplexity images**: Use `result.images[0].image_url` (not `.url`)
- **Gemini Image**: Extract from `response.candidates[0].content.parts[].inlineData.data`

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
