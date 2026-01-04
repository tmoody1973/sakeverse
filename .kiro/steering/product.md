# Product Overview

## Product Purpose
Sakéverse is an AI-powered sake discovery platform featuring Kiki (利き酒 - "sake tasting"), a voice-first sommelier agent that bridges wine knowledge to sake exploration. The platform helps users translate their existing wine preferences into sake recommendations through conversational interactions and dynamic UI generation.

## Target Users
**Primary**: Wine enthusiasts curious about sake who want guidance translating their wine preferences (e.g., "I like Pinot Noir" → "Try aged Junmai")
**Secondary**: Sake beginners overwhelmed by Japanese terminology who need a patient, voice-first guide
**Tertiary**: Enthusiasts tracking their sake journey through a personal library

## Key Features (Implemented)
- **Voice-First Sommelier (Kiki)**: Real-time voice conversations using OpenAI Realtime API with WebRTC
- **Dynamic UI Generation**: Thesys C1 creates React components (sake cards, temperature guides) during conversations
- **Multi-Layer RAG System**: Vector search (104 Tippsy products), wine-to-sake knowledge (13 chunks), food pairing (9 chunks), Gemini PDF search, Perplexity live web
- **User Sake Library**: Session-based save/view functionality for favorite sake
- **Tippsy Integration**: Product cards with images, prices, and direct purchase links

## Planned Features (Not Yet Built)
- Interactive Japan Brewery Map (Mapbox GL)
- AI-Generated Educational Podcasts (Gemini TTS)
- WSET-style Badge System and Certifications
- Temperature Lab with Interactive Recommendations

## User Journey
1. **Discovery**: Voice or text conversation with Kiki about sake preferences
2. **Translation**: Wine preferences mapped to sake recommendations via RAG
3. **Exploration**: Dynamic UI cards with product details and Tippsy links
4. **Saving**: Favorite sake saved to personal library for later

## Success Criteria
- **Engagement**: Voice conversation quality and return visits
- **Discovery**: Successful wine-to-sake translations
- **Conversion**: Tippsy link clicks and library saves
- **User Satisfaction**: Natural conversation flow with Kiki
