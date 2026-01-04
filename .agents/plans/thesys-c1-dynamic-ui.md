# Feature: Thesys C1 Dynamic UI Integration

The following plan should be complete, but validate documentation and codebase patterns before implementing.

Pay special attention to naming of existing utils, types, and models. Import from the right files.

## Feature Description

Integrate Thesys C1 Generative UI API into the Kiki voice chat to render dynamic, interactive UI components (sake cards, temperature guides, pairing charts, comparison tables) instead of plain text responses. This transforms the chat from a text-only interface into a rich visual experience.

**Agent Identity**: Kiki (from Kikizake 利き酒 - "sake tasting") - the art of evaluating and understanding sake. A friendly, knowledgeable sake sommelier who helps users discover and appreciate sake.

## User Story

As a sake enthusiast chatting with Kiki
I want to see interactive visual components (product cards, charts, temperature guides)
So that I can better understand recommendations and take actions (add to cart, explore regions)

## Problem Statement

Currently, Kiki returns text-only responses with basic product cards hardcoded in ChatBubble. Users cannot interact with recommendations beyond clicking external links. The experience lacks the visual richness needed for sake discovery (temperature sliders, taste radar charts, comparison tables).

## Solution Statement

Integrate Thesys C1 SDK to generate dynamic React components from AI responses. When Kiki recommends sake, shows temperature guidance, or compares products, C1 renders interactive UI components with action handlers for cart, navigation, and preferences.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Medium
**Primary Systems Affected**: VoiceChat, ChatBubble, API routes
**Dependencies**: @thesysai/genui-sdk, @crayonai/react-ui

---

## CONTEXT REFERENCES

### Relevant Codebase Files - MUST READ BEFORE IMPLEMENTING

- `components/voice/VoiceChat.tsx` - Main chat component, message rendering loop
- `components/voice/ChatBubble.tsx` - Current message display with hardcoded product cards
- `hooks/useVoiceChat.ts` (lines 1-50) - Message state structure, action hooks
- `app/kiki/page.tsx` - Page wrapper with dynamic import pattern
- `app/layout.tsx` - Root layout for provider placement
- `package.json` - Current dependencies, add new packages here
- `research/sakeverse-kiro-guide (2).md` (lines 2600-3050) - Thesys C1 implementation reference

### New Files to Create

- `lib/thesys/client.ts` - Thesys OpenAI-compatible client configuration
- `lib/thesys/prompts.ts` - Sake UI system prompt for C1
- `app/api/c1/chat/route.ts` - API route for C1 chat completions
- `components/voice/C1Message.tsx` - Wrapper for rendering C1 dynamic UI
- `components/voice/C1ActionHandler.tsx` - Action handler for C1 component interactions

### Relevant Documentation - READ BEFORE IMPLEMENTING

- [Thesys C1 Quick Start](https://thesys.dev/docs/quickstart)
  - Installation and basic setup
  - Why: Core integration pattern
- [Thesys React SDK](https://thesys.dev/docs/react)
  - C1Component usage, ThemeProvider setup
  - Why: Component rendering approach
- [Thesys API Reference](https://thesys.dev/docs/api)
  - OpenAI-compatible endpoint, model names
  - Why: API route implementation

### Patterns to Follow

**API Route Pattern (Next.js App Router):**
```typescript
// app/api/example/route.ts
export async function POST(request: Request) {
  const body = await request.json()
  // Process and return Response
  return Response.json({ data })
}
```

**Component Import Pattern:**
```typescript
// From existing VoiceChat.tsx
import { useVoiceChat } from "@/hooks/useVoiceChat"
import { ChatBubble } from "./ChatBubble"
```

**Message State Structure:**
```typescript
// From useVoiceChat.ts
interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  products?: Array<{...}>
}
```

**Styling Pattern (RetroUI):**
```typescript
// From ChatBubble.tsx
className="rounded-xl border-2 border-ink p-4 retro-shadow"
className="bg-sakura-pink text-ink"
className="bg-sake-mist/30"
```

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation - SDK Setup

Install Thesys C1 packages and create client configuration.

**Tasks:**
- Install @thesysai/genui-sdk and @crayonai/react-ui
- Create Thesys client with OpenAI-compatible configuration
- Add THESYS_API_KEY to environment variables
- Create sake-specific UI system prompt

### Phase 2: Core Implementation - API Route

Create Next.js API route to proxy C1 requests with sake context.

**Tasks:**
- Create /api/c1/chat route for C1 completions
- Integrate RAG context (wine-to-sake, products) into prompts
- Handle streaming responses
- Add error handling and rate limiting

### Phase 3: UI Components - C1 Rendering

Create components to render C1 dynamic UI in chat.

**Tasks:**
- Create C1Message component with ThemeProvider
- Create action handler for button clicks
- Update ChatBubble to detect and render C1 content
- Style C1 components to match RetroUI theme

### Phase 4: Integration - Voice Chat Hook

Connect C1 to existing voice chat flow.

**Tasks:**
- Add C1 message type to useVoiceChat state
- Create sendC1Message function for text input
- Route appropriate queries to C1 vs standard responses
- Handle C1 actions (add to cart, explore region)

### Phase 5: Testing & Validation

Test all dynamic UI components and interactions.

**Tasks:**
- Test sake recommendation cards render correctly
- Test temperature guide slider interactions
- Test add to cart action flow
- Verify mobile responsiveness

---

## STEP-BY-STEP TASKS

### Task 1: CREATE package.json dependencies

- **IMPLEMENT**: Add Thesys C1 SDK packages
- **PATTERN**: Existing dependency structure in package.json
- **IMPORTS**: N/A
- **GOTCHA**: Use exact versions to avoid breaking changes
- **VALIDATE**: `npm install && npm run type-check`

```bash
npm install @thesysai/genui-sdk @crayonai/react-ui
```

### Task 2: CREATE lib/thesys/client.ts

- **IMPLEMENT**: OpenAI-compatible client for Thesys C1 API
- **PATTERN**: Similar to OpenAI client pattern
- **IMPORTS**: `import OpenAI from 'openai'`
- **GOTCHA**: baseURL must be 'https://api.thesys.dev/v1/embed'
- **VALIDATE**: `npm run type-check`

```typescript
import OpenAI from 'openai'

export const thesysClient = new OpenAI({
  apiKey: process.env.THESYS_API_KEY!,
  baseURL: 'https://api.thesys.dev/v1/embed',
})

export const C1_MODELS = {
  nightly: 'c1-nightly',
  stable: 'c1-stable',
} as const
```

### Task 3: CREATE lib/thesys/prompts.ts

- **IMPLEMENT**: Sake-specific UI system prompt for C1
- **PATTERN**: Reference sakeverse-kiro-guide (2).md lines 2700-2850
- **IMPORTS**: None
- **GOTCHA**: Keep prompt concise but comprehensive for UI generation
- **VALIDATE**: `npm run type-check`

Key prompt sections:
- Component palette (Card, Grid, Chart, Slider)
- Sake recommendation card structure
- Temperature guide structure
- Wine bridge translation structure
- Styling guidelines (sakura-pink, sake-mist colors)
- Action types (add_to_cart, explore_region, set_temperature)

### Task 4: CREATE app/api/c1/chat/route.ts

- **IMPLEMENT**: API route for C1 chat completions
- **PATTERN**: Next.js App Router API route pattern
- **IMPORTS**: `thesysClient`, `SAKE_UI_SYSTEM_PROMPT`
- **GOTCHA**: Must handle both streaming and non-streaming
- **VALIDATE**: `curl -X POST http://localhost:3000/api/c1/chat -d '{"message":"recommend sake"}'`

```typescript
import { thesysClient, C1_MODELS } from '@/lib/thesys/client'
import { SAKE_UI_SYSTEM_PROMPT } from '@/lib/thesys/prompts'

export async function POST(request: Request) {
  const { messages, context } = await request.json()
  
  const response = await thesysClient.chat.completions.create({
    model: C1_MODELS.nightly,
    messages: [
      { role: 'system', content: SAKE_UI_SYSTEM_PROMPT },
      ...messages
    ],
  })
  
  return Response.json(response)
}
```

### Task 5: CREATE components/voice/C1Message.tsx

- **IMPLEMENT**: Wrapper component for rendering C1 dynamic UI
- **PATTERN**: Mirror ChatBubble.tsx structure
- **IMPORTS**: `C1Component, ThemeProvider` from @thesysai/genui-sdk
- **GOTCHA**: Must import CSS: `@crayonai/react-ui/styles/index.css`
- **VALIDATE**: `npm run build`

```typescript
"use client"

import { C1Component, ThemeProvider } from "@thesysai/genui-sdk"
import "@crayonai/react-ui/styles/index.css"

interface C1MessageProps {
  content: any
  onAction: (action: { type: string; payload: any }) => void
}

export function C1Message({ content, onAction }: C1MessageProps) {
  return (
    <ThemeProvider>
      <C1Component 
        content={content}
        onAction={onAction}
      />
    </ThemeProvider>
  )
}
```

### Task 6: UPDATE components/voice/ChatBubble.tsx

- **IMPLEMENT**: Add C1 content detection and rendering
- **PATTERN**: Existing ChatBubble structure
- **IMPORTS**: Add `C1Message` import
- **GOTCHA**: Detect C1 content by checking if content is object vs string
- **VALIDATE**: `npm run build`

Add new prop:
```typescript
interface ChatBubbleProps {
  // ... existing props
  isC1?: boolean
  onC1Action?: (action: { type: string; payload: any }) => void
}
```

Conditional rendering:
```typescript
{isC1 && typeof content === 'object' ? (
  <C1Message content={content} onAction={onC1Action} />
) : (
  <div className="text-sm leading-relaxed">{content}</div>
)}
```

### Task 7: UPDATE hooks/useVoiceChat.ts

- **IMPLEMENT**: Add C1 message support and action handling
- **PATTERN**: Existing message handling pattern
- **IMPORTS**: None (uses fetch)
- **GOTCHA**: Detect when to use C1 vs standard response
- **VALIDATE**: `npm run type-check`

Add to state interface:
```typescript
interface Message {
  // ... existing
  isC1?: boolean
  c1Content?: any
}
```

Add C1 query detection:
```typescript
const isC1Query = input.includes("recommend") || 
                  input.includes("compare") ||
                  input.includes("temperature") ||
                  input.includes("pairing")
```

Add sendC1Message function:
```typescript
const sendC1Message = async (text: string) => {
  const response = await fetch('/api/c1/chat', {
    method: 'POST',
    body: JSON.stringify({ messages: [{ role: 'user', content: text }] })
  })
  const data = await response.json()
  // Add C1 message to state
}
```

### Task 8: UPDATE components/voice/VoiceChat.tsx

- **IMPLEMENT**: Pass C1 action handler to ChatBubble
- **PATTERN**: Existing prop passing pattern
- **IMPORTS**: None new
- **GOTCHA**: Handle actions like add_to_cart, explore_region
- **VALIDATE**: `npm run build`

Add action handler:
```typescript
const handleC1Action = async (action: { type: string; payload: any }) => {
  switch (action.type) {
    case 'add_to_cart':
      // Call Convex mutation or show toast
      break
    case 'explore_region':
      // Navigate to region page
      break
    case 'set_temperature':
      // Update preferences
      break
  }
}
```

Pass to ChatBubble:
```typescript
<ChatBubble
  {...message}
  isC1={message.isC1}
  onC1Action={handleC1Action}
/>
```

### Task 9: UPDATE .env.local

- **IMPLEMENT**: Add THESYS_API_KEY environment variable
- **PATTERN**: Existing env vars
- **IMPORTS**: N/A
- **GOTCHA**: Get API key from thesys.dev dashboard
- **VALIDATE**: Check key is loaded in API route

```
THESYS_API_KEY=your_thesys_api_key_here
```

### Task 10: UPDATE app/globals.css

- **IMPLEMENT**: Import C1 styles and add theme overrides
- **PATTERN**: Existing CSS structure
- **IMPORTS**: @crayonai/react-ui/styles/index.css
- **GOTCHA**: Override C1 default styles to match RetroUI theme
- **VALIDATE**: Visual inspection

```css
/* Thesys C1 theme overrides */
.c1-card {
  @apply border-2 border-ink rounded-xl retro-shadow;
}
.c1-button-primary {
  @apply bg-sakura-pink text-ink border-2 border-ink;
}
```

---

## TESTING STRATEGY

### Unit Tests

- Test C1Message renders without errors
- Test action handler dispatches correct actions
- Test C1 content detection in ChatBubble

### Integration Tests

- Test full flow: user message → C1 API → rendered UI
- Test action flow: button click → handler → state update

### Edge Cases

- Empty C1 response handling
- Malformed C1 content graceful degradation
- Network error during C1 API call
- Very long C1 responses (scrolling)

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style

```bash
npm run lint
npm run type-check
```

### Level 2: Build

```bash
npm run build
```

### Level 3: Manual Validation

1. Start dev server: `npm run dev`
2. Navigate to /kiki
3. Type "recommend a sake for beginners"
4. Verify C1 card renders with image, price, buttons
5. Click "Add to Cart" button
6. Verify action handler fires
7. Type "compare Dassai and Hakkaisan"
8. Verify comparison table renders
9. Type "what temperature for Junmai"
10. Verify temperature guide renders with slider

---

## ACCEPTANCE CRITERIA

- [ ] Thesys C1 SDK installed and configured
- [ ] API route proxies requests to C1 with sake context
- [ ] C1Message component renders dynamic UI
- [ ] ChatBubble detects and renders C1 content
- [ ] Action handlers work (add_to_cart, explore_region)
- [ ] Styling matches RetroUI theme (sakura-pink, borders)
- [ ] Mobile responsive
- [ ] Error states handled gracefully
- [ ] Build passes with no errors

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] Each task validation passed
- [ ] npm run build succeeds
- [ ] Manual testing confirms C1 UI renders
- [ ] Actions trigger correct handlers
- [ ] Styling consistent with app theme

---

## NOTES

### Design Decisions

1. **API Route vs Direct Client**: Using API route to keep THESYS_API_KEY server-side and add RAG context
2. **C1 Query Detection**: Simple keyword matching for MVP, can enhance with intent classification later
3. **Theme Override**: Applying RetroUI styles via CSS overrides rather than custom C1 theme config
4. **Action Handling**: Centralized in VoiceChat for state management access

### Trade-offs

- C1 adds ~50KB to bundle but provides rich UI without custom component development
- API route adds latency but enables server-side RAG integration
- Keyword detection is simple but may miss some C1-appropriate queries

### Future Enhancements

- Streaming C1 responses for faster perceived performance
- Custom C1 components for sake-specific UI (taste radar, temperature thermometer)
- Voice-triggered C1 actions ("add that to my cart")
- Persist C1 preferences (temperature, regions explored)

### Confidence Score: 8/10

High confidence due to:
- Clear Thesys documentation
- Existing chat infrastructure to build on
- Well-defined component patterns in codebase

Risks:
- C1 SDK compatibility with React 19 (untested)
- Theme override complexity
- Action handler edge cases
