# Project Structure

## Directory Layout
```
sakecosm/
├── app/
│   ├── page.tsx                  # Home (landing or dashboard)
│   ├── layout.tsx                # Root layout with providers
│   ├── globals.css               # RetroUI styles
│   ├── kiki/page.tsx             # Voice chat interface
│   ├── library/                  # Saved sake library
│   ├── discover/                 # Sake catalog browser
│   ├── map/                      # Interactive Japan map
│   │   ├── page.tsx
│   │   └── MapContent.tsx
│   ├── learn/                    # Learning system
│   │   ├── page.tsx              # Course catalog
│   │   └── [slug]/               # Course detail + chapters
│   ├── podcasts/                 # Public podcast pages
│   │   ├── page.tsx              # Podcast hub
│   │   └── [series]/[episodeId]/ # Episode player
│   ├── admin/                    # Admin dashboard
│   │   ├── page.tsx              # Admin hub
│   │   ├── learn/                # Course generator
│   │   └── podcasts/             # Podcast generator
│   │       ├── page.tsx          # Dashboard
│   │       ├── generate/         # Topic selection
│   │       └── episodes/         # Preview/publish
│   ├── settings/                 # User preferences
│   ├── onboarding/               # 4-step flow
│   ├── sign-in/[[...sign-in]]/   # Clerk auth
│   ├── sign-up/[[...sign-up]]/
│   └── api/
│       ├── c1/chat/              # Thesys C1 endpoint
│       ├── voice/                # Voice tool routes
│       └── webhooks/clerk/       # User sync
├── components/
│   ├── ui/                       # RetroUI components
│   ├── voice/                    # Chat components
│   ├── map/                      # JapanMap, PrefecturePanel
│   ├── landing/                  # Marketing page
│   ├── onboarding/               # Onboarding flow
│   ├── dashboard/                # Dashboard widgets
│   └── layout/                   # Header, BottomNav
├── convex/
│   ├── schema.ts                 # All tables
│   ├── sake.ts                   # Product queries
│   ├── embeddings.ts             # Vector search
│   ├── wineToSake.ts             # Wine RAG
│   ├── foodPairing.ts            # Food RAG
│   ├── geminiRAG.ts              # PDF search
│   ├── perplexityAPI.ts          # Web search
│   ├── map.ts                    # Prefecture queries
│   ├── recommendations.ts        # Personalized recs
│   ├── gamification.ts           # XP, levels
│   ├── learn/                    # Learning system
│   │   ├── courses.ts
│   │   ├── progress.ts
│   │   ├── quizzes.ts
│   │   ├── generation.ts         # Perplexity course gen
│   │   └── seed.ts
│   ├── podcastTopics.ts          # Topic management
│   ├── podcastEpisodes.ts        # Episode CRUD
│   ├── podcastGeneration.ts      # Script generation
│   ├── podcastTTS.ts             # Multi-voice TTS + MP3
│   ├── podcastRAG.ts             # Gemini File API
│   ├── userLibrary.ts
│   ├── users.ts
│   └── sakeBreweries.ts
├── hooks/
│   ├── useVoiceChat.ts           # OpenAI Realtime
│   └── useVoiceToC1.ts           # Voice-to-C1 bridge
├── lib/
│   ├── convex.tsx                # Providers
│   └── thesys/                   # C1 client
├── scripts/
│   └── upload-to-gemini.mjs      # RAG file upload
├── public/
│   ├── badges/                   # 10 level badge images
│   └── japan-prefectures.geojson
└── .kiro/
    ├── steering/                 # product.md, tech.md, structure.md
    └── prompts/                  # Custom dev prompts
```

## Key Files
- `convex/schema.ts`: All database tables
- `convex/podcastTTS.ts`: Multi-host TTS with TOJI/KOJI voices
- `convex/podcastGeneration.ts`: This American Life style scripts
- `convex/learn/generation.ts`: Perplexity course generation
- `convex/gamification.ts`: XP and level system
- `convex/map.ts`: Prefecture descriptions with caching
- `app/admin/page.tsx`: Central admin dashboard

## Configuration
- `next.config.js`: `serverExternalPackages: ['convex']`
- `tailwind.config.js`: RetroUI + cherry blossom theme
- `.npmrc`: `legacy-peer-deps=true`
- Convex env: OPENAI_API_KEY, GEMINI_API_KEY, PERPLEXITY_API_KEY, GEMINI_FILE_URI
