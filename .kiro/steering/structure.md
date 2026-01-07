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
│   │   ├── [series]/             # Series detail page
│   │   │   └── page.tsx
│   │   └── [series]/[episodeId]/ # Episode player
│   │       └── page.tsx
│   ├── admin/                    # Admin dashboard
│   │   ├── page.tsx              # Admin hub
│   │   ├── learn/                # Course generator
│   │   └── podcasts/             # Podcast generator
│   │       ├── page.tsx          # Dashboard
│   │       ├── generate/         # Topic selection
│   │       └── episodes/         # Preview/publish
│   │           └── [id]/         # Episode detail with cancel
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
│   ├── voice/                    # Chat components (KikiChat with disconnect fix)
│   ├── audio/                    # GlobalAudioPlayer with react-h5-audio-player
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
│   ├── podcastEpisodes.ts        # Episode CRUD + cancel + isCancelled query
│   ├── podcastGeneration.ts      # Script generation (3-5 min, Sakécosm branding)
│   ├── podcastTTS.ts             # Multi-voice TTS + WAV (not MP3)
│   ├── podcastRAG.ts             # Gemini File API
│   ├── userLibrary.ts
│   ├── users.ts
│   └── sakeBreweries.ts
├── hooks/
│   ├── useVoiceChat.ts           # OpenAI Realtime with clean disconnect
│   └── useVoiceToC1.ts           # Voice-to-C1 bridge
├── lib/
│   ├── convex.tsx                # Providers
│   └── thesys/                   # C1 client
├── scripts/
│   └── upload-to-gemini.mjs      # RAG file upload
├── public/
│   ├── badges/                   # 10 level badge images
│   ├── sake-stories.jpg          # Podcast show thumbnail
│   ├── pairing-lab.jpg           # Podcast show thumbnail
│   ├── the-bridge.jpg            # Podcast show thumbnail
│   ├── brewing-secrets.jpg       # Podcast show thumbnail
│   ├── robots.txt                # SEO crawler rules
│   ├── sitemap.xml               # Static XML sitemap
│   └── japan-prefectures.geojson
├── components/
│   └── seo/                      # SEO components
│       └── StructuredData.tsx    # JSON-LD schemas
└── .kiro/
    ├── steering/                 # product.md, tech.md, structure.md
    └── prompts/                  # Custom dev prompts (seo-optimize.md)
```

## Key Files
- `convex/schema.ts`: All database tables
- `convex/podcastTTS.ts`: Multi-host TTS with TOJI/KOJI voices, WAV output
- `convex/podcastGeneration.ts`: This American Life style scripts (3-5 min)
- `convex/podcastEpisodes.ts`: Episode CRUD with cancel support
- `convex/learn/generation.ts`: Perplexity course generation with AI cover images
- `convex/discover.ts`: Product search with multi-field filtering
- `app/sitemap.ts`: Dynamic sitemap generation
- `components/seo/StructuredData.tsx`: JSON-LD schemas for rich snippets
- `convex/gamification.ts`: XP and level system
- `convex/map.ts`: Prefecture descriptions with caching
- `convex/pairingTips.ts`: Enhanced expert tips with structured prompts
- `components/voice/KikiChat.tsx`: Voice chat with clean audio disconnect
- `components/audio/GlobalAudioPlayer.tsx`: react-h5-audio-player integration
- `app/admin/page.tsx`: Central admin dashboard
- `app/HomeContent.tsx`: Dashboard with Silkscreen pixel font stats
- `app/layout.tsx`: Root layout with all font imports (Inter, Space Grotesk, Noto Sans JP, Silkscreen)

## Configuration
- `next.config.js`: `serverExternalPackages: ['convex']`
- `tailwind.config.js`: RetroUI + cherry blossom theme, Silkscreen pixel font
- `.npmrc`: `legacy-peer-deps=true`
- Convex env: OPENAI_API_KEY, GEMINI_API_KEY, PERPLEXITY_API_KEY, GEMINI_FILE_URI
