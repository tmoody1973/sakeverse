# Technical Architecture

## Technology Stack
**Frontend**: Next.js 15 (App Router), TypeScript, React 19, Tailwind CSS
**Backend**: Convex (realtime database, serverless functions)
**Authentication**: Clerk (optional, graceful fallback when not configured)
**Voice Agent**: OpenAI Realtime API (WebRTC) with function tools
**Dynamic UI**: Thesys C1 with Claude Sonnet 4 (`c1/anthropic/claude-sonnet-4/v-20251130`)
**RAG System**: OpenAI Embeddings (vector search), Gemini File Search (PDFs), Perplexity API (live web)
**Styling**: RetroUI neobrutalism + cherry blossom theme

## Architecture Overview

```
User Interface
├── Voice Chat (OpenAI Realtime WebRTC)
├── C1 Chat (Thesys streaming with tool calling)
└── Library Page (Convex realtime)
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
└── userLibrary (session-based)
```

## Key Technical Decisions

### C1Chat Integration Pattern
- C1Chat component handles chat UI, streaming, and message history
- Voice controls overlay on top of C1Chat
- `useVoiceToC1` hook bridges voice input to C1 via `generate_ui` function tool

### Tool Calling with runTools
- OpenAI SDK v6 uses `client.chat.completions.runTools()` (non-beta path)
- Manual iteration over `ChatCompletionStreamingRunner` for proper streaming
- Tools: `search_sake_products`, `get_wine_to_sake_recommendation`, `get_food_pairing`, `save_to_library`, `get_user_library`

### Session-Based Storage
- User library works without authentication via session ID
- Convex `userLibrary` table stores saved sake per session

## Development Environment
**Required**: Node.js 18+, Convex CLI
**API Keys**: OpenAI, Thesys, Gemini, Perplexity (optional)
**Local Dev**: `npx convex dev` + `npm run dev`

## Code Standards
- TypeScript strict mode
- Functional components with hooks
- Server Components where appropriate
- RetroUI CSS classes for consistent styling

## Performance Requirements
- Voice latency: <200ms (WebRTC direct connection)
- C1 streaming: Real-time token display
- Vector search: <100ms response time
