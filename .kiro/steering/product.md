# Product Overview

## Product Purpose
Sakécosm is an AI-powered sake discovery platform featuring Kiki (利き酒 - "sake tasting"), a voice-first sommelier agent that bridges wine knowledge to sake exploration. The platform combines conversational AI, dynamic UI generation, gamified learning, and AI-generated podcasts to create a comprehensive sake education experience.

## Target Users
**Primary**: Wine enthusiasts curious about sake who want guidance translating their wine preferences (e.g., "I like Pinot Noir" → "Try aged Junmai")
**Secondary**: Sake beginners overwhelmed by Japanese terminology who need a patient, voice-first guide
**Tertiary**: Enthusiasts tracking their sake journey through courses, badges, and a personal library

## Key Features (Implemented)

### Voice & Chat
- **Voice-First Sommelier (Kiki)**: Real-time voice conversations using OpenAI Realtime API with WebRTC and function tools
- **Dynamic UI Generation**: Thesys C1 creates React components (sake cards, temperature guides) during conversations
- **Multi-Layer RAG System**: Vector search (104 Tippsy products), wine-to-sake knowledge (13 chunks), food pairing (9 chunks), Gemini PDF search (5 books), Perplexity live web
- **Voice Disconnect**: Clean audio stop when ending voice sessions (stops all active AudioBufferSourceNodes)
- **Rate Limiting**: 20 voice requests/hour, 50 text messages/hour per user for cost control
- **Kiki Avatar**: Branded character with online status indicator on dashboard

### Learning System
- **AI-Generated Courses**: Perplexity-powered course generation with chapters, quizzes
- **Gamification**: XP rewards (25-100 per action), 10 badge levels from "Sake Curious" to "Sake Grandmaster"
- **Progress Tracking**: Chapter completion, quiz scores, course progress
- **Admin Course Generator**: `/admin/learn` for creating new courses

### AI Podcast Network
- **4 Shows**: Sake Stories (Monday), Pairing Lab (Wednesday), The Bridge (Friday), Brewing Secrets (1st/15th)
- **194 Topics**: Pre-defined topics across all series
- **Sakécosm Branding**: Scripts open with "Welcome to [Show Name] from Sakécosm..."
- **This American Life Style**: Two-host format with TOJI (master brewer guide) and KOJI (curious catalyst)
- **3-5 Minute Episodes**: ~450-750 words, optimized for quick listening
- **Full Pipeline**: Research (Gemini RAG + Perplexity) → Script → Audio (Gemini TTS) → WAV storage
- **Admin Workflow**: Generate script, then generate audio (two-step process), preview, publish
- **Cancel Generation**: Ability to cancel in-progress podcast generation
- **Episode Player**: react-h5-audio-player with progress tracking, Tippsy product recommendations, formatted transcripts with speaker colors
- **Series Pages**: `/podcasts/[series]` pages showing all episodes per show

### Discovery & Exploration
- **Interactive Japan Map**: Mapbox GL with 47 clickable prefectures
- **Prefecture Descriptions**: AI-generated via Perplexity, cached for performance
- **Brewery Data**: 50+ breweries with regional information
- **Personalized Recommendations**: Based on wine preferences, taste sliders, food preferences
- **Menu Scanner (Planned)**: Snap sake menu or bottle label, get instant personalized recommendations
  - Dual mode: Menu (multiple sake ranked) and Bottle (details + similar recommendations)
  - Gemini Vision API for OCR (handles Japanese text)
  - Mobile-first with camera capture
  - 5 scans per day rate limit

### User Features
- **User Sake Library**: Save/view favorite sake with Tippsy links
- **4-Step Onboarding**: Experience level, taste preferences, food preferences, wine preferences
- **Settings Page**: Edit preferences anytime at `/settings`
- **Dashboard Widgets**: Wine-to-Sake tip, Food Pairing of the Day, Library preview, Course progress with cover images, Featured podcast with thumbnails
- **Header Search**: Global search bar connects to /discover with results
- **Kiki Avatar**: Branded character with online status indicator, gradient background, hover effects

### Authentication & Admin
- **Clerk Authentication**: Sign-in/sign-up with RetroUI styling
- **Admin Dashboard**: Central hub at `/admin` linking to Learn and Podcasts
- **Clerk Webhook**: User sync to Convex on create/update/delete

### SEO & Discoverability
- **Custom Domain**: https://sakecosm.com with proper DNS configuration
- **Structured Data**: Organization, WebSite, WebApplication schemas for rich snippets
- **XML Sitemap**: Dynamic and static sitemaps for search engines
- **Meta Tags**: Comprehensive Open Graph and Twitter Card optimization
- **Target Keywords**: 15+ sake-related keywords for search visibility
- **robots.txt**: Proper crawler configuration
- **Search Integration**: Header search connects to /discover with query params

### Cost Control
- **Rate Limiting System**: Prevents API cost overruns
  - Voice chat: 20 requests per hour per user (~$0.50/hour max)
  - Text chat: 50 messages per hour per user
  - Sliding 1-hour windows from first request
  - Color-coded UI feedback (green/orange/red)
  - Admin override capability for support cases

## User Journey
1. **Landing**: Marketing page introduces Kiki and value proposition
2. **Sign Up**: Clerk authentication with RetroUI styling
3. **Onboarding**: 4-step flow to capture preferences for personalization
4. **Discovery**: Voice or text conversation with Kiki about sake preferences
5. **Menu Scanning (Planned)**: Snap menu or bottle at restaurant/store for instant recommendations
6. **Learning**: Take courses, earn XP, unlock badges
7. **Listening**: AI-generated podcasts with TOJI and KOJI hosts
8. **Exploration**: Interactive Japan map, prefecture deep-dives
9. **Saving**: Favorite sake saved to personal library

## Success Criteria
- **Engagement**: Voice conversation quality, course completion rates, podcast listens
- **Discovery**: Successful wine-to-sake translations, map exploration
- **Learning**: Quiz pass rates, XP accumulation, badge unlocks
- **Conversion**: Tippsy link clicks and library saves
