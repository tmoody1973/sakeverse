# Feature: Voice Agent (Yuki) with OpenAI Realtime API

## Feature Description

Implement Yuki, the AI-powered sake sommelier voice agent using OpenAI Realtime API with WebRTC for low-latency voice conversations. The agent will provide personalized sake recommendations, answer questions about Japanese sake culture, and generate dynamic UI components during conversations using Thesys C1.

## User Story

As a sake enthusiast or beginner
I want to have natural voice conversations with Yuki about sake
So that I can discover new sake, learn about Japanese culture, and get personalized recommendations through an engaging conversational experience

## Problem Statement

Traditional sake discovery relies on complex filtering and search interfaces that can be overwhelming for beginners and inefficient for experienced users. Voice-first interaction provides a more natural, accessible way to explore sake while learning about Japanese culture and terminology.

## Solution Statement

Create a real-time voice agent that combines OpenAI Realtime API for natural conversations, Convex functions for sake data access, and Thesys C1 for dynamic UI generation. The agent will understand user preferences, provide contextual recommendations, and create visual components during conversations.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: High
**Primary Systems Affected**: Frontend (Voice UI), Backend (Convex functions), AI Integration (OpenAI, Thesys C1)
**Dependencies**: OpenAI Realtime API, Thesys C1, WebRTC, Convex real-time functions

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE BEFORE IMPLEMENTING!

- `convex/sake.ts` - Sake catalog functions for recommendations
- `convex/users.ts` - User preference and activity tracking
- `convex/schema.ts` - Voice session and interaction data models
- `components/ui/Button.tsx` - RetroUI button styling for voice controls
- `components/layout/Header.tsx` - Voice agent navigation integration
- `lib/utils.ts` - Sake-specific utility functions

### New Files to Create

**Voice Components:**
- `components/voice/VoiceChat.tsx` - Main voice chat interface
- `components/voice/VoiceControls.tsx` - Microphone and control buttons
- `components/voice/ChatBubble.tsx` - Message display components
- `components/voice/DynamicUI.tsx` - Thesys C1 generated components
- `components/voice/VoiceStatus.tsx` - Connection and listening status

**Voice Integration:**
- `lib/openai-realtime.ts` - OpenAI Realtime API client
- `lib/thesys.ts` - Thesys C1 integration for dynamic UI
- `hooks/useVoiceChat.ts` - Voice interaction state management
- `app/yuki/page.tsx` - Voice agent main page

**Convex Functions:**
- `convex/voice.ts` - Voice session management and function tools
- `convex/recommendations.ts` - AI-powered sake recommendations

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [OpenAI Realtime API Documentation](https://platform.openai.com/docs/guides/realtime)
  - Specific section: WebRTC integration and function calling
  - Why: Required for voice agent implementation
- [Thesys C1 Documentation](https://docs.thesys.ai/c1)
  - Specific section: React component generation
  - Why: Needed for dynamic UI during conversations
- [WebRTC API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
  - Specific section: MediaStream and audio handling
  - Why: Required for browser audio capture and playback

### Patterns to Follow

**Voice Interaction Patterns:**
- Use WebRTC for low-latency audio streaming
- Implement proper error handling for network issues
- Handle microphone permissions gracefully
- Provide visual feedback for voice states (listening, processing, speaking)

**Convex Integration Patterns:**
- Use real-time subscriptions for voice session updates
- Implement function calling for sake recommendations
- Store conversation history for context
- Track user interactions for personalization

**Mobile-First Patterns:**
- Large touch targets for voice controls
- Proper audio handling on mobile devices
- Battery-efficient voice processing
- Responsive voice UI design

---

## IMPLEMENTATION PLAN

### Phase 1: OpenAI Realtime API Setup

Set up the core voice infrastructure with OpenAI Realtime API and WebRTC.

**Tasks:**
- Configure OpenAI Realtime API client
- Implement WebRTC audio streaming
- Create basic voice connection management
- Add microphone permission handling

### Phase 2: Voice UI Components

Build the voice chat interface with RetroUI styling.

**Tasks:**
- Create voice chat layout and components
- Implement chat bubbles for conversation display
- Add voice controls (mic, stop, settings)
- Create voice status indicators

### Phase 3: Convex Integration

Connect voice agent to Convex backend for sake data and user management.

**Tasks:**
- Implement voice session tracking
- Create function tools for sake recommendations
- Add conversation history storage
- Integrate user preference learning

### Phase 4: Dynamic UI Generation

Integrate Thesys C1 for AI-generated React components during conversations.

**Tasks:**
- Set up Thesys C1 integration
- Create dynamic component rendering system
- Implement component types (SakeCard, TasteRadar, etc.)
- Add component interaction handling

---

## STEP-BY-STEP TASKS

### CREATE lib/openai-realtime.ts

- **IMPLEMENT**: OpenAI Realtime API client with WebRTC integration
- **PATTERN**: Modern WebRTC patterns with proper error handling
- **IMPORTS**: OpenAI SDK, WebRTC APIs
- **GOTCHA**: Handle browser compatibility and permissions
- **VALIDATE**: `npm run build`

### CREATE hooks/useVoiceChat.ts

- **IMPLEMENT**: Voice chat state management hook
- **PATTERN**: React hooks with real-time state updates
- **IMPORTS**: React hooks, Convex real-time
- **GOTCHA**: Proper cleanup of audio resources
- **VALIDATE**: `npm run build`

### CREATE components/voice/VoiceChat.tsx

- **IMPLEMENT**: Main voice chat interface with RetroUI styling
- **PATTERN**: Mobile-first responsive design
- **IMPORTS**: Voice hooks, UI components
- **GOTCHA**: Proper audio visualization and feedback
- **VALIDATE**: `npm run dev`

### CREATE convex/voice.ts

- **IMPLEMENT**: Voice session management and function tools
- **PATTERN**: Convex mutations and queries
- **IMPORTS**: Convex functions, schema types
- **GOTCHA**: Real-time session updates and cleanup
- **VALIDATE**: `npx convex dev --once`

### CREATE app/yuki/page.tsx

- **IMPLEMENT**: Voice agent main page
- **PATTERN**: Next.js App Router page component
- **IMPORTS**: Voice components, layout
- **GOTCHA**: Proper SEO and metadata for voice page
- **VALIDATE**: `npm run dev`

### CREATE lib/thesys.ts

- **IMPLEMENT**: Thesys C1 integration for dynamic UI
- **PATTERN**: AI service integration with error handling
- **IMPORTS**: Thesys C1 SDK, React types
- **GOTCHA**: Component security and validation
- **VALIDATE**: `npm run build`

---

## TESTING STRATEGY

### Voice Functionality Tests
- Microphone permission handling
- Audio quality and latency testing
- WebRTC connection stability
- Cross-browser compatibility

### Integration Tests
- Convex function calling from voice agent
- Real-time conversation updates
- Dynamic UI component generation
- User preference learning

### Mobile Testing
- Touch interface responsiveness
- Audio handling on mobile browsers
- Battery usage optimization
- Network connectivity handling

---

## VALIDATION COMMANDS

### Level 1: Build Validation
```bash
npm run build
npx convex dev --once
```

### Level 2: Development Testing
```bash
npm run dev
# Test voice interface at /yuki
# Verify microphone permissions
# Test conversation flow
```

### Level 3: Voice Quality Testing
- Test audio latency (<200ms target)
- Verify conversation context retention
- Test dynamic UI generation
- Validate mobile voice experience

---

## ACCEPTANCE CRITERIA

- [ ] Voice agent accessible at /yuki route
- [ ] OpenAI Realtime API integration working
- [ ] WebRTC audio streaming functional
- [ ] Microphone permissions handled gracefully
- [ ] Voice controls with RetroUI styling
- [ ] Conversation history stored in Convex
- [ ] Function calling for sake recommendations
- [ ] Dynamic UI components generated during chat
- [ ] Mobile-optimized voice experience
- [ ] Real-time conversation updates
- [ ] Proper error handling and fallbacks
- [ ] Voice session cleanup on disconnect

---

## NOTES

**Performance Priority**: Voice latency must be <200ms for natural conversation flow.

**Mobile Focus**: Voice-first design requires excellent mobile experience with proper audio handling.

**Security**: Validate all dynamic UI components and sanitize user inputs.

**Accessibility**: Provide visual feedback for voice states and keyboard alternatives.
