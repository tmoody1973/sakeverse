# Project Structure

## Directory Layout
```
sakecosm/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Home (landing or dashboard based on auth)
│   ├── layout.tsx                # Root layout with ClerkProvider
│   ├── globals.css               # RetroUI styles
│   ├── kiki/                     # Voice chat interface
│   │   └── page.tsx
│   ├── library/                  # Saved sake library
│   │   ├── page.tsx
│   │   └── LibraryContent.tsx
│   ├── onboarding/               # 4-step onboarding flow
│   │   └── page.tsx
│   ├── sign-in/[[...sign-in]]/   # Clerk sign-in
│   │   └── page.tsx
│   ├── sign-up/[[...sign-up]]/   # Clerk sign-up
│   │   └── page.tsx
│   └── api/
│       ├── c1/chat/              # C1 API route
│       │   ├── route.ts          # Streaming handler with tools
│       │   ├── tools.ts          # Tool definitions
│       │   ├── systemPrompt.ts   # Kiki personality
│       │   └── messageStore.ts   # Conversation history
│       └── voice/                # Voice API routes
│           ├── search/route.ts   # Sake search
│           ├── pairing/route.ts  # Food pairing
│           └── wine-to-sake/route.ts
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
│   ├── landing/                  # Marketing landing page
│   │   └── LandingPage.tsx
│   ├── onboarding/               # Onboarding flow
│   │   └── OnboardingContent.tsx
│   ├── dashboard/                # Dashboard components
│   │   └── DashboardContent.tsx
│   └── layout/
│       ├── Header.tsx            # Navigation header (conditional)
│       └── BottomNav.tsx         # Mobile navigation
├── convex/                       # Backend functions
│   ├── schema.ts                 # Database schema
│   ├── sake.ts                   # Product queries
│   ├── embeddings.ts             # Vector search
│   ├── wineToSake.ts             # Wine preference RAG
│   ├── foodPairing.ts            # Food pairing RAG
│   ├── geminiRAG.ts              # PDF knowledge search
│   ├── perplexityAPI.ts          # Live web search
│   ├── dashboard.ts              # Sake news (Perplexity)
│   ├── userLibrary.ts            # Save/remove sake
│   ├── users.ts                  # User management + preferences
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
├── public/
│   └── sakverse-logo.svg         # Logo file
└── .kiro/
    ├── steering/                 # Project documentation
    │   ├── product.md
    │   ├── tech.md
    │   └── structure.md
    └── prompts/                  # Custom development prompts
```

## File Naming Conventions
- **Components**: PascalCase (`KikiChat.tsx`, `VoiceControls.tsx`)
- **Hooks**: camelCase with "use" prefix (`useVoiceChat.ts`)
- **Convex functions**: camelCase (`wineToSake.ts`, `foodPairing.ts`)
- **API routes**: `route.ts` in directory structure

## Key Files
- `app/api/c1/chat/route.ts`: Main C1 endpoint with tool calling
- `app/api/webhooks/clerk/route.ts`: Clerk webhook for user sync
- `hooks/useVoiceChat.ts`: OpenAI Realtime WebRTC integration
- `components/voice/KikiChat.tsx`: Primary chat interface
- `components/layout/Header.tsx`: Conditional nav (logged-in vs logged-out)
- `components/layout/AppShell.tsx`: Client-side provider wrapper
- `components/landing/LandingPage.tsx`: Marketing page for logged-out users
- `components/onboarding/OnboardingContent.tsx`: 4-step preference capture
- `app/settings/SettingsContent.tsx`: Edit preferences page
- `app/HomeContent.tsx`: Dashboard with personalized widgets
- `convex/schema.ts`: All database table definitions
- `convex/embeddings.ts`: Vector search implementation
- `convex/users.ts`: User preferences, onboarding, webhook handlers
- `convex/auth.config.js`: Clerk domain configuration for Convex
- `lib/convex.tsx`: Combined Clerk + Convex providers
- `middleware.ts`: Clerk route protection

## Configuration Files
- `next.config.js`: Next.js 15 with `serverExternalPackages: ['convex']`
- `tailwind.config.js`: RetroUI theme with cherry blossom colors
- `convex.json`: Convex deployment configuration
- `.env.local`: API keys (OpenAI, Thesys, Clerk)
- `.npmrc`: `legacy-peer-deps=true` for Zod version conflict
- Convex env vars: OPENAI_API_KEY, GEMINI_API_KEY, PERPLEXITY_API_KEY
