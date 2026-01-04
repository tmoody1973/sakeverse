# Project Structure

## Directory Layout
```
sakeverse/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Home dashboard
│   ├── layout.tsx                # Root layout with providers
│   ├── globals.css               # RetroUI styles
│   ├── kiki/                     # Voice chat interface
│   │   └── page.tsx
│   ├── library/                  # Saved sake library
│   │   ├── page.tsx
│   │   └── LibraryContent.tsx
│   └── api/c1/chat/              # C1 API route
│       ├── route.ts              # Streaming handler with tools
│       ├── tools.ts              # Tool definitions
│       ├── systemPrompt.ts       # Kiki personality
│       └── messageStore.ts       # Conversation history
├── components/
│   ├── ui/                       # RetroUI base components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   └── Input.tsx
│   ├── voice/                    # Voice/chat components
│   │   ├── KikiChat.tsx          # C1Chat + voice overlay
│   │   ├── VoiceChat.tsx         # Legacy voice component
│   │   ├── VoiceControls.tsx     # Mic button, status
│   │   ├── ChatBubble.tsx        # Message display
│   │   └── C1Message.tsx         # Dynamic UI renderer
│   └── layout/
│       ├── Header.tsx            # Navigation header
│       └── BottomNav.tsx         # Mobile navigation
├── convex/                       # Backend functions
│   ├── schema.ts                 # Database schema
│   ├── sake.ts                   # Product queries
│   ├── embeddings.ts             # Vector search
│   ├── wineToSake.ts             # Wine preference RAG
│   ├── foodPairing.ts            # Food pairing RAG
│   ├── geminiRAG.ts              # PDF knowledge search
│   ├── perplexityAPI.ts          # Live web search
│   ├── userLibrary.ts            # Save/remove sake
│   ├── users.ts                  # User management
│   └── importTippsy.ts           # Data import
├── hooks/
│   ├── useVoiceChat.ts           # OpenAI Realtime integration
│   └── useVoiceToC1.ts           # Voice-to-C1 bridge
├── lib/
│   ├── convex.tsx                # Convex provider
│   ├── utils.ts                  # Utility functions
│   └── thesys/
│       ├── client.ts             # C1 API client
│       └── prompts.ts            # System prompts
└── .kiro/
    ├── steering/                 # Project documentation
    │   ├── product.md
    │   ├── tech.md
    │   └── structure.md
    └── prompts/                  # 18 custom prompts
```

## File Naming Conventions
- **Components**: PascalCase (`KikiChat.tsx`, `VoiceControls.tsx`)
- **Hooks**: camelCase with "use" prefix (`useVoiceChat.ts`)
- **Convex functions**: camelCase (`wineToSake.ts`, `foodPairing.ts`)
- **API routes**: `route.ts` in directory structure

## Key Files
- `app/api/c1/chat/route.ts`: Main C1 endpoint with tool calling
- `hooks/useVoiceChat.ts`: OpenAI Realtime WebRTC integration
- `components/voice/KikiChat.tsx`: Primary chat interface
- `convex/schema.ts`: All database table definitions
- `convex/embeddings.ts`: Vector search implementation

## Configuration Files
- `next.config.js`: Next.js 15 with `serverExternalPackages: ['convex']`
- `tailwind.config.js`: RetroUI theme with cherry blossom colors
- `convex.json`: Convex deployment configuration
- `.env.local`: API keys (OpenAI, Thesys, Clerk)
- Convex env vars: OPENAI_API_KEY, GEMINI_API_KEY, PERPLEXITY_API_KEY
