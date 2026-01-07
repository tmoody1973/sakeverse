# Sakécosm 🍶

**AI-powered sake discovery with Kiki, your voice-first sommelier who bridges wine knowledge to sake exploration.**

> 🏆 Built for the Kiro Hackathon (January 2026)

## Overview

Sakécosm solves a real problem: wine enthusiasts curious about sake are overwhelmed by Japanese terminology and unfamiliar flavor profiles. Kiki (利き酒 - "sake tasting") is a conversational AI sommelier that translates your wine preferences into personalized sake recommendations.

**Target Users:**
- Wine lovers wanting to explore sake ("I like Pinot Noir" → "Try aged Junmai")
- Sake beginners needing patient, voice-first guidance
- Enthusiasts tracking their sake journey

## Features

### 🎤 Voice-First Sommelier (Kiki)
Real-time voice conversations using OpenAI Realtime API with WebRTC for sub-200ms latency. Ask questions naturally and get personalized recommendations.

### 🎙️ AI Podcast Network
Four AI-generated podcast shows with **This American Life**-inspired storytelling:

| Show | Schedule | Focus |
|------|----------|-------|
| 📖 Sake Stories | Monday | Brewery histories, regional tales |
| 🍽️ Pairing Lab | Wednesday | Food pairing deep dives |
| 🍷 The Bridge | Friday | Wine-to-sake translations |
| 🔬 Brewing Secrets | 1st/15th | Technical brewing science |

**Two-Host Format:**
- **TOJI** (杜氏 - master brewer): The storyteller and guide
- **KOJI** (麹 - the catalyst): The curious everyman who asks great questions

**Full Pipeline:** Topic → Research (Gemini RAG + Perplexity) → Script → Multi-voice TTS (Gemini 2.5 Flash) → WAV storage

### 🗾 Interactive Japan Map
Explore sake regions with an interactive Mapbox-powered map of Japan's 47 prefectures:
- Click any prefecture to see local breweries and products
- AI-generated regional descriptions via Perplexity (cached for all users)
- Color-coded prefectures showing which have brewery data

### 📚 Learning System with Gamification
Complete sake courses with AI-generated content:
- **Courses & Chapters**: Structured learning paths on sake fundamentals, brewing, tasting
- **AI-Generated Course Covers**: Stardew Valley pixel art style images via Gemini 2.5 Flash Image
- **Quizzes**: Test knowledge with chapter quizzes and final exams
- **XP & Levels**: Earn 25 XP per chapter, 50-100 XP per quiz
- **10 Badge Levels**: From "Sake Curious" to "Sake Grandmaster"
- **Progress Tracking**: Dashboard shows real stats with Silkscreen pixel font
- **Enhanced Expert Tips**: Structured pairing recommendations with images

### 🧠 Multi-Layer RAG System
- **Vector Search**: 104 Tippsy products with semantic matching (OpenAI embeddings)
- **Wine-to-Sake Knowledge**: 13 pre-chunked wine preference translations
- **Food Pairing RAG**: 9 knowledge chunks for pairing recommendations
- **Gemini File Search**: 5 PDF sake books + 68 brewery histories for deep expertise
- **Perplexity API**: Real-time web search for current trends

### 🎨 Dynamic UI Generation
Thesys C1 generates React components during conversations—sake cards with images, temperature guides, comparison tables, and more.

### 📊 Personalized Dashboard
- Real user stats (XP, level, badge) from Convex
- Wine-to-sake recommendations based on preferences
- Food pairing of the day
- Course progress tracking

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, TypeScript, React 19, Tailwind CSS |
| Backend | Convex (realtime database, serverless functions, file storage) |
| Voice | OpenAI Realtime API (WebRTC) |
| Dynamic UI | Thesys C1 with Claude Sonnet 4 |
| Maps | Mapbox GL JS, react-map-gl |
| RAG | Gemini File Search, Perplexity API, OpenAI Embeddings |
| Podcast TTS | Gemini 2.5 Flash TTS + WAV output |
| Image Generation | Gemini 2.5 Flash Image (Stardew Valley style) |
| Audio Player | react-h5-audio-player |
| Auth | Clerk |
| Fonts | Inter, Space Grotesk, Noto Sans JP, Silkscreen (pixel) |
| Styling | RetroUI neobrutalism + cherry blossom theme |

## Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | Dashboard with stats, recommendations, course progress |
| `/kiki` | Voice chat with Kiki sommelier |
| `/discover` | Browse 104 sake products with filters |
| `/map` | Interactive Japan prefecture map |
| `/learn` | Course catalog with progress tracking |
| `/learn/[slug]` | Course detail with chapter list |
| `/learn/[slug]/[chapter]` | Chapter content with quiz |
| `/podcasts` | Podcast hub with all shows |
| `/podcasts/[series]/[id]` | Episode player |
| `/library` | Saved sake collection |
| `/settings` | Edit taste preferences |
| `/admin` | Admin dashboard hub |
| `/admin/learn` | AI course generator |
| `/admin/podcasts` | Podcast generator and management |

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Convex account (free tier works)
- API keys for: OpenAI, Thesys, Gemini, Perplexity, Mapbox, Clerk

### Installation

```bash
# Clone the repository
git clone https://github.com/tmoody1973/sakeverse.git
cd sakeverse

# Install dependencies
npm install

# Set up Convex
npx convex dev
```

### Environment Variables

Create `.env.local`:

```env
# Convex (auto-generated by npx convex dev)
CONVEX_DEPLOYMENT=your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# OpenAI (for voice + embeddings)
OPENAI_API_KEY=sk-...

# Thesys C1 (for dynamic UI)
THESYS_API_KEY=...

# Clerk (for auth)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Mapbox (for Japan map)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk...
```

Set Convex environment variables:
```bash
npx convex env set OPENAI_API_KEY sk-...
npx convex env set GEMINI_API_KEY ...
npx convex env set PERPLEXITY_API_KEY ...
npx convex env set GEMINI_FILE_URI https://generativelanguage.googleapis.com/v1beta/files/...
```

### Running Locally

```bash
# Terminal 1: Convex backend
npx convex dev

# Terminal 2: Next.js frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Import Data

```bash
# Import Tippsy sake catalog (104 products)
npx convex run importTippsy:importFromJSON

# Import wine-to-sake knowledge
npx convex run wineToSake:importWineToSakeKnowledge

# Import food pairing knowledge
npx convex run foodPairing:importFoodPairingKnowledge

# Import brewery data
npx convex run sakeBreweries:importBreweries

# Import podcast topics (194 topics)
npx convex run podcastImport:importAllTopics

# Seed learning categories
npx convex run learn/seed:seedCategories
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │Dashboard │ │Voice Chat│ │ Podcasts │ │ Learning │ │  Map   │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┬────┘ │
└───────┼────────────┼────────────┼────────────┼───────────┼──────┘
        │            │            │            │           │
        ▼            ▼            ▼            ▼           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Query Router                                │
│  Wine preference? → Wine-to-Sake RAG                            │
│  Product search?  → Vector Search (104 products)                │
│  Food pairing?    → Food Pairing RAG                            │
│  Prefecture info? → Perplexity API (cached)                     │
│  Podcast research?→ Gemini RAG + Perplexity                     │
│  Knowledge?       → Gemini File Search (5 PDFs + breweries)     │
│  Visual UI?       → Thesys C1                                   │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Convex Backend                              │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌─────────────────┐  │
│  │ Products  │ │ Breweries │ │  Courses  │ │ User Progress   │  │
│  │ (Vector)  │ │ (50+)     │ │ Chapters  │ │ XP, Levels      │  │
│  └───────────┘ └───────────┘ │ Quizzes   │ │ Quiz Attempts   │  │
│  ┌───────────┐ ┌───────────┐ └───────────┘ └─────────────────┘  │
│  │ Podcast   │ │ Podcast   │ ┌───────────┐ ┌─────────────────┐  │
│  │ Topics    │ │ Episodes  │ │  Users    │ │ Recommendations │  │
│  │ (194)     │ │ (Audio)   │ └───────────┘ └─────────────────┘  │
│  └───────────┘ └───────────┘                                    │
└─────────────────────────────────────────────────────────────────┘
```

## AI Podcast Pipeline

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Topic     │ ──▶ │  Research   │ ──▶ │   Script    │ ──▶ │   Audio     │
│  Selection  │     │ Gemini RAG  │     │ This Am Life│     │ Multi-voice │
│             │     │ + Perplexity│     │   Style     │     │ TTS + WAV   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │ TOJI: Kore  │
                                        │ KOJI: Puck  │
                                        │ (Gemini TTS)│
                                        └─────────────┘
```

**Note**: WAV format used due to lamejs Node.js 22 compatibility issues. WAV files are ~10x larger but 100% reliable.

## Gamification System

### XP Rewards
| Action | XP Earned |
|--------|-----------|
| Complete chapter | +25 XP |
| Pass quiz (first time) | +50 XP |
| Perfect quiz score | +100 XP |

### Level Progression
| Level | Title | XP Required |
|-------|-------|-------------|
| 1 | Sake Curious | 0 |
| 2 | Sake Novice | 100 |
| 3 | Sake Student | 300 |
| 4 | Sake Enthusiast | 600 |
| 5 | Sake Connoisseur | 1,000 |
| 6 | Sake Expert | 1,500 |
| 7 | Sake Master | 2,500 |
| 8 | Sake Sensei | 4,000 |
| 9 | Sake Legend | 6,000 |
| 10 | Sake Grandmaster | 10,000 |

## Kiro CLI Workflow

This project was built entirely with Kiro CLI, demonstrating AI-assisted development at scale.

### Custom Prompts Created

| Prompt | Purpose |
|--------|---------|
| `@prime` | Load project context at session start |
| `@plan-feature` | Create comprehensive implementation plans |
| `@execute` | Systematic task execution |
| `@code-review` | Technical code review pre-commit |
| `@update-devlog` | Maintain development documentation |
| `@update-steering` | Keep steering docs current |

### Steering Documents

- **product.md**: Product vision, user stories, success criteria
- **tech.md**: Technical architecture, stack decisions, patterns
- **structure.md**: File organization, naming conventions

### Development Pattern

```
@prime → @plan-feature → @execute → @code-review → @update-steering → commit
```

### Time Savings

| Metric | Value |
|--------|-------|
| Total Development Time | ~26.75 hours |
| Estimated Manual Time | 75.5-95.5 hours |
| **Time Saved** | **65-72%** |
| Features Built | 22+ major features |
| Lines of Code | ~8,000+ |
| Git Commits | 43+ |

## Project Structure

```
sakecosm/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── kiki/                 # Voice chat
│   ├── map/                  # Japan prefecture map
│   ├── learn/                # Learning system
│   ├── podcasts/             # Public podcast player
│   ├── discover/             # Product catalog
│   ├── library/              # Saved sake
│   ├── settings/             # User preferences
│   └── admin/                # Admin dashboard
│       ├── learn/            # Course generator
│       └── podcasts/         # Podcast generator
├── components/
│   ├── map/                  # JapanMap, PrefecturePanel
│   ├── voice/                # KikiChat, VoiceControls
│   ├── ui/                   # RetroUI components
│   └── layout/               # Header, BottomNav
├── convex/
│   ├── schema.ts             # Database schema
│   ├── podcastGeneration.ts  # This American Life scripts
│   ├── podcastTTS.ts         # Multi-voice TTS + WAV
│   ├── podcastRAG.ts         # Gemini File API
│   ├── learn/                # Courses, progress, quizzes
│   │   └── generation.ts     # AI course + image generation
│   ├── gamification.ts       # XP, levels, badges
│   ├── pairingTips.ts        # Enhanced expert tips
│   └── embeddings.ts         # Vector search
└── public/
    ├── badges/               # 10 level badge images
    ├── sake-stories.jpg      # Podcast thumbnails
    ├── pairing-lab.jpg
    ├── the-bridge.jpg
    ├── brewing-secrets.jpg
    └── japan-prefectures.geojson
```

## Development Journey

### Key Challenges Overcome

**1. Convex Runtime Limitations**
- **Challenge**: `Buffer` class not available in Convex actions
- **Solution**: Used `atob()` and `Uint8Array` for base64 decoding
- **Learning**: Convex has different runtime constraints than Node.js

**2. Audio Format Selection**
- **Challenge**: lamejs MP3 encoder has `MPEGMode is not defined` bug in Node.js 22
- **Solution**: Switched to WAV format for 100% reliability
- **Trade-off**: WAV files ~10x larger but guaranteed to work

**3. Nested Actions Limitation**
- **Challenge**: Cannot call `ctx.runAction()` from within an action
- **Solution**: Separated podcast generation into two user-triggered steps (script, then audio)
- **Learning**: Convex enforces clear separation of concerns

**4. Image Storage**
- **Challenge**: Base64 images (~2MB) too large for Convex string fields
- **Solution**: Used Convex file storage for generated course covers
- **Learning**: Choose appropriate storage for data size

### Development Velocity

The project was built in **~26.75 hours** over 4 days using Kiro CLI:

| Day | Focus | Hours | Features |
|-----|-------|-------|----------|
| Day 1 | Foundation, Voice Agent | 8h | Next.js setup, Convex, Voice chat |
| Day 2 | Learning System, Map | 7h | Courses, Quizzes, Japan map |
| Day 3 | Podcasts, Polish | 8h | AI podcasts, TTS, Player |
| Day 4 | Enhancements | 3.75h | Images, Search, UI polish |

**Estimated manual development time**: 75.5-95.5 hours  
**Time saved with Kiro CLI**: 65-72%

### Kiro CLI Impact

**Custom Prompts Created**:
- `@prime`: Load project context
- `@plan-feature`: Create implementation plans
- `@execute`: Systematic execution
- `@code-review`: Pre-commit review
- `@update-devlog`: Documentation maintenance
- `@update-steering`: Keep steering docs current

**Development Pattern**:
```
@prime → @plan-feature → @execute → @code-review → @update-steering → commit
```

This systematic approach enabled rapid feature development while maintaining code quality and comprehensive documentation.

## Live Demo

🌐 **Production**: [https://dynamous-kiro-hackathon.vercel.app](https://dynamous-kiro-hackathon.vercel.app)

## License

MIT

---

Built with 🍶 and Kiro CLI for the Kiro Hackathon 2026
