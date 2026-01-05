# Technical Architecture

## Technology Stack
**Frontend**: Next.js 15 (App Router), TypeScript, React 19, Tailwind CSS
**Backend**: Convex (realtime database, serverless functions)
**Authentication**: Clerk (sign-in/sign-up with RetroUI styling, onboarding flow)
**Voice Agent**: OpenAI Realtime API (WebRTC) with function tools
**Dynamic UI**: Thesys C1 with Claude Sonnet 4 (`c1/anthropic/claude-sonnet-4/v-20251130`)
**RAG System**: OpenAI Embeddings (vector search), Gemini File Search (PDFs), Perplexity API (live web)
**Styling**: RetroUI neobrutalism + cherry blossom theme

## Architecture Overview

```
User Interface
├── Landing Page (logged-out marketing)
├── Voice Chat (OpenAI Realtime WebRTC with function tools)
├── C1 Chat (Thesys streaming with tool calling)
├── Library Page (Convex realtime)
└── Onboarding (4-step preference capture)
         │
         ▼
    Query Router
├── Wine preference → Wine-to-Sake RAG (13 chunks)
├── Food pairing → Food Pairing RAG (9 chunks)
├── Product search → Vector Search (104 products)
├── Knowledge → Gemini File Search (5 PDFs)
├── Current info → Perplexity API
└── Visual UI → Thesys C1
         │
         ▼
    Convex Backend
├── sakeProducts (with embeddings)
├── knowledgeChunks (wine-to-sake, food pairing)
├── userLibrary (session-based)
└── users (preferences, onboarding status)
```

## Key Technical Decisions

### C1Chat Integration Pattern
- C1Chat component handles chat UI, streaming, and message history
- Voice controls overlay on top of C1Chat
- `useVoiceToC1` hook bridges voice input to C1 via `generate_ui` function tool

### Voice Agent with Function Tools
- OpenAI Realtime API GA format with `session.type: 'realtime'`
- Direct tool calling: `search_sake`, `get_food_pairing`, `wine_to_sake`
- Voice API routes: `/api/voice/search`, `/api/voice/pairing`, `/api/voice/wine-to-sake`
- Product cards display from voice search results

### Tool Calling with runTools
- OpenAI SDK v6 uses `client.chat.completions.runTools()` (non-beta path)
- Manual iteration over `ChatCompletionStreamingRunner` for proper streaming
- Tools: `search_sake_products`, `get_wine_to_sake_recommendation`, `get_food_pairing`, `save_to_library`, `get_user_library`

### Authentication & Onboarding
- Clerk for sign-in/sign-up with RetroUI styled pages
- JWT Template configured for Convex authentication
- Clerk webhook syncs users to Convex on create/update/delete
- 4-step onboarding: experience level, taste preferences, food preferences, wine preferences
- Conditional navigation: logged-out sees landing + auth buttons, logged-in sees full nav
- Settings page at `/settings` for editing preferences post-onboarding

### Dashboard Personalization
- Wine-to-Sake widget fetches user preferences from Convex
- Case-insensitive wine matching for data consistency
- Library widget shows real saved sake from session storage
- Food pairing of the day suggestion

### Session-Based Storage
- User library works without authentication via session ID
- Convex `userLibrary` table stores saved sake per session

## Development Environment
**Required**: Node.js 18+, Convex CLI
**API Keys**: OpenAI, Thesys, Gemini, Perplexity (optional), Clerk
**Local Dev**: `npx convex dev` + `npm run dev`

## Code Standards
- TypeScript strict mode
- Functional components with hooks
- Server Components where appropriate
- RetroUI CSS classes for consistent styling
- Dynamic imports with `ssr: false` for auth-dependent components

## Performance Requirements
- Voice latency: <200ms (WebRTC direct connection)
- C1 streaming: Real-time token display
- Vector search: <100ms response time
