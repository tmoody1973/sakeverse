# SAKÉVERSE: Complete Kiro Development Guide
## AI-Powered Sake Mastery Platform | Dynamous x Kiro Hackathon

> **Hackathon:** Dynamous x Kiro ($17,000 prize pool)
> **Target Categories:** Best Voice Agent, Best AI Solution for Public Good
> **Core Tech:** OpenAI Realtime API, Thesys C1, Mapbox, Gemini, Firecrawl
> **Backend:** Convex (realtime DB, actions, crons, file storage) + Clerk (auth)

---

# TABLE OF CONTENTS

1. [Product Vision](#1-product-vision)
2. [Technical Architecture](#2-technical-architecture)
3. [Convex + Clerk Backend](#3-convex--clerk-backend) ⭐ **NEW**
4. [Kiro Project Setup](#4-kiro-project-setup)
5. [OpenAI Realtime Voice Agent](#5-openai-realtime-voice-agent)
6. [Thesys C1 Dynamic UI](#6-thesys-c1-dynamic-ui)
7. [Mapbox Sake Regions](#7-mapbox-sake-regions)
8. [Temperature System](#8-temperature-system)
9. [Data Pipeline & Firecrawl](#9-data-pipeline--firecrawl) ⭐ **UPDATED**
10. [Gemini File Search RAG](#10-gemini-file-search-rag)
11. [API Schemas](#11-api-schemas)
12. [Kiro Spec Files](#12-kiro-spec-files)
13. [Demo Script](#13-demo-script)
14. [Deployment](#14-deployment)

---

# 1. PRODUCT VISION

## The Problem

- 80M+ Americans drink wine; most are terrified of sake menus
- Sake education is fragmented, academic, and not engaging
- Wine vocabulary doesn't translate to sake
- No bridge between curiosity and confident purchase

## The Solution: SAKÉVERSE

An AI-powered sake mastery platform that transforms beginners into connoisseurs through:

1. **Voice Sommelier** - Conversational AI guide (OpenAI Realtime)
2. **Dynamic UI** - Rich visual responses, not just text (Thesys C1)
3. **Interactive Map** - Explore Japan's 47 sake regions (Mapbox)
4. **Temperature Mastery** - Learn the art of serving temperature
5. **Wine Bridge** - Translate wine preferences to sake recommendations
6. **Gamified Learning** - Oboe-style courses with badges and progress

## Core Insight

> "We're not teaching about sake. We're inviting users to join a 1,000-year conversation between water, rice, koji, and human hands."

## Target Users

| Segment | Need | Solution |
|---------|------|----------|
| Wine Lovers | Entry point to sake | Wine-to-sake translation |
| Sake Beginners | Reduce intimidation | Voice guidance, visual UI |
| Enthusiasts | Deeper knowledge | Regional mastery, badges |
| Tippsy | Educated buyers | Higher AOV, better retention |

---

# 2. TECHNICAL ARCHITECTURE

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SAKÉVERSE ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  KNOWLEDGE SOURCES                                                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │  Sake PDFs  │    │  Podcast    │    │  Firecrawl  │    │ NanoBanana  │  │
│  │  & Books    │    │ Transcripts │    │  Tippsy DB  │    │   Images    │  │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘  │
│         │                  │                  │                  │         │
│         └──────────────────┴────────┬─────────┴──────────────────┘         │
│                                     │                                       │
│  ┌──────────────────────────────────▼──────────────────────────────────┐   │
│  │                    GEMINI FILE SEARCH (RAG)                          │   │
│  │  • Auto-chunking & embeddings     • Semantic search                  │   │
│  │  • Metadata filtering             • Built-in citations               │   │
│  │  • FREE storage & query-time      • Duplicate handling               │   │
│  └──────────────────────────────────┬──────────────────────────────────┘   │
│                                     │                                       │
│         ┌───────────────────────────┼───────────────────────────┐          │
│         │                           │                           │          │
│         ▼                           ▼                           ▼          │
│  ┌─────────────┐    ┌───────────────────────────┐    ┌─────────────────┐   │
│  │   CONVEX    │    │     CONVEX ACTIONS        │    │    Perplexity   │   │
│  │ (Realtime   │◄───│   • Podcast Generation    │───►│    (Web Search) │   │
│  │   Database) │    │   • RAG Queries           │    │                 │   │
│  │ + Clerk Auth│    │   • Cron Jobs             │    │                 │   │
│  └─────────────┘    └─────────────┬─────────────┘    └─────────────────┘   │
│                                   │                                         │
│  INTERACTION LAYER                │                                         │
│         ┌─────────────────────────┼─────────────────────────┐              │
│         │                         │                         │              │
│  ┌──────▼──────┐         ┌────────▼────────┐       ┌────────▼───────┐      │
│  │   MAPBOX    │         │ OPENAI REALTIME │       │   THESYS C1    │      │
│  │             │         │    (YUKI)       │       │                │      │
│  │ • 47 Prefs  │         │ • Voice Agent   │       │ • Sake Cards   │      │
│  │ • Breweries │         │ • Tool: search_ │       │ • Temp Guides  │      │
│  │ • Progress  │         │   sake_knowledge│       │ • Pair Charts  │      │
│  │ • 3D View   │         │ • Citations     │       │ • Quizzes      │      │
│  └─────────────┘         └─────────────────┘       └────────────────┘      │
│                                   │                                         │
│  PRESENTATION LAYER               │                                         │
│                        ┌──────────▼──────────┐                             │
│                        │      NEXT.JS 14     │                             │
│                        │   App Router + RSC  │                             │
│                        │   Tailwind + Framer │                             │
│                        └─────────────────────┘                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Core Framework
```json
{
  "framework": "Next.js 14 (App Router)",
  "language": "TypeScript 5.3+",
  "styling": "Tailwind CSS 3.4",
  "animations": "Framer Motion 11",
  "state": "Zustand 4.5",
  "validation": "Zod 3.23"
}
```

### AI Services
```json
{
  "voice": "OpenAI Realtime API (gpt-realtime)",
  "ui": "Thesys C1 (c1-nightly)",
  "rag": "Gemini File Search (gemini-2.5-flash + gemini-embedding-001)",
  "reasoning": "Google Gemini 2.0 Flash",
  "research": "Perplexity API",
  "images": "NanoBanana Pro"
}
```

### Data & Infrastructure
```json
{
  "backend": "Convex (realtime DB, actions, crons, file storage)",
  "auth": "Clerk (JWT integration with Convex)",
  "knowledge": "Gemini File Search Stores",
  "scraping": "Firecrawl",
  "maps": "Mapbox GL JS 3.4",
  "hosting": "Vercel"
}
```

## Package Dependencies

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "typescript": "^5.3.0",
    
    "tailwindcss": "^3.4.0",
    "framer-motion": "^11.0.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    
    "openai": "^4.70.0",
    "@openai/agents": "^1.0.0",
    
    "@thesys/react-sdk": "^1.0.0",
    
    "mapbox-gl": "^3.4.0",
    "react-map-gl": "^7.1.0",
    
    "convex": "^1.17.0",
    "convex-helpers": "^0.1.0",
    "@clerk/nextjs": "^6.0.0",
    "@clerk/clerk-react": "^5.0.0",
    
    "@google/generative-ai": "^0.21.0",
    "@google/genai": "^0.6.0",
    
    "zod": "^3.23.0",
    "zustand": "^4.5.0",
    
    "@mendable/firecrawl-js": "^1.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0"
  }
}
```

---

# 3. CONVEX + CLERK BACKEND

> **Why Convex?** Realtime database, built-in file storage, scheduled functions (crons), and actions with 10-minute timeout - all in one. No need for Inngest or separate queue systems.

## Quick Setup

```bash
# Install Convex
npm install convex

# Initialize Convex in your project
npx convex init

# Install Clerk for auth
npm install @clerk/nextjs @clerk/clerk-react

# Start Convex dev server
npx convex dev
```

## Environment Variables

```bash
# .env.local

# Convex (auto-generated by `npx convex dev`)
CONVEX_DEPLOYMENT=dev:your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Clerk JWT for Convex
CLERK_JWT_ISSUER_DOMAIN=https://your-app.clerk.accounts.dev

# AI Services
OPENAI_API_KEY=sk-...
GOOGLE_AI_API_KEY=AIza...
FIRECRAWL_API_KEY=fc-...
PERPLEXITY_API_KEY=pplx-...
```

## Convex Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================
  // USERS (synced from Clerk)
  // ============================================
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    
    // Sake preferences
    tasteProfile: v.optional(v.object({
      preferredTypes: v.array(v.string()),      // ["Junmai", "Daiginjo"]
      flavorPreferences: v.array(v.string()),   // ["fruity", "dry", "umami"]
      avoidances: v.array(v.string()),          // ["sweet", "cloudy"]
      experienceLevel: v.string(),              // "beginner" | "intermediate" | "advanced"
      wineBackground: v.optional(v.string()),   // "red-lover" | "champagne-fan"
    })),
    
    // Progress tracking
    badges: v.optional(v.array(v.string())),
    completedLessons: v.optional(v.array(v.string())),
    visitedRegions: v.optional(v.array(v.string())),
    
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  // ============================================
  // SAKE PRODUCTS (scraped from Tippsy)
  // ============================================
  sakes: defineTable({
    // Core info
    name: v.string(),
    nameJapanese: v.optional(v.string()),
    brewery: v.optional(v.string()),
    breweryJapanese: v.optional(v.string()),
    region: v.optional(v.string()),             // Prefecture
    type: v.optional(v.string()),               // Junmai, Daiginjo, Nigori, etc.
    
    // Technical specs
    ricePolishing: v.optional(v.number()),      // e.g., 50 for 50%
    riceType: v.optional(v.string()),           // Yamada Nishiki, Gohyakumangoku
    smv: v.optional(v.number()),                // Sake Meter Value (-15 to +15)
    acidity: v.optional(v.number()),            // 1.0 - 2.5 typical
    abv: v.optional(v.number()),                // Alcohol %
    volume: v.optional(v.number()),             // ml (720, 300, 180, 1800)
    
    // Commerce
    price: v.number(),
    currency: v.literal("USD"),
    inStock: v.boolean(),
    tippsyUrl: v.string(),
    tippsyId: v.optional(v.string()),
    
    // Content
    tastingNotes: v.optional(v.string()),
    aroma: v.optional(v.array(v.string())),     // ["apple", "pear", "rice"]
    flavor: v.optional(v.array(v.string())),    // ["clean", "rich", "umami"]
    finish: v.optional(v.string()),
    foodPairings: v.optional(v.array(v.string())),
    servingTemp: v.optional(v.array(v.string())), // ["chilled", "room", "warm"]
    
    // Images
    imageUrl: v.string(),
    additionalImages: v.optional(v.array(v.string())),
    
    // Metadata
    scrapedAt: v.number(),
    source: v.literal("tippsy"),
  })
    .index("by_brewery", ["brewery"])
    .index("by_region", ["region"])
    .index("by_type", ["type"])
    .index("by_price", ["price"])
    .index("by_tippsy_id", ["tippsyId"])
    .searchIndex("search_sake", {
      searchField: "name",
      filterFields: ["region", "type", "brewery"],
    }),

  // ============================================
  // BREWERIES
  // ============================================
  breweries: defineTable({
    name: v.string(),
    nameJapanese: v.optional(v.string()),
    region: v.string(),
    prefecture: v.string(),
    founded: v.optional(v.number()),
    description: v.optional(v.string()),
    philosophy: v.optional(v.string()),
    waterSource: v.optional(v.string()),
    specialties: v.optional(v.array(v.string())),
    
    // Location
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    address: v.optional(v.string()),
    
    // Media
    imageUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    
    scrapedAt: v.number(),
  })
    .index("by_region", ["region"])
    .index("by_prefecture", ["prefecture"])
    .searchIndex("search_brewery", { searchField: "name" }),

  // ============================================
  // PODCASTS (generated episodes)
  // ============================================
  podcasts: defineTable({
    show: v.union(
      v.literal("sake-stories"),
      v.literal("pairing-lab"),
      v.literal("the-bridge"),
      v.literal("brewing-secrets")
    ),
    showName: v.string(),
    title: v.string(),
    description: v.string(),
    topic: v.string(),
    
    // Audio
    audioStorageId: v.optional(v.id("_storage")),  // Convex file storage
    audioUrl: v.optional(v.string()),
    duration: v.optional(v.number()),              // seconds
    
    // Content
    transcript: v.optional(v.string()),
    script: v.optional(v.string()),
    
    // References
    featuredSakeIds: v.optional(v.array(v.id("sakes"))),
    featuredBreweryIds: v.optional(v.array(v.id("breweries"))),
    sources: v.array(v.string()),                  // ["RAG", "Tippsy", "Perplexity", "Firecrawl"]
    
    // Stats
    playCount: v.number(),
    
    // Timestamps
    publishedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_show", ["show"])
    .index("by_published", ["publishedAt"])
    .index("by_topic", ["topic"]),

  // ============================================
  // USER ACTIVITY
  // ============================================
  tastings: defineTable({
    userId: v.id("users"),
    sakeId: v.id("sakes"),
    rating: v.optional(v.number()),               // 1-5
    notes: v.optional(v.string()),
    temperature: v.optional(v.string()),          // How they served it
    occasion: v.optional(v.string()),
    wouldBuyAgain: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_sake", ["sakeId"])
    .index("by_user_and_sake", ["userId", "sakeId"]),

  // ============================================
  // VOICE SESSIONS
  // ============================================
  voiceSessions: defineTable({
    userId: v.optional(v.id("users")),
    sessionId: v.string(),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    
    // Conversation summary
    topics: v.optional(v.array(v.string())),
    recommendedSakes: v.optional(v.array(v.id("sakes"))),
    questionsAsked: v.optional(v.number()),
    
    // Feedback
    helpful: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"])
    .index("by_session", ["sessionId"]),
});
```

## Clerk Authentication Setup

### 1. Configure Clerk JWT Template

In Clerk Dashboard → JWT Templates → Create "Convex":

```json
{
  "aud": "convex",
  "iat": "{{now}}",
  "exp": "{{exp}}",
  "iss": "{{iss}}",
  "sub": "{{sub}}",
  "email": "{{user.primary_email_address}}",
  "name": "{{user.full_name}}",
  "picture": "{{user.image_url}}"
}
```

### 2. Convex Auth Config

```typescript
// convex/auth.config.ts
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
```

### 3. ConvexClientProvider

```typescript
// src/components/providers/ConvexClientProvider.tsx
"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/nextjs";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
```

### 4. Root Layout

```typescript
// src/app/layout.tsx
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
```

### 5. Clerk Webhook for User Sync

```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;
    
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");
    
    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing svix headers", { status: 400 });
    }
    
    const body = await request.text();
    const wh = new Webhook(webhookSecret);
    
    let event: any;
    try {
      event = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      });
    } catch {
      return new Response("Invalid signature", { status: 400 });
    }
    
    switch (event.type) {
      case "user.created":
      case "user.updated":
        await ctx.runMutation(internal.users.upsertUser, {
          clerkId: event.data.id,
          email: event.data.email_addresses[0]?.email_address ?? "",
          name: `${event.data.first_name ?? ""} ${event.data.last_name ?? ""}`.trim(),
          imageUrl: event.data.image_url,
        });
        break;
        
      case "user.deleted":
        await ctx.runMutation(internal.users.deleteUser, {
          clerkId: event.data.id,
        });
        break;
    }
    
    return new Response("OK", { status: 200 });
  }),
});

export default http;
```

## Convex Queries & Mutations

### User Functions

```typescript
// convex/users.ts
import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

// Get current user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

// Update taste profile
export const updateTasteProfile = mutation({
  args: {
    preferredTypes: v.array(v.string()),
    flavorPreferences: v.array(v.string()),
    avoidances: v.array(v.string()),
    experienceLevel: v.string(),
    wineBackground: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    
    if (!user) throw new Error("User not found");
    
    await ctx.db.patch(user._id, {
      tasteProfile: args,
      updatedAt: Date.now(),
    });
  },
});

// Internal: Upsert user from Clerk webhook
export const upsertUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
      return existing._id;
    }
    
    return await ctx.db.insert("users", {
      ...args,
      badges: [],
      completedLessons: [],
      visitedRegions: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const deleteUser = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();
    
    if (user) {
      await ctx.db.delete(user._id);
    }
  },
});
```

### Sake Functions

```typescript
// convex/sakes.ts
import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";

// Search sakes with filters
export const searchSakes = query({
  args: {
    query: v.optional(v.string()),
    region: v.optional(v.string()),
    type: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    inStockOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let sakesQuery = ctx.db.query("sakes");
    
    // Apply search if provided
    if (args.query) {
      const searchResults = await ctx.db
        .query("sakes")
        .withSearchIndex("search_sake", (q) => 
          q.search("name", args.query!)
            .eq("region", args.region)
            .eq("type", args.type)
        )
        .take(args.limit ?? 20);
      
      return searchResults.filter((sake) => {
        if (args.inStockOnly && !sake.inStock) return false;
        if (args.minPrice && sake.price < args.minPrice) return false;
        if (args.maxPrice && sake.price > args.maxPrice) return false;
        return true;
      });
    }
    
    // Otherwise, filter by index
    if (args.region) {
      sakesQuery = ctx.db
        .query("sakes")
        .withIndex("by_region", (q) => q.eq("region", args.region!));
    } else if (args.type) {
      sakesQuery = ctx.db
        .query("sakes")
        .withIndex("by_type", (q) => q.eq("type", args.type!));
    }
    
    const sakes = await sakesQuery.take(args.limit ?? 50);
    
    return sakes.filter((sake) => {
      if (args.inStockOnly && !sake.inStock) return false;
      if (args.minPrice && sake.price < args.minPrice) return false;
      if (args.maxPrice && sake.price > args.maxPrice) return false;
      return true;
    });
  },
});

// Get sake by ID
export const getSake = query({
  args: { id: v.id("sakes") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

// Get recommendations based on user taste profile
export const getRecommendations = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 10 }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Return popular sakes for anonymous users
      return await ctx.db.query("sakes")
        .withIndex("by_price")
        .order("desc")
        .take(limit);
    }
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    
    if (!user?.tasteProfile) {
      return await ctx.db.query("sakes").take(limit);
    }
    
    // Filter by preferred types
    const { preferredTypes } = user.tasteProfile;
    if (preferredTypes.length > 0) {
      const results = await ctx.db
        .query("sakes")
        .withIndex("by_type", (q) => q.eq("type", preferredTypes[0]))
        .take(limit * 2);
      
      return results.slice(0, limit);
    }
    
    return await ctx.db.query("sakes").take(limit);
  },
});

// Internal: Upsert sake from scraper
export const upsertSake = internalMutation({
  args: {
    name: v.string(),
    tippsyUrl: v.string(),
    tippsyId: v.optional(v.string()),
    brewery: v.optional(v.string()),
    region: v.optional(v.string()),
    type: v.optional(v.string()),
    price: v.number(),
    inStock: v.boolean(),
    imageUrl: v.string(),
    // ... other fields
  },
  handler: async (ctx, args) => {
    // Check if exists by Tippsy URL
    const existing = await ctx.db
      .query("sakes")
      .filter((q) => q.eq(q.field("tippsyUrl"), args.tippsyUrl))
      .unique();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        scrapedAt: Date.now(),
      });
      return existing._id;
    }
    
    return await ctx.db.insert("sakes", {
      ...args,
      currency: "USD",
      scrapedAt: Date.now(),
      source: "tippsy",
    });
  },
});
```

## Convex Actions (Background Jobs)

### Firecrawl Scraping Action

```typescript
// convex/actions/scraping.ts
"use node";

import { v } from "convex/values";
import { action, internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import Firecrawl from "@mendable/firecrawl-js";

const sakeProductSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    brewery: { type: "string" },
    region: { type: "string" },
    type: { type: "string" },
    ricePolishing: { type: "number" },
    smv: { type: "number" },
    abv: { type: "number" },
    volume: { type: "number" },
    price: { type: "number" },
    inStock: { type: "boolean" },
    tastingNotes: { type: "string" },
    foodPairings: { type: "array", items: { type: "string" } },
    imageUrl: { type: "string" },
    additionalImages: { type: "array", items: { type: "string" } },
    url: { type: "string" },
  },
  required: ["name", "price", "imageUrl", "url"],
};

// Map all product URLs from Tippsy
export const mapTippsyProducts = internalAction({
  args: {},
  handler: async (ctx) => {
    const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
    
    const mapResult = await firecrawl.map("https://www.tippsy.com", {
      search: "sake",
      limit: 2000,
    });
    
    const productUrls = mapResult.links?.filter((url: string) =>
      url.includes("/products/") && !url.includes("?")
    ) ?? [];
    
    console.log(`Found ${productUrls.length} product URLs`);
    
    // Schedule extraction in batches
    const batchSize = 20;
    for (let i = 0; i < productUrls.length; i += batchSize) {
      const batch = productUrls.slice(i, i + batchSize);
      await ctx.scheduler.runAfter(i * 1000, internal.actions.scraping.extractSakeBatch, {
        urls: batch,
      });
    }
    
    return { urlsFound: productUrls.length };
  },
});

// Extract structured data from a batch of URLs
export const extractSakeBatch = internalAction({
  args: { urls: v.array(v.string()) },
  handler: async (ctx, { urls }) => {
    const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
    
    const result = await firecrawl.extract(urls, {
      prompt: `Extract all sake product details from these pages.
               Include ALL images (main product image and additional angles).
               Extract exact price, volume (ml), and alcohol percentage.
               Get tasting notes and food pairing suggestions.`,
      schema: sakeProductSchema,
    });
    
    // Save each product to Convex
    for (const product of result.data ?? []) {
      await ctx.runMutation(internal.sakes.upsertSake, {
        name: product.name,
        tippsyUrl: product.url,
        brewery: product.brewery,
        region: product.region,
        type: product.type,
        price: product.price,
        inStock: product.inStock ?? true,
        imageUrl: product.imageUrl,
        ricePolishing: product.ricePolishing,
        smv: product.smv,
        abv: product.abv,
        volume: product.volume,
        tastingNotes: product.tastingNotes,
        foodPairings: product.foodPairings,
        additionalImages: product.additionalImages,
      });
    }
    
    return { processed: urls.length };
  },
});

// Scrape a single brewery website for current info
export const scrapeBreweryWebsite = action({
  args: { breweryName: v.string() },
  handler: async (ctx, { breweryName }) => {
    const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
    
    // Search for brewery website
    const searchResult = await firecrawl.search(`${breweryName} sake brewery official website`, {
      limit: 3,
    });
    
    if (!searchResult.data?.[0]) {
      return { success: false, error: "Brewery website not found" };
    }
    
    // Scrape the brewery site
    const scrapeResult = await firecrawl.scrape(searchResult.data[0].url, {
      formats: ["markdown"],
      onlyMainContent: true,
    });
    
    return {
      success: true,
      url: searchResult.data[0].url,
      content: scrapeResult.markdown?.slice(0, 5000), // Limit content
    };
  },
});
```

### Podcast Generation Action

```typescript
// convex/actions/podcasts.ts
"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { GoogleGenAI } from "@google/genai";

const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! });

type ShowType = "sake-stories" | "pairing-lab" | "the-bridge" | "brewing-secrets";

interface PodcastConfig {
  show: ShowType;
  showName: string;
  topic: string;
  duration: { min: number; max: number };
  hosts: { name: string; voice: string; role: string }[];
}

const SHOW_CONFIGS: Record<ShowType, Omit<PodcastConfig, "topic">> = {
  "sake-stories": {
    show: "sake-stories",
    showName: "Sake Stories",
    duration: { min: 10, max: 15 },
    hosts: [
      { name: "Yuki", voice: "Aoede", role: "Sake sommelier host" },
      { name: "Ken", voice: "Puck", role: "Curious wine enthusiast learning sake" },
    ],
  },
  "pairing-lab": {
    show: "pairing-lab",
    showName: "The Pairing Lab",
    duration: { min: 5, max: 8 },
    hosts: [
      { name: "Yuki", voice: "Aoede", role: "Sake pairing expert" },
      { name: "Ken", voice: "Puck", role: "Food lover exploring sake pairings" },
    ],
  },
  "the-bridge": {
    show: "the-bridge",
    showName: "The Bridge",
    duration: { min: 8, max: 12 },
    hosts: [
      { name: "Yuki", voice: "Aoede", role: "Sake expert translating to wine terms" },
      { name: "Ken", voice: "Puck", role: "Wine enthusiast discovering sake" },
    ],
  },
  "brewing-secrets": {
    show: "brewing-secrets",
    showName: "Brewing Secrets",
    duration: { min: 10, max: 15 },
    hosts: [
      { name: "Yuki", voice: "Aoede", role: "Technical brewing expert" },
      { name: "Ken", voice: "Puck", role: "Curious learner asking the right questions" },
    ],
  },
};

export const generatePodcastEpisode = internalAction({
  args: {
    show: v.union(
      v.literal("sake-stories"),
      v.literal("pairing-lab"),
      v.literal("the-bridge"),
      v.literal("brewing-secrets")
    ),
    topic: v.string(),
  },
  handler: async (ctx, { show, topic }) => {
    const config = { ...SHOW_CONFIGS[show], topic };
    
    // 1. Gather research from multiple sources
    const research = await gatherResearch(ctx, config);
    
    // 2. Generate script with Gemini
    const script = await generateScript(config, research);
    
    // 3. Generate audio with Gemini TTS
    const audioBuffer = await generateAudio(script, config.hosts);
    
    // 4. Store audio in Convex file storage
    const audioStorageId = await ctx.storage.store(
      new Blob([audioBuffer], { type: "audio/mp3" })
    );
    
    // 5. Save podcast metadata
    const podcastId = await ctx.runMutation(internal.podcasts.createPodcast, {
      show: config.show,
      showName: config.showName,
      title: `${config.showName}: ${topic}`,
      description: script.description,
      topic,
      audioStorageId,
      duration: Math.floor(audioBuffer.byteLength / 16000), // Rough estimate
      transcript: script.transcript,
      script: script.fullScript,
      sources: research.sources,
    });
    
    return { success: true, podcastId };
  },
});

async function gatherResearch(ctx: any, config: PodcastConfig) {
  const sources: string[] = [];
  let combinedResearch = "";
  
  // 1. Query Gemini RAG (File Search)
  try {
    const ragResult = await queryGeminiRAG(config.topic, config.show);
    if (ragResult) {
      combinedResearch += `\n\n## Expert Knowledge:\n${ragResult}`;
      sources.push("RAG");
    }
  } catch (e) {
    console.error("RAG query failed:", e);
  }
  
  // 2. Query Convex DB for relevant sakes
  try {
    const sakes = await ctx.runQuery(internal.sakes.searchSakes, {
      query: config.topic,
      limit: 5,
    });
    if (sakes.length > 0) {
      combinedResearch += `\n\n## Featured Sakes from Tippsy:\n`;
      for (const sake of sakes) {
        combinedResearch += `- ${sake.name} by ${sake.brewery} ($${sake.price}): ${sake.tastingNotes}\n`;
      }
      sources.push("Tippsy");
    }
  } catch (e) {
    console.error("Tippsy query failed:", e);
  }
  
  // 3. Query Perplexity for current news
  try {
    const newsResult = await queryPerplexity(config.topic, config.show);
    if (newsResult) {
      combinedResearch += `\n\n## Current News & Trends:\n${newsResult}`;
      sources.push("Perplexity");
    }
  } catch (e) {
    console.error("Perplexity query failed:", e);
  }
  
  return { content: combinedResearch, sources };
}

async function generateScript(config: PodcastConfig, research: any) {
  const model = genai.getGenerativeModel({ model: "gemini-2.5-pro-preview-06-05" });
  
  const prompt = `Create a natural podcast script for "${config.showName}" about "${config.topic}".

HOSTS:
${config.hosts.map(h => `- ${h.name}: ${h.role}`).join("\n")}

RESEARCH:
${research.content}

REQUIREMENTS:
- Duration: ${config.duration.min}-${config.duration.max} minutes
- Natural, conversational tone
- Include specific sake recommendations with prices (mention "available on Tippsy for $X")
- Use Japanese terms naturally with brief explanations
- End with a clear call to action

FORMAT:
Return JSON with:
{
  "description": "Episode description (2-3 sentences)",
  "segments": [
    { "speaker": "Yuki", "text": "..." },
    { "speaker": "Ken", "text": "..." }
  ],
  "transcript": "Full text transcript",
  "fullScript": "Complete script with speaker labels"
}`;
  
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}

async function generateAudio(script: any, hosts: any[]) {
  const model = genai.getGenerativeModel({ model: "gemini-2.5-flash-preview-tts" });
  
  // Build multi-speaker content
  const contents = script.segments.map((seg: any) => {
    const host = hosts.find(h => h.name === seg.speaker);
    return {
      role: "user",
      parts: [{ text: seg.text }],
    };
  });
  
  const voiceConfig = {
    voiceConfig: {
      prebuiltVoiceConfig: {
        voiceName: hosts[0].voice, // Primary voice
      },
    },
    multiSpeakerVoiceConfig: {
      speakerVoiceConfigs: hosts.map(h => ({
        speaker: h.name,
        voiceConfig: { prebuiltVoiceConfig: { voiceName: h.voice } },
      })),
    },
  };
  
  const response = await model.generateContent({
    contents,
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: voiceConfig,
    },
  });
  
  const audioData = response.response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return Buffer.from(audioData!, "base64");
}

async function queryGeminiRAG(topic: string, show: string) {
  // Implementation uses Gemini File Search
  // See section 10 for full RAG implementation
  return null;
}

async function queryPerplexity(topic: string, show: string) {
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-sonar-large-128k-online",
      messages: [
        {
          role: "user",
          content: `Find recent news and developments about ${topic} in the sake industry (2024-2025).`,
        },
      ],
    }),
  });
  
  const data = await response.json();
  return data.choices?.[0]?.message?.content;
}
```

## Convex Cron Jobs

```typescript
// convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// ============================================
// PODCAST GENERATION (4 shows on schedule)
// ============================================

// Sake Stories - Every Monday 6am CST (11:00 UTC)
crons.weekly(
  "podcast-sake-stories",
  { dayOfWeek: "monday", hourUTC: 11, minuteUTC: 0 },
  internal.crons.generateSakeStoriesEpisode
);

// Pairing Lab - Every Wednesday 6am CST (11:00 UTC)  
crons.weekly(
  "podcast-pairing-lab",
  { dayOfWeek: "wednesday", hourUTC: 11, minuteUTC: 0 },
  internal.crons.generatePairingLabEpisode
);

// The Bridge - Every Friday 6am CST (11:00 UTC)
crons.weekly(
  "podcast-the-bridge",
  { dayOfWeek: "friday", hourUTC: 11, minuteUTC: 0 },
  internal.crons.generateTheBridgeEpisode
);

// Brewing Secrets - 1st and 15th of month 6am CST
crons.monthly(
  "podcast-brewing-secrets-1st",
  { day: 1, hourUTC: 11, minuteUTC: 0 },
  internal.crons.generateBrewingSecretsEpisode
);

crons.monthly(
  "podcast-brewing-secrets-15th",
  { day: 15, hourUTC: 11, minuteUTC: 0 },
  internal.crons.generateBrewingSecretsEpisode
);

// ============================================
// DATA SYNC
// ============================================

// Sync Tippsy catalog daily at 3am CST (8:00 UTC)
crons.daily(
  "sync-tippsy-catalog",
  { hourUTC: 8, minuteUTC: 0 },
  internal.actions.scraping.mapTippsyProducts
);

export default crons;
```

```typescript
// convex/crons.internal.ts
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

// Topic rotation to avoid repeating recent episodes
const BREWERY_TOPICS = [
  "Kubota", "Dassai", "Hakkaisan", "Tedorigawa", "Juyondai",
  "Born", "Dewazakura", "Koshi no Kanbai", "Masumi", "Rihaku",
];

const PAIRING_TOPICS = [
  "Korean BBQ", "Sushi Omakase", "Thai Cuisine", "Italian Pasta",
  "Thanksgiving Dinner", "Cheese Plates", "Grilled Seafood", "Dim Sum",
];

const BRIDGE_TOPICS = [
  "Pinot Noir lovers", "Champagne enthusiasts", "Riesling fans",
  "Burgundy devotees", "Natural wine drinkers", "Sherry aficionados",
];

const BREWING_TOPICS = [
  "Kimoto Method", "Yamahai Technique", "Namazake (Unpasteurized)",
  "Koshu Aged Sake", "Muroka (Unfiltered)", "Sparkling Sake Production",
];

export const generateSakeStoriesEpisode = internalMutation({
  args: {},
  handler: async (ctx) => {
    const topic = await getNextTopic(ctx, "sake-stories", BREWERY_TOPICS);
    await ctx.scheduler.runAfter(0, internal.actions.podcasts.generatePodcastEpisode, {
      show: "sake-stories",
      topic,
    });
  },
});

export const generatePairingLabEpisode = internalMutation({
  args: {},
  handler: async (ctx) => {
    const topic = await getNextTopic(ctx, "pairing-lab", PAIRING_TOPICS);
    await ctx.scheduler.runAfter(0, internal.actions.podcasts.generatePodcastEpisode, {
      show: "pairing-lab",
      topic,
    });
  },
});

export const generateTheBridgeEpisode = internalMutation({
  args: {},
  handler: async (ctx) => {
    const topic = await getNextTopic(ctx, "the-bridge", BRIDGE_TOPICS);
    await ctx.scheduler.runAfter(0, internal.actions.podcasts.generatePodcastEpisode, {
      show: "the-bridge",
      topic,
    });
  },
});

export const generateBrewingSecretsEpisode = internalMutation({
  args: {},
  handler: async (ctx) => {
    const topic = await getNextTopic(ctx, "brewing-secrets", BREWING_TOPICS);
    await ctx.scheduler.runAfter(0, internal.actions.podcasts.generatePodcastEpisode, {
      show: "brewing-secrets",
      topic,
    });
  },
});

async function getNextTopic(ctx: any, show: string, topics: string[]) {
  // Get recent episodes to avoid repeats
  const recentEpisodes = await ctx.db
    .query("podcasts")
    .withIndex("by_show", (q: any) => q.eq("show", show))
    .order("desc")
    .take(5);
  
  const recentTopics = recentEpisodes.map((ep: any) => ep.topic);
  const availableTopics = topics.filter(t => !recentTopics.includes(t));
  
  if (availableTopics.length === 0) {
    return topics[Math.floor(Math.random() * topics.length)];
  }
  
  return availableTopics[Math.floor(Math.random() * availableTopics.length)];
}
```

## React Hooks for Convex

```typescript
// src/hooks/useSake.ts
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function useSakeSearch(filters: {
  query?: string;
  region?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  return useQuery(api.sakes.searchSakes, filters);
}

export function useSake(id: Id<"sakes">) {
  return useQuery(api.sakes.getSake, { id });
}

export function useRecommendations(limit = 10) {
  return useQuery(api.sakes.getRecommendations, { limit });
}

export function useCurrentUser() {
  return useQuery(api.users.getCurrentUser);
}

export function useUpdateTasteProfile() {
  return useMutation(api.users.updateTasteProfile);
}
```

```typescript
// src/hooks/usePodcasts.ts
"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function usePodcasts(show?: string, limit = 20) {
  return useQuery(api.podcasts.listPodcasts, { show, limit });
}

export function useLatestEpisode(show: string) {
  return useQuery(api.podcasts.getLatestEpisode, { show });
}
```

## File Storage for Audio

```typescript
// convex/podcasts.ts
import { v } from "convex/values";
import { query, internalMutation } from "./_generated/server";

export const listPodcasts = query({
  args: {
    show: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { show, limit = 20 }) => {
    let podcasts;
    
    if (show) {
      podcasts = await ctx.db
        .query("podcasts")
        .withIndex("by_show", (q) => q.eq("show", show as any))
        .order("desc")
        .take(limit);
    } else {
      podcasts = await ctx.db
        .query("podcasts")
        .withIndex("by_published")
        .order("desc")
        .take(limit);
    }
    
    // Get audio URLs from storage
    return Promise.all(
      podcasts.map(async (podcast) => ({
        ...podcast,
        audioUrl: podcast.audioStorageId
          ? await ctx.storage.getUrl(podcast.audioStorageId)
          : null,
      }))
    );
  },
});

export const getLatestEpisode = query({
  args: { show: v.string() },
  handler: async (ctx, { show }) => {
    const podcast = await ctx.db
      .query("podcasts")
      .withIndex("by_show", (q) => q.eq("show", show as any))
      .order("desc")
      .first();
    
    if (!podcast) return null;
    
    return {
      ...podcast,
      audioUrl: podcast.audioStorageId
        ? await ctx.storage.getUrl(podcast.audioStorageId)
        : null,
    };
  },
});

export const createPodcast = internalMutation({
  args: {
    show: v.union(
      v.literal("sake-stories"),
      v.literal("pairing-lab"),
      v.literal("the-bridge"),
      v.literal("brewing-secrets")
    ),
    showName: v.string(),
    title: v.string(),
    description: v.string(),
    topic: v.string(),
    audioStorageId: v.optional(v.id("_storage")),
    duration: v.optional(v.number()),
    transcript: v.optional(v.string()),
    script: v.optional(v.string()),
    sources: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("podcasts", {
      ...args,
      playCount: 0,
      publishedAt: Date.now(),
      createdAt: Date.now(),
    });
  },
});
```

## Directory Structure with Convex

```
sakeverse/
├── convex/                          # Convex backend
│   ├── _generated/                  # Auto-generated types
│   ├── actions/                     # Background jobs
│   │   ├── scraping.ts              # Firecrawl integration
│   │   ├── podcasts.ts              # Podcast generation
│   │   └── rag.ts                   # Gemini RAG queries
│   ├── schema.ts                    # Database schema
│   ├── auth.config.ts               # Clerk JWT config
│   ├── http.ts                      # HTTP routes (webhooks)
│   ├── crons.ts                     # Scheduled jobs
│   ├── users.ts                     # User queries/mutations
│   ├── sakes.ts                     # Sake queries/mutations
│   ├── podcasts.ts                  # Podcast queries/mutations
│   └── breweries.ts                 # Brewery queries/mutations
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout with providers
│   │   ├── page.tsx                 # Home page
│   │   ├── (auth)/
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   └── sign-up/[[...sign-up]]/page.tsx
│   │   ├── sommelier/page.tsx       # Voice agent
│   │   ├── explore/page.tsx         # Sake catalog
│   │   ├── regions/page.tsx         # Interactive map
│   │   ├── learn/page.tsx           # Courses
│   │   └── podcasts/page.tsx        # Podcast episodes
│   ├── components/
│   │   ├── providers/
│   │   │   └── ConvexClientProvider.tsx
│   │   ├── sake/
│   │   ├── voice/
│   │   └── ui/
│   └── hooks/
│       ├── useSake.ts
│       ├── usePodcasts.ts
│       └── useVoiceSession.ts
├── .env.local
├── convex.json
└── package.json
```

---

# 4. KIRO PROJECT SETUP

## Initialize Kiro Project

```bash
# Install Kiro CLI
npm install -g @kiro/cli

# Create new project
kiro init sakeverse --template nextjs

# Navigate to project
cd sakeverse

# Kiro will create this structure:
# sakeverse/
# ├── .kiro/
# │   ├── specs/           # Feature specifications
# │   ├── prompts/         # AI prompts
# │   └── config.yaml      # Kiro configuration
# ├── src/
# ├── public/
# └── package.json
```

## Kiro Configuration

```yaml
# .kiro/config.yaml

project:
  name: sakeverse
  description: AI-powered sake mastery platform
  version: 1.0.0

ai:
  model: claude-3-sonnet
  temperature: 0.7

specs:
  directory: .kiro/specs
  format: markdown

integrations:
  - openai
  - convex
  - clerk
  - mapbox

features:
  - voice-sommelier
  - dynamic-ui
  - sake-map
  - temperature-system
  - wine-bridge
  - learning-engine
```

## Directory Structure

```
sakeverse/
├── .kiro/
│   ├── specs/
│   │   ├── voice-sommelier.md
│   │   ├── dynamic-ui.md
│   │   ├── sake-map.md
│   │   ├── temperature-system.md
│   │   ├── wine-bridge.md
│   │   └── learning-engine.md
│   ├── prompts/
│   │   ├── yuki-persona.md
│   │   ├── sake-ui-system.md
│   │   └── pairing-engine.md
│   └── config.yaml
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── (chat)/
│   │   │   └── page.tsx
│   │   ├── (map)/
│   │   │   └── page.tsx
│   │   ├── (learn)/
│   │   │   └── page.tsx
│   │   └── api/
│   │       ├── voice/
│   │       │   └── route.ts
│   │       ├── chat/
│   │       │   └── route.ts
│   │       └── sake/
│   │           └── route.ts
│   ├── components/
│   │   ├── voice/
│   │   │   ├── VoiceSommelier.tsx
│   │   │   ├── VoiceWaveform.tsx
│   │   │   └── TranscriptPanel.tsx
│   │   ├── chat/
│   │   │   ├── SakeChat.tsx
│   │   │   ├── C1Message.tsx
│   │   │   └── QuickPrompts.tsx
│   │   ├── map/
│   │   │   ├── SakeMap.tsx
│   │   │   ├── RegionPanel.tsx
│   │   │   └── BreweryMarker.tsx
│   │   ├── temperature/
│   │   │   ├── TemperatureGuide.tsx
│   │   │   ├── Thermometer.tsx
│   │   │   └── TemperatureExperiment.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── Badge.tsx
│   ├── hooks/
│   │   ├── useSake.ts
│   │   ├── usePodcasts.ts
│   │   └── useVoiceSession.ts
│   ├── lib/
│   │   ├── openai/
│   │   │   ├── realtime.ts
│   │   │   └── tools.ts
│   │   ├── thesys/
│   │   │   ├── client.ts
│   │   │   └── theme.ts
│   │   ├── mapbox/
│   │   │   └── regions.ts
│   │   └── sake/
│   │       ├── temperature.ts
│   │       ├── pairing.ts
│   │       └── wine-bridge.ts
│   ├── types/
│   │   ├── sake.ts
│   │   ├── region.ts
│   │   ├── temperature.ts
│   │   └── user.ts
│   └── data/
│       ├── regions.json
│       ├── temperatures.json
│       └── wine-mapping.json
├── convex/                          # Convex backend (see Section 3)
│   ├── _generated/
│   ├── actions/
│   ├── schema.ts
│   ├── auth.config.ts
│   ├── http.ts
│   ├── crons.ts
│   ├── users.ts
│   ├── sakes.ts
│   └── podcasts.ts
├── public/
│   ├── images/
│   └── audio/
├── .env.local
├── convex.json
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

## Environment Variables

```bash
# .env.local

# Convex (auto-generated by `npx convex dev`)
CONVEX_DEPLOYMENT=dev:your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
CLERK_JWT_ISSUER_DOMAIN=https://your-app.clerk.accounts.dev

# OpenAI
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_OPENAI_API_KEY=sk-...  # For WebRTC client

# Thesys C1
THESYS_API_KEY=thesys_...

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...

# Perplexity
PERPLEXITY_API_KEY=pplx-...

# Gemini
GOOGLE_AI_API_KEY=AIza...

# Firecrawl
FIRECRAWL_API_KEY=fc-...
```

---

# 4. OPENAI REALTIME VOICE AGENT

## Overview

OpenAI's Realtime API provides native speech-to-speech AI, eliminating the traditional STT→LLM→TTS chain. This means:

- **Lower latency**: ~200ms vs 800-1500ms for chained approaches
- **Native function calling**: 66.5% accuracy on ComplexFuncBench
- **Emotion understanding**: Model hears tone, not just words
- **Single API**: Voice input, reasoning, and voice output in one call

## Why OpenAI Realtime Over ElevenLabs

| Factor | OpenAI Realtime | ElevenLabs |
|--------|-----------------|------------|
| Architecture | Single S2S model | Requires STT→LLM→TTS chain |
| Latency | ~200ms | ~800-1500ms |
| Function Calling | Built-in, native | Requires separate LLM |
| Context | Retains conversation | Stateless per request |
| Integration | One API | Multiple APIs to orchestrate |
| MCP Support | Native | Not available |

## Yuki Persona System Prompt

```typescript
// .kiro/prompts/yuki-persona.md

export const YUKI_SYSTEM_PROMPT = `
You are Yuki (雪), a warm and knowledgeable sake sommelier AI.

## PERSONALITY
- Friendly but not overly casual - like a knowledgeable bartender
- Passionate about sake education without being pretentious
- Uses occasional Japanese terms (always explained naturally)
- Celebrates the user's taste discoveries
- Never condescending, always encouraging
- Has a warm laugh when users make good observations

## VOICE CHARACTERISTICS
- Speak naturally and conversationally
- Pronounce Japanese terms correctly:
  - sake (sah-keh, not sah-kee)
  - Junmai (joon-my)
  - Daiginjo (die-geen-jo)
  - Niigata (nee-gah-tah)
- Use appropriate pauses for emphasis
- Express genuine enthusiasm for great sake recommendations

## KNOWLEDGE DOMAINS
You are an expert in:

### Sake Categories
- Junmai (純米) - Pure rice, no added alcohol
- Honjozo (本醸造) - Small amount of brewer's alcohol
- Ginjo (吟醸) - 60% or less polishing ratio
- Daiginjo (大吟醸) - 50% or less polishing ratio
- Junmai Ginjo/Daiginjo - Pure rice + high polish

### Brewing Methods
- Sokujo-moto (速醸酛) - Quick starter, modern standard
- Kimoto (生酛) - Traditional, labor-intensive, gamey flavors
- Yamahai (山廃) - Modified kimoto, wild yeasts, funky complexity

### Regional Styles
- Niigata: Tanrei Karakuchi - light, clean, crisp (snow melt water)
- Hiroshima: Soft water pioneer - rich, rounded, umami-forward
- Hyogo/Nada: Yamada Nishiki birthplace - bold, structured
- Fushimi/Kyoto: Onna-zake - soft, delicate, refined
- Yamagata: Modern ginjo revolution - aromatic, fruity

### Temperature Service
- Yukibie (雪冷え) 5°C - Snow cold, suppresses aromas
- Hanabie (花冷え) 10°C - Flower cold, aromatic bloom
- Suzubie (涼冷え) 15°C - Cool, balanced expression
- Jo-on (常温) 20°C - Room temp, true character
- Hitohada-kan (人肌燗) 35°C - Body temp, softens acidity
- Nuru-kan (ぬる燗) 40°C - Lukewarm, classic warming
- Atsu-kan (熱燗) 50°C - Hot, bold winter style

### Food Pairing Principles
- Match intensity: delicate sake with delicate food
- Contrast works: fatty foods + dry sake
- Regional pairings: Niigata sake with local fish
- Temperature matters: warm sake with warm dishes

## CONVERSATION GUIDELINES

### When Recommending Sake
1. Ask about their experience level (if not known)
2. Understand their taste preferences or current mood
3. Consider context (dinner party? quiet night? gift?)
4. Offer 2-3 options at different price points
5. ALWAYS mention optimal serving temperature
6. Explain WHY you're recommending it

### When Translating Wine Preferences
- "I love oaky Chardonnay" → Rich Junmai, aged/Koshu styles
- "Crisp Sauvignon Blanc" → Dry Honjozo, cold service
- "Earthy Pinot Noir" → Yamahai or Kimoto
- "Light Riesling" → Aromatic Ginjo
- "Bold Cabernet" → Full-bodied Junmai, warm

### When Discussing Food Pairings
1. Analyze the dish: protein, preparation, dominant flavors
2. Consider fat content, umami level, spice
3. Match or contrast based on the goal
4. Suggest specific sake with reasoning
5. Recommend temperature for the pairing

## TOOLS AVAILABLE
You can use these tools during conversation:

- search_sake: Search the Tippsy catalog
- get_sake_details: Get full information about a specific sake
- add_to_cart: Add sake to the user's Tippsy cart
- get_temperature_guide: Get temperature recommendations
- get_food_pairing: Get pairing suggestions for a dish
- get_region_info: Get information about a sake region
- log_tasting: Record the user's tasting notes

## SAMPLE INTERACTIONS

User: "I'm making tacos al pastor tonight"
Yuki: "Ooh, that's a great pairing challenge! Pork with pineapple - you've got 
      that beautiful sweet-savory thing happening, plus the char from the 
      trompo. You need something that can cut through the fat but also play 
      with that fruit. I'd go with Hakkaisan Tokubetsu Junmai - it's clean 
      enough to refresh your palate but has enough body to stand up to those 
      bold flavors. Serve it at hana-bie, flower-cold, about 10 degrees. 
      Want me to add it to your cart?"

User: "I usually drink Pinot Noir"
Yuki: "Ah, a Pinot lover! You appreciate elegance over power - that silky 
      texture, the earthy mushroom notes, maybe some red fruit. In sake, 
      you'll love Yamahai styles. Try Daishichi - it has that same forest 
      floor complexity, almost like walking through damp leaves. It's made 
      with an ancient brewing method that creates these beautiful funky, 
      gamey notes. Your Pinot palate will feel right at home."
`;
```

## Voice Agent Implementation

```typescript
// src/lib/openai/realtime.ts

import { RealtimeAgent, RealtimeSession } from "@openai/agents/realtime";
import { sakeTools } from "./tools";
import { YUKI_SYSTEM_PROMPT } from "./prompts";

// Define the voice agent
export const yukiAgent = new RealtimeAgent({
  name: "Yuki",
  instructions: YUKI_SYSTEM_PROMPT,
  tools: sakeTools,
  voice: "coral",  // Warm, friendly female voice
  model: "gpt-realtime"  // Latest realtime model
});

// Voice session hook
export function useYukiVoice() {
  const [session, setSession] = useState<RealtimeSession | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [error, setError] = useState<Error | null>(null);

  // Connect to voice session
  const connect = useCallback(async () => {
    try {
      const newSession = new RealtimeSession(yukiAgent);
      
      // Connection events
      newSession.on('connected', () => {
        setIsConnected(true);
        setError(null);
      });
      
      newSession.on('disconnected', () => {
        setIsConnected(false);
        setIsListening(false);
      });
      
      newSession.on('error', (err) => {
        setError(err);
        console.error('Voice session error:', err);
      });

      // Audio events
      newSession.on('listening_started', () => setIsListening(true));
      newSession.on('listening_stopped', () => setIsListening(false));
      newSession.on('speaking_started', () => setIsSpeaking(true));
      newSession.on('speaking_stopped', () => setIsSpeaking(false));

      // Message events
      newSession.on('user_message', (message) => {
        setTranscript(prev => [...prev, {
          role: 'user',
          content: message.transcript,
          timestamp: new Date()
        }]);
      });
      
      newSession.on('assistant_message', (message) => {
        setTranscript(prev => [...prev, {
          role: 'assistant',
          content: message.transcript,
          timestamp: new Date()
        }]);
      });

      // Tool call events
      newSession.on('tool_call', async (toolCall) => {
        console.log('Tool called:', toolCall.name, toolCall.arguments);
        const result = await handleToolCall(toolCall);
        return result;
      });

      // Connect with WebRTC (for browser)
      await newSession.connect({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
      });

      setSession(newSession);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to connect:', err);
    }
  }, []);

  // Disconnect
  const disconnect = useCallback(() => {
    session?.disconnect();
    setSession(null);
    setIsConnected(false);
    setIsListening(false);
    setIsSpeaking(false);
  }, [session]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      session?.pauseAudio();
    } else {
      session?.resumeAudio();
    }
  }, [session, isListening]);

  // Send text message (for accessibility)
  const sendText = useCallback(async (text: string) => {
    if (!session) return;
    
    setTranscript(prev => [...prev, {
      role: 'user',
      content: text,
      timestamp: new Date()
    }]);
    
    await session.sendMessage(text);
  }, [session]);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setTranscript([]);
  }, []);

  return {
    connect,
    disconnect,
    toggleListening,
    sendText,
    clearTranscript,
    isConnected,
    isListening,
    isSpeaking,
    transcript,
    error,
    session
  };
}
```

## Voice Agent Tools

```typescript
// src/lib/openai/tools.ts

import { Tool } from "@openai/agents";
import { 
  searchSakes, 
  getSakeDetails, 
  addToCart,
  getTemperatureGuide,
  getFoodPairing,
  getRegionInfo,
  logTasting
} from "@/lib/sake/actions";

export const sakeTools: Tool[] = [
  {
    type: "function",
    name: "search_sake",
    description: "Search the Tippsy sake catalog by various criteria including name, grade, style, region, and price range",
    parameters: {
      type: "object",
      properties: {
        query: { 
          type: "string", 
          description: "Search terms (sake name, brewery, etc.)" 
        },
        grade: { 
          type: "string", 
          enum: ["junmai", "junmai-ginjo", "junmai-daiginjo", "ginjo", "daiginjo", "honjozo", "futsushu"],
          description: "Sake grade/classification" 
        },
        style: {
          type: "string",
          enum: ["light-dry", "light-sweet", "rich-dry", "rich-sweet"],
          description: "Taste profile quadrant"
        },
        brewingMethod: {
          type: "string",
          enum: ["sokujo", "kimoto", "yamahai"],
          description: "Traditional brewing method"
        },
        region: { 
          type: "string", 
          description: "Japanese prefecture (e.g., Niigata, Hiroshima)" 
        },
        priceRange: {
          type: "object",
          properties: {
            min: { type: "number", description: "Minimum price USD" },
            max: { type: "number", description: "Maximum price USD" }
          }
        },
        servingTemp: {
          type: "string",
          enum: ["cold", "room", "warm", "hot"],
          description: "Preferred serving temperature"
        },
        limit: {
          type: "number",
          description: "Maximum results to return",
          default: 5
        }
      },
      required: ["query"]
    },
    handler: searchSakes
  },
  
  {
    type: "function",
    name: "get_sake_details",
    description: "Get detailed information about a specific sake including tasting notes, food pairings, temperature recommendations, and brewery history",
    parameters: {
      type: "object",
      properties: {
        sakeId: { 
          type: "string", 
          description: "The unique identifier for the sake" 
        }
      },
      required: ["sakeId"]
    },
    handler: getSakeDetails
  },
  
  {
    type: "function",
    name: "add_to_cart",
    description: "Add a sake to the user's Tippsy shopping cart",
    parameters: {
      type: "object",
      properties: {
        sakeId: { 
          type: "string", 
          description: "The sake to add" 
        },
        quantity: { 
          type: "number", 
          default: 1,
          description: "Number of bottles" 
        }
      },
      required: ["sakeId"]
    },
    handler: addToCart
  },
  
  {
    type: "function",
    name: "get_temperature_guide",
    description: "Get serving temperature recommendations for a sake, optionally considering season, food pairing, or mood",
    parameters: {
      type: "object",
      properties: {
        sakeId: { 
          type: "string",
          description: "The sake to get temperature guide for"
        },
        context: {
          type: "object",
          properties: {
            season: { 
              type: "string", 
              enum: ["spring", "summer", "fall", "winter"] 
            },
            food: { 
              type: "string",
              description: "The dish being paired"
            },
            mood: { 
              type: "string",
              enum: ["refreshing", "warming", "contemplative", "celebratory"]
            }
          }
        }
      },
      required: ["sakeId"]
    },
    handler: getTemperatureGuide
  },
  
  {
    type: "function",
    name: "get_food_pairing",
    description: "Get sake recommendations for a specific dish or cuisine type",
    parameters: {
      type: "object",
      properties: {
        dish: { 
          type: "string", 
          description: "The food or dish to pair with sake" 
        },
        cuisine: { 
          type: "string",
          description: "Cuisine type (Japanese, Italian, Mexican, etc.)"
        },
        flavorProfile: {
          type: "object",
          properties: {
            protein: { type: "string" },
            preparation: { type: "string" },
            dominant: { type: "array", items: { type: "string" } },
            spiceLevel: { type: "string", enum: ["mild", "medium", "spicy", "very-spicy"] }
          }
        },
        budget: { 
          type: "number",
          description: "Maximum price per bottle"
        }
      },
      required: ["dish"]
    },
    handler: getFoodPairing
  },
  
  {
    type: "function",
    name: "get_region_info",
    description: "Get information about a sake-producing region including style characteristics, famous breweries, and water sources",
    parameters: {
      type: "object",
      properties: {
        region: { 
          type: "string",
          description: "Prefecture or region name (e.g., Niigata, Hiroshima, Nada)"
        },
        includeBreweries: { 
          type: "boolean", 
          default: true,
          description: "Include list of notable breweries"
        },
        includeRecommendations: {
          type: "boolean",
          default: true,
          description: "Include sake recommendations from the region"
        }
      },
      required: ["region"]
    },
    handler: getRegionInfo
  },
  
  {
    type: "function",
    name: "log_tasting",
    description: "Record the user's tasting notes for a sake, including aroma, taste, finish, and overall rating",
    parameters: {
      type: "object",
      properties: {
        sakeId: { 
          type: "string",
          description: "The sake being tasted"
        },
        temperature: {
          type: "string",
          enum: ["yukibie", "hanabie", "suzubie", "jo-on", "hitohada-kan", "nuru-kan", "atsu-kan"],
          description: "Serving temperature used"
        },
        aromaNotes: { 
          type: "array", 
          items: { type: "string" },
          description: "Aromas detected"
        },
        tasteNotes: { 
          type: "array", 
          items: { type: "string" },
          description: "Flavors experienced"
        },
        finishNotes: {
          type: "array",
          items: { type: "string" },
          description: "Finish characteristics"
        },
        rating: { 
          type: "number", 
          minimum: 1, 
          maximum: 5,
          description: "Overall rating 1-5"
        },
        notes: { 
          type: "string",
          description: "Free-form tasting notes"
        }
      },
      required: ["sakeId", "rating"]
    },
    handler: logTasting
  }
];

// Tool call handler
export async function handleToolCall(toolCall: {
  name: string;
  arguments: Record<string, unknown>;
}) {
  const tool = sakeTools.find(t => t.name === toolCall.name);
  
  if (!tool) {
    return { error: `Unknown tool: ${toolCall.name}` };
  }
  
  try {
    const result = await tool.handler(toolCall.arguments);
    return result;
  } catch (error) {
    console.error(`Tool ${toolCall.name} failed:`, error);
    return { error: `Failed to execute ${toolCall.name}` };
  }
}
```

## Voice UI Component

```typescript
// src/components/voice/VoiceSommelier.tsx

'use client';

import { useYukiVoice } from '@/lib/openai/realtime';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Volume2, 
  X,
  MessageSquare
} from 'lucide-react';

export function VoiceSommelier() {
  const { 
    connect, 
    disconnect, 
    toggleListening,
    sendText,
    isConnected, 
    isListening,
    isSpeaking,
    transcript,
    error
  } = useYukiVoice();
  
  const [showTranscript, setShowTranscript] = useState(false);
  const [textInput, setTextInput] = useState('');
  
  return (
    <>
      {/* Floating Voice Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        
        {/* Connection Status */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 
                       border border-green-500/30 rounded-full"
          >
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-400 text-sm">Yuki is ready</span>
          </motion.div>
        )}
        
        {/* Speaking Indicator */}
        {isSpeaking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 
                       border border-amber-500/30 rounded-full"
          >
            <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-amber-400 text-sm">Yuki is speaking...</span>
          </motion.div>
        )}

        {/* Main Button */}
        <motion.button
          onClick={isConnected ? toggleListening : connect}
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center",
            "shadow-2xl transition-all duration-300",
            "ring-4 ring-offset-2 ring-offset-gray-900",
            isConnected 
              ? isListening 
                ? "bg-red-500 ring-red-500/50 animate-pulse" 
                : "bg-green-500 ring-green-500/50 hover:bg-green-400"
              : "bg-amber-500 ring-amber-500/50 hover:bg-amber-400"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isConnected ? (
            isListening ? (
              <Mic className="w-7 h-7 text-white" />
            ) : (
              <MicOff className="w-7 h-7 text-white" />
            )
          ) : (
            <Phone className="w-7 h-7 text-white" />
          )}
        </motion.button>

        {/* Secondary Actions */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-2"
          >
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20
                         flex items-center justify-center transition-colors"
            >
              <MessageSquare className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={disconnect}
              className="w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/30
                         flex items-center justify-center transition-colors"
            >
              <PhoneOff className="w-5 h-5 text-red-400" />
            </button>
          </motion.div>
        )}

        {/* Hint Text */}
        {!isConnected && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white/50 text-sm"
          >
            Tap to talk with Yuki
          </motion.p>
        )}
      </div>

      {/* Transcript Panel */}
      <AnimatePresence>
        {showTranscript && isConnected && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            className="fixed bottom-28 right-6 w-96 max-h-[60vh] z-40
                       bg-gray-900/95 backdrop-blur-xl rounded-2xl 
                       border border-white/10 shadow-2xl overflow-hidden
                       flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br 
                            from-amber-400 to-orange-500 flex items-center 
                            justify-center text-lg">
                🍶
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium">Yuki</h3>
                <p className="text-white/50 text-sm">Sake Sommelier</p>
              </div>
              <button 
                onClick={() => setShowTranscript(false)}
                className="text-white/50 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {transcript.length === 0 ? (
                <p className="text-white/30 text-center py-8">
                  Start talking to see the conversation here
                </p>
              ) : (
                transcript.map((message, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "max-w-[85%]",
                      message.role === 'user' ? "ml-auto" : "mr-auto"
                    )}
                  >
                    <div className={cn(
                      "rounded-2xl px-4 py-2.5",
                      message.role === 'user' 
                        ? "bg-amber-500/20 text-white rounded-tr-sm"
                        : "bg-white/10 text-white/90 rounded-tl-sm"
                    )}>
                      {message.content}
                    </div>
                    <p className={cn(
                      "text-white/30 text-xs mt-1",
                      message.role === 'user' ? "text-right" : "text-left"
                    )}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </motion.div>
                ))
              )}
            </div>

            {/* Text Input (Accessibility) */}
            <div className="p-3 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && textInput.trim()) {
                      sendText(textInput);
                      setTextInput('');
                    }
                  }}
                  placeholder="Or type a message..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg
                             px-3 py-2 text-white text-sm placeholder:text-white/30
                             focus:outline-none focus:border-amber-500/50"
                />
                <button
                  onClick={() => {
                    if (textInput.trim()) {
                      sendText(textInput);
                      setTextInput('');
                    }
                  }}
                  className="px-4 py-2 bg-amber-500 text-black text-sm font-medium
                             rounded-lg hover:bg-amber-400 transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Waveform Visualization */}
      <AnimatePresence>
        {isConnected && isListening && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-28 right-6 z-40"
          >
            <VoiceWaveform />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-28 right-6 z-40 px-4 py-2 bg-red-500/20 
                     border border-red-500/30 rounded-lg text-red-400 text-sm"
        >
          {error.message}
        </motion.div>
      )}
    </>
  );
}

// Voice waveform visualization
function VoiceWaveform() {
  return (
    <div className="flex items-center gap-1 px-4 py-2 bg-gray-900/90 
                    backdrop-blur-sm rounded-full border border-white/10">
      {[...Array(7)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-amber-500 rounded-full"
          animate={{
            height: [8, 24, 8],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.08,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}
```

---

# 5. THESYS C1 DYNAMIC UI

## Overview

Thesys C1 is a Generative UI API that turns LLM responses into live, interactive UI components. Instead of returning plain text, C1 outputs structured UI (cards, charts, forms, tables) rendered via React SDK.

## Why Thesys C1 Over CopilotKit

| Factor | Thesys C1 | CopilotKit |
|--------|-----------|------------|
| Focus | Generative UI from LLM responses | Full copilot framework |
| Integration | 2 lines - just change model name | Provider + hooks + state setup |
| Output | Dynamic cards, charts, forms | Chat interface + actions |
| Complexity | Simple drop-in replacement | More infrastructure needed |
| Best For | Rich visual responses in chat | Full copilot sidebar |

## Thesys C1 Integration

```typescript
// src/lib/thesys/client.ts

import OpenAI from 'openai';

// Thesys C1 uses OpenAI-compatible API
export const thesysClient = new OpenAI({
  apiKey: process.env.THESYS_API_KEY!,
  baseURL: 'https://api.thesys.dev/v1'
});

// Model options
export const C1_MODELS = {
  nightly: 'c1-nightly',     // Latest features
  stable: 'c1-stable',       // Production ready
  fast: 'c1-fast'            // Lower latency
} as const;
```

## Sake UI System Prompt

```typescript
// .kiro/prompts/sake-ui-system.md

export const SAKE_UI_SYSTEM_PROMPT = `
You are a sake recommendation UI generator for Sakéverse. Generate beautiful, 
interactive UI components instead of plain text responses.

## COMPONENT PALETTE

### Layout Components
- Card: Container with optional header, footer, image
- Grid: Multi-column layouts
- Stack: Vertical/horizontal stacking
- Accordion: Expandable sections
- Tabs: Tabbed content
- Carousel: Swipeable cards

### Data Display
- Table: Structured data comparison
- Chart: Bar, line, radar, pie charts
- Badge: Labels, tags, status indicators
- Progress: Progress bars, rings
- Avatar: Images with fallback
- Stat: Key metrics with labels

### Interactive
- Button: Primary, secondary, outline variants
- Slider: Range selection
- Form: Input groups
- Select: Dropdown menus
- Toggle: On/off switches
- Rating: Star ratings

### Feedback
- Alert: Info, success, warning, error
- Toast: Temporary notifications
- Tooltip: Hover information

## SAKE-SPECIFIC UI PATTERNS

### 1. SAKE RECOMMENDATION CARD
Generate this when recommending a specific sake:

\`\`\`
Card
├── Image (sake bottle hero shot)
├── Header
│   ├── Name (English)
│   ├── Name (Japanese) - smaller, lighter
│   └── Brewery name
├── Badges Row
│   ├── Grade (Junmai Daiginjo, etc.)
│   ├── Region (Niigata, etc.)
│   └── Style (Light & Dry, etc.)
├── Stats Row
│   ├── SMV: +5
│   ├── Acidity: 1.3
│   └── Polish: 50%
├── Temperature Icons
│   └── Recommended serving temps with icons
├── Price
├── Description (2-3 sentences max)
└── Actions
    ├── "Add to Cart" button (primary)
    └── "Learn More" button (secondary)
\`\`\`

### 2. FOOD PAIRING RESPONSE
Generate this when asked about food pairings:

\`\`\`
Stack
├── Dish Analysis Card
│   ├── Dish name
│   ├── Flavor wheel/radar (sweet, sour, salty, umami, spicy)
│   ├── Key characteristics (protein, fat content, preparation)
│   └── Pairing strategy explanation
├── Recommendations Grid (2-3 sakes)
│   └── SakeCard (compact version)
│       ├── Image
│       ├── Name
│       ├── Why it works (1 sentence)
│       ├── Temperature recommendation
│       └── Price + Add to Cart
└── Accordion: "Pairing Principles"
    └── Educational content about why these work
\`\`\`

### 3. TEMPERATURE GUIDE
Generate this for temperature recommendations:

\`\`\`
Card
├── Sake Name + Image (small)
├── Visual Thermometer
│   ├── Scale from 5°C to 55°C
│   ├── Optimal zone (green highlight)
│   ├── Acceptable zones (yellow)
│   └── Avoid zones (red)
├── Temperature Points (interactive)
│   └── Each point shows Japanese name, temp, effect
├── Current Selection Details
│   ├── Temperature name (Japanese + English)
│   ├── Effect on this sake
│   └── Best food pairings at this temp
└── Pro Tip Alert
    └── "Try this sake at multiple temps to discover how it transforms"
\`\`\`

### 4. REGION EXPLORER
Generate this for region information:

\`\`\`
Card
├── Region Header
│   ├── Name (English + Japanese)
│   ├── Map snippet (stylized)
│   └── Style badge
├── Stats Grid
│   ├── Breweries: 89
│   ├── Style: Light & Dry
│   └── Famous for: Snow melt water
├── Description (2-3 sentences)
├── Water Profile
│   └── Key characteristic that defines the style
├── Top Breweries Carousel
│   └── Brewery cards (3-5)
├── Recommended Sakes Grid
│   └── Sake cards (3)
└── CTA Button: "Explore Region"
\`\`\`

### 5. COMPARISON TABLE
Generate this when comparing sakes:

\`\`\`
Table
├── Header Row: [Attribute, Sake 1, Sake 2, Sake 3]
├── Image Row
├── Price Row
├── Grade Row
├── Region Row
├── SMV Row (with visual bar)
├── Acidity Row
├── Polish % Row
├── Temperature Row (icons)
├── Taste Profile Row (mini radars)
└── Add to Cart Row (buttons)
\`\`\`

### 6. WINE BRIDGE TRANSLATION
Generate this for wine-to-sake translation:

\`\`\`
Card
├── Header: "Your Wine → Sake Translation"
├── Wine Profile Card
│   ├── Wine type mentioned
│   ├── Key characteristics identified
│   └── What you love about it
├── Arrow/Bridge visual
├── Sake Style Card
│   ├── Recommended sake category
│   ├── Why it matches
│   └── Key similarities
├── Top 3 Recommendations
│   └── Sake cards
└── Educational Note
    └── "Your $40 wine budget gets exceptional sake..."
\`\`\`

### 7. QUIZ/LEARNING COMPONENT
Generate this for educational content:

\`\`\`
Card
├── Question
├── Options (buttons or radio)
├── Submit button
├── Result (after submission)
│   ├── Correct/Incorrect indicator
│   ├── Explanation
│   └── Related sake recommendation
└── Progress indicator
\`\`\`

## STYLING GUIDELINES

### Colors
- Background: gray-900, gray-950
- Surface: gray-800, white/5, white/10
- Primary: amber-500 (#F59E0B)
- Secondary: amber-700
- Text: white, white/90, white/70, white/50
- Success: green-500
- Warning: amber-500
- Error: red-500

### Region Colors (for badges/maps)
- Niigata: #4FC3F7 (light blue - clean/crisp)
- Hiroshima: #FF8A65 (warm orange - soft/rich)
- Hyogo/Nada: #7E57C2 (purple - bold/structured)
- Yamagata: #EC407A (pink - fruity/aromatic)
- Fushimi/Kyoto: #26A69A (teal - delicate/refined)

### Typography
- Headings: Bold, tracking-tight
- Japanese text: Noto Sans JP, lighter weight
- Body: Inter or system font
- Prices: Tabular numbers

### Spacing
- Card padding: 16-24px
- Element gaps: 8-16px
- Section gaps: 24-32px

## RULES

1. ALWAYS prefer UI components over plain text
2. Keep text concise - use visuals to convey information
3. Include actionable elements (buttons, links)
4. Use Japanese terms with English translations
5. Temperature recommendations should ALWAYS be included
6. Prices should be clearly visible
7. "Add to Cart" should be prominent
8. Make comparisons visual, not textual
9. Use icons for temperature, taste profiles
10. Responsive design - works on mobile

## DO NOT

- Return walls of text
- Omit prices
- Forget temperature recommendations  
- Use generic stock images
- Make buttons without clear actions
- Create cluttered layouts
- Ignore the user's context/preferences
`;
```

## C1 Chat Component

```typescript
// src/components/chat/SakeChat.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { C1Component } from '@thesys/react-sdk';
import { thesysClient, C1_MODELS } from '@/lib/thesys/client';
import { SAKE_UI_SYSTEM_PROMPT } from '@/lib/thesys/prompts';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string | object;  // object for C1 UI spec
  isC1?: boolean;
  timestamp: Date;
}

export function SakeChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Welcome to Sakéverse! I\'m here to help you discover amazing sake. Ask me anything about sake recommendations, food pairings, regions, or temperatures.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Build conversation history for context
      const conversationHistory = messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
      }));
      
      // Call Thesys C1 API
      const response = await thesysClient.chat.completions.create({
        model: C1_MODELS.nightly,
        messages: [
          { role: 'system', content: SAKE_UI_SYSTEM_PROMPT },
          ...conversationHistory,
          { role: 'user', content: input }
        ],
        stream: false  // Can be true for streaming
      });
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.choices[0].message.content,
        isC1: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      // Add error message
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle actions from C1-generated UI
  const handleC1Action = async (action: { type: string; payload: any }) => {
    console.log('C1 Action:', action);
    
    switch (action.type) {
      case 'add_to_cart':
        // Add sake to cart via API
        await fetch('/api/cart/add', {
          method: 'POST',
          body: JSON.stringify({
            sakeId: action.payload.sakeId,
            quantity: action.payload.quantity || 1
          })
        });
        // Show success toast
        break;
        
      case 'explore_region':
        // Navigate to region page
        window.location.href = `/regions/${action.payload.regionId}`;
        break;
        
      case 'learn_more':
        // Expand sake details or navigate
        window.location.href = `/sake/${action.payload.sakeId}`;
        break;
        
      case 'set_temperature':
        // Could update user preferences
        break;
        
      case 'submit_quiz':
        // Handle quiz submission
        break;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 space-y-6">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={message.role === 'user' ? 'flex justify-end' : ''}
            >
              {message.role === 'user' ? (
                <div className="max-w-[80%] bg-amber-500/20 text-white 
                              rounded-2xl rounded-tr-sm px-4 py-3">
                  {message.content as string}
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Assistant indicator */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br 
                                  from-amber-400 to-orange-500 flex items-center 
                                  justify-center text-xs">
                      🍶
                    </div>
                    <span className="text-white/50 text-sm">Yuki</span>
                  </div>
                  
                  {/* Message content */}
                  <div className="ml-8">
                    {message.isC1 ? (
                      // Render C1 dynamic UI
                      <C1Component 
                        response={message.content}
                        theme="dark"
                        className="sake-c1-ui"
                        onAction={handleC1Action}
                        customComponents={sakeCustomComponents}
                      />
                    ) : (
                      // Render plain text
                      <div className="text-white/90">
                        {message.content as string}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 text-white/50"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br 
                            from-amber-400 to-orange-500 flex items-center 
                            justify-center text-xs">
                🍶
              </div>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Yuki is thinking...</span>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-white/10 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto p-4">
          {/* Quick Prompts */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt.id}
                onClick={() => setInput(prompt.text)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 
                          bg-white/5 hover:bg-white/10 rounded-full text-white/70 
                          text-sm transition-colors"
              >
                <span>{prompt.icon}</span>
                <span>{prompt.label}</span>
              </button>
            ))}
          </div>
          
          {/* Input */}
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask about sake, food pairings, regions..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3
                        text-white placeholder:text-white/30 focus:outline-none
                        focus:border-amber-500/50 transition-colors"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="px-5 py-3 bg-amber-500 text-black font-medium rounded-xl
                        hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed
                        transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Ask</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick prompts for common questions
const QUICK_PROMPTS = [
  { id: 1, icon: '🍣', label: 'Pair with sushi', text: 'What sake pairs well with sushi?' },
  { id: 2, icon: '🍷', label: 'Wine lover', text: 'I usually drink Pinot Noir. What sake would I enjoy?' },
  { id: 3, icon: '🗾', label: 'Explore Niigata', text: 'Tell me about Niigata sake style and recommend some bottles' },
  { id: 4, icon: '🌡️', label: 'Warm sake', text: 'What sake is best served warm and why?' },
  { id: 5, icon: '🎁', label: 'Gift ideas', text: 'Recommend a premium sake gift under $100' },
  { id: 6, icon: '🆚', label: 'Compare', text: 'Compare Dassai 23 vs Dassai 45' }
];

// Custom sake-specific components for C1
const sakeCustomComponents = {
  TemperatureBadge: ({ temperature }: { temperature: string }) => (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 
                    bg-gradient-to-r from-blue-500/20 to-red-500/20 
                    rounded-full text-sm">
      {TEMP_ICONS[temperature]} {temperature}
    </span>
  ),
  
  GradeBadge: ({ grade }: { grade: string }) => (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${GRADE_STYLES[grade]}`}>
      {grade}
    </span>
  ),
  
  RegionBadge: ({ region }: { region: string }) => (
    <span 
      className="px-2 py-0.5 rounded text-xs font-medium"
      style={{ backgroundColor: `${REGION_COLORS[region]}20`, color: REGION_COLORS[region] }}
    >
      {region}
    </span>
  )
};

const TEMP_ICONS: Record<string, string> = {
  'yukibie': '❄️',
  'hanabie': '🌸',
  'suzubie': '🌿',
  'jo-on': '🏠',
  'hitohada-kan': '🤲',
  'nuru-kan': '♨️',
  'atsu-kan': '🔥'
};

const GRADE_STYLES: Record<string, string> = {
  'Junmai Daiginjo': 'bg-purple-500/20 text-purple-400',
  'Daiginjo': 'bg-blue-500/20 text-blue-400',
  'Junmai Ginjo': 'bg-pink-500/20 text-pink-400',
  'Ginjo': 'bg-cyan-500/20 text-cyan-400',
  'Junmai': 'bg-amber-500/20 text-amber-400',
  'Honjozo': 'bg-green-500/20 text-green-400'
};

const REGION_COLORS: Record<string, string> = {
  'Niigata': '#4FC3F7',
  'Hiroshima': '#FF8A65',
  'Hyogo': '#7E57C2',
  'Yamagata': '#EC407A',
  'Kyoto': '#26A69A'
};
```

## C1 Theme Configuration

```typescript
// src/lib/thesys/theme.ts

export const sakeC1Theme = {
  // Color palette
  colors: {
    primary: '#F59E0B',      // Amber-500
    primaryHover: '#D97706', // Amber-600
    secondary: '#78350F',    // Amber-900
    
    background: '#030712',   // Gray-950
    surface: '#111827',      // Gray-900
    surfaceHover: '#1F2937', // Gray-800
    
    border: 'rgba(255, 255, 255, 0.1)',
    borderHover: 'rgba(255, 255, 255, 0.2)',
    
    text: '#F9FAFB',         // Gray-50
    textSecondary: '#D1D5DB', // Gray-300
    textMuted: '#6B7280',    // Gray-500
    
    success: '#10B981',      // Emerald-500
    warning: '#F59E0B',      // Amber-500
    error: '#EF4444',        // Red-500
    info: '#3B82F6',         // Blue-500
  },
  
  // Component-specific styles
  components: {
    card: {
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
      padding: '20px',
    },
    
    button: {
      primary: {
        background: '#F59E0B',
        color: '#000000',
        borderRadius: '12px',
        fontWeight: 600,
        padding: '12px 24px',
      },
      secondary: {
        background: 'rgba(255, 255, 255, 0.1)',
        color: '#FFFFFF',
        borderRadius: '12px',
        fontWeight: 500,
        padding: '12px 24px',
      },
      outline: {
        background: 'transparent',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: '#FFFFFF',
        borderRadius: '12px',
        fontWeight: 500,
        padding: '12px 24px',
      }
    },
    
    badge: {
      borderRadius: '9999px',
      padding: '4px 12px',
      fontSize: '12px',
      fontWeight: 500,
    },
    
    input: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      color: '#FFFFFF',
      padding: '12px 16px',
    },
    
    table: {
      headerBackground: 'rgba(255, 255, 255, 0.05)',
      rowHover: 'rgba(255, 255, 255, 0.03)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    
    chart: {
      colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'],
      gridColor: 'rgba(255, 255, 255, 0.1)',
      textColor: '#9CA3AF',
    }
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, sans-serif',
      japanese: '"Noto Sans JP", sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    
    heading: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    
    body: {
      fontWeight: 400,
      lineHeight: 1.6,
    }
  },
  
  // Spacing scale
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
  
  // Border radius scale
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
  }
};
```

---

# 6. MAPBOX SAKE REGIONS

## Japan Sake Regions Data

```typescript
// src/data/regions.ts

export interface SakeRegion {
  id: string;
  name: string;
  nameJa: string;
  coordinates: [number, number]; // [lng, lat]
  
  // Sake style
  style: 'light-dry' | 'light-sweet' | 'rich-dry' | 'rich-sweet';
  styleDescription: string;
  
  // Characteristics
  waterSource: string;
  waterProfile: 'soft' | 'medium' | 'hard';
  climate: string;
  famousRice: string[];
  
  // Stats
  breweryCount: number;
  annualProduction: number; // koku
  
  // Breweries
  topBreweries: {
    id: string;
    name: string;
    nameJa: string;
    founded: number;
    coordinates: [number, number];
    flagshipSake: string;
  }[];
  
  // Display
  color: string;
  unlockRequirement: number; // sakes to taste to unlock
}

export const SAKE_REGIONS: Record<string, SakeRegion> = {
  niigata: {
    id: 'niigata',
    name: 'Niigata',
    nameJa: '新潟',
    coordinates: [139.0364, 37.9161],
    
    style: 'light-dry',
    styleDescription: 'Tanrei Karakuchi (淡麗辛口) - Light, clean, crisp. The snow country style.',
    
    waterSource: 'Snow melt from Japanese Alps',
    waterProfile: 'soft',
    climate: 'Heavy snowfall, cold fermentation temperatures',
    famousRice: ['Gohyakumangoku', 'Koshi Tanrei'],
    
    breweryCount: 89,
    annualProduction: 36000,
    
    topBreweries: [
      {
        id: 'asahi-shuzo-niigata',
        name: 'Asahi Shuzo (Kubota)',
        nameJa: '朝日酒造',
        founded: 1830,
        coordinates: [138.9647, 37.4505],
        flagshipSake: 'Kubota Manju'
      },
      {
        id: 'hakkaisan',
        name: 'Hakkaisan Brewery',
        nameJa: '八海山',
        founded: 1922,
        coordinates: [138.9167, 37.0667],
        flagshipSake: 'Hakkaisan Junmai Daiginjo'
      },
      {
        id: 'ishimoto',
        name: 'Ishimoto Shuzo (Koshi no Kanbai)',
        nameJa: '石本酒造',
        founded: 1907,
        coordinates: [139.1333, 37.8167],
        flagshipSake: 'Koshi no Kanbai'
      }
    ],
    
    color: '#4FC3F7',
    unlockRequirement: 3
  },
  
  hiroshima: {
    id: 'hiroshima',
    name: 'Hiroshima',
    nameJa: '広島',
    coordinates: [132.4596, 34.3853],
    
    style: 'rich-sweet',
    styleDescription: 'Soft water pioneer. Rich, rounded, umami-forward sakes.',
    
    waterSource: 'Extremely soft mountain water',
    waterProfile: 'soft',
    climate: 'Mild, influenced by Seto Inland Sea',
    famousRice: ['Hattan Nishiki', 'Senbon Nishiki'],
    
    breweryCount: 47,
    annualProduction: 18000,
    
    topBreweries: [
      {
        id: 'kamotsuru',
        name: 'Kamotsuru Shuzo',
        nameJa: '賀茂鶴酒造',
        founded: 1873,
        coordinates: [132.7167, 34.4167],
        flagshipSake: 'Kamotsuru Daiginjo'
      },
      {
        id: 'suishin',
        name: 'Suishin Shuzo',
        nameJa: '酔心山根本店',
        founded: 1860,
        coordinates: [133.0833, 34.4000],
        flagshipSake: 'Suishin'
      }
    ],
    
    color: '#FF8A65',
    unlockRequirement: 3
  },
  
  hyogo: {
    id: 'hyogo',
    name: 'Hyogo (Nada)',
    nameJa: '兵庫',
    coordinates: [135.1955, 34.6901],
    
    style: 'rich-dry',
    styleDescription: 'Birthplace of Yamada Nishiki. Bold, structured, masculine sakes.',
    
    waterSource: 'Miyamizu - mineral-rich hard water',
    waterProfile: 'hard',
    climate: 'Rokko mountain winds (Rokko oroshi)',
    famousRice: ['Yamada Nishiki'],
    
    breweryCount: 70,
    annualProduction: 130000,
    
    topBreweries: [
      {
        id: 'hakutsuru',
        name: 'Hakutsuru Sake Brewing',
        nameJa: '白鶴酒造',
        founded: 1743,
        coordinates: [135.2500, 34.7167],
        flagshipSake: 'Hakutsuru'
      },
      {
        id: 'kiku-masamune',
        name: 'Kiku-Masamune',
        nameJa: '菊正宗酒造',
        founded: 1659,
        coordinates: [135.2667, 34.7000],
        flagshipSake: 'Kiku-Masamune Kimoto'
      },
      {
        id: 'ozeki',
        name: 'Ozeki Corporation',
        nameJa: '大関',
        founded: 1711,
        coordinates: [135.3333, 34.7333],
        flagshipSake: 'Ozeki One Cup'
      }
    ],
    
    color: '#7E57C2',
    unlockRequirement: 3
  },
  
  yamagata: {
    id: 'yamagata',
    name: 'Yamagata',
    nameJa: '山形',
    coordinates: [140.3399, 38.2404],
    
    style: 'light-sweet',
    styleDescription: 'Modern ginjo revolution. Aromatic, fruity, elegant sakes.',
    
    waterSource: 'Soft mountain streams',
    waterProfile: 'soft',
    climate: 'Basin climate - hot summers, cold winters',
    famousRice: ['Dewasansan', 'Miyama Nishiki'],
    
    breweryCount: 52,
    annualProduction: 12000,
    
    topBreweries: [
      {
        id: 'dewazakura',
        name: 'Dewazakura Shuzo',
        nameJa: '出羽桜酒造',
        founded: 1892,
        coordinates: [140.2833, 38.2333],
        flagshipSake: 'Dewazakura Oka'
      },
      {
        id: 'takagi',
        name: 'Takagi Shuzo (Juyondai)',
        nameJa: '高木酒造',
        founded: 1615,
        coordinates: [140.1167, 38.4167],
        flagshipSake: 'Juyondai'
      },
      {
        id: 'tatenokawa',
        name: 'Tatenokawa Shuzo',
        nameJa: '楯の川酒造',
        founded: 1832,
        coordinates: [139.9167, 38.9333],
        flagshipSake: 'Tatenokawa'
      }
    ],
    
    color: '#EC407A',
    unlockRequirement: 3
  },
  
  kyoto: {
    id: 'kyoto',
    name: 'Fushimi (Kyoto)',
    nameJa: '伏見',
    coordinates: [135.7681, 34.9358],
    
    style: 'light-sweet',
    styleDescription: 'Onna-zake (女酒) - feminine sake. Soft, delicate, refined.',
    
    waterSource: 'Gokousui (御香水) - blessed water',
    waterProfile: 'medium',
    climate: 'Imperial city microclimate',
    famousRice: ['Iwai', 'Gohyakumangoku'],
    
    breweryCount: 22,
    annualProduction: 42000,
    
    topBreweries: [
      {
        id: 'gekkeikan',
        name: 'Gekkeikan',
        nameJa: '月桂冠',
        founded: 1637,
        coordinates: [135.7667, 34.9333],
        flagshipSake: 'Gekkeikan'
      },
      {
        id: 'kizakura',
        name: 'Kizakura',
        nameJa: '黄桜',
        founded: 1925,
        coordinates: [135.7500, 34.9167],
        flagshipSake: 'Kizakura Junmai'
      }
    ],
    
    color: '#26A69A',
    unlockRequirement: 3
  }
};
```

## Mapbox Map Component

```typescript
// src/components/map/SakeMap.tsx

'use client';

import { useState, useCallback, useEffect } from 'react';
import Map, { 
  Source, 
  Layer, 
  Marker, 
  Popup,
  NavigationControl,
  GeolocateControl
} from 'react-map-gl';
import { motion, AnimatePresence } from 'framer-motion';
import { SAKE_REGIONS, SakeRegion } from '@/data/regions';
import { useUserProgress } from '@/hooks/useUserProgress';
import { RegionDetailPanel } from './RegionDetailPanel';
import { BreweryMarker } from './BreweryMarker';
import { MapLegend } from './MapLegend';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

// Japan bounds
const JAPAN_BOUNDS: [[number, number], [number, number]] = [
  [122.0, 24.0],  // Southwest
  [154.0, 46.0]   // Northeast
];

export function SakeMap() {
  const { progress, isLoading } = useUserProgress();
  
  const [viewState, setViewState] = useState({
    longitude: 138.2529,
    latitude: 36.2048,
    zoom: 5,
    pitch: 45,
    bearing: -10
  });
  
  const [selectedRegion, setSelectedRegion] = useState<SakeRegion | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [showBreweries, setShowBreweries] = useState(false);

  // Region click handler
  const handleRegionClick = useCallback((event: any) => {
    const feature = event.features?.[0];
    if (feature) {
      const regionId = feature.properties.id;
      const region = SAKE_REGIONS[regionId];
      
      if (region) {
        setSelectedRegion(region);
        setShowBreweries(true);
        
        // Fly to region
        setViewState(prev => ({
          ...prev,
          longitude: region.coordinates[0],
          latitude: region.coordinates[1],
          zoom: 8,
          pitch: 60
        }));
      }
    }
  }, []);

  // Check if region is unlocked
  const isRegionUnlocked = (regionId: string) => {
    return progress?.unlockedRegions?.includes(regionId) ?? false;
  };

  // Get region mastery percentage
  const getRegionMastery = (regionId: string) => {
    return progress?.regionMastery?.[regionId] ?? 0;
  };

  // Build GeoJSON for regions
  const regionsGeoJSON = {
    type: 'FeatureCollection' as const,
    features: Object.values(SAKE_REGIONS).map(region => ({
      type: 'Feature' as const,
      properties: {
        id: region.id,
        name: region.name,
        nameJa: region.nameJa,
        style: region.style,
        color: region.color,
        unlocked: isRegionUnlocked(region.id),
        mastery: getRegionMastery(region.id)
      },
      geometry: {
        type: 'Point' as const,
        coordinates: region.coordinates
      }
    }))
  };

  return (
    <div className="relative w-full h-full min-h-[600px] bg-gray-950">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        maxBounds={JAPAN_BOUNDS}
        minZoom={4}
        maxZoom={12}
        interactiveLayerIds={['regions-circles']}
        onClick={handleRegionClick}
        onMouseMove={(event) => {
          const feature = event.features?.[0];
          setHoveredRegion(feature?.properties?.id ?? null);
        }}
        onMouseLeave={() => setHoveredRegion(null)}
        cursor={hoveredRegion ? 'pointer' : 'grab'}
      >
        {/* Navigation Controls */}
        <NavigationControl position="top-right" />
        
        {/* Region Markers */}
        <Source id="regions" type="geojson" data={regionsGeoJSON}>
          {/* Glow effect for unlocked regions */}
          <Layer
            id="regions-glow"
            type="circle"
            paint={{
              'circle-radius': [
                'interpolate', ['linear'], ['zoom'],
                4, 30,
                8, 60
              ],
              'circle-color': ['get', 'color'],
              'circle-opacity': [
                'case',
                ['get', 'unlocked'],
                0.3,
                0.1
              ],
              'circle-blur': 1
            }}
          />
          
          {/* Main circles */}
          <Layer
            id="regions-circles"
            type="circle"
            paint={{
              'circle-radius': [
                'interpolate', ['linear'], ['zoom'],
                4, 15,
                8, 30
              ],
              'circle-color': [
                'case',
                ['get', 'unlocked'],
                ['get', 'color'],
                '#374151'
              ],
              'circle-stroke-width': 2,
              'circle-stroke-color': [
                'case',
                ['==', ['get', 'id'], hoveredRegion ?? ''],
                '#FFFFFF',
                'rgba(255, 255, 255, 0.3)'
              ],
              'circle-opacity': [
                'case',
                ['==', ['get', 'id'], hoveredRegion ?? ''],
                1,
                0.8
              ]
            }}
          />
          
          {/* Region labels */}
          <Layer
            id="regions-labels"
            type="symbol"
            layout={{
              'text-field': ['get', 'name'],
              'text-size': [
                'interpolate', ['linear'], ['zoom'],
                4, 10,
                8, 14
              ],
              'text-anchor': 'top',
              'text-offset': [0, 2]
            }}
            paint={{
              'text-color': '#FFFFFF',
              'text-halo-color': '#000000',
              'text-halo-width': 1
            }}
          />
        </Source>

        {/* Brewery Markers (when region selected) */}
        {showBreweries && selectedRegion && (
          <>
            {selectedRegion.topBreweries.map(brewery => (
              <BreweryMarker
                key={brewery.id}
                brewery={brewery}
                visited={progress?.visitedBreweries?.includes(brewery.id)}
              />
            ))}
          </>
        )}
      </Map>

      {/* Region Detail Panel */}
      <AnimatePresence>
        {selectedRegion && (
          <RegionDetailPanel
            region={selectedRegion}
            mastery={getRegionMastery(selectedRegion.id)}
            isUnlocked={isRegionUnlocked(selectedRegion.id)}
            sakeTasted={progress?.regionSakesTasted?.[selectedRegion.id] ?? 0}
            onClose={() => {
              setSelectedRegion(null);
              setShowBreweries(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Map Legend */}
      <MapLegend />

      {/* Instructions */}
      {!selectedRegion && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 
                     bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full
                     text-white/70 text-sm"
        >
          Click a region to explore its sake style
        </motion.div>
      )}
    </div>
  );
}
```

---

# 7. TEMPERATURE SYSTEM

## Temperature Data

```typescript
// src/data/temperatures.ts

export type ServingTemperature = 
  | 'yukibie'      // 雪冷え - Snow cold (5°C)
  | 'hanabie'      // 花冷え - Flower cold (10°C)
  | 'suzubie'      // 涼冷え - Cool (15°C)
  | 'jo-on'        // 常温 - Room temperature (20°C)
  | 'hinata-kan'   // 日向燗 - Sunshine warm (30°C)
  | 'hitohada-kan' // 人肌燗 - Body temperature (35°C)
  | 'nuru-kan'     // ぬる燗 - Lukewarm (40°C)
  | 'jo-kan'       // 上燗 - Warm (45°C)
  | 'atsu-kan'     // 熱燗 - Hot (50°C)
  | 'tobikiri-kan'; // 飛切燗 - Extra hot (55°C+)

export interface TemperatureProfile {
  id: ServingTemperature;
  nameEn: string;
  nameJa: string;
  tempC: number;
  tempF: number;
  description: string;
  effect: string;
  bestFor: string[];
  avoid: string[];
  foodPairings: string[];
  icon: string;
  color: string;
}

export const TEMPERATURES: Record<ServingTemperature, TemperatureProfile> = {
  'yukibie': {
    id: 'yukibie',
    nameEn: 'Snow Cold',
    nameJa: '雪冷え',
    tempC: 5,
    tempF: 41,
    description: 'Crisp and sharp. Suppresses aromas, highlights clean finish.',
    effect: 'Minimizes sweetness, emphasizes acidity and dryness. Makes sake very refreshing.',
    bestFor: ['Daiginjo', 'Junmai Daiginjo', 'Nama (unpasteurized)', 'Sparkling sake'],
    avoid: ['Junmai', 'Yamahai', 'Kimoto', 'Aged/Koshu'],
    foodPairings: ['Oysters', 'Sashimi', 'Light appetizers', 'Summer dishes'],
    icon: '❄️',
    color: '#60A5FA'
  },
  
  'hanabie': {
    id: 'hanabie',
    nameEn: 'Flower Cold',
    nameJa: '花冷え',
    tempC: 10,
    tempF: 50,
    description: 'Delicate aromatics emerge. Balanced and refreshing.',
    effect: 'Opens up fruity/floral notes (ginjo-ka) while maintaining structure.',
    bestFor: ['Ginjo', 'Junmai Ginjo', 'Aromatic styles', 'Premium Daiginjo'],
    avoid: ['Full-bodied Junmai', 'Yamahai', 'Rustic styles'],
    foodPairings: ['White fish', 'Vegetable tempura', 'Salads', 'Light pasta'],
    icon: '🌸',
    color: '#F472B6'
  },
  
  'suzubie': {
    id: 'suzubie',
    nameEn: 'Cool',
    nameJa: '涼冷え',
    tempC: 15,
    tempF: 59,
    description: 'Sweet spot for many sakes. Balanced expression.',
    effect: 'Full aroma development, smooth texture. Most versatile temperature.',
    bestFor: ['Junmai Ginjo', 'Premium Junmai', 'Honjozo', 'Most styles'],
    avoid: ['Super aromatic Daiginjo (too warm)', 'Bold Yamahai (too cold)'],
    foodPairings: ['Grilled fish', 'Yakitori', 'Tofu dishes', 'Izakaya fare'],
    icon: '🌿',
    color: '#34D399'
  },
  
  'jo-on': {
    id: 'jo-on',
    nameEn: 'Room Temperature',
    nameJa: '常温',
    tempC: 20,
    tempF: 68,
    description: 'Natural expression. The "true" character of sake.',
    effect: 'Rice character prominent, umami forward. Shows sake as intended.',
    bestFor: ['Junmai', 'Kimoto', 'Yamahai', 'Aged sake (Koshu)'],
    avoid: ['Delicate Daiginjo', 'Nama', 'Sparkling'],
    foodPairings: ['Cheese', 'Cured meats', 'Mushrooms', 'Earthy dishes'],
    icon: '🏠',
    color: '#FBBF24'
  },
  
  'hinata-kan': {
    id: 'hinata-kan',
    nameEn: 'Sunshine Warm',
    nameJa: '日向燗',
    tempC: 30,
    tempF: 86,
    description: 'Gentle warmth begins to open the sake.',
    effect: 'Subtle softening of acidity, hints of warmth emerging.',
    bestFor: ['Junmai', 'Light Honjozo', 'Everyday sake'],
    avoid: ['Ginjo', 'Daiginjo', 'Nama'],
    foodPairings: ['Light appetizers', 'Edamame', 'Simple dishes'],
    icon: '🌤️',
    color: '#FB923C'
  },
  
  'hitohada-kan': {
    id: 'hitohada-kan',
    nameEn: 'Body Temperature',
    nameJa: '人肌燗',
    tempC: 35,
    tempF: 95,
    description: 'Gentle warmth releases hidden complexity.',
    effect: 'Softens acidity, enhances sweetness and umami. Very comforting.',
    bestFor: ['Junmai', 'Honjozo', 'Yamahai', 'Kimoto'],
    avoid: ['Aromatic Ginjo', 'Nama', 'Sparkling'],
    foodPairings: ['Oden', 'Nabe (hot pot)', 'Grilled meats', 'Comfort food'],
    icon: '🤲',
    color: '#F97316'
  },
  
  'nuru-kan': {
    id: 'nuru-kan',
    nameEn: 'Lukewarm',
    nameJa: 'ぬる燗',
    tempC: 40,
    tempF: 104,
    description: 'Classic warming. Reveals depth without harshness.',
    effect: 'Expands umami, rounds rough edges. Traditional serving style.',
    bestFor: ['Junmai', 'Tokubetsu Junmai', 'Yamahai', 'Kimoto'],
    avoid: ['Daiginjo', 'Nama', 'Fruity/aromatic styles'],
    foodPairings: ['Sukiyaki', 'Braised dishes', 'Rich stews', 'Grilled eel'],
    icon: '♨️',
    color: '#EA580C'
  },
  
  'jo-kan': {
    id: 'jo-kan',
    nameEn: 'Warm',
    nameJa: '上燗',
    tempC: 45,
    tempF: 113,
    description: 'Noticeably warm. Full body expression.',
    effect: 'Strong umami, pronounced warmth, shorter finish.',
    bestFor: ['Robust Junmai', 'Honjozo', 'Everyday sake'],
    avoid: ['Premium Ginjo', 'Delicate styles'],
    foodPairings: ['Grilled fatty fish', 'Heavy stews', 'Winter dishes'],
    icon: '🔥',
    color: '#DC2626'
  },
  
  'atsu-kan': {
    id: 'atsu-kan',
    nameEn: 'Hot',
    nameJa: '熱燗',
    tempC: 50,
    tempF: 122,
    description: 'Bold and warming. Traditional winter style.',
    effect: 'Intensifies flavor, quick finish. Very warming.',
    bestFor: ['Futsushu', 'Robust Junmai', 'Honjozo', 'Everyday sake'],
    avoid: ['Premium Ginjo/Daiginjo', 'Delicate styles', 'Nama'],
    foodPairings: ['Hot pot', 'Grilled fatty fish', 'Winter comfort food'],
    icon: '🔥',
    color: '#B91C1C'
  },
  
  'tobikiri-kan': {
    id: 'tobikiri-kan',
    nameEn: 'Extra Hot',
    nameJa: '飛切燗',
    tempC: 55,
    tempF: 131,
    description: 'Very hot. Intense, quick drinking style.',
    effect: 'Maximum warmth, most flavor intensity, shortest finish.',
    bestFor: ['Futsushu', 'Very robust sake'],
    avoid: ['Most premium sake', 'Anything delicate'],
    foodPairings: ['Rich winter dishes', 'Cold weather comfort'],
    icon: '🌋',
    color: '#7F1D1D'
  }
};

// Temperature zones for visual representation
export const TEMPERATURE_ZONES = {
  cold: ['yukibie', 'hanabie', 'suzubie'],
  room: ['jo-on'],
  warm: ['hinata-kan', 'hitohada-kan', 'nuru-kan', 'jo-kan', 'atsu-kan', 'tobikiri-kan']
};
```

## Temperature Recommendation Engine

```typescript
// src/lib/sake/temperature.ts

import { TEMPERATURES, ServingTemperature } from '@/data/temperatures';
import { Sake } from '@/types/sake';

export interface TemperatureRecommendation {
  optimal: ServingTemperature;
  acceptable: ServingTemperature[];
  avoid: ServingTemperature[];
  reasoning: string;
  tips: string[];
}

export function getTemperatureRecommendation(
  sake: Sake,
  context?: {
    season?: 'spring' | 'summer' | 'fall' | 'winter';
    food?: string;
    mood?: 'refreshing' | 'warming' | 'contemplative';
  }
): TemperatureRecommendation {
  
  // Start with base recommendation from sake type
  let recommendation = getBaseRecommendation(sake);
  
  // Adjust for context
  if (context?.season) {
    recommendation = adjustForSeason(recommendation, sake, context.season);
  }
  
  if (context?.food) {
    recommendation = adjustForFood(recommendation, sake, context.food);
  }
  
  if (context?.mood) {
    recommendation = adjustForMood(recommendation, sake, context.mood);
  }
  
  return recommendation;
}

function getBaseRecommendation(sake: Sake): TemperatureRecommendation {
  
  // Nama (unpasteurized) - MUST be cold
  if (sake.isNama) {
    return {
      optimal: 'yukibie',
      acceptable: ['hanabie'],
      avoid: ['jo-on', 'hinata-kan', 'hitohada-kan', 'nuru-kan', 'jo-kan', 'atsu-kan', 'tobikiri-kan'],
      reasoning: `${sake.name} is nama (生/unpasteurized), meaning it has active enzymes that continue to evolve. Cold serving (5-10°C) is essential to preserve its fresh, lively character and prevent unwanted changes. Never warm nama sake.`,
      tips: [
        'Store in refrigerator at all times',
        'Consume within a few weeks of opening',
        'The "fresh" flavors are the point - embrace them!'
      ]
    };
  }
  
  // Daiginjo / Junmai Daiginjo - Keep cold
  if (sake.grade?.toLowerCase().includes('daiginjo')) {
    return {
      optimal: 'hanabie',
      acceptable: ['yukibie', 'suzubie'],
      avoid: ['nuru-kan', 'jo-kan', 'atsu-kan', 'tobikiri-kan'],
      reasoning: `${sake.name} is a ${sake.grade} with delicate fruity and floral aromatics (ginjo-ka). Chilled serving at "flower cold" (10°C) allows these carefully crafted aromas to bloom while maintaining elegance. Warming would destroy the refinement.`,
      tips: [
        'Use a wine glass to appreciate the aromatics',
        'Let it warm slightly in the glass - flavors evolve',
        'Pair with delicate dishes that won\'t overpower'
      ]
    };
  }
  
  // Ginjo / Junmai Ginjo - Cold to cool
  if (sake.grade?.toLowerCase().includes('ginjo')) {
    return {
      optimal: 'suzubie',
      acceptable: ['hanabie', 'jo-on'],
      avoid: ['atsu-kan', 'tobikiri-kan'],
      reasoning: `${sake.name} is a ${sake.grade} with aromatic qualities that shine at cool temperatures. "Suzubie" (15°C) is the sweet spot - cold enough to preserve aromatics, warm enough for full flavor.`,
      tips: [
        'Slightly warmer than Daiginjo is fine',
        'Room temperature is acceptable on cool days',
        'The fruit notes become more pronounced as it warms slightly'
      ]
    };
  }
  
  // Yamahai / Kimoto - Versatile, often better warm
  if (sake.brewingMethod === 'yamahai' || sake.brewingMethod === 'kimoto') {
    return {
      optimal: 'nuru-kan',
      acceptable: ['jo-on', 'hitohada-kan', 'jo-kan', 'suzubie'],
      avoid: ['yukibie'],
      reasoning: `${sake.name} uses the ${sake.brewingMethod} method, creating deep umami, earthy complexity, and gamey notes. Gentle warming at "nuru-kan" (40°C) opens up these layered flavors beautifully. It's also excellent at room temperature for contemplative sipping.`,
      tips: [
        'Try it at multiple temperatures - it transforms dramatically',
        'Warm versions pair amazingly with rich, fatty foods',
        'The "funky" notes become more integrated when warm'
      ]
    };
  }
  
  // Junmai (pure rice) - The versatile middle ground
  if (sake.grade?.toLowerCase() === 'junmai') {
    return {
      optimal: 'jo-on',
      acceptable: ['suzubie', 'hitohada-kan', 'nuru-kan'],
      avoid: ['yukibie', 'tobikiri-kan'],
      reasoning: `${sake.name} is a pure rice sake (Junmai) with solid structure and rice-forward character. Room temperature (20°C) reveals its true nature, but it's versatile enough for gentle warming on cold nights or light chilling in summer.`,
      tips: [
        'This is the most flexible sake style for temperature',
        'Experiment! Same bottle, different temps = different experiences',
        'Match temperature to the season and your food'
      ]
    };
  }
  
  // Honjozo - Good warm
  if (sake.grade?.toLowerCase() === 'honjozo') {
    return {
      optimal: 'hitohada-kan',
      acceptable: ['jo-on', 'nuru-kan', 'suzubie'],
      avoid: ['yukibie', 'tobikiri-kan'],
      reasoning: `${sake.name} is a Honjozo with a small amount of brewer's alcohol added, making it lighter and very food-friendly. Body temperature warming (35°C) brings out its gentle, smooth character.`,
      tips: [
        'Great as an everyday "food sake"',
        'Warming makes it even more approachable',
        'Excellent value - don\'t be afraid to experiment'
      ]
    };
  }
  
  // Sparkling - Cold only
  if (sake.style?.toLowerCase().includes('sparkling')) {
    return {
      optimal: 'yukibie',
      acceptable: ['hanabie'],
      avoid: ['jo-on', 'hinata-kan', 'hitohada-kan', 'nuru-kan', 'jo-kan', 'atsu-kan', 'tobikiri-kan'],
      reasoning: `${sake.name} is a sparkling sake. Cold serving (5°C) is essential to maintain carbonation and refreshing character. Room temperature would make it go flat.`,
      tips: [
        'Serve in a champagne flute',
        'Great as an aperitif',
        'Pairs well with appetizers and celebrations'
      ]
    };
  }
  
  // Aged (Koshu) - Room temp or slightly warm
  if (sake.style?.toLowerCase().includes('aged') || sake.style?.toLowerCase().includes('koshu')) {
    return {
      optimal: 'jo-on',
      acceptable: ['hitohada-kan', 'suzubie'],
      avoid: ['yukibie', 'atsu-kan', 'tobikiri-kan'],
      reasoning: `${sake.name} is an aged sake (Koshu) with developed complexity - think nuts, caramel, dried fruit. Room temperature (20°C) allows these mature flavors to express fully. Slight warming can also be interesting.`,
      tips: [
        'Treat it like an aged spirit - sip slowly',
        'Pairs beautifully with cheese and nuts',
        'The amber color indicates oxidative aging'
      ]
    };
  }
  
  // Default - cool serving
  return {
    optimal: 'suzubie',
    acceptable: ['hanabie', 'jo-on'],
    avoid: ['atsu-kan', 'tobikiri-kan'],
    reasoning: `Cool serving (15°C) is a safe starting point for most sakes, allowing both aroma and flavor to express while maintaining refreshing character.`,
    tips: [
      'When in doubt, start cool and let it warm naturally',
      'Your preference matters - adjust to taste',
      'Different temperatures reveal different aspects'
    ]
  };
}

function adjustForSeason(
  recommendation: TemperatureRecommendation,
  sake: Sake,
  season: 'spring' | 'summer' | 'fall' | 'winter'
): TemperatureRecommendation {
  
  // Don't adjust if sake type strongly dictates temperature (nama, sparkling)
  if (sake.isNama || sake.style?.toLowerCase().includes('sparkling')) {
    return recommendation;
  }
  
  switch (season) {
    case 'summer':
      // Shift cooler in summer
      if (recommendation.optimal === 'jo-on') {
        return {
          ...recommendation,
          optimal: 'suzubie',
          reasoning: recommendation.reasoning + ` In summer, serving slightly cooler (15°C) makes it more refreshing.`
        };
      }
      break;
      
    case 'winter':
      // Shift warmer in winter
      if (['suzubie', 'jo-on'].includes(recommendation.optimal)) {
        const warmerOption = recommendation.acceptable.find(t => 
          ['hitohada-kan', 'nuru-kan'].includes(t)
        );
        if (warmerOption) {
          return {
            ...recommendation,
            optimal: warmerOption,
            reasoning: recommendation.reasoning + ` In winter, warming to ${TEMPERATURES[warmerOption].nameEn} (${TEMPERATURES[warmerOption].tempC}°C) adds comforting warmth.`
          };
        }
      }
      break;
  }
  
  return recommendation;
}

function adjustForFood(
  recommendation: TemperatureRecommendation,
  sake: Sake,
  food: string
): TemperatureRecommendation {
  const lowerFood = food.toLowerCase();
  
  // Hot dishes suggest warmer sake
  if (lowerFood.includes('hot pot') || lowerFood.includes('nabe') || 
      lowerFood.includes('soup') || lowerFood.includes('stew')) {
    const warmerOption = recommendation.acceptable.find(t => 
      ['hitohada-kan', 'nuru-kan', 'jo-kan'].includes(t)
    );
    if (warmerOption && !sake.isNama) {
      return {
        ...recommendation,
        optimal: warmerOption,
        reasoning: recommendation.reasoning + ` With hot dishes like ${food}, matching temperature creates harmony.`
      };
    }
  }
  
  // Cold dishes suggest cooler sake
  if (lowerFood.includes('sashimi') || lowerFood.includes('oyster') || 
      lowerFood.includes('salad') || lowerFood.includes('ceviche')) {
    const coolerOption = recommendation.acceptable.find(t => 
      ['hanabie', 'suzubie'].includes(t)
    );
    if (coolerOption) {
      return {
        ...recommendation,
        optimal: coolerOption,
        reasoning: recommendation.reasoning + ` With ${food}, cooler serving enhances the pairing.`
      };
    }
  }
  
  return recommendation;
}

function adjustForMood(
  recommendation: TemperatureRecommendation,
  sake: Sake,
  mood: 'refreshing' | 'warming' | 'contemplative'
): TemperatureRecommendation {
  
  switch (mood) {
    case 'refreshing':
      const coolerOption = recommendation.acceptable.find(t => 
        ['hanabie', 'suzubie', 'yukibie'].includes(t)
      );
      if (coolerOption && !recommendation.avoid.includes(coolerOption)) {
        return {
          ...recommendation,
          optimal: coolerOption,
          reasoning: recommendation.reasoning + ` For a refreshing experience, cooler serving enhances crispness.`
        };
      }
      break;
      
    case 'warming':
      const warmerOption = recommendation.acceptable.find(t => 
        ['hitohada-kan', 'nuru-kan', 'jo-kan'].includes(t)
      );
      if (warmerOption && !sake.isNama) {
        return {
          ...recommendation,
          optimal: warmerOption,
          reasoning: recommendation.reasoning + ` For warming comfort, serving at ${TEMPERATURES[warmerOption].nameEn} creates a cozy experience.`
        };
      }
      break;
      
    case 'contemplative':
      // Room temperature for thoughtful sipping
      if (!recommendation.avoid.includes('jo-on')) {
        return {
          ...recommendation,
          optimal: 'jo-on',
          reasoning: recommendation.reasoning + ` For contemplative sipping, room temperature reveals the sake's true character over time.`
        };
      }
      break;
  }
  
  return recommendation;
}
```

---

# 8. DATA PIPELINE & FIRECRAWL

> **Note**: Scraping is now handled by Convex Actions. See Section 3 for the full implementation. This section provides additional context on the Firecrawl strategy.

## Firecrawl Strategy for Tippsy Sake Catalog

### Three Approaches (Best to Simplest)

| Approach | Use Case | Credits | Data Quality |
|----------|----------|---------|--------------|
| **Agent** | Fully autonomous discovery | ~2-3/page | ⭐⭐⭐⭐⭐ |
| **Map + Extract** | Known site structure | ~1-2/page | ⭐⭐⭐⭐ |
| **Crawl** | Quick scan with HTML | ~1/page | ⭐⭐⭐ |

### Option 1: Firecrawl Agent (Recommended)

The `/agent` endpoint autonomously navigates sites and extracts structured data:

```typescript
// convex/actions/scraping.ts
"use node";

import { internalAction } from "../_generated/server";
import Firecrawl from "@mendable/firecrawl-js";

export const agentScrapeTippsy = internalAction({
  args: {},
  handler: async (ctx) => {
    const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
    
    // Agent autonomously discovers and extracts all sake products
    const result = await firecrawl.agent({
      prompt: `Navigate Tippsy.com and extract ALL sake products. 
               For each sake, get:
               - Name (English and Japanese if available)
               - Brewery name
               - Region/Prefecture
               - Grade/Type (Junmai, Daiginjo, Ginjo, etc.)
               - Rice polishing ratio
               - SMV (Sake Meter Value)
               - Acidity
               - ABV (alcohol percentage)
               - Volume (ml)
               - Price (USD)
               - Tasting notes
               - Food pairings
               - Serving temperature recommendations
               - ALL product images (main + additional views)
               - Product URL
               - In stock status`,
      schema: {
        type: "object",
        properties: {
          products: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                nameJapanese: { type: "string" },
                brewery: { type: "string" },
                region: { type: "string" },
                type: { type: "string" },
                ricePolishing: { type: "number" },
                smv: { type: "number" },
                acidity: { type: "number" },
                abv: { type: "number" },
                volume: { type: "number" },
                price: { type: "number" },
                tastingNotes: { type: "string" },
                aroma: { type: "array", items: { type: "string" } },
                flavor: { type: "array", items: { type: "string" } },
                foodPairings: { type: "array", items: { type: "string" } },
                servingTemp: { type: "array", items: { type: "string" } },
                imageUrl: { type: "string" },
                additionalImages: { type: "array", items: { type: "string" } },
                url: { type: "string" },
                inStock: { type: "boolean" },
              },
              required: ["name", "price", "imageUrl", "url"],
            },
          },
        },
      },
    });
    
    // Save to Convex
    for (const product of result.data?.products ?? []) {
      await ctx.runMutation(internal.sakes.upsertSake, {
        ...product,
        tippsyUrl: product.url,
        currency: "USD",
        source: "tippsy",
      });
    }
    
    return { count: result.data?.products?.length ?? 0 };
  },
});
```

### Option 2: Map + Extract (More Control)

```typescript
// Step 1: Map all product URLs (fast, cheap)
export const mapTippsyUrls = internalAction({
  args: {},
  handler: async (ctx) => {
    const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
    
    const mapResult = await firecrawl.map("https://www.tippsy.com", {
      search: "sake",
      limit: 2000,
    });
    
    // Filter for product pages only
    const productUrls = mapResult.links?.filter((url: string) =>
      url.includes("/products/") && !url.includes("?")
    ) ?? [];
    
    console.log(`Found ${productUrls.length} product URLs`);
    
    // Store URLs and schedule batch extraction
    for (let i = 0; i < productUrls.length; i += 20) {
      await ctx.scheduler.runAfter(
        i * 500, // Stagger batches
        internal.actions.scraping.extractBatch,
        { urls: productUrls.slice(i, i + 20) }
      );
    }
    
    return { totalUrls: productUrls.length };
  },
});

// Step 2: Extract structured data from batch of URLs
export const extractBatch = internalAction({
  args: { urls: v.array(v.string()) },
  handler: async (ctx, { urls }) => {
    const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
    
    const result = await firecrawl.extract(urls, {
      prompt: `Extract sake product details. Include ALL images.`,
      schema: sakeProductSchema,
    });
    
    for (const product of result.data ?? []) {
      await ctx.runMutation(internal.sakes.upsertSake, product);
    }
    
    return { processed: urls.length };
  },
});
```

### Option 3: Direct Crawl with HTML Parsing

```typescript
export const crawlTippsy = internalAction({
  args: {},
  handler: async (ctx) => {
    const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });
    
    const crawlResult = await firecrawl.crawl(
      "https://www.tippsy.com/collections/sake",
      {
        limit: 500,
        maxDepth: 2,
        scrapeOptions: {
          formats: ["markdown", "html"],
          includeTags: ["img", "h1", "h2", ".price", ".product-info"],
        },
      }
    );
    
    // Parse products from crawl results
    for (const page of crawlResult.data ?? []) {
      const product = parseProductFromHtml(page.html, page.metadata);
      if (product) {
        await ctx.runMutation(internal.sakes.upsertSake, product);
      }
    }
    
    return { pages: crawlResult.data?.length ?? 0 };
  },
});
```

## Convex Sake Schema (Reference)

```typescript
// This is already in convex/schema.ts (Section 3)
// Key fields for Tippsy data:

sakes: defineTable({
  // Identity
  name: v.string(),
  nameJapanese: v.optional(v.string()),
  tippsyUrl: v.string(),
  tippsyId: v.optional(v.string()),
  
  // Sake attributes
  brewery: v.optional(v.string()),
  region: v.optional(v.string()),        // Prefecture
  type: v.optional(v.string()),           // Junmai, Daiginjo, etc.
  riceType: v.optional(v.string()),       // Yamada Nishiki, etc.
  ricePolishing: v.optional(v.number()),  // 50 = 50%
  smv: v.optional(v.number()),            // Sake Meter Value
  acidity: v.optional(v.number()),
  abv: v.optional(v.number()),
  volume: v.optional(v.number()),         // ml
  
  // Commerce
  price: v.number(),
  currency: v.literal("USD"),
  inStock: v.boolean(),
  
  // Content
  tastingNotes: v.optional(v.string()),
  aroma: v.optional(v.array(v.string())),
  flavor: v.optional(v.array(v.string())),
  foodPairings: v.optional(v.array(v.string())),
  servingTemp: v.optional(v.array(v.string())),
  
  // Images
  imageUrl: v.string(),
  additionalImages: v.optional(v.array(v.string())),
  
  // Metadata
  scrapedAt: v.number(),
  source: v.literal("tippsy"),
})
```

## Daily Sync Cron Job

```typescript
// convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Sync Tippsy catalog daily at 3am CST (8:00 UTC)
crons.daily(
  "sync-tippsy-catalog",
  { hourUTC: 8, minuteUTC: 0 },
  internal.actions.scraping.agentScrapeTippsy  // Or mapTippsyUrls
);

export default crons;
```

## Cost Estimation

| Operation | Credits | 500 Products | Monthly (Daily Sync) |
|-----------|---------|--------------|---------------------|
| Map URLs | ~5 total | ~5 | ~150 |
| Extract (per page) | ~1-2 | ~750 | ~22,500 |
| Agent (autonomous) | ~2-3 | ~1,250 | ~37,500 |
| **Recommended: Map + Extract** | - | **~755** | **~22,650** |

**Firecrawl Pricing**: Free tier includes 500 credits/month. Grow plan ($19/mo) includes 3,000 credits.

## React Hook for Sake Data

```typescript
// src/hooks/useSake.ts (already in Section 3)
"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useSakeSearch(filters: {
  query?: string;
  region?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  return useQuery(api.sakes.searchSakes, filters);
}

export function useRecommendations(limit = 10) {
  return useQuery(api.sakes.getRecommendations, { limit });
}
```

---

# 9. GEMINI FILE SEARCH RAG

## Overview: Why Gemini File Search?

Gemini File Search is a **fully managed RAG (Retrieval Augmented Generation) system** that's perfect for Sakéverse because:

1. **Zero Infrastructure** - No need to manage vector databases, embeddings, or chunking
2. **Cost Effective** - Storage and query-time embeddings are FREE; you only pay $0.15/1M tokens for initial indexing
3. **Semantic Search** - Understands meaning, not just keywords (e.g., "fruity sake" finds Daiginjo even if "fruity" isn't in the text)
4. **Built-in Citations** - Every response includes sources, perfect for educational content
5. **Handles Duplicates** - When multiple documents contain similar info, semantic search naturally surfaces the most relevant chunks
6. **Multi-format Support** - PDFs, DOCX, TXT, JSON all work seamlessly

## The Unified Knowledge Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     SAKÉVERSE UNIFIED KNOWLEDGE LAYER                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  KNOWLEDGE SOURCES                                                          │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐                │
│  │  📚 SAKE PDFS  │  │ 🎙️ PODCASTS    │  │ 🍶 TIPPSY DB   │                │
│  │                │  │                │  │                │                │
│  │ • Books        │  │ • Transcripts  │  │ • 500+ sakes   │                │
│  │ • Guides       │  │   (Whisper)    │  │ • Breweries    │                │
│  │ • Certif. docs │  │ • Episode      │  │ • Tasting      │                │
│  │ • WSET/JSS     │  │   summaries    │  │   notes        │                │
│  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘                │
│          │                   │                   │                         │
│          │     Metadata:     │     Metadata:     │     Metadata:           │
│          │     source=book   │     source=pod    │     source=tippsy       │
│          │     type=guide    │     episode=42    │     type=product        │
│          │                   │                   │                         │
│          └───────────────────┴───────────────────┘                         │
│                              │                                              │
│                              ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                  GEMINI FILE SEARCH STORE                            │   │
│  │                  "sakeverse-knowledge"                               │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  📦 Auto-chunking (configurable: 200-800 tokens/chunk)              │   │
│  │  🧮 Embeddings via gemini-embedding-001 (FREE at query time)         │   │
│  │  🔍 Semantic search with relevance scoring                          │   │
│  │  📎 Custom metadata for filtering (source, type, grade, region)     │   │
│  │  💬 Citations with document references                              │   │
│  └──────────────────────────────┬──────────────────────────────────────┘   │
│                                 │                                           │
│                                 │ Query via generateContent() with          │
│                                 │ FileSearch tool                           │
│                                 ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                  NEXT.JS API ROUTE                                   │   │
│  │                  /api/knowledge                                      │   │
│  └─────────────────────────────┬───────────────────────────────────────┘   │
│                                │                                            │
│            ┌───────────────────┼───────────────────┐                       │
│            ▼                   ▼                   ▼                       │
│  ┌──────────────────┐ ┌────────────────┐ ┌────────────────────┐           │
│  │  OPENAI REALTIME │ │   THESYS C1    │ │      CONVEX        │           │
│  │     (YUKI)       │ │     CHAT       │ │   (Structured)     │           │
│  │                  │ │                │ │                    │           │
│  │ Tool:            │ │ Action:        │ │ For: pricing,      │           │
│  │ search_sake_     │ │ search_        │ │ inventory, user    │           │
│  │ knowledge()      │ │ knowledge()    │ │ progress           │           │
│  └──────────────────┘ └────────────────┘ └────────────────────┘           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## How Duplicate Content is Handled

**Problem**: Your sake PDFs, books, and guides likely repeat similar information (e.g., multiple sources explain what "Junmai Daiginjo" means).

**Solution**: Gemini File Search handles this automatically through semantic search:

1. **Relevance Ranking** - When a query matches multiple chunks, the most relevant ones float to the top
2. **Context Window** - Gemini synthesizes across sources, eliminating redundancy in the response
3. **Metadata Filtering** - You can query specific sources: `source=book` vs `source=tippsy`
4. **Citations** - Even if info overlaps, citations show which sources contributed

```typescript
// Example: Query with metadata filter to prioritize authoritative sources
const response = await client.models.generateContent({
  model: "gemini-2.5-flash",
  contents: "What makes a sake 'Junmai Daiginjo'?",
  config: {
    tools: [{
      fileSearch: {
        fileSearchStoreNames: [STORE_NAME],
        // Prioritize official certification docs and books
        metadataFilter: "source=book OR source=certification"
      }
    }]
  }
});
```

## Setting Up the File Search Store

### 1. Environment Variables

```bash
# .env.local (add these)
GOOGLE_GENAI_API_KEY=your_gemini_api_key
GEMINI_FILE_SEARCH_STORE=fileSearchStores/sakeverse-knowledge
```

### 2. Create the Store and Upload Documents

```typescript
// scripts/setup-knowledge-store.ts

import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY! });

// Document metadata for different source types
interface DocumentConfig {
  file: string;
  displayName: string;
  metadata: Array<{ key: string; stringValue?: string; numericValue?: number }>;
}

async function setupKnowledgeStore() {
  console.log('🍶 Setting up Sakéverse Knowledge Store...\n');

  // 1. Create File Search Store
  console.log('1️⃣ Creating File Search Store...');
  const fileSearchStore = await ai.fileSearchStores.create({
    config: { displayName: 'sakeverse-knowledge' }
  });
  console.log(`   ✓ Store created: ${fileSearchStore.name}\n`);

  // 2. Define documents to upload
  const documents: DocumentConfig[] = [
    // Sake education PDFs
    {
      file: './knowledge/sake-basics-guide.pdf',
      displayName: 'Sake Basics Guide',
      metadata: [
        { key: 'source', stringValue: 'book' },
        { key: 'type', stringValue: 'education' },
        { key: 'level', stringValue: 'beginner' }
      ]
    },
    {
      file: './knowledge/sake-sommelier-certification.pdf',
      displayName: 'Sake Sommelier Study Guide',
      metadata: [
        { key: 'source', stringValue: 'certification' },
        { key: 'type', stringValue: 'education' },
        { key: 'level', stringValue: 'advanced' }
      ]
    },
    {
      file: './knowledge/pure-sake-book.pdf',
      displayName: 'Pure Sake by Beau Timken',
      metadata: [
        { key: 'source', stringValue: 'book' },
        { key: 'type', stringValue: 'comprehensive' },
        { key: 'author', stringValue: 'Beau Timken' }
      ]
    },
    {
      file: './knowledge/japanese-sake-handbook.pdf',
      displayName: 'Japanese Sake Handbook',
      metadata: [
        { key: 'source', stringValue: 'book' },
        { key: 'type', stringValue: 'reference' },
        { key: 'focus', stringValue: 'regions' }
      ]
    },
    // Podcast transcripts
    {
      file: './knowledge/podcasts/sake-revolution-ep1-50.txt',
      displayName: 'Sake Revolution Podcast Transcripts',
      metadata: [
        { key: 'source', stringValue: 'podcast' },
        { key: 'type', stringValue: 'transcript' },
        { key: 'show', stringValue: 'Sake Revolution' }
      ]
    },
    // Tippsy product catalog (exported as structured text)
    {
      file: './knowledge/tippsy-catalog-export.json',
      displayName: 'Tippsy Sake Catalog',
      metadata: [
        { key: 'source', stringValue: 'tippsy' },
        { key: 'type', stringValue: 'product' },
        { key: 'updated', stringValue: new Date().toISOString().split('T')[0] }
      ]
    }
  ];

  // 3. Upload each document with metadata
  console.log('2️⃣ Uploading documents...\n');
  
  for (const doc of documents) {
    if (!fs.existsSync(doc.file)) {
      console.log(`   ⚠️ Skipping ${doc.displayName} (file not found)`);
      continue;
    }

    console.log(`   📄 Uploading: ${doc.displayName}`);
    
    let operation = await ai.fileSearchStores.uploadToFileSearchStore({
      file: doc.file,
      fileSearchStoreName: fileSearchStore.name!,
      config: {
        displayName: doc.displayName,
        customMetadata: doc.metadata,
        // Chunking config optimized for sake content
        chunkingConfig: {
          whiteSpaceConfig: {
            maxTokensPerChunk: 500,  // Good for paragraphs
            maxOverlapTokens: 50     // Context continuity
          }
        }
      }
    });

    // Wait for indexing to complete
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      operation = await ai.operations.get({ operation });
    }

    console.log(`   ✓ Indexed: ${doc.displayName}\n`);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Knowledge Store Setup Complete!');
  console.log(`\nStore Name: ${fileSearchStore.name}`);
  console.log('\nAdd to .env.local:');
  console.log(`GEMINI_FILE_SEARCH_STORE=${fileSearchStore.name}`);
}

setupKnowledgeStore().catch(console.error);
```

### 3. Export Tippsy Data for RAG

```typescript
// scripts/export-tippsy-for-rag.ts
// Run with: npx convex run scripts:exportTippsyForRag

import { internalAction } from "../convex/_generated/server";
import { internal } from "../convex/_generated/api";

// Convex action to export sake data for RAG indexing
export const exportTippsyForRag = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log('🍶 Exporting Tippsy catalog for RAG...');

    // Fetch all sakes from Convex
    const sakes = await ctx.runQuery(internal.sakes.getAllSakes, {});

    // Transform into RAG-friendly format
    const documents = sakes.map(sake => ({
      id: sake._id,
      content: formatSakeForRAG(sake)
    }));

    // Return formatted data (save to file or upload to Gemini)
    return {
      exportedAt: Date.now(),
      productCount: documents.length,
      products: documents
    };
  },
});

function formatSakeForRAG(sake: any): string {
  // Create a natural language description optimized for semantic search
  return `
SAKE: ${sake.name}${sake.nameJapanese ? ` (${sake.nameJapanese})` : ''}

CLASSIFICATION:
- Grade: ${sake.type || 'Not specified'}
- Brewing Method: Standard

PRODUCER:
- Brewery: ${sake.brewery || 'Unknown'}
- Region: ${sake.region || 'Japan'}

SPECIFICATIONS:
- Rice Polishing Ratio: ${sake.ricePolishing ? `${sake.ricePolishing}%` : 'Not specified'}
- SMV (Sake Meter Value): ${sake.smv ?? 'Not specified'} ${sake.smv ? (sake.smv > 0 ? '(dry)' : sake.smv < 0 ? '(sweet)' : '(neutral)') : ''}
- Acidity: ${sake.acidity ?? 'Not specified'}
- ABV: ${sake.abv ? `${sake.abv}%` : 'Not specified'}
- Rice Type: ${sake.riceType || 'Not specified'}

TASTING NOTES:
${sake.tastingNotes || 'No tasting notes available.'}

FOOD PAIRINGS:
${sake.foodPairings?.join(', ') || 'Versatile pairing options.'}

SERVING TEMPERATURE:
${sake.servingTemp?.join(', ') || 'Chilled to room temperature.'}

PRICE: $${sake.price || 'See retailer'}
VOLUME: ${sake.volume || '720'}ml
PRODUCT URL: ${sake.tippsyUrl || 'https://tippsy.com'}
`.trim();
}
```

### 4. Transcribe Podcasts for RAG

```typescript
// scripts/transcribe-podcasts.ts

import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function transcribePodcasts() {
  const podcastDir = './podcasts';
  const outputFile = './knowledge/podcasts/sake-podcasts-transcripts.txt';
  
  const episodes = fs.readdirSync(podcastDir)
    .filter(f => f.endsWith('.mp3') || f.endsWith('.m4a'));

  console.log(`🎙️ Transcribing ${episodes.length} podcast episodes...`);

  const transcripts: string[] = [];

  for (const episode of episodes) {
    console.log(`   Processing: ${episode}`);
    
    const filePath = path.join(podcastDir, episode);
    
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-1',
      response_format: 'text'
    });

    transcripts.push(`
================================================================================
EPISODE: ${episode.replace(/\.(mp3|m4a)$/, '')}
================================================================================

${transcription}
`);
  }

  // Write all transcripts to single file for RAG
  fs.writeFileSync(outputFile, transcripts.join('\n\n'));
  console.log(`✓ Wrote transcripts to ${outputFile}`);
}

transcribePodcasts().catch(console.error);
```

## API Route: Knowledge Search Endpoint

```typescript
// src/app/api/knowledge/route.ts

import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY! });
const STORE_NAME = process.env.GEMINI_FILE_SEARCH_STORE!;

export interface KnowledgeSearchRequest {
  query: string;
  filters?: {
    source?: 'book' | 'podcast' | 'tippsy' | 'certification';
    type?: 'education' | 'product' | 'transcript';
    level?: 'beginner' | 'intermediate' | 'advanced';
  };
  context?: {
    userLevel?: string;
    previousTopic?: string;
  };
}

export interface KnowledgeSearchResponse {
  answer: string;
  citations: Array<{
    documentName: string;
    snippet: string;
  }>;
  suggestedFollowups?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { query, filters, context } = await request.json() as KnowledgeSearchRequest;

    // Build metadata filter string
    let metadataFilter: string | undefined;
    if (filters) {
      const filterParts: string[] = [];
      if (filters.source) filterParts.push(`source="${filters.source}"`);
      if (filters.type) filterParts.push(`type="${filters.type}"`);
      if (filters.level) filterParts.push(`level="${filters.level}"`);
      metadataFilter = filterParts.join(' AND ');
    }

    // Enhance query with context
    const enhancedQuery = context?.previousTopic
      ? `In the context of ${context.previousTopic}: ${query}`
      : query;

    // Query Gemini with File Search
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: enhancedQuery,
      config: {
        tools: [{
          fileSearch: {
            fileSearchStoreNames: [STORE_NAME],
            ...(metadataFilter && { metadataFilter })
          }
        }],
        // System instruction for sake sommelier tone
        systemInstruction: `You are Yuki, a friendly sake sommelier AI. 
Answer questions using the knowledge from your document store.
Always cite your sources when providing information.
Use Japanese terms with English explanations.
If asked about specific products, include pricing from Tippsy when available.
For beginners, explain concepts simply. For advanced users, go deeper.`
      }
    });

    // Extract citations from grounding metadata
    const citations = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => ({
      documentName: chunk.retrievedContext?.title || 'Unknown',
      snippet: chunk.retrievedContext?.text || ''
    })) || [];

    // Generate follow-up suggestions
    const suggestedFollowups = generateFollowups(query, response.text || '');

    return NextResponse.json({
      answer: response.text,
      citations,
      suggestedFollowups
    } as KnowledgeSearchResponse);

  } catch (error) {
    console.error('Knowledge search error:', error);
    return NextResponse.json(
      { error: 'Failed to search knowledge base' },
      { status: 500 }
    );
  }
}

function generateFollowups(query: string, answer: string): string[] {
  // Simple heuristic follow-ups based on topic
  const followups: string[] = [];
  
  if (answer.includes('Junmai') || answer.includes('Daiginjo')) {
    followups.push("What's the difference between Junmai and Honjozo?");
  }
  if (answer.includes('temperature') || answer.includes('warm') || answer.includes('cold')) {
    followups.push("What temperature is best for this sake?");
  }
  if (answer.includes('region') || answer.includes('Niigata') || answer.includes('Hiroshima')) {
    followups.push("What makes this region's sake special?");
  }
  if (answer.includes('food') || answer.includes('pair')) {
    followups.push("What foods pair best with this style?");
  }

  return followups.slice(0, 3);
}
```

## Integrating with OpenAI Realtime Voice Agent

The key is adding a `search_sake_knowledge` function tool to Yuki:

```typescript
// src/lib/openai/realtime-tools.ts

export const voiceAgentTools = [
  // ... existing tools (search_sake, add_to_cart, etc.)
  
  {
    type: 'function',
    name: 'search_sake_knowledge',
    description: `Search the comprehensive sake knowledge base for detailed information.
Use this when users ask about:
- Sake brewing process, techniques, and terminology
- Regional styles and characteristics
- Food pairing principles and recommendations
- Serving temperature science
- Sake history and culture
- Certification/education topics
- Anything requiring deep expertise beyond product search`,
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The natural language question to search for'
        },
        source_preference: {
          type: 'string',
          enum: ['any', 'books', 'podcasts', 'products'],
          description: 'Preferred source type (optional)'
        },
        depth: {
          type: 'string',
          enum: ['brief', 'detailed'],
          description: 'Brief for quick answers, detailed for comprehensive explanation'
        }
      },
      required: ['query']
    }
  }
];
```

```typescript
// src/hooks/useYukiVoice.ts (updated tool handler)

async function handleToolCall(name: string, args: any) {
  switch (name) {
    // ... existing handlers
    
    case 'search_sake_knowledge':
      const knowledgeResponse = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: args.query,
          filters: args.source_preference !== 'any' 
            ? { source: args.source_preference } 
            : undefined
        })
      });
      
      const knowledge = await knowledgeResponse.json();
      
      // Return to voice agent for synthesis
      return {
        answer: knowledge.answer,
        sources: knowledge.citations.map((c: any) => c.documentName).join(', '),
        followups: knowledge.suggestedFollowups
      };
  }
}
```

## Integrating with Thesys C1 Chat

```typescript
// src/components/chat/SakeChat.tsx (updated)

const handleAction = async (action: any) => {
  switch (action.type) {
    // ... existing actions
    
    case 'search_knowledge':
      const response = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: action.query,
          filters: action.filters,
          context: {
            previousTopic: lastTopic
          }
        })
      });
      
      const result = await response.json();
      
      // Display in C1 with citations
      addMessage({
        role: 'assistant',
        content: result.answer,
        metadata: {
          citations: result.citations,
          suggestedFollowups: result.suggestedFollowups
        }
      });
      break;
  }
};
```

## When to Use Which Data Source

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    QUERY ROUTING DECISION TREE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  User Query                                                                 │
│      │                                                                      │
│      ▼                                                                      │
│  ┌─────────────────────────────────────────┐                               │
│  │ Is it about a SPECIFIC PRODUCT?         │                               │
│  │ (price, buy, stock, specific sake name) │                               │
│  └────────────────┬────────────────────────┘                               │
│                   │                                                         │
│         ┌────────YES────────┐                                              │
│         │                   │                                              │
│         ▼                   ▼                                              │
│  ┌─────────────┐    ┌────────────────────────────────────┐                │
│  │   CONVEX    │    │ Is it EDUCATIONAL or CONCEPTUAL?   │                │
│  │ (structured │    │ (what is, how does, why, explain,  │                │
│  │  queries)   │    │  history, culture, technique)      │                │
│  └─────────────┘    └───────────────┬────────────────────┘                │
│                                     │                                       │
│                           ┌────────YES────────┐                            │
│                           │                   │                            │
│                           ▼                   ▼                            │
│                    ┌─────────────┐    ┌────────────────────────┐          │
│                    │ GEMINI FILE │    │ Is it about CURRENT    │          │
│                    │   SEARCH    │    │ EVENTS or NEWS?        │          │
│                    │   (RAG)     │    └───────────┬────────────┘          │
│                    └─────────────┘                │                        │
│                                         ┌────────YES────────┐             │
│                                         │                   │             │
│                                         ▼                   ▼             │
│                                  ┌─────────────┐    ┌─────────────┐       │
│                                  │ PERPLEXITY  │    │   GEMINI    │       │
│                                  │ (web search)│    │ (reasoning) │       │
│                                  └─────────────┘    └─────────────┘       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

```typescript
// src/lib/routing/query-router.ts

export type DataSource = 'convex' | 'gemini_rag' | 'perplexity' | 'gemini_reasoning';

export function routeQuery(query: string): DataSource {
  const lowerQuery = query.toLowerCase();
  
  // Product-specific queries → Convex
  const productSignals = [
    'price', 'buy', 'order', 'stock', 'available', 'bottle',
    'how much', 'where can i', 'add to cart'
  ];
  if (productSignals.some(s => lowerQuery.includes(s))) {
    return 'convex';
  }
  
  // Educational/conceptual → Gemini File Search RAG
  const educationSignals = [
    'what is', 'what are', 'how does', 'how do', 'why', 'explain',
    'difference between', 'history', 'culture', 'tradition',
    'brewing', 'fermentation', 'koji', 'yeast', 'rice polishing',
    'region', 'prefecture', 'style', 'technique', 'method'
  ];
  if (educationSignals.some(s => lowerQuery.includes(s))) {
    return 'gemini_rag';
  }
  
  // Current events → Perplexity
  const newsSignals = [
    'latest', 'recent', 'new release', 'this year', 'trending',
    'news', 'award', 'competition', 'festival'
  ];
  if (newsSignals.some(s => lowerQuery.includes(s))) {
    return 'perplexity';
  }
  
  // Default to RAG for knowledge queries
  return 'gemini_rag';
}
```

## Kiro Spec: Knowledge System

```markdown
// .kiro/specs/knowledge-system.md

# Knowledge System Specification

## Overview
The Sakéverse Knowledge System uses Gemini File Search as a managed RAG solution
to provide accurate, cited answers from sake books, podcasts, and product data.

## Functional Requirements

### FR1: Multi-Source Knowledge Base
- Upload and index sake education PDFs (books, certification guides)
- Transcribe and index podcast episodes (via Whisper)
- Export and index Tippsy product catalog
- Support metadata filtering by source, type, level

### FR2: Semantic Search
- Natural language query understanding
- Cross-source retrieval (find relevant info from any source)
- Relevance ranking with duplicate handling
- Context-aware responses

### FR3: Citation Support
- Every response includes source citations
- Link to original documents where available
- Distinguish between authoritative (books) and casual (podcasts) sources

### FR4: Integration Points
- OpenAI Realtime voice agent via function tool
- Thesys C1 chat via action handler
- Direct API access via /api/knowledge endpoint

### FR5: Query Routing
- Route product queries to Convex (structured)
- Route education queries to Gemini File Search (RAG)
- Route current events to Perplexity (web search)

## Non-Functional Requirements

### NFR1: Performance
- Query response time < 2 seconds (p95)
- Support concurrent queries
- Cache frequent queries

### NFR2: Cost Efficiency
- Optimize chunk size for relevance vs. token usage
- Use metadata filters to reduce search scope
- Monitor embedding costs during indexing

### NFR3: Accuracy
- Prefer authoritative sources (books, certifications)
- Include source confidence in responses
- Flag when information may be outdated

## Acceptance Criteria

### AC1: Knowledge Upload
- [ ] Successfully upload 5+ sake PDFs
- [ ] Successfully transcribe and upload podcast episodes
- [ ] Successfully export and upload Tippsy catalog
- [ ] All documents indexed with proper metadata

### AC2: Query Quality
- [ ] Query "What is Junmai Daiginjo?" returns accurate definition with citation
- [ ] Query "Best sake for sushi?" returns food pairing info with sources
- [ ] Query "Tell me about Niigata sake" returns regional info

### AC3: Integration
- [ ] Voice agent can call search_sake_knowledge tool
- [ ] C1 chat can trigger knowledge search action
- [ ] API returns structured response with citations

### AC4: Duplicate Handling
- [ ] Similar info in multiple docs doesn't cause redundant responses
- [ ] Most authoritative source is prioritized
- [ ] Multiple sources cited when appropriate
```

## Generated Podcast Feature (NotebookLM-Style)

The killer feature: **On-demand podcast generation** where RAG provides the knowledge and Gemini TTS creates engaging multi-host audio content.

### Architecture: RAG → Script → Audio

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PODCAST GENERATION PIPELINE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  USER: "Generate a podcast about sake and sushi pairing"                   │
│                              │                                              │
│                              ▼                                              │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │ 1. RAG RETRIEVAL                                                  │      │
│  │    Query File Search for: food pairing, sushi, umami, temp       │      │
│  │    Returns: 5-10 relevant chunks with citations                  │      │
│  └──────────────────────────────┬───────────────────────────────────┘      │
│                                 │                                           │
│                                 ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │ 2. SCRIPT GENERATION (Gemini 2.5 Flash)                          │      │
│  │    Input: RAG context + podcast prompt template                  │      │
│  │    Output: Yuki/Alex dialogue (5-15 min of content)              │      │
│  └──────────────────────────────┬───────────────────────────────────┘      │
│                                 │                                           │
│                                 ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │ 3. MULTI-SPEAKER TTS (gemini-2.5-flash-preview-tts)              │      │
│  │    Yuki → Aoede voice (warm expert)                              │      │
│  │    Alex → Kore voice (curious learner)                           │      │
│  │    Output: WAV audio stream                                      │      │
│  └──────────────────────────────┬───────────────────────────────────┘      │
│                                 │                                           │
│                                 ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │ 4. FEEDBACK LOOP (Optional)                                       │      │
│  │    Transcribe generated audio → Add to RAG store                 │      │
│  │    Future queries can reference past episodes!                   │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### API Route: Generate Podcast

```typescript
// src/app/api/podcast/generate/route.ts

import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY! });
const STORE_NAME = process.env.GEMINI_FILE_SEARCH_STORE!;

// Available Gemini TTS voices
const VOICES = {
  yuki: 'Aoede',   // Warm, knowledgeable female voice
  alex: 'Kore',    // Curious, engaged voice
  // Other options: Puck, Charon, Fenrir
};

export interface PodcastRequest {
  topic: string;
  duration: '3min' | '5min' | '10min' | '15min';
  style: 'educational' | 'conversational' | 'deep-dive';
  includeProducts?: boolean;  // Mention specific Tippsy products
}

export interface PodcastResponse {
  audioUrl: string;
  script: string;
  duration: number;
  sources: string[];
}

export async function POST(request: NextRequest) {
  const { topic, duration, style, includeProducts } = await request.json() as PodcastRequest;

  // ============================================
  // STEP 1: RAG RETRIEVAL
  // ============================================
  console.log('📚 Step 1: Retrieving knowledge from RAG...');
  
  // Build search queries based on topic
  const searchQueries = generateSearchQueries(topic);
  
  // Query File Search for relevant content
  const ragResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Provide comprehensive information about: ${topic}
    
Focus on:
- Historical context and cultural significance
- Technical details and characteristics
- Practical tips and recommendations
- Interesting stories or anecdotes
${includeProducts ? '- Specific product recommendations from Tippsy' : ''}`,
    config: {
      tools: [{
        fileSearch: {
          fileSearchStoreNames: [STORE_NAME]
        }
      }]
    }
  });

  const ragContent = ragResponse.text || '';
  const sources = ragResponse.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(
    chunk => chunk.retrievedContext?.title
  ).filter(Boolean) || [];

  console.log(`   ✓ Retrieved content from ${sources.length} sources`);

  // ============================================
  // STEP 2: SCRIPT GENERATION
  // ============================================
  console.log('📝 Step 2: Generating podcast script...');

  const targetWordCount = {
    '3min': 450,
    '5min': 750,
    '10min': 1500,
    '15min': 2250
  }[duration];

  const scriptPrompt = buildScriptPrompt(topic, ragContent, style, targetWordCount, sources);
  
  const scriptResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: scriptPrompt,
    config: {
      temperature: 0.8,  // Creative but coherent
      maxOutputTokens: 8000
    }
  });

  const script = scriptResponse.text || '';
  console.log(`   ✓ Generated ${script.split(' ').length} word script`);

  // ============================================
  // STEP 3: MULTI-SPEAKER TTS
  // ============================================
  console.log('🎙️ Step 3: Generating audio with multi-speaker TTS...');

  const ttsResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: [{
      parts: [{ text: `TTS the following podcast conversation between Yuki and Alex:\n\n${script}` }]
    }],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: [
            {
              speaker: 'Yuki',
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: VOICES.yuki }
              }
            },
            {
              speaker: 'Alex',
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: VOICES.alex }
              }
            }
          ]
        }
      }
    }
  });

  // Extract audio data
  const audioData = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  
  if (!audioData) {
    throw new Error('Failed to generate audio');
  }

  // Save audio file
  const audioBuffer = Buffer.from(audioData, 'base64');
  const filename = `podcast-${Date.now()}.wav`;
  const filepath = path.join(process.cwd(), 'public', 'podcasts', filename);
  
  // Ensure directory exists
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  
  // Write PCM data and convert to WAV
  await saveAsWav(filepath, audioBuffer);

  console.log(`   ✓ Audio saved to ${filename}`);

  return NextResponse.json({
    audioUrl: `/podcasts/${filename}`,
    script,
    duration: estimateDuration(script),
    sources: sources as string[]
  } as PodcastResponse);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateSearchQueries(topic: string): string[] {
  const baseTopic = topic.toLowerCase();
  const queries = [topic];
  
  // Add related queries based on topic keywords
  if (baseTopic.includes('region') || baseTopic.includes('niigata') || baseTopic.includes('hiroshima')) {
    queries.push(`${topic} water source climate style`);
    queries.push(`${topic} famous breweries`);
  }
  if (baseTopic.includes('food') || baseTopic.includes('pair')) {
    queries.push(`sake food pairing principles umami`);
    queries.push(`sake temperature food matching`);
  }
  if (baseTopic.includes('brewing') || baseTopic.includes('how')) {
    queries.push(`sake brewing process koji fermentation`);
    queries.push(`rice polishing milling ratio`);
  }
  
  return queries;
}

function buildScriptPrompt(
  topic: string, 
  ragContent: string, 
  style: string, 
  wordCount: number,
  sources: string[]
): string {
  const styleInstructions = {
    educational: `Focus on teaching. Yuki explains concepts clearly with examples. Alex asks clarifying questions.`,
    conversational: `Keep it light and fun. Include personal anecdotes and humor. Less formal, more like friends chatting.`,
    'deep-dive': `Go technical. Yuki provides expert-level detail. Alex pushes for deeper understanding. Include specific data.`
  }[style];

  return `You are writing a podcast script for "Sakéverse Radio" - a show about Japanese sake.

HOSTS:
- Yuki: A warm, knowledgeable sake sommelier. Uses Japanese terms with explanations. Enthusiastic but not over-the-top.
- Alex: A curious sake enthusiast learning from Yuki. Asks great questions. Represents the listener's perspective.

TOPIC: ${topic}

STYLE: ${styleInstructions}

TARGET LENGTH: Approximately ${wordCount} words (${wordCount / 150} minutes of audio)

KNOWLEDGE BASE (use this as your source material):
${ragContent}

SOURCES TO CITE NATURALLY IN CONVERSATION:
${sources.join(', ')}

FORMAT YOUR SCRIPT EXACTLY LIKE THIS:
Yuki: [dialogue]
Alex: [dialogue]
Yuki: [dialogue]
...

GUIDELINES:
1. Start with a warm welcome and topic introduction
2. Build from basics to more advanced concepts
3. Include at least one "aha moment" for listeners
4. Use Japanese terms with immediate English explanations (e.g., "tanrei karakuchi - that means light and dry")
5. Reference specific sake products when relevant
6. End with a practical takeaway or recommendation
7. Keep exchanges natural - not too long, not too short
8. Include occasional [laughs], [pause], or [enthusiastically] cues for natural delivery

DO NOT:
- Start with "Welcome to another episode" (vary the openings)
- Include music cues or sound effect notes
- Make it feel scripted - keep it conversational
- Go over the target word count significantly

Now write the complete podcast script:`;
}

function estimateDuration(script: string): number {
  // Average speaking rate: ~150 words per minute
  const wordCount = script.split(/\s+/).length;
  return Math.round(wordCount / 150);
}

async function saveAsWav(filepath: string, pcmBuffer: Buffer): Promise<void> {
  // WAV header for 24kHz, 16-bit, mono PCM
  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmBuffer.length;
  const fileSize = 36 + dataSize;

  const header = Buffer.alloc(44);
  
  // RIFF header
  header.write('RIFF', 0);
  header.writeUInt32LE(fileSize, 4);
  header.write('WAVE', 8);
  
  // fmt chunk
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);        // Subchunk1Size
  header.writeUInt16LE(1, 20);         // AudioFormat (PCM)
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  
  // data chunk
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  const wavBuffer = Buffer.concat([header, pcmBuffer]);
  fs.writeFileSync(filepath, wavBuffer);
}
```

### React Component: Podcast Generator UI

```tsx
// src/components/podcast/PodcastGenerator.tsx

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Play, Pause, Download, Loader2, Sparkles } from 'lucide-react';

interface PodcastGeneratorProps {
  onGenerated?: (audioUrl: string) => void;
}

export function PodcastGenerator({ onGenerated }: PodcastGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState<'3min' | '5min' | '10min' | '15min'>('5min');
  const [style, setStyle] = useState<'educational' | 'conversational' | 'deep-dive'>('conversational');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPodcast, setGeneratedPodcast] = useState<{
    audioUrl: string;
    script: string;
    duration: number;
    sources: string[];
  } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const suggestedTopics = [
    "The art of sake and sushi pairing",
    "Niigata: Japan's snow country sake",
    "Understanding sake grades: Junmai to Daiginjo",
    "The magic of koji: sake's secret ingredient",
    "Warm vs cold: sake temperature mastery",
    "Women in sake: breaking the toji tradition"
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/podcast/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          duration,
          style,
          includeProducts: true
        })
      });

      if (!response.ok) throw new Error('Generation failed');
      
      const result = await response.json();
      setGeneratedPodcast(result);
      onGenerated?.(result.audioUrl);
      
      // Create audio element
      const audio = new Audio(result.audioUrl);
      setAudioElement(audio);
      
    } catch (error) {
      console.error('Podcast generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayback = () => {
    if (!audioElement) return;
    
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-500/20 rounded-lg">
          <Mic className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Podcast Generator</h2>
          <p className="text-gray-400 text-sm">Create AI-powered sake episodes</p>
        </div>
      </div>

      {/* Topic Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Episode Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., The art of sake and sushi pairing"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 
                       text-white placeholder-gray-500 focus:border-amber-500 
                       focus:ring-1 focus:ring-amber-500 outline-none"
          />
        </div>

        {/* Suggested Topics */}
        <div className="flex flex-wrap gap-2">
          {suggestedTopics.slice(0, 3).map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setTopic(suggestion)}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 
                         px-3 py-1.5 rounded-full transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Duration & Style */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value as any)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5
                         text-white focus:border-amber-500 outline-none"
            >
              <option value="3min">~3 minutes</option>
              <option value="5min">~5 minutes</option>
              <option value="10min">~10 minutes</option>
              <option value="15min">~15 minutes</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Style</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as any)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5
                         text-white focus:border-amber-500 outline-none"
            >
              <option value="conversational">Conversational</option>
              <option value="educational">Educational</option>
              <option value="deep-dive">Deep Dive</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!topic.trim() || isGenerating}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 
                     hover:from-amber-600 hover:to-orange-600 disabled:opacity-50
                     text-white font-semibold py-3 rounded-lg transition-all
                     flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Episode...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Podcast
            </>
          )}
        </button>
      </div>

      {/* Generated Podcast Player */}
      <AnimatePresence>
        {generatedPodcast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-medium">{topic}</h3>
                <p className="text-gray-400 text-sm">
                  ~{generatedPodcast.duration} min • {generatedPodcast.sources.length} sources
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlayback}
                  className="p-3 bg-amber-500 hover:bg-amber-600 rounded-full transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white" />
                  )}
                </button>
                <a
                  href={generatedPodcast.audioUrl}
                  download
                  className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                >
                  <Download className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>

            {/* Sources */}
            <div className="text-xs text-gray-500">
              <span className="text-gray-400">Sources: </span>
              {generatedPodcast.sources.join(', ')}
            </div>

            {/* Script Preview (collapsible) */}
            <details className="mt-4">
              <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
                View Script
              </summary>
              <pre className="mt-2 p-3 bg-gray-900 rounded-lg text-xs text-gray-300 
                             overflow-auto max-h-60 whitespace-pre-wrap">
                {generatedPodcast.script}
              </pre>
            </details>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### Integration: Voice Agent Can Trigger Podcast Generation

```typescript
// Add to voice agent tools
{
  type: 'function',
  name: 'generate_podcast_episode',
  description: `Generate a custom podcast episode about a sake topic.
Use when users say things like:
- "Can you make me a podcast about..."
- "I'd love to listen to an episode about..."
- "Generate audio content about..."`,
  parameters: {
    type: 'object',
    properties: {
      topic: {
        type: 'string',
        description: 'The topic for the podcast episode'
      },
      duration: {
        type: 'string',
        enum: ['3min', '5min', '10min', '15min'],
        description: 'Target duration'
      }
    },
    required: ['topic']
  }
}
```

### Feedback Loop: Add Generated Podcasts Back to RAG

```typescript
// scripts/add-podcast-to-rag.ts

import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import * as fs from 'fs';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY! });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const STORE_NAME = process.env.GEMINI_FILE_SEARCH_STORE!;

async function addPodcastToRAG(
  audioPath: string,
  episodeTitle: string,
  episodeTopic: string
) {
  console.log('🎙️ Processing podcast for RAG...');

  // 1. Transcribe with Whisper
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: 'whisper-1',
    response_format: 'text'
  });

  // 2. Format for RAG
  const ragDocument = `
SAKÉVERSE PODCAST EPISODE
Title: ${episodeTitle}
Topic: ${episodeTopic}
Generated: ${new Date().toISOString()}

TRANSCRIPT:
${transcription}
`.trim();

  // 3. Save as text file
  const transcriptPath = audioPath.replace('.wav', '.txt');
  fs.writeFileSync(transcriptPath, ragDocument);

  // 4. Upload to File Search Store
  let operation = await ai.fileSearchStores.uploadToFileSearchStore({
    file: transcriptPath,
    fileSearchStoreName: STORE_NAME,
    config: {
      displayName: `Podcast: ${episodeTitle}`,
      customMetadata: [
        { key: 'source', stringValue: 'generated_podcast' },
        { key: 'type', stringValue: 'transcript' },
        { key: 'topic', stringValue: episodeTopic }
      ]
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    operation = await ai.operations.get({ operation });
  }

  console.log('✓ Podcast added to RAG knowledge base');
  
  // Now future queries can reference this episode!
  // e.g., "What did we discuss about Niigata in the last episode?"
}
```

### Gemini TTS Available Voices

| Voice | Character | Best For |
|-------|-----------|----------|
| **Aoede** | Warm, knowledgeable | Yuki (expert host) |
| **Kore** | Curious, engaged | Alex (learner host) |
| **Puck** | Energetic, youthful | Younger demographic |
| **Charon** | Deep, authoritative | Serious deep-dives |
| **Fenrir** | Dynamic, expressive | Storytelling episodes |

### Kiro Spec: Podcast Generation

```markdown
// .kiro/specs/podcast-generation.md

# Podcast Generation Specification

## Overview
Generate on-demand multi-host podcast episodes using RAG for content
and Gemini TTS for audio synthesis.

## Functional Requirements

### FR1: Topic-Based Generation
- Accept free-form topic input
- Query RAG for relevant content
- Generate coherent 2-host dialogue script

### FR2: Multi-Speaker TTS
- Use Gemini 2.5 Flash TTS (gemini-2.5-flash-preview-tts)
- Configure distinct voices for each host
- Output high-quality WAV audio

### FR3: Duration Control
- Support 3/5/10/15 minute targets
- Adjust script word count accordingly
- Maintain natural pacing

### FR4: Style Variations
- Educational: Teaching-focused with clear explanations
- Conversational: Light, fun, friend-to-friend
- Deep-dive: Technical, detailed, expert-level

### FR5: Feedback Loop
- Optionally transcribe generated episodes
- Add transcripts back to RAG store
- Enable queries about past episodes

## Non-Functional Requirements

### NFR1: Generation Time
- < 60 seconds for 5-minute episode
- Stream audio when possible

### NFR2: Audio Quality
- 24kHz sample rate
- Clear voice distinction between hosts
- Natural conversation flow

## Acceptance Criteria

### AC1: Basic Generation
- [ ] Generate 5-minute episode on "sake basics"
- [ ] Audio plays correctly
- [ ] Both hosts clearly distinguishable

### AC2: RAG Integration
- [ ] Generated content reflects uploaded PDFs
- [ ] Citations from knowledge base appear in script

### AC3: Voice Quality
- [ ] Natural-sounding dialogue
- [ ] Appropriate emotional cues
- [ ] Correct pronunciation of Japanese terms
```

## Cost Analysis

| Component | Cost | Notes |
|-----------|------|-------|
| Initial Indexing | ~$0.15 / 1M tokens | One-time per document |
| Storage | FREE | Gemini File Search stores |
| Query-time Embeddings | FREE | No per-query embedding cost |
| Gemini API (responses) | Standard rates | ~$0.075 / 1M input tokens |
| Whisper Transcription | ~$0.006 / min | One-time for podcasts |
| **Gemini TTS** | ~$0.10 / 1M chars | For podcast audio generation |

**Example Costs**:
- Indexing 10 sake books (avg 50K tokens each) = 500K tokens = ~$0.08 total
- Generating 5-minute podcast (~750 words) = ~4K chars = ~$0.0004

---

## 🎧 The Sakéverse Podcast Network

**AI-generated, personalized podcast episodes about sake—updated weekly with fresh content.**

Think NotebookLM-style dual-host format, but specifically for sake culture. This is a **backend-only system** driven by cron jobs—users consume podcasts, they don't trigger generation.

### Podcast Shows (4 Formats)

| Show | Duration | Schedule | Description |
|------|----------|----------|-------------|
| **Sake Stories** | 10-15 min | Weekly (Mon) | Deep dives into specific breweries, their history, flagship sakes |
| **Pairing Lab** | 5-8 min | Weekly (Wed) | Unexpected sake + food combinations |
| **The Bridge** | 8-12 min | Weekly (Fri) | For wine lovers transitioning to sake |
| **Brewing Secrets** | 10-15 min | Bi-weekly | Technical deep dives into brewing methods |

### Data Sources Integration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SAKÉVERSE PODCAST GENERATION PIPELINE                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CRON TRIGGERS (Backend Only - Users Never Trigger)                         │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  • Monday 6am:    "Sake Stories" - Featured brewery episode        │    │
│  │  • Wednesday 6am: "Pairing Lab" - Food pairing episode             │    │
│  │  • Friday 6am:    "The Bridge" - Wine→Sake episode                 │    │
│  │  • 1st/15th 6am:  "Brewing Secrets" - Technical deep dive          │    │
│  └───────────────────────────────┬────────────────────────────────────┘    │
│                                  │                                          │
│  MULTI-SOURCE RESEARCH           ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │   │
│  │  │ GEMINI RAG   │  │   TIPPSY     │  │  PERPLEXITY  │  │ FIRECRAWL│ │   │
│  │  │ (Your PDFs)  │  │  (Convex)    │  │  (Current)   │  │ (Live)   │ │   │
│  │  │              │  │              │  │              │  │          │ │   │
│  │  │ • Sake books │  │ • Products   │  │ • News       │  │ • Brewery│ │   │
│  │  │ • History    │  │ • Prices     │  │ • Awards     │  │   sites  │ │   │
│  │  │ • Brewing    │  │ • Inventory  │  │ • Trends     │  │ • Current│ │   │
│  │  │ • Regions    │  │ • Reviews    │  │ • Events     │  │   info   │ │   │
│  │  │ • Culture    │  │ • User prefs │  │ • Interviews │  │          │ │   │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └────┬─────┘ │   │
│  │         │                 │                 │                │       │   │
│  │         └─────────────────┴─────────────────┴────────────────┘       │   │
│  │                                  │                                    │   │
│  │                    Combined Research Context                          │   │
│  └──────────────────────────────────┼────────────────────────────────────┘   │
│                                     │                                        │
│  SCRIPT GENERATION                  ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    GEMINI 2.5 PRO (Script Writer)                    │    │
│  │                                                                      │    │
│  │  Hosts:                                                              │    │
│  │  • YUKI - Sake sommelier (warm, uses Japanese terms naturally)      │    │
│  │  • KEN - Wine lover learning sake (asks great questions)            │    │
│  │                                                                      │    │
│  │  Example Output:                                                     │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │ Yuki: So this week we're heading to Niigata, the Snow       │    │    │
│  │  │       Country, to talk about Kubota.                        │    │    │
│  │  │                                                             │    │    │
│  │  │ Ken: I love Kubota! But I didn't know until recently that   │    │    │
│  │  │      their parent company, Asahi Shuzo—not the beer         │    │    │
│  │  │      company—they almost shut down in the 1980s.            │    │    │
│  │  │                                                             │    │    │
│  │  │ Yuki: Right! And the turnaround story is incredible. They   │    │    │
│  │  │       basically reinvented what Niigata sake could be...    │    │    │
│  │  └─────────────────────────────────────────────────────────────┘    │    │
│  └───────────────────────────────┬──────────────────────────────────────┘    │
│                                  │                                           │
│  AUDIO GENERATION                ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │               GEMINI 2.5 TTS (Multi-Speaker)                         │    │
│  │                                                                      │    │
│  │  • Yuki → "Aoede" voice (warm, knowledgeable)                       │    │
│  │  • Ken  → "Puck" voice (curious, enthusiastic)                      │    │
│  │  • Natural conversation flow with emotional expression              │    │
│  │  • Context-aware pacing                                              │    │
│  │                                                                      │    │
│  │  Output: WAV → MP3 for distribution                                 │    │
│  └───────────────────────────────┬──────────────────────────────────────┘    │
│                                  │                                           │
│  STORAGE & DELIVERY              ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  • Convex File Storage (podcasts)                                   │    │
│  │  • useQuery(api.podcasts.list) serves episodes                      │    │
│  │  • PodcastFeed component with realtime updates                      │    │
│  │  • Optional: RSS feed for Apple Podcasts/Spotify                    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Example Episode Scripts

**Sake Stories: "Kubota - The Niigata Renaissance"**
```
Yuki: So this week we're heading to Niigata, the Snow Country, to talk about Kubota.

Ken: I love Kubota! But I didn't know until recently that their parent company, 
     Asahi Shuzo—not the beer company—they almost shut down in the 1980s.

Yuki: Right! And the turnaround story is incredible. They basically reinvented 
      what Niigata sake could be. You know that tanrei karakuchi style?

Ken: That light and dry character? 

Yuki: Exactly. Kubota Manju—which is available on Tippsy for around $45—that's 
      basically the perfect expression of it. Clean, elegant, just beautiful.
```

**Pairing Lab: "Korean BBQ and Sake—Why It Works"**
```
Ken: Okay, so Korean BBQ. Spicy, fatty, grilled meat. Why does sake work here?

Yuki: It's all about the amino acids, Ken! Both sake and Korean cuisine are 
      umami powerhouses. They amplify each other rather than compete.

Ken: So what should I bring to KBBQ night?

Yuki: Junmai—something with a little body. Check out Hakkaisan Tokubetsu 
      on Tippsy, around $32. The slight sweetness handles the gochujang perfectly.
```

**The Bridge: "From Burgundy to Niigata—A Pinot Lover's Guide"**
```
Ken: Alright, so I'm a total Pinot Noir person. Light, earthy, elegant. 
     What's my sake equivalent?

Yuki: Oh, you're going to love this. Niigata sakes! Same philosophy—it's all 
      about restraint and elegance rather than power.

Ken: So the "Burgundy of Japan"?

Yuki: Exactly how some people describe it! Try Koshi no Kanbai—if you appreciate 
      the minerality in Burgundy, the snow-melt water in Niigata sake will feel familiar.
```

**Brewing Secrets: "Kimoto—The Old Way That's New Again"**
```
Yuki: Today we're going deep into kimoto, the traditional brewing method that's 
      making a comeback.

Ken: This is the one with the wooden poles, right? The "ramming the moto" thing?

Yuki: Ha! Yes, it's quite physical. But here's the science—by not adding lactic acid 
      and letting wild bacteria do the work, you get this incredible depth and complexity.

Ken: So it's like natural wine but for sake?

Yuki: Great analogy! Same philosophy—trust the process, accept some variation, 
      and the result has character you just can't get otherwise.
```

### Podcast Generator Service

> **Note**: The podcast generation system is now implemented as Convex Actions with built-in scheduling. See **Section 3: Convex + Clerk Backend** for the complete implementation including:
> - `convex/actions/podcasts.ts` - Research gathering, script generation, TTS audio
> - `convex/crons.ts` - Scheduled show generation (Sake Stories, Pairing Lab, The Bridge, Brewing Secrets)
> - `convex/podcasts.ts` - Queries and mutations for episode management
> - Convex File Storage for audio files

Below is a simplified overview of the podcast generation flow:

```typescript
// convex/actions/podcasts.ts (overview - see Section 3 for full code)

import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { GoogleGenAI } from "@google/genai";

// Podcast Show Types
export type PodcastShow = "sake-stories" | "pairing-lab" | "the-bridge" | "brewing-secrets";

// Show configurations
const SHOW_CONFIG = {
  "sake-stories": {
    name: "Sake Stories",
    duration: "10-15 minutes (~1500-2200 words)",
    style: `Deep dive into a specific brewery. Cover history, founding story, 
            signature style, flagship sakes, recent developments.`,
    dataSources: ["rag", "convex", "perplexity", "firecrawl"],
  },
  "pairing-lab": {
    name: "Pairing Lab",
    duration: "5-8 minutes (~700-1200 words)",
    style: `Explore unexpected food and sake pairings. Be practical and fun.
            Give specific sake recommendations with prices.`,
    dataSources: ["rag", "convex", "perplexity"],
  },
  "the-bridge": {
    name: "The Bridge",
    duration: "8-12 minutes (~1200-1800 words)",
    style: `Help wine lovers understand sake through familiar concepts.
            "If you like X wine, try Y sake because..."`,
    dataSources: ["rag", "convex"],
  },
  "brewing-secrets": {
    name: "Brewing Secrets",
    duration: "10-15 minutes (~1500-2200 words)",
    style: `Technical deep dive into brewing methods. Make complex topics
            accessible with "why" questions and scientific explanations.`,
    dataSources: ["rag", "perplexity"],
  },
};

// Host personas for Gemini TTS
const HOSTS = {
  yuki: {
    name: "Yuki",
    voice: "Aoede",
    persona: `Certified sake sommelier with 15 years experience. Speaks warmly,
              uses Japanese terms naturally. Knowledgeable but never condescending.`,
  },
  ken: {
    name: "Ken",
    voice: "Puck",
    persona: `Wine enthusiast learning sake. Asks insightful questions.
              Relatable for newcomers. Makes connections to wine concepts.`,
  },
};

// Main generation action (simplified)
export const generatePodcastEpisode = internalAction({
  args: {
    show: v.union(
      v.literal("sake-stories"),
      v.literal("pairing-lab"),
      v.literal("the-bridge"),
      v.literal("brewing-secrets")
    ),
    topic: v.string(),
  },
  handler: async (ctx, { show, topic }) => {
    // 1. Gather research from multiple sources
    const research = await gatherResearch(ctx, show, topic);
    
    // 2. Generate conversational script with Gemini
    const script = await generateScript(show, topic, research);
    
    // 3. Generate multi-speaker audio with Gemini TTS
    const audioBuffer = await generateAudio(script);
    
    // 4. Store in Convex file storage
    const audioStorageId = await ctx.storage.store(
      new Blob([audioBuffer], { type: "audio/mp3" })
    );
    
    // 5. Save podcast metadata
    await ctx.runMutation(internal.podcasts.createPodcast, {
      show,
      showName: SHOW_CONFIG[show].name,
      title: `${SHOW_CONFIG[show].name}: ${topic}`,
      topic,
      audioStorageId,
      sources: research.sources,
    });
    
    return { success: true };
  },
});

// Research gathering (queries all 4 data sources)
async function gatherResearch(ctx: any, show: PodcastShow, topic: string) {
  const sources: string[] = [];
  let content = "";
  
  // 1. Gemini RAG (File Search) - authoritative knowledge
  const ragResult = await queryGeminiRAG(topic);
  if (ragResult) {
    content += `\n## Expert Knowledge:\n${ragResult}`;
    sources.push("RAG");
  }
  
  // 2. Convex DB - product data with prices
  const sakes = await ctx.runQuery(internal.sakes.searchSakes, {
    query: topic,
    limit: 5,
  });
  if (sakes.length > 0) {
    content += `\n## Featured Sakes:\n`;
    sakes.forEach((s: any) => {
      content += `- ${s.name} by ${s.brewery} ($${s.price}): ${s.tastingNotes}\n`;
    });
    sources.push("Convex");
  }
  
  // 3. Perplexity - current news and trends
  const news = await queryPerplexity(topic);
  if (news) {
    content += `\n## Current News:\n${news}`;
    sources.push("Perplexity");
  }
  
  // 4. Firecrawl - live brewery website data
  if (show === "sake-stories") {
    const breweryInfo = await scrapeBreweryWebsite(topic);
    if (breweryInfo) {
      content += `\n## Brewery Website:\n${breweryInfo}`;
      sources.push("Firecrawl");
    }
  }
  
  return { content, sources, sakes };
}
```
    persona: `Wine enthusiast learning about sake. Asks questions listeners are
thinking. Curious, enthusiastic, admits when confused. Often relates sake
concepts to wine. Represents the audience's perspective.`
  }
};

export interface PodcastResult {
  id: string;
  show: PodcastShow;
  title: string;
  description: string;
  duration: number;
  audioUrl: string;
  transcript: string;
  featuredSakes: any[];
  sources: string[];
  createdAt: string;
}

// ============================================
// MAIN GENERATOR
// ============================================

export async function generatePodcast(config: PodcastConfig): Promise<PodcastResult> {
  const showConfig = SHOW_CONFIG[config.show];
  console.log(`🎙️ Generating ${showConfig.name}: ${config.topic}`);
  
  // Step 1: Gather research from all configured data sources
  const research = await gatherResearch(config, showConfig.dataSources);
  
  // Step 2: Generate script
  const script = await generateScript(config, showConfig, research);
  
  // Step 3: Generate multi-speaker audio
  const audioBuffer = await generateAudio(script);
  
  // Step 4: Store and return
  return await storePodcast(config, showConfig, script, audioBuffer, research);
}

// ============================================
// RESEARCH PHASE - All 4 Data Sources
// ============================================

async function gatherResearch(
  config: PodcastConfig, 
  dataSources: string[]
): Promise<any> {
  console.log(`📚 Gathering from: ${dataSources.join(', ')}`);
  
  const research: any = {
    rag: null,
    ragCitations: [],
    tippsy: [],
    perplexity: null,
    firecrawl: null,
    sources: []
  };

  // 1. GEMINI RAG (Your sake PDFs/books)
  if (dataSources.includes('rag')) {
    console.log('  → Querying Gemini File Search (sake books)...');
    
    const ragQuery = buildRagQuery(config);
    const ragResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: ragQuery,
      config: {
        tools: [{
          fileSearch: {
            fileSearchStoreNames: [RAG_STORE]
          }
        }]
      }
    });
    
    research.rag = ragResponse.text;
    research.ragCitations = ragResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    research.sources.push('Sake Books & Guides (RAG)');
  }

  // 2. TIPPSY DATABASE (Supabase - products, prices, inventory)
  if (dataSources.includes('tippsy')) {
    console.log('  → Querying Tippsy database...');
    
    let query = supabase.from('sakes').select('*');
    
    if (config.featuredSakeIds?.length) {
      query = query.in('id', config.featuredSakeIds);
    } else if (config.featuredBrewery) {
      query = query.ilike('brewery', `%${config.featuredBrewery}%`);
    } else if (config.topic) {
      // Search by topic in multiple fields
      query = query.or(
        `region.ilike.%${config.topic}%,` +
        `grade.ilike.%${config.topic}%,` +
        `tasting_notes.ilike.%${config.topic}%,` +
        `brewery.ilike.%${config.topic}%`
      );
    }
    
    const { data: sakes } = await query.limit(5);
    research.tippsy = sakes || [];
    
    if (research.tippsy.length > 0) {
      research.sources.push('Tippsy Product Database');
    }
  }

  // 3. PERPLEXITY (Current news, awards, trends)
  if (dataSources.includes('perplexity')) {
    console.log('  → Querying Perplexity for current info...');
    
    const perplexityQuery = buildPerplexityQuery(config);
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [{
          role: 'user',
          content: perplexityQuery
        }]
      })
    });
    
    const data = await response.json();
    research.perplexity = data.choices[0].message.content;
    research.sources.push('Perplexity (Current News)');
  }

  // 4. FIRECRAWL (Live brewery website data)
  if (dataSources.includes('firecrawl') && config.featuredBrewery) {
    console.log('  → Scraping brewery website via Firecrawl...');
    
    try {
      // Search for brewery official site
      const searchQuery = `${config.featuredBrewery} sake brewery official site`;
      const searchResult = await firecrawl.search(searchQuery, { limit: 1 });
      
      if (searchResult.data?.[0]?.url) {
        const scrapeResult = await firecrawl.scrapeUrl(searchResult.data[0].url, {
          formats: ['markdown']
        });
        
        research.firecrawl = scrapeResult.markdown?.substring(0, 3000); // Limit size
        research.sources.push(`${config.featuredBrewery} Official Website`);
      }
    } catch (error) {
      console.warn('  ⚠️ Firecrawl failed, continuing without live brewery data');
    }
  }

  return research;
}

function buildRagQuery(config: PodcastConfig): string {
  switch (config.show) {
    case 'sake-stories':
      return `Provide detailed information about ${config.featuredBrewery || config.topic}:
- Brewery history and founding story
- Regional characteristics and water source
- Signature brewing style and philosophy
- Notable sakes and their characteristics
- Awards and recognition
- Any interesting anecdotes or stories`;

    case 'pairing-lab':
      return `Provide information about sake and food pairing for ${config.topic}:
- Why this pairing works (flavor science)
- Specific sake styles that complement this cuisine
- Temperature recommendations
- Common mistakes to avoid
- Cultural context if relevant`;

    case 'the-bridge':
      return `Provide information to help wine lovers understand sake:
- For someone who loves ${config.wineStyle || config.topic} wine
- Sake equivalents in terms of body, acidity, flavor profile
- How sake production compares to winemaking
- Regional parallels (Burgundy→Niigata, etc.)
- Tasting vocabulary translation`;

    case 'brewing-secrets':
      return `Provide detailed technical information about ${config.brewingTechnique || config.topic}:
- Historical background of this technique
- Step-by-step process explanation
- How it affects the final flavor
- Which breweries are known for this method
- Scientific principles involved
- Common variations`;

    default:
      return `Provide comprehensive information about: ${config.topic}`;
  }
}

function buildPerplexityQuery(config: PodcastConfig): string {
  switch (config.show) {
    case 'sake-stories':
      return `Recent news and developments about ${config.featuredBrewery || config.topic} sake brewery in Japan. 
Include: recent awards, new releases, interviews, expansion news, sustainability initiatives.
Focus on 2024-2025 developments.`;

    case 'pairing-lab':
      return `Current trends in sake and ${config.topic} food pairing.
Include: restaurant trends, chef recommendations, viral pairings, new fusion concepts.`;

    case 'brewing-secrets':
      return `Recent developments and trends in ${config.brewingTechnique || config.topic} sake brewing.
Include: breweries reviving traditional methods, scientific research, awards for this style.`;

    default:
      return `Latest news and trends about ${config.topic} in the sake industry.`;
  }
}

// ============================================
// SCRIPT GENERATION
// ============================================

async function generateScript(
  config: PodcastConfig,
  showConfig: any,
  research: any
): Promise<string> {
  console.log('✍️ Generating conversation script...');
  
  // Format Tippsy products for the script
  const tippsyProducts = research.tippsy.map((sake: any) => `
PRODUCT: ${sake.name} ${sake.name_ja ? `(${sake.name_ja})` : ''}
- Brewery: ${sake.brewery}, ${sake.region}
- Grade: ${sake.grade}
- Price: $${sake.price} on Tippsy
- Tasting: ${sake.tasting_notes}
- Pairs with: ${sake.food_pairings?.join(', ')}
- Serve: ${sake.serving_temperature?.join(', ')}`).join('\n');

  const prompt = `Write a podcast script for "${showConfig.name}" - part of the Sakéverse Podcast Network.

SHOW: ${showConfig.name}
EPISODE TOPIC: ${config.topic}
TARGET DURATION: ${showConfig.duration}
STYLE: ${showConfig.style}

HOSTS:
${HOSTS.yuki.name}: ${HOSTS.yuki.persona}
${HOSTS.ken.name}: ${HOSTS.ken.persona}

=== RESEARCH DATA ===

FROM SAKE BOOKS (RAG):
${research.rag || 'No RAG data available'}

FROM TIPPSY DATABASE (Products to mention):
${tippsyProducts || 'No specific products to feature'}

CURRENT NEWS & TRENDS (Perplexity):
${research.perplexity || 'No current news available'}

BREWERY WEBSITE INFO (Firecrawl):
${research.firecrawl || 'No live website data'}

=== SCRIPT FORMAT ===

Write natural dialogue:
Yuki: [her dialogue]
Ken: [his dialogue]

REQUIREMENTS:
1. Natural, conversational flow (not lecture-style)
2. Ken asks questions listeners would ask
3. Yuki uses Japanese terms WITH explanations
4. MUST mention specific products with "$XX on Tippsy" pricing
5. Include recent news/developments if available
6. End with call-to-action (check out Tippsy, try the pairing, etc.)

Generate the complete podcast script:`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro', // Pro for better creative writing
    contents: prompt
  });
  
  return response.text || '';
}

// ============================================
// AUDIO GENERATION (Gemini TTS)
// ============================================

async function generateAudio(script: string): Promise<Buffer> {
  console.log('🔊 Generating multi-speaker audio...');
  
  const enhancedScript = `
[Voice direction: Natural podcast conversation. 
Yuki speaks warmly with genuine enthusiasm for sake.
Ken is curious and asks good follow-up questions.
Both should sound like friends having a real conversation.]

${script}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: [{ parts: [{ text: enhancedScript }] }],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: [
            {
              speaker: 'Yuki',
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Aoede' }
              }
            },
            {
              speaker: 'Ken',
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Puck' }
              }
            }
          ]
        }
      }
    }
  });

  const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!audioData) throw new Error('No audio in TTS response');
  
  return Buffer.from(audioData, 'base64');
}

// ============================================
// STORAGE
// ============================================

async function storePodcast(
  config: PodcastConfig,
  showConfig: any,
  script: string,
  audioBuffer: Buffer,
  research: any
): Promise<PodcastResult> {
  console.log('💾 Storing podcast...');
  
  const id = `${config.show}_${Date.now()}`;
  const filename = `${id}.wav`;
  
  await supabase.storage
    .from('podcasts')
    .upload(filename, audioBuffer, { contentType: 'audio/wav' });
  
  const { data: urlData } = supabase.storage.from('podcasts').getPublicUrl(filename);
  
  const durationSeconds = Math.round(audioBuffer.length / 48000);
  
  // Generate title/description
  const metaResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Generate podcast metadata:
SHOW: ${showConfig.name}
TOPIC: ${config.topic}

Script excerpt: ${script.substring(0, 1000)}...

Output format:
TITLE: [catchy episode title, no show name prefix]
DESCRIPTION: [2 sentence description]`
  });
  
  const metaText = metaResponse.text || '';
  const title = metaText.match(/TITLE:\s*(.+)/)?.[1] || config.topic;
  const description = metaText.match(/DESCRIPTION:\s*(.+)/)?.[1] || `An episode about ${config.topic}`;
  
  const record = {
    id,
    show: config.show,
    show_name: showConfig.name,
    title,
    description,
    topic: config.topic,
    duration: durationSeconds,
    audio_url: urlData.publicUrl,
    transcript: script,
    featured_sake_ids: research.tippsy.map((s: any) => s.id),
    sources: research.sources,
    created_at: new Date().toISOString()
  };
  
  await supabase.from('podcasts').insert(record);
  
  console.log(`✅ ${showConfig.name}: "${title}" (${Math.floor(durationSeconds/60)}:${(durationSeconds%60).toString().padStart(2,'0')})`);
  
  return {
    id,
    show: config.show,
    title,
    description,
    duration: durationSeconds,
    audioUrl: urlData.publicUrl,
    transcript: script,
    featuredSakes: research.tippsy,
    sources: research.sources,
    createdAt: record.created_at
  };
}
```

### Cron Jobs (4 Scheduled Shows)

```typescript
// src/app/api/cron/podcasts/route.ts
// Vercel cron configuration in vercel.json

import { NextRequest, NextResponse } from 'next/server';
import { generatePodcast, PodcastShow } from '@/lib/podcast/generator';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Topic rotation for variety
const SAKE_STORIES_BREWERIES = [
  'Kubota', 'Dassai', 'Hakkaisan', 'Tedorigawa', 'Juyondai',
  'Isojiman', 'Kokuryu', 'Masumi', 'Koshi no Kanbai', 'Dewazakura'
];

const PAIRING_TOPICS = [
  'Korean BBQ', 'Sushi Omakase', 'Thai Cuisine', 'Italian Pasta',
  'Thanksgiving Dinner', 'BBQ and Grilling', 'Cheese Pairing',
  'Chocolate Desserts', 'Mexican Food', 'Indian Curry'
];

const BRIDGE_TOPICS = [
  { wine: 'Pinot Noir', sake: 'Niigata' },
  { wine: 'Champagne', sake: 'Sparkling Sake' },
  { wine: 'Burgundy', sake: 'Aged Koshu' },
  { wine: 'Riesling', sake: 'Ginjo' },
  { wine: 'Natural Wine', sake: 'Kimoto/Yamahai' }
];

const BREWING_TOPICS = [
  'Kimoto', 'Yamahai', 'Namazake', 'Koshu Aging', 'Muroka',
  'Multiple Parallel Fermentation', 'Rice Polishing', 'Koji'
];

export async function GET(request: NextRequest) {
  // Verify cron secret
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const show = searchParams.get('show') as PodcastShow;

  if (!show) {
    return NextResponse.json({ error: 'Show parameter required' }, { status: 400 });
  }

  try {
    let podcast;

    switch (show) {
      case 'sake-stories': {
        // Pick a brewery we haven't covered recently
        const { data: recent } = await supabase
          .from('podcasts')
          .select('topic')
          .eq('show', 'sake-stories')
          .order('created_at', { ascending: false })
          .limit(5);
        
        const recentTopics = recent?.map(p => p.topic) || [];
        const available = SAKE_STORIES_BREWERIES.filter(b => !recentTopics.includes(b));
        const brewery = available[Math.floor(Math.random() * available.length)] || SAKE_STORIES_BREWERIES[0];
        
        podcast = await generatePodcast({
          show: 'sake-stories',
          topic: brewery,
          featuredBrewery: brewery
        });
        break;
      }

      case 'pairing-lab': {
        const { data: recent } = await supabase
          .from('podcasts')
          .select('topic')
          .eq('show', 'pairing-lab')
          .order('created_at', { ascending: false })
          .limit(5);
        
        const recentTopics = recent?.map(p => p.topic) || [];
        const available = PAIRING_TOPICS.filter(t => !recentTopics.includes(t));
        const pairing = available[Math.floor(Math.random() * available.length)] || PAIRING_TOPICS[0];
        
        podcast = await generatePodcast({
          show: 'pairing-lab',
          topic: pairing,
          featuredPairing: pairing
        });
        break;
      }

      case 'the-bridge': {
        const { data: recent } = await supabase
          .from('podcasts')
          .select('topic')
          .eq('show', 'the-bridge')
          .order('created_at', { ascending: false })
          .limit(3);
        
        const recentTopics = recent?.map(p => p.topic) || [];
        const available = BRIDGE_TOPICS.filter(t => !recentTopics.includes(t.wine));
        const bridge = available[Math.floor(Math.random() * available.length)] || BRIDGE_TOPICS[0];
        
        podcast = await generatePodcast({
          show: 'the-bridge',
          topic: `From ${bridge.wine} to ${bridge.sake}`,
          wineStyle: bridge.wine
        });
        break;
      }

      case 'brewing-secrets': {
        const { data: recent } = await supabase
          .from('podcasts')
          .select('topic')
          .eq('show', 'brewing-secrets')
          .order('created_at', { ascending: false })
          .limit(3);
        
        const recentTopics = recent?.map(p => p.topic) || [];
        const available = BREWING_TOPICS.filter(t => !recentTopics.includes(t));
        const technique = available[Math.floor(Math.random() * available.length)] || BREWING_TOPICS[0];
        
        podcast = await generatePodcast({
          show: 'brewing-secrets',
          topic: technique,
          brewingTechnique: technique
        });
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid show' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      podcast: {
        id: podcast.id,
        show: podcast.show,
        title: podcast.title,
        duration: podcast.duration,
        sources: podcast.sources
      }
    });

  } catch (error) {
    console.error(`Podcast generation failed for ${show}:`, error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
```

### Vercel Cron Configuration

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/podcasts?show=sake-stories",
      "schedule": "0 6 * * 1"
    },
    {
      "path": "/api/cron/podcasts?show=pairing-lab",
      "schedule": "0 6 * * 3"
    },
    {
      "path": "/api/cron/podcasts?show=the-bridge",
      "schedule": "0 6 * * 5"
    },
    {
      "path": "/api/cron/podcasts?show=brewing-secrets",
      "schedule": "0 6 1,15 * *"
    }
  ]
}
```

### Database Schema

```sql
-- Supabase: Podcasts table with show types
create table podcasts (
  id text primary key,
  show text not null check (show in ('sake-stories', 'pairing-lab', 'the-bridge', 'brewing-secrets')),
  show_name text not null,
  title text not null,
  description text,
  topic text,
  duration integer, -- seconds
  audio_url text not null,
  transcript text,
  featured_sake_ids text[],
  sources text[], -- ['RAG', 'Tippsy', 'Perplexity', 'Firecrawl']
  play_count integer default 0,
  created_at timestamptz default now()
);

-- Indexes
create index idx_podcasts_show on podcasts(show);
create index idx_podcasts_created on podcasts(created_at desc);

-- Storage bucket
insert into storage.buckets (id, name, public) values ('podcasts', 'podcasts', true);
```

### Podcast Feed API

```typescript
// src/app/api/podcasts/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const show = searchParams.get('show'); // Optional filter
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');
  
  let query = supabase
    .from('podcasts')
    .select('id, show, show_name, title, description, duration, audio_url, created_at, sources', 
            { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (show) {
    query = query.eq('show', show);
  }
  
  const { data: podcasts, error, count } = await query;
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({
    podcasts,
    total: count,
    shows: ['sake-stories', 'pairing-lab', 'the-bridge', 'brewing-secrets']
  });
}
```

### Personalization (Future Enhancement)

```typescript
// For personalized episode recommendations based on user taste profile
// Called from /api/podcasts/recommended

async function getPersonalizedPodcasts(userId: string) {
  // Get user's taste profile
  const { data: user } = await supabase
    .from('users')
    .select('taste_profile, favorite_sakes, learning_progress')
    .eq('id', userId)
    .single();
  
  if (!user?.taste_profile) {
    // Return latest episodes for new users
    return supabase.from('podcasts').select('*').order('created_at', { ascending: false }).limit(5);
  }
  
  // Match podcasts to user preferences
  const recommendations = [];
  
  // If user likes a specific region, recommend Sake Stories about that region
  if (user.taste_profile.preferred_regions?.includes('Niigata')) {
    const { data } = await supabase
      .from('podcasts')
      .select('*')
      .eq('show', 'sake-stories')
      .ilike('topic', '%Niigata%')
      .limit(2);
    recommendations.push(...(data || []));
  }
  
  // If user is wine-curious, recommend The Bridge episodes
  if (user.taste_profile.wine_background) {
    const { data } = await supabase
      .from('podcasts')
      .select('*')
      .eq('show', 'the-bridge')
      .order('created_at', { ascending: false })
      .limit(2);
    recommendations.push(...(data || []));
  }
  
  // Based on learning progress, recommend Brewing Secrets
  if (user.learning_progress?.level === 'intermediate') {
    const { data } = await supabase
      .from('podcasts')
      .select('*')
      .eq('show', 'brewing-secrets')
      .order('created_at', { ascending: false })
      .limit(2);
    recommendations.push(...(data || []));
  }
  
  return recommendations;
}
```

### Data Source Summary

| Source | What It Provides | Used By |
|--------|------------------|---------|
| **Gemini RAG** | Sake books, history, brewing science, regional info | All shows |
| **Tippsy DB** | Products, prices, tasting notes, "on Tippsy" CTAs | All shows |
| **Perplexity** | Current news, awards, trends, recent developments | Sake Stories, Pairing Lab, Brewing Secrets |
| **Firecrawl** | Live brewery website data, current offerings | Sake Stories |

### Cost Per Episode

| Component | Cost |
|-----------|------|
| Gemini RAG Query | ~$0.01 |
| Tippsy Query | FREE (Supabase) |
| Perplexity Query | ~$0.005 |
| Firecrawl Scrape | ~$0.01 |
| Script (Gemini Pro) | ~$0.05-0.10 |
| TTS Audio (10 min) | ~$0.10-0.15 |
| Storage | ~$0.001 |
| **Total per episode** | **~$0.20-0.30** |

**Weekly cost (4 shows)**: ~$1.00-1.50
  Aoede: 'Warm, knowledgeable female - perfect for expert host',
  Kore: 'Friendly, energetic female - great for casual conversation',
  Puck: 'Curious, youthful male - ideal for learner/interviewer',
  Charon: 'Deep, authoritative male - good for documentary style',
  Fenrir: 'Passionate, expressive male - excellent for enthusiast'
};

// Host Personas
const HOSTS = {
  yuki: {
    name: 'Yuki',
    voice: 'Aoede',
    persona: `Yuki is a certified sake sommelier with 15 years experience.
She speaks warmly and uses Japanese terms naturally, always explaining them.
She loves sharing little-known facts and gets visibly excited about regional styles.
Her speaking style is knowledgeable but never condescending.`
  },
  ken: {
    name: 'Ken', 
    voice: 'Puck',
    persona: `Ken is a wine lover learning about sake. He asks great questions
that listeners are thinking. He's curious, enthusiastic, and not afraid to admit
when he doesn't understand. He often relates sake concepts to wine.`
  }
};

export interface PodcastRequest {
  topic: string;
  style: 'educational' | 'product-feature' | 'news-roundup' | 'deep-dive';
  duration: 'short' | 'medium' | 'long'; // 3-5min, 8-12min, 15-20min
  featuredSakeIds?: string[];
}

export interface PodcastResult {
  id: string;
  title: string;
  description: string;
  duration: number;
  audioUrl: string;
  transcript: string;
  featuredSakes: any[];
  createdAt: string;
}

export async function generatePodcast(request: PodcastRequest): Promise<PodcastResult> {
  console.log(`🎙️ Generating podcast: ${request.topic}`);
  
  // Step 1: Research - gather from all sources
  const research = await gatherResearch(request);
  
  // Step 2: Generate script
  const script = await generateScript(request, research);
  
  // Step 3: Generate multi-speaker audio
  const audioBuffer = await generateAudio(script);
  
  // Step 4: Store and return
  return await storePodcast(request, script, audioBuffer, research);
}

// ============================================
// STEP 1: RESEARCH PHASE
// ============================================

async function gatherResearch(request: PodcastRequest) {
  console.log('📚 Gathering research from all sources...');
  
  const research: any = {
    ragContent: null,
    ragCitations: [],
    featuredSakes: [],
    currentNews: null
  };
  
  // 1. Query RAG (Gemini File Search) for educational content
  const ragResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Provide comprehensive information for a sake podcast about: ${request.topic}
    
Include:
- Key facts and history
- Technical brewing details
- Regional characteristics
- Interesting anecdotes or stories
- Common misconceptions to address
- Japanese terminology with explanations`,
    config: {
      tools: [{
        fileSearch: {
          fileSearchStoreNames: [STORE_NAME]
        }
      }]
    }
  });
  
  research.ragContent = ragResponse.text;
  research.ragCitations = ragResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  // 2. Get products from Tippsy database (Supabase)
  if (request.featuredSakeIds?.length) {
    // Specific sakes requested
    const { data } = await supabase
      .from('sakes')
      .select('*')
      .in('id', request.featuredSakeIds);
    research.featuredSakes = data || [];
  } else {
    // Auto-select relevant sakes based on topic
    const { data } = await supabase
      .from('sakes')
      .select('*')
      .or(`region.ilike.%${request.topic}%,grade.ilike.%${request.topic}%,tasting_notes.ilike.%${request.topic}%`)
      .limit(3);
    research.featuredSakes = data || [];
  }
  
  // 3. Get current news if needed (Perplexity)
  if (request.style === 'news-roundup') {
    const newsResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [{
          role: 'user',
          content: `Latest news and trends in Japanese sake industry. Focus on: new releases, awards, brewery news, and interesting developments.`
        }]
      })
    });
    const newsData = await newsResponse.json();
    research.currentNews = newsData.choices[0].message.content;
  }
  
  return research;
}

// ============================================
// STEP 2: SCRIPT GENERATION
// ============================================

async function generateScript(request: PodcastRequest, research: any): Promise<string> {
  console.log('✍️ Generating conversation script...');
  
  const durationGuide = {
    short: '3-5 minutes (~500-800 words)',
    medium: '8-12 minutes (~1200-1800 words)',
    long: '15-20 minutes (~2500-3500 words)'
  };
  
  const styleGuide = {
    educational: 'Focus on teaching. Yuki explains concepts, Ken asks clarifying questions.',
    'product-feature': 'Highlight specific sakes with tasting notes and pairing suggestions.',
    'news-roundup': 'Cover recent developments, keep it snappy and current.',
    'deep-dive': 'Go deep into one topic with historical context and technical details.'
  };
  
  // Format sake data for script
  const sakeFeatures = research.featuredSakes.map((sake: any) => `
SAKE: ${sake.name} ${sake.name_ja ? `(${sake.name_ja})` : ''}
- Brewery: ${sake.brewery}, ${sake.region}
- Grade: ${sake.grade}
- Price: $${sake.price}
- Tasting: ${sake.tasting_notes}
- Pairs with: ${sake.food_pairings?.join(', ')}
- Serve: ${sake.serving_temperature?.join(', ')}`).join('\n');

  const prompt = `Write a podcast script for "Sake Sessions" about Japanese sake.

HOSTS:
${HOSTS.yuki.name}: ${HOSTS.yuki.persona}
${HOSTS.ken.name}: ${HOSTS.ken.persona}

EPISODE TOPIC: ${request.topic}
STYLE: ${request.style} - ${styleGuide[request.style]}
DURATION: ${durationGuide[request.duration]}

RESEARCH CONTENT (from sake books and guides):
${research.ragContent}

${research.featuredSakes.length > 0 ? `FEATURED SAKES TO DISCUSS:\n${sakeFeatures}` : ''}

${research.currentNews ? `CURRENT NEWS TO MENTION:\n${research.currentNews}` : ''}

SCRIPT FORMAT - Write as natural dialogue:
Yuki: [her dialogue]
Ken: [his dialogue]

REQUIREMENTS:
- Warm, welcoming intro
- Use Japanese terms with brief explanations  
- Include specific examples and personal anecdotes
- If featuring sakes, mention prices and "available on Tippsy"
- Ken asks questions listeners would ask
- Yuki shows genuine enthusiasm for sake
- End with summary and call-to-action

Generate the complete podcast script:`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro', // Pro for better creative writing
    contents: prompt
  });
  
  return response.text || '';
}

// ============================================
// STEP 3: MULTI-SPEAKER TTS AUDIO GENERATION
// ============================================

async function generateAudio(script: string): Promise<Buffer> {
  console.log('🔊 Generating multi-speaker audio with Gemini TTS...');
  
  // Add voice direction for better expression
  const enhancedScript = `
[Voice direction: Casual, friendly podcast conversation.
Yuki: warm and knowledgeable, occasional excitement about sake facts.
Ken: curious and enthusiastic, genuine questions.]

${script}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts', // Fast, affordable
    // model: 'gemini-2.5-pro-preview-tts', // Higher quality option
    contents: [{ 
      parts: [{ text: enhancedScript }] 
    }],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: [
            {
              speaker: 'Yuki',
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'Aoede' // Warm, knowledgeable female
                }
              }
            },
            {
              speaker: 'Ken',
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'Puck' // Curious, youthful male
                }
              }
            }
          ]
        }
      }
    }
  });

  const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!audioData) {
    throw new Error('No audio data in TTS response');
  }
  
  return Buffer.from(audioData, 'base64');
}

// ============================================
// STEP 4: STORAGE
// ============================================

async function storePodcast(
  request: PodcastRequest,
  script: string,
  audioBuffer: Buffer,
  research: any
): Promise<PodcastResult> {
  console.log('💾 Storing podcast...');
  
  const id = `podcast_${Date.now()}`;
  const filename = `${id}.wav`;
  
  // Upload audio to Supabase Storage
  await supabase.storage
    .from('podcasts')
    .upload(filename, audioBuffer, { contentType: 'audio/wav' });
  
  const { data: urlData } = supabase.storage
    .from('podcasts')
    .getPublicUrl(filename);
  
  // Estimate duration (24kHz, 16-bit = ~48KB/sec)
  const durationSeconds = Math.round(audioBuffer.length / 48000);
  
  // Generate title/description
  const metaResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Based on this podcast script, generate:
TITLE: [catchy episode title]
DESCRIPTION: [2 sentence description]

Script excerpt:
${script.substring(0, 1500)}...`
  });
  
  const metaText = metaResponse.text || '';
  const title = metaText.match(/TITLE:\s*(.+)/)?.[1] || `Sake Sessions: ${request.topic}`;
  const description = metaText.match(/DESCRIPTION:\s*(.+)/)?.[1] || `Exploring ${request.topic}`;
  
  // Store metadata
  const record = {
    id,
    title,
    description,
    topic: request.topic,
    style: request.style,
    duration: durationSeconds,
    audio_url: urlData.publicUrl,
    transcript: script,
    featured_sake_ids: research.featuredSakes.map((s: any) => s.id),
    created_at: new Date().toISOString()
  };
  
  await supabase.from('podcasts').insert(record);
  
  console.log(`✅ Podcast ready: ${title} (${Math.floor(durationSeconds/60)}:${(durationSeconds%60).toString().padStart(2,'0')})`);
  
  return {
    id,
    title,
    description,
    duration: durationSeconds,
    audioUrl: urlData.publicUrl,
    transcript: script,
    featuredSakes: research.featuredSakes,
    createdAt: record.created_at
  };
}
```

---

# 10. API SCHEMAS

## Sake Type Definitions

```typescript
// src/types/sake.ts

export interface Sake {
  id: string;
  name: string;
  nameJa?: string;
  
  // Classification
  grade: SakeGrade;
  category: SakeCategory;
  brewingMethod?: 'sokujo' | 'kimoto' | 'yamahai';
  
  // Specs
  polishingRatio?: number;  // Seimaibuai (精米歩合)
  smv?: number;             // Sake Meter Value (日本酒度)
  acidity?: number;
  aminoAcidity?: number;
  alcoholContent?: number;
  
  // Characteristics
  style: TasteStyle;
  isNama?: boolean;         // Unpasteurized
  isGenshu?: boolean;       // Undiluted
  isNigori?: boolean;       // Cloudy
  isSparkling?: boolean;
  isKoshu?: boolean;        // Aged
  
  // Origin
  brewery: Brewery;
  region: string;
  prefecture: string;
  riceVariety?: string;
  waterSource?: string;
  
  // Tasting
  tastingNotes: string;
  aromaNotes: string[];
  flavorNotes: string[];
  finishNotes: string[];
  
  // Serving
  recommendedTemperatures: ServingTemperature[];
  foodPairings: string[];
  
  // Commerce
  price: number;
  volume: string;
  imageUrl: string;
  productUrl: string;
  inStock: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export type SakeGrade = 
  | 'junmai-daiginjo'
  | 'daiginjo'
  | 'junmai-ginjo'
  | 'ginjo'
  | 'tokubetsu-junmai'
  | 'junmai'
  | 'tokubetsu-honjozo'
  | 'honjozo'
  | 'futsushu';

export type SakeCategory = 
  | 'premium'
  | 'ginjo'
  | 'junmai'
  | 'honjozo'
  | 'table'
  | 'specialty';

export type TasteStyle = 
  | 'light-dry'
  | 'light-sweet'
  | 'rich-dry'
  | 'rich-sweet';

export interface Brewery {
  id: string;
  name: string;
  nameJa?: string;
  founded?: number;
  region: string;
  prefecture: string;
  description?: string;
  coordinates?: [number, number];
  website?: string;
  toji?: string;  // Master brewer
}
```

## User Progress Type

```typescript
// src/types/user.ts

export interface UserProgress {
  userId: string;
  
  // Overall stats
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  
  // Regional progress
  unlockedRegions: string[];
  regionMastery: Record<string, number>;  // 0-100
  regionSakesTasted: Record<string, number>;
  
  // Brewery visits (virtual)
  visitedBreweries: string[];
  
  // Tasting log
  tastings: TastingLog[];
  favoriteSakes: string[];
  
  // Learning
  completedCourses: string[];
  courseProgress: Record<string, number>;  // 0-100
  quizScores: Record<string, number>;
  
  // Badges
  earnedBadges: Badge[];
  
  // Preferences
  preferences: {
    favoriteStyles: TasteStyle[];
    favoriteRegions: string[];
    priceRange: { min: number; max: number };
    temperaturePreference: 'cold' | 'room' | 'warm' | 'varies';
  };
  
  // Timestamps
  createdAt: string;
  lastActiveAt: string;
}

export interface TastingLog {
  id: string;
  sakeId: string;
  date: string;
  temperature: ServingTemperature;
  rating: number;  // 1-5
  aromaNotes: string[];
  tasteNotes: string[];
  finishNotes: string[];
  notes?: string;
  food?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  category: 'tasting' | 'learning' | 'regional' | 'special';
}
```

---

# 11. KIRO SPEC FILES

## Voice Sommelier Spec

```markdown
<!-- .kiro/specs/voice-sommelier.md -->

# Voice Sommelier Feature

## Overview
AI-powered voice assistant for sake recommendations using OpenAI Realtime API.
The assistant is named "Yuki" (雪) and acts as a knowledgeable, friendly sake sommelier.

## Requirements

### Functional Requirements
- FR-1: Natural voice conversation about sake
- FR-2: Real-time speech-to-speech interaction
- FR-3: Function calling for sake search, cart management
- FR-4: Context retention across conversation turns
- FR-5: Temperature recommendations
- FR-6: Food pairing suggestions
- FR-7: Wine-to-sake translation
- FR-8: Cart management via voice

### Non-Functional Requirements
- NFR-1: Response latency < 300ms
- NFR-2: Works on mobile browsers (WebRTC)
- NFR-3: Graceful degradation without microphone
- NFR-4: Text fallback for accessibility
- NFR-5: Session timeout after 10 minutes of inactivity

## Acceptance Criteria

### Voice Connection
- [ ] User can initiate voice session with single tap
- [ ] Audio input/output works in Chrome, Safari, Firefox
- [ ] Visual indicator shows when listening
- [ ] Visual indicator shows when assistant is speaking
- [ ] Session persists across page navigation
- [ ] Error states handled gracefully

### Conversation Quality
- [ ] Agent understands sake terminology correctly
- [ ] Pronunciation of Japanese terms is accurate
- [ ] Responses are conversational, not robotic
- [ ] Agent asks clarifying questions when needed
- [ ] Context is maintained across conversation turns
- [ ] Agent uses user's name if known

### Tool Integration
- [ ] search_sake returns relevant results
- [ ] add_to_cart successfully adds to Tippsy cart
- [ ] get_temperature_guide provides accurate recommendations
- [ ] get_food_pairing matches dish characteristics
- [ ] get_region_info returns comprehensive data
- [ ] log_tasting records user's tasting notes

### Edge Cases
- [ ] Handles background noise gracefully
- [ ] Recovers from network interruptions
- [ ] Times out inactive sessions appropriately
- [ ] Handles unknown sake requests gracefully
- [ ] Provides text transcript for reference

## Technical Implementation

### Dependencies
```json
{
  "openai": "^4.70.0",
  "@openai/agents": "^1.0.0"
}
```

### API Configuration
- Model: gpt-realtime
- Voice: coral
- Connection: WebRTC (browser), WebSocket (server)

### Files
- src/lib/openai/realtime.ts - Voice agent configuration
- src/lib/openai/tools.ts - Tool definitions
- src/components/voice/VoiceSommelier.tsx - UI component
```

## Dynamic UI Spec

```markdown
<!-- .kiro/specs/dynamic-ui.md -->

# Dynamic UI Feature (Thesys C1)

## Overview
Generate rich, interactive UI components from LLM responses using Thesys C1 API.
Instead of plain text, the chat generates sake cards, charts, forms, and more.

## Requirements

### Functional Requirements
- FR-1: Generate sake recommendation cards
- FR-2: Generate food pairing visualizations
- FR-3: Generate temperature guide UI
- FR-4: Generate comparison tables
- FR-5: Generate region explorer UI
- FR-6: Generate quiz/learning components
- FR-7: Handle user actions (add to cart, navigate)

### Non-Functional Requirements
- NFR-1: UI renders within 500ms
- NFR-2: Streaming support for progressive rendering
- NFR-3: Consistent dark theme styling
- NFR-4: Responsive on mobile
- NFR-5: Accessibility compliant

## Acceptance Criteria

### UI Generation
- [ ] Sake recommendations display as cards with images
- [ ] Food pairings show flavor analysis
- [ ] Temperature guides show visual thermometer
- [ ] Comparisons render as tables
- [ ] Region info shows mini-map
- [ ] Quizzes are interactive

### Styling
- [ ] Consistent with Sakéverse theme
- [ ] Dark mode only
- [ ] Amber accent color
- [ ] Japanese typography for Japanese text
- [ ] Responsive layout

### Actions
- [ ] "Add to Cart" buttons work
- [ ] "Learn More" navigates correctly
- [ ] Temperature slider updates
- [ ] Quiz submissions are processed
- [ ] Form inputs are captured

## Technical Implementation

### Dependencies
```json
{
  "@thesys/react-sdk": "^1.0.0"
}
```

### API Configuration
- Model: c1-nightly
- Base URL: https://api.thesys.dev/v1

### Files
- src/lib/thesys/client.ts - API client
- src/lib/thesys/prompts.ts - System prompts
- src/lib/thesys/theme.ts - Theme configuration
- src/components/chat/SakeChat.tsx - Chat component
```

## Sake Map Spec

```markdown
<!-- .kiro/specs/sake-map.md -->

# Interactive Sake Region Map

## Overview
Mapbox-powered visualization of Japan's 47 sake-producing prefectures 
with user progress tracking and brewery exploration.

## Requirements

### Functional Requirements
- FR-1: Display Japan with prefecture boundaries
- FR-2: Color-code regions by sake style
- FR-3: Show locked/unlocked state based on progress
- FR-4: Display brewery markers on region select
- FR-5: Show region detail panel
- FR-6: Track user progress visually
- FR-7: Enable 3D pitch view

### Non-Functional Requirements
- NFR-1: Smooth 60fps interactions
- NFR-2: Load within 2 seconds
- NFR-3: Work on mobile with touch
- NFR-4: Offline fallback for map tiles

## Acceptance Criteria

### Map Display
- [ ] Japan prefectures displayed clearly
- [ ] Regions colored by sake style
- [ ] Locked regions appear grayed
- [ ] Hover state shows region name
- [ ] Click selects region
- [ ] 3D pitch creates depth

### Region Panel
- [ ] Shows region name (EN + JP)
- [ ] Displays style badge
- [ ] Shows water source info
- [ ] Lists top breweries
- [ ] Shows mastery progress
- [ ] "Explore" CTA works

### Brewery Markers
- [ ] Appear on region select
- [ ] Popup shows brewery info
- [ ] Visited state tracked
- [ ] Click navigates to detail

## Technical Implementation

### Dependencies
```json
{
  "mapbox-gl": "^3.4.0",
  "react-map-gl": "^7.1.0"
}
```

### Files
- src/data/regions.ts - Region data
- src/components/map/SakeMap.tsx - Main map
- src/components/map/RegionDetailPanel.tsx - Detail panel
- src/components/map/BreweryMarker.tsx - Markers
```

---

# 12. DEMO SCRIPT

## 3-Minute Demo Video Script

```
[0:00-0:15] HOOK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Visual: Wine lover staring at sake menu, confused

Voiceover: "80 million Americans love wine. Most are terrified of 
           sake menus. We fixed that."

[Cut to: Sakéverse logo animation]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[0:15-0:35] THE WINE BRIDGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Visual: User onboarding conversation in Sakéverse

User types: "I love Pinot Noir"

[C1 generates animated response - wine → sake translation card]

Yuki (voice): "Ah, you appreciate elegance over power. That silky 
              texture, the earthy mushroom notes. In sake, you'll 
              love Yamahai styles—try Daishichi. Same forest floor 
              complexity."

[Wine-to-sake comparison chart animates in]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[0:35-1:05] VOICE SOMMELIER IN ACTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Visual: User taps voice button, waveform appears

User (speaking): "I'm making tacos al pastor tonight"

[Voice waveform animates, processing indicator]

Yuki (voice): "Ooh, that's a great pairing challenge! Pork with 
              pineapple—you've got that beautiful sweet-savory 
              thing happening. You need something that can cut 
              through the fat but play with the fruit."

[C1 generates sake pairing cards with images, prices]

Yuki: "I'd go with Hakkaisan Tokubetsu Junmai. Clean enough to 
      refresh your palate, body to stand up to those bold flavors. 
      Serve it at hana-bie—flower cold—about 10 degrees. 
      Want me to add it to your cart?"

User: "Yes, add it"

Yuki: "Done! It's on its way."

[Cart animation, success toast]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1:05-1:30] TEMPERATURE MASTERY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Visual: Temperature guide UI

Voiceover: "Same sake. Completely different experience."

[Interactive thermometer, user drags slider]
[5°C → 40°C, descriptions change dynamically]

Yuki (voice): "At 5 degrees, you get crisp apple. At 40 degrees, 
              it opens up to caramel and rice pudding. That's the 
              magic of sake."

[Temperature experiment badge unlocks]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1:30-1:55] THE MAP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Visual: 3D map of Japan, regions glowing

Voiceover: "Every bottle tells a story. Every region has a style."

[Map zooms to Niigata, blue glow]
[Brewery pins appear, detail panel slides in]

Voiceover: "As you learn and taste, the map comes alive."

[User clicks brewery, more info appears]
[Progress bar fills, region unlocks with celebration]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1:55-2:20] DYNAMIC UI MAGIC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Visual: Chat interface

User types: "Compare Dassai 23 vs Dassai 45"

[C1 generates side-by-side comparison table]
[Taste radar charts appear]
[Price/value analysis]
[Temperature recommendations for each]

["Add Both" button appears]

Voiceover: "Ask anything. Get answers you can see, touch, and buy."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[2:20-2:45] THE TECH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Visual: Architecture diagram (simplified)

Voiceover: "Built with..."

[Icons fly in]
- "OpenAI Realtime for voice that understands"
- "Thesys C1 for UI that generates itself"  
- "Mapbox for journeys through Japan"
- "All running on Kiro spec-driven development"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[2:45-3:00] CLOSE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Visual: Progress dashboard, badges, certificate preview

Voiceover: "From curious to connoisseur."

[Tippsy cart showing curated recommendations]
[User's journey visualization]

[Logo + tagline]
"SAKÉVERSE"
"Join the conversation."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

# 13. DEPLOYMENT

## Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add OPENAI_API_KEY
vercel env add NEXT_PUBLIC_OPENAI_API_KEY
vercel env add THESYS_API_KEY
vercel env add NEXT_PUBLIC_MAPBOX_TOKEN
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

## Required for Hackathon Submission

1. **/.kiro directory** - Must be included in repo
2. **Demo video** - 3 minutes max
3. **README** - Project description
4. **Live URL** - Deployed application

## Hackathon Checklist

- [ ] Kiro CLI used for development
- [ ] /.kiro directory in repo
- [ ] All specs documented
- [ ] Demo video recorded (3 min)
- [ ] Application deployed
- [ ] README complete
- [ ] Submitted before deadline

---

# QUICK REFERENCE

## Key API Endpoints

| Service | Endpoint | Purpose |
|---------|----------|---------|
| OpenAI Realtime | wss://api.openai.com/v1/realtime | Voice agent |
| Thesys C1 | https://api.thesys.dev/v1 | Dynamic UI |
| Mapbox | mapbox://styles/mapbox/dark-v11 | Map tiles |
| Supabase | https://xxx.supabase.co | Database |

## Key Commands

```bash
# Development
npm run dev

# Build
npm run build

# Kiro generate
kiro generate voice-sommelier

# Scrape Tippsy
npx ts-node scripts/scrape-tippsy.ts

# Deploy
vercel --prod
```

## Important Files

| File | Purpose |
|------|---------|
| .kiro/config.yaml | Kiro configuration |
| .kiro/specs/*.md | Feature specifications |
| src/lib/openai/realtime.ts | Voice agent |
| src/lib/thesys/client.ts | C1 integration |
| src/data/regions.ts | Sake regions |
| src/data/temperatures.ts | Temperature data |

---

**Good luck with the hackathon! 🍶**
