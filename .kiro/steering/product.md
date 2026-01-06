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

### Learning System
- **AI-Generated Courses**: Perplexity-powered course generation with chapters, quizzes
- **Gamification**: XP rewards (25-100 per action), 10 badge levels from "Sake Curious" to "Sake Grandmaster"
- **Progress Tracking**: Chapter completion, quiz scores, course progress
- **Admin Course Generator**: `/admin/learn` for creating new courses

### AI Podcast Network
- **4 Shows**: Sake Stories, Pairing Lab, The Bridge, Brewing Secrets
- **194 Topics**: Pre-defined topics across all series
- **This American Life Style**: Two-host format with TOJI (master brewer guide) and KOJI (curious catalyst)
- **Full Pipeline**: Research (Gemini RAG + Perplexity) → Script → Audio (Gemini TTS) → MP3 (lamejs)
- **Admin Workflow**: Generate, preview, publish at `/admin/podcasts`

### Discovery & Exploration
- **Interactive Japan Map**: Mapbox GL with 47 clickable prefectures
- **Prefecture Descriptions**: AI-generated via Perplexity, cached for performance
- **Brewery Data**: 50+ breweries with regional information
- **Personalized Recommendations**: Based on wine preferences, taste sliders, food preferences

### User Features
- **User Sake Library**: Save/view favorite sake with Tippsy links
- **4-Step Onboarding**: Experience level, taste preferences, food preferences, wine preferences
- **Settings Page**: Edit preferences anytime at `/settings`
- **Dashboard Widgets**: Wine-to-Sake tip, Food Pairing of the Day, Library preview, Course progress

### Authentication & Admin
- **Clerk Authentication**: Sign-in/sign-up with RetroUI styling
- **Admin Dashboard**: Central hub at `/admin` linking to Learn and Podcasts
- **Clerk Webhook**: User sync to Convex on create/update/delete

## User Journey
1. **Landing**: Marketing page introduces Kiki and value proposition
2. **Sign Up**: Clerk authentication with RetroUI styling
3. **Onboarding**: 4-step flow to capture preferences for personalization
4. **Discovery**: Voice or text conversation with Kiki about sake preferences
5. **Learning**: Take courses, earn XP, unlock badges
6. **Listening**: AI-generated podcasts with TOJI and KOJI hosts
7. **Exploration**: Interactive Japan map, prefecture deep-dives
8. **Saving**: Favorite sake saved to personal library

## Success Criteria
- **Engagement**: Voice conversation quality, course completion rates, podcast listens
- **Discovery**: Successful wine-to-sake translations, map exploration
- **Learning**: Quiz pass rates, XP accumulation, badge unlocks
- **Conversion**: Tippsy link clicks and library saves
