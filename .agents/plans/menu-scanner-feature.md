# Feature: Menu Scanner - Snap Sake Menu, Get Personalized Recommendations

## Feature Description

Enable users to take a photo of a sake menu at a restaurant and receive instant, personalized recommendations based on their taste profile. This solves the real-world problem of being overwhelmed by unfamiliar sake menus when dining out.

## User Story

As a sake beginner at a restaurant or store  
I want to take a photo of a sake menu or bottle label and get instant recommendations based on my taste profile  
So that I can order or purchase confidently without feeling overwhelmed by Japanese terminology

## Problem Statement

**80M+ Americans drink wine regularly. Most are terrified of sake menus and bottle labels.**

When wine lovers visit restaurants with sake menus or browse sake at stores, they face:
- Unfamiliar Japanese terminology (Junmai, Yamahai, Daiginjo)
- Bottle labels entirely in Japanese characters
- No translation of wine vocabulary to sake
- Overwhelming choices without guidance
- Fear of ordering/buying something they won't enjoy

This feature bridges the gap between curiosity and confident purchase by providing instant, personalized guidance.

## Solution Statement

Implement a mobile-first scanning feature that works for both menus and bottle labels:
1. Captures sake menu or bottle photos via camera or upload
2. Extracts sake names using Gemini Vision API (handles Japanese text and labels)
3. Matches extracted items against Tippsy database + enriches with Perplexity
4. Scores each item against user's taste profile
5. Returns personalized recommendations with reasoning
6. Enables follow-up questions via Kiki voice chat

**Dual Mode Support:**
- **Menu Mode**: Extracts multiple sake from restaurant menus, ranks all items
- **Bottle Mode**: Identifies single sake from label, provides detailed info + similar recommendations

## Feature Metadata

**Feature Type**: New Capability  
**Estimated Complexity**: High  
**Primary Systems Affected**: 
- Frontend (new camera/upload UI)
- Convex backend (new tables, actions)
- Gemini Vision API integration
- Existing recommendation engine

**Dependencies**:
- Gemini Vision API (multimodal)
- Existing user taste profiles
- Tippsy product database
- Perplexity API (for unknown sake)
- Convex file storage

---

## CONTEXT REFERENCES

### Relevant Codebase Files (MUST READ BEFORE IMPLEMENTING!)

**User Profile & Preferences:**
- `convex/schema.ts` (lines 30-60) - User table with taste preferences structure
- `convex/users.ts` - User queries and mutations
- `app/settings/SettingsContent.tsx` - How preferences are displayed/edited

**Existing Recommendation Logic:**
- `convex/recommendations.ts` - Current recommendation scoring algorithm
- `convex/wineToSake.ts` - Wine-to-sake translation logic
- `convex/embeddings.ts` - Vector search implementation

**API Integration Patterns:**
- `convex/geminiRAG.ts` - Gemini API integration pattern (use for Vision)
- `convex/perplexityAPI.ts` - Perplexity API pattern
- `convex/learn/generation.ts` (lines 1-50) - Image generation with Gemini

**File Storage:**
- `convex/podcastTTS.ts` (lines 100-150) - Convex file storage pattern
- `convex/learn/generation.ts` (lines 200-250) - Storing generated images

**UI Components:**
- `components/ui/Button.tsx` - RetroUI button variants
- `components/ui/Card.tsx` - Card component structure
- `app/HomeContent.tsx` - Dashboard layout patterns

### New Files to Create

**Backend (Convex):**
- `convex/menuScanner.ts` - Menu scanning actions (OCR, matching, scoring)
- `convex/menuMatcher.ts` - Fuzzy matching and enrichment logic

**Frontend Components:**
- `components/menu/MenuScanner.tsx` - Camera/upload interface
- `components/menu/MenuScanResults.tsx` - Results display page
- `components/menu/SakeMenuItem.tsx` - Individual sake card
- `components/menu/RecommendationCard.tsx` - Top pick display
- `components/menu/MenuScanHistory.tsx` - Past scans list

**Pages:**
- `app/menu-scan/page.tsx` - Scanner entry point
- `app/menu-scan/[scanId]/page.tsx` - Results page

### Relevant Documentation (READ BEFORE IMPLEMENTING!)

**Gemini Vision API:**
- [Gemini Multimodal Guide](https://ai.google.dev/gemini-api/docs/vision)
  - Section: "Prompting with images"
  - Why: Shows how to send images and extract structured data
- [Gemini JSON Mode](https://ai.google.dev/gemini-api/docs/json-mode)
  - Section: "Structured output"
  - Why: Required for extracting sake menu items as JSON

**Convex File Storage:**
- [Convex File Storage Docs](https://docs.convex.dev/file-storage)
  - Section: "Uploading files"
  - Why: Storing menu images

**Fuzzy Matching:**
- [fuse.js Documentation](https://fusejs.io/)
  - Section: "Basic usage"
  - Why: Matching extracted sake names to database

### Patterns to Follow

**Naming Conventions:**
```typescript
// Tables: camelCase
menuScans, menuScanItems

// Actions: verbNoun
extractMenuItems, matchSakeProducts, scoreMenuItems

// Components: PascalCase
MenuScanner, MenuScanResults
```

**Error Handling:**
```typescript
// Pattern from convex/geminiRAG.ts
try {
  const response = await fetch(apiUrl, options)
  if (!response.ok) {
    const errorText = await response.text()
    console.error("API error details:", errorText)
    throw new Error(`API error: ${response.status}`)
  }
  return await response.json()
} catch (error) {
  console.error("Operation failed:", error)
  return { error: error instanceof Error ? error.message : "Unknown error" }
}
```

**Convex File Storage Pattern:**
```typescript
// From convex/podcastTTS.ts
const storageId = await ctx.storage.store(blob)
// Store reference in database
await ctx.db.insert("tableName", {
  imageStorageId: storageId,
  // ... other fields
})
```

**API Response Extraction:**
```typescript
// From convex/learn/generation.ts (Gemini Image)
const imageData = response.candidates?.[0]?.content?.parts?.find(
  (part: any) => part.inlineData
)?.inlineData?.data

// From convex/perplexityAPI.ts
const answer = result.choices?.[0]?.message?.content || "No information found."
```

---

## IMPLEMENTATION PLAN

### Phase 1: Database Schema & Backend Foundation

Set up database tables and core backend functions for menu scanning.

**Tasks:**
- Add `menuScans` and `menuScanItems` tables to schema
- Create Gemini Vision API integration for OCR
- Implement fuzzy matching against Tippsy database
- Build scoring algorithm using existing recommendation logic

### Phase 2: Frontend Camera/Upload Interface

Build mobile-first UI for capturing menu photos.

**Tasks:**
- Create camera capture component with preview
- Add photo upload from gallery
- Implement image cropping/rotation
- Upload to Convex file storage
- Show loading state during processing

### Phase 3: Results Display & Recommendations

Display personalized recommendations with reasoning.

**Tasks:**
- Build results page with top 3 picks
- Show full menu ranked by match score
- Display reasoning for each recommendation
- Add "Ask Kiki" integration for follow-up questions
- Implement scan history

### Phase 4: Enrichment & Polish

Handle edge cases and enhance UX.

**Tasks:**
- Query Perplexity for unknown sake
- Add error handling (bad photos, no sake found)
- Implement rate limiting (5 scans/day)
- Mobile optimization and testing
- Add analytics tracking

---


## STEP-BY-STEP TASKS

### PHASE 1: Database Schema & Backend Foundation

#### Task 1.1: UPDATE convex/schema.ts

- **IMPLEMENT**: Add `menuScans` table
- **PATTERN**: Follow existing table patterns (users, tippsyProducts)
- **IMPORTS**: None needed (already has v, defineTable)
- **GOTCHA**: Use `v.id("_storage")` for file references
- **VALIDATE**: `npx convex dev --once`

```typescript
menuScans: defineTable({
  userId: v.string(), // Clerk ID
  imageStorageId: v.id("_storage"),
  scanType: v.union(v.literal("menu"), v.literal("bottle")), // NEW: Scan type
  restaurantName: v.optional(v.string()),
  extractedItems: v.array(v.object({
    name: v.string(),
    nameRomaji: v.optional(v.string()),
    type: v.optional(v.string()), // Junmai, Ginjo, etc.
    price: v.optional(v.string()),
    size: v.optional(v.string()),
    matchedProductId: v.optional(v.id("tippsyProducts")),
    matchConfidence: v.optional(v.number()), // 0-1
    enrichedData: v.optional(v.object({
      description: v.optional(v.string()),
      brewery: v.optional(v.string()),
      prefecture: v.optional(v.string()),
      alcohol: v.optional(v.number()),
      ricePolishingRatio: v.optional(v.number()),
    })),
  })),
  recommendations: v.array(v.object({
    itemIndex: v.number(),
    score: v.number(), // 0-100
    reasoning: v.string(),
    matchType: v.string(), // "wine_profile", "taste_match", "food_pairing"
  })),
  // NEW: For bottle mode - similar sake recommendations
  similarSake: v.optional(v.array(v.object({
    productId: v.id("tippsyProducts"),
    similarityScore: v.number(),
    reason: v.string(),
  }))),
  status: v.union(
    v.literal("processing"),
    v.literal("completed"),
    v.literal("failed")
  ),
  errorMessage: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_status", ["status"])
  .index("by_user_created", ["userId", "createdAt"])
  .index("by_scan_type", ["scanType"]), // NEW: Index by type
```

#### Task 1.2: CREATE convex/menuScanner.ts

- **IMPLEMENT**: Gemini Vision API integration for menu OCR
- **PATTERN**: Mirror `convex/geminiRAG.ts` API call structure
- **IMPORTS**: `import { action } from "./_generated/server"`, `import { v } from "convex/values"`
- **GOTCHA**: Gemini Vision requires base64 image data, not URLs
- **VALIDATE**: Test with sample menu image

```typescript
import { action } from "./_generated/server"
import { v } from "convex/values"

export const extractMenuItems = action({
  args: {
    imageStorageId: v.id("_storage"),
  },
  handler: async (ctx, { imageStorageId }) => {
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY not found")
    }

    // Get image from storage
    const imageBlob = await ctx.storage.get(imageStorageId)
    if (!imageBlob) {
      throw new Error("Image not found in storage")
    }

    // Convert blob to base64
    const arrayBuffer = await imageBlob.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    const base64 = btoa(String.fromCharCode(...uint8Array))

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  text: `Extract sake information from this image. 

**If this is a MENU** (multiple sake listed):
Return JSON: {"type": "menu", "items": [{name, nameRomaji, type, price, size}]}

**If this is a BOTTLE LABEL** (single sake):
Return JSON: {"type": "bottle", "items": [{name, nameRomaji, type, brewery, prefecture, alcohol, ricePolishingRatio}]}

Rules:
- Detect if image shows a menu (multiple items) or bottle label (single item)
- Include both Japanese and romaji names if visible
- Extract sake type (Junmai, Ginjo, Daiginjo, Honjozo, etc.)
- For bottles: extract brewery name, prefecture, alcohol %, rice polishing ratio if visible
- For menus: include price and size if shown
- Skip non-sake items (beer, wine, shochu)
- Return empty array if no sake found`
                },
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: base64
                  }
                }
              ]
            }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 2000,
              responseMimeType: "application/json"
            }
          })
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Gemini Vision error:", errorText)
        throw new Error(`Gemini Vision API error: ${response.status}`)
      }

      const result = await response.json()
      const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text
      
      if (!textContent) {
        throw new Error("No content returned from Gemini Vision")
      }

      const extracted = JSON.parse(textContent)
      
      return {
        scanType: extracted.type || "menu", // NEW: Detect scan type
        items: extracted.items || [],
        timestamp: Date.now()
      }
      
    } catch (error) {
      console.error("Menu extraction error:", error)
      throw error
    }
  },
})
```

#### Task 1.3: CREATE convex/menuMatcher.ts

- **IMPLEMENT**: Fuzzy matching against Tippsy database
- **PATTERN**: Use vector search from `convex/embeddings.ts`
- **IMPORTS**: `import { action, query } from "./_generated/server"`, `import { v } from "convex/values"`
- **GOTCHA**: Japanese names need normalization (remove spaces, convert to hiragana)
- **VALIDATE**: Test with known sake names

```typescript
import { action, query } from "./_generated/server"
import { v } from "convex/values"

// Fuzzy match extracted sake names to Tippsy database
export const matchSakeProducts = action({
  args: {
    extractedItems: v.array(v.object({
      name: v.string(),
      nameRomaji: v.optional(v.string()),
      type: v.optional(v.string()),
      price: v.optional(v.string()),
      size: v.optional(v.string()),
    })),
  },
  handler: async (ctx, { extractedItems }) => {
    const matched = []

    for (const item of extractedItems) {
      // Try exact match first
      const exactMatch = await ctx.runQuery(api.menuMatcher.findExactMatch, {
        name: item.name,
        nameRomaji: item.nameRomaji,
      })

      if (exactMatch) {
        matched.push({
          ...item,
          matchedProductId: exactMatch._id,
          matchConfidence: 1.0,
          enrichedData: {
            description: exactMatch.description,
            brewery: exactMatch.brewery,
            prefecture: exactMatch.prefecture,
          }
        })
        continue
      }

      // Try fuzzy match using vector search
      const searchText = `${item.name} ${item.nameRomaji || ""} ${item.type || ""}`
      const fuzzyMatches = await ctx.runAction(api.embeddings.searchSake, {
        query: searchText,
        limit: 1,
      })

      if (fuzzyMatches.length > 0 && fuzzyMatches[0].score > 0.7) {
        const match = fuzzyMatches[0]
        matched.push({
          ...item,
          matchedProductId: match._id,
          matchConfidence: match.score,
          enrichedData: {
            description: match.description,
            brewery: match.brewery,
            prefecture: match.prefecture,
          }
        })
      } else {
        // No match - will need Perplexity enrichment
        matched.push({
          ...item,
          matchedProductId: undefined,
          matchConfidence: 0,
        })
      }
    }

    return matched
  },
})

// Helper query for exact matching
export const findExactMatch = query({
  args: {
    name: v.string(),
    nameRomaji: v.optional(v.string()),
  },
  handler: async (ctx, { name, nameRomaji }) => {
    // Try matching by product name
    const byName = await ctx.db
      .query("tippsyProducts")
      .filter((q) => q.eq(q.field("productName"), name))
      .first()
    
    if (byName) return byName

    // Try matching by romaji if provided
    if (nameRomaji) {
      const byRomaji = await ctx.db
        .query("tippsyProducts")
        .filter((q) => 
          q.or(
            q.eq(q.field("productName"), nameRomaji),
            q.eq(q.field("brand"), nameRomaji)
          )
        )
        .first()
      
      if (byRomaji) return byRomaji
    }

    return null
  },
})
```

#### Task 1.4: CREATE convex/menuRecommendations.ts

- **IMPLEMENT**: Score menu items against user taste profile + find similar sake for bottles
- **PATTERN**: Adapt logic from `convex/recommendations.ts`
- **IMPORTS**: `import { action } from "./_generated/server"`, `import { v } from "convex/values"`
- **GOTCHA**: Handle unmatched items gracefully, bottle mode needs different logic
- **VALIDATE**: Test with real user profiles and bottle scans

```typescript
import { action } from "./_generated/server"
import { v } from "convex/values"

export const scoreMenuItems = action({
  args: {
    userId: v.string(),
    matchedItems: v.array(v.any()),
  },
  handler: async (ctx, { userId, matchedItems }) => {
    // Get user preferences
    const user = await ctx.runQuery(api.users.getUserByClerkId, { clerkId: userId })
    if (!user) {
      throw new Error("User not found")
    }

    const recommendations = []

    for (let i = 0; i < matchedItems.length; i++) {
      const item = matchedItems[i]
      
      // Skip unmatched items for now
      if (!item.matchedProductId) {
        continue
      }

      // Get full product details
      const product = await ctx.runQuery(api.sake.getProductById, {
        id: item.matchedProductId
      })

      if (!product) continue

      // Calculate match score (0-100)
      let score = 0
      let reasoning = []
      let matchType = "general"

      // Wine profile matching (40 points)
      if (user.preferences.wineProfile && user.preferences.wineProfile.length > 0) {
        const wineMatch = calculateWineMatch(product, user.preferences.wineProfile)
        score += wineMatch.score * 40
        if (wineMatch.score > 0.5) {
          reasoning.push(wineMatch.reason)
          matchType = "wine_profile"
        }
      }

      // Taste preference matching (40 points)
      const tasteMatch = calculateTasteMatch(product, user.preferences.tastePreferences)
      score += tasteMatch.score * 40
      if (tasteMatch.score > 0.5) {
        reasoning.push(tasteMatch.reason)
        if (matchType === "general") matchType = "taste_match"
      }

      // Food preference matching (20 points)
      if (user.preferences.foodPreferences && user.preferences.foodPreferences.length > 0) {
        const foodMatch = calculateFoodMatch(product, user.preferences.foodPreferences)
        score += foodMatch.score * 20
        if (foodMatch.score > 0.5) {
          reasoning.push(foodMatch.reason)
          if (matchType === "general") matchType = "food_pairing"
        }
      }

      recommendations.push({
        itemIndex: i,
        score: Math.round(score),
        reasoning: reasoning.join(" "),
        matchType,
      })
    }

    // Sort by score descending
    recommendations.sort((a, b) => b.score - a.score)

    return recommendations
  },
})

// Helper functions (simplified - adapt from convex/recommendations.ts)
function calculateWineMatch(product: any, wineProfile: string[]) {
  // Implementation from existing recommendation logic
  return { score: 0.7, reason: "Matches your wine preferences" }
}

function calculateTasteMatch(product: any, tastePrefs: any) {
  // Implementation from existing recommendation logic
  return { score: 0.8, reason: "Aligns with your taste profile" }
}

function calculateFoodMatch(product: any, foodPrefs: string[]) {
  // Implementation from existing recommendation logic
  return { score: 0.6, reason: "Pairs well with your favorite foods" }
}

// NEW: Find similar sake for bottle mode
export const findSimilarSake = action({
  args: {
    productId: v.id("tippsyProducts"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { productId, limit = 5 }) => {
    // Get the scanned product
    const product = await ctx.runQuery(api.sake.getProductById, { id: productId })
    if (!product) return []

    // Use vector search to find similar sake
    const searchText = `${product.category} ${product.tasteProfile} ${product.prefecture}`
    const similar = await ctx.runAction(api.embeddings.searchSake, {
      query: searchText,
      limit: limit + 1, // +1 to exclude self
    })

    // Filter out the original product and format results
    return similar
      .filter(s => s._id !== productId)
      .slice(0, limit)
      .map(s => ({
        productId: s._id,
        similarityScore: Math.round(s.score * 100),
        reason: `Similar ${s.category} from ${s.prefecture}`,
      }))
  },
})
```

---

### PHASE 2: Frontend Camera/Upload Interface

#### Task 2.1: CREATE components/menu/MenuScanner.tsx

- **IMPLEMENT**: Camera capture and photo upload UI
- **PATTERN**: Use RetroUI button/card styles from `components/ui/`
- **IMPORTS**: `import { Button } from "@/components/ui/Button"`, `import { Card } from "@/components/ui/Card"`
- **GOTCHA**: Camera API requires HTTPS in production
- **VALIDATE**: Test on mobile device

```typescript
"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"

export function MenuScanner() {
  const router = useRouter()
  const [image, setImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [cameraActive, setCameraActive] = useState(false)

  const uploadImage = useMutation(api.menuScanner.uploadMenuImage)
  const startScan = useMutation(api.menuScanner.createMenuScan)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" } // Use back camera on mobile
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
      }
    } catch (error) {
      console.error("Camera access denied:", error)
      alert("Please allow camera access to scan menus")
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current) return

    const canvas = document.createElement("canvas")
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext("2d")
    ctx?.drawImage(videoRef.current, 0, 0)
    
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8)
    setImage(dataUrl)
    
    // Stop camera
    const stream = videoRef.current.srcObject as MediaStream
    stream?.getTracks().forEach(track => track.stop())
    setCameraActive(false)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setImage(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleScan = async () => {
    if (!image) return

    setIsProcessing(true)
    try {
      // Convert base64 to blob
      const response = await fetch(image)
      const blob = await response.blob()

      // Upload to Convex storage
      const storageId = await uploadImage({ image: blob })

      // Create scan record
      const scanId = await startScan({ imageStorageId: storageId })

      // Navigate to results
      router.push(`/menu-scan/${scanId}`)
    } catch (error) {
      console.error("Scan failed:", error)
      alert("Failed to scan menu. Please try again.")
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="p-6">
        <h2 className="text-2xl font-display font-bold text-ink mb-4">
          Scan Sake Menu or Bottle
        </h2>
        <p className="text-gray-600 mb-6">
          Take a photo of a sake menu or bottle label and get personalized recommendations
        </p>

        {!image && !cameraActive && (
          <div className="space-y-4">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={startCamera}
            >
              📸 Open Camera
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              📁 Upload Photo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        )}

        {cameraActive && (
          <div className="space-y-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg border-3 border-ink"
            />
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={capturePhoto}
            >
              📷 Capture Photo
            </Button>
          </div>
        )}

        {image && !cameraActive && (
          <div className="space-y-4">
            <img
              src={image}
              alt="Menu preview"
              className="w-full rounded-lg border-3 border-ink"
            />
            <div className="flex gap-4">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setImage(null)}
                disabled={isProcessing}
              >
                Retake
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleScan}
                disabled={isProcessing}
              >
                {isProcessing ? "Analyzing..." : "Scan Menu"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
```


#### Task 2.2: CREATE app/menu-scan/page.tsx

- **IMPLEMENT**: Scanner entry page
- **PATTERN**: Follow `app/kiki/page.tsx` structure
- **IMPORTS**: Dynamic import for client component
- **GOTCHA**: Must use `"use client"` or dynamic import
- **VALIDATE**: `npm run build`

```typescript
import dynamic from "next/dynamic"

const MenuScanner = dynamic(
  () => import("@/components/menu/MenuScanner").then(mod => ({ default: mod.MenuScanner })),
  { ssr: false }
)

export default function MenuScanPage() {
  return <MenuScanner />
}
```

#### Task 2.3: ADD Convex mutations for file upload

- **IMPLEMENT**: Upload handler in `convex/menuScanner.ts`
- **PATTERN**: Follow `convex/podcastTTS.ts` file storage pattern
- **IMPORTS**: Already imported
- **GOTCHA**: Blob must be converted properly
- **VALIDATE**: Test upload with sample image

```typescript
// Add to convex/menuScanner.ts

export const uploadMenuImage = mutation({
  args: {
    image: v.any(), // Blob
  },
  handler: async (ctx, { image }) => {
    // Store image in Convex storage
    const storageId = await ctx.storage.store(image)
    return storageId
  },
})

export const createMenuScan = mutation({
  args: {
    imageStorageId: v.id("_storage"),
  },
  handler: async (ctx, { imageStorageId }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    // Create scan record
    const scanId = await ctx.db.insert("menuScans", {
      userId: identity.subject,
      imageStorageId,
      extractedItems: [],
      recommendations: [],
      status: "processing",
      createdAt: Date.now(),
    })

    // Trigger extraction (async)
    await ctx.scheduler.runAfter(0, api.menuScanner.processMenuScan, {
      scanId,
    })

    return scanId
  },
})

export const processMenuScan = internalMutation({
  args: {
    scanId: v.id("menuScans"),
  },
  handler: async (ctx, { scanId }) => {
    const scan = await ctx.db.get(scanId)
    if (!scan) return

    try {
      // Extract items from image
      const extracted = await ctx.runAction(api.menuScanner.extractMenuItems, {
        imageStorageId: scan.imageStorageId,
      })

      // Match against database
      const matched = await ctx.runAction(api.menuMatcher.matchSakeProducts, {
        extractedItems: extracted.items,
      })

      // Score and recommend
      const recommendations = await ctx.runAction(api.menuRecommendations.scoreMenuItems, {
        userId: scan.userId,
        matchedItems: matched,
      })

      // NEW: For bottle mode, find similar sake
      let similarSake = []
      if (extracted.scanType === "bottle" && matched.length > 0 && matched[0].matchedProductId) {
        similarSake = await ctx.runAction(api.menuRecommendations.findSimilarSake, {
          productId: matched[0].matchedProductId,
          limit: 5,
        })
      }

      // Update scan with results
      await ctx.db.patch(scanId, {
        scanType: extracted.scanType, // NEW: Store scan type
        extractedItems: matched,
        recommendations,
        similarSake, // NEW: Store similar sake for bottles
        status: "completed",
      })
    } catch (error) {
      console.error("Menu scan processing failed:", error)
      await ctx.db.patch(scanId, {
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      })
    }
  },
})
```

---

### PHASE 3: Results Display & Recommendations

#### Task 3.1: CREATE components/menu/MenuScanResults.tsx

- **IMPLEMENT**: Results page with top 3 recommendations
- **PATTERN**: Use Card layout from `app/HomeContent.tsx`
- **IMPORTS**: Convex hooks, UI components
- **GOTCHA**: Handle loading and error states
- **VALIDATE**: Test with completed scan

```typescript
"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { useRouter } from "next/navigation"

interface MenuScanResultsProps {
  scanId: Id<"menuScans">
}

export function MenuScanResults({ scanId }: MenuScanResultsProps) {
  const router = useRouter()
  const scan = useQuery(api.menuScanner.getScanById, { scanId })

  if (!scan) {
    return <div className="text-center p-8">Loading...</div>
  }

  if (scan.status === "processing") {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card className="p-8 text-center">
          <div className="animate-pulse mb-4">🔍</div>
          <h2 className="text-xl font-bold mb-2">Analyzing Menu...</h2>
          <p className="text-gray-600">
            Extracting sake names and matching to your taste profile
          </p>
        </Card>
      </div>
    )
  }

  if (scan.status === "failed") {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card className="p-8 text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-xl font-bold mb-2">Scan Failed</h2>
          <p className="text-gray-600 mb-4">{scan.errorMessage}</p>
          <Button onClick={() => router.push("/menu-scan")}>
            Try Again
          </Button>
        </Card>
      </div>
    )
  }

  const topPicks = scan.recommendations.slice(0, 3)
  const topItems = topPicks.map(rec => scan.extractedItems[rec.itemIndex])

  // NEW: Check if this is a bottle scan
  const isBottleScan = scan.scanType === "bottle"

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Bottle Mode: Single Sake Details */}
      {isBottleScan && scan.extractedItems.length > 0 && (
        <div>
          <h2 className="text-2xl font-display font-bold text-ink mb-4">
            🍶 Sake Details
          </h2>
          <Card className="p-6">
            {(() => {
              const item = scan.extractedItems[0]
              const rec = scan.recommendations[0]
              return (
                <>
                  <h3 className="text-2xl font-bold mb-2">{item.name}</h3>
                  {item.nameRomaji && (
                    <p className="text-lg text-gray-600 mb-4">{item.nameRomaji}</p>
                  )}

                  {item.type && <Badge className="mb-3">{item.type}</Badge>}

                  {item.enrichedData && (
                    <div className="space-y-2 mb-4">
                      {item.enrichedData.brewery && (
                        <p className="text-gray-700">
                          <strong>Brewery:</strong> {item.enrichedData.brewery}
                        </p>
                      )}
                      {item.enrichedData.prefecture && (
                        <p className="text-gray-700">
                          <strong>Prefecture:</strong> {item.enrichedData.prefecture}
                        </p>
                      )}
                      {item.enrichedData.alcohol && (
                        <p className="text-gray-700">
                          <strong>Alcohol:</strong> {item.enrichedData.alcohol}%
                        </p>
                      )}
                      {item.enrichedData.ricePolishingRatio && (
                        <p className="text-gray-700">
                          <strong>Rice Polishing:</strong> {item.enrichedData.ricePolishingRatio}%
                        </p>
                      )}
                    </div>
                  )}

                  {rec && (
                    <div className="mt-4 pt-4 border-t-2 border-gray-200">
                      <Badge variant="success" className="mb-2">
                        {rec.score}% Match for You
                      </Badge>
                      <p className="text-gray-700">{rec.reasoning}</p>
                    </div>
                  )}
                </>
              )
            })()}
          </Card>

          {/* Similar Sake Recommendations */}
          {scan.similarSake && scan.similarSake.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-display font-bold text-ink mb-4">
                Similar Sake You Might Like
              </h3>
              <div className="space-y-3">
                {scan.similarSake.map((similar) => (
                  <Card key={similar.productId} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Similar Sake</p>
                        <p className="text-sm text-gray-600">{similar.reason}</p>
                      </div>
                      <Badge>{similar.similarityScore}% Similar</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Menu Mode: Top Recommendations */}
      {!isBottleScan && (
        <div>
          <h2 className="text-2xl font-display font-bold text-ink mb-4">
            🥇 Your Top Picks
          </h2>
        <div className="space-y-4">
          {topPicks.map((rec, idx) => {
            const item = scan.extractedItems[rec.itemIndex]
            return (
              <Card key={idx} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">
                        {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                      </span>
                      <h3 className="text-xl font-bold">{item.name}</h3>
                    </div>
                    {item.nameRomaji && (
                      <p className="text-gray-600">{item.nameRomaji}</p>
                    )}
                  </div>
                  <Badge variant="success">{rec.score}% Match</Badge>
                </div>

                {item.type && (
                  <Badge className="mb-3">{item.type}</Badge>
                )}

                <p className="text-gray-700 mb-4">{rec.reasoning}</p>

                {item.price && (
                  <p className="text-sm text-gray-600">
                    {item.price} {item.size && `• ${item.size}`}
                  </p>
                )}

                {item.enrichedData && (
                  <div className="mt-4 pt-4 border-t-2 border-gray-200">
                    <p className="text-sm text-gray-600">
                      {item.enrichedData.brewery} • {item.enrichedData.prefecture}
                    </p>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>
      )}

      {/* Full Menu (Menu Mode Only) */}
      {!isBottleScan && scan.extractedItems.length > 3 && (
        <div>
          <h3 className="text-xl font-display font-bold text-ink mb-4">
            Full Menu (Ranked)
          </h3>
          <div className="space-y-2">
            {scan.recommendations.slice(3).map((rec) => {
              const item = scan.extractedItems[rec.itemIndex]
              return (
                <Card key={rec.itemIndex} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      {item.nameRomaji && (
                        <p className="text-sm text-gray-600">{item.nameRomaji}</p>
                      )}
                    </div>
                    <Badge>{rec.score}%</Badge>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Ask Kiki CTA */}
      <Card className="p-6 bg-sake-mist">
        <h3 className="text-lg font-bold mb-2">Have Questions?</h3>
        <p className="text-gray-700 mb-4">
          {isBottleScan 
            ? "Ask Kiki about this sake or get pairing recommendations"
            : "Ask Kiki about any of these sake or get pairing recommendations"
          }
        </p>
        <Button
          variant="primary"
          onClick={() => router.push(`/kiki?context=menu-scan:${scanId}`)}
        >
          🎤 Ask Kiki
        </Button>
      </Card>
    </div>
  )
}
```

#### Task 3.2: CREATE app/menu-scan/[scanId]/page.tsx

- **IMPLEMENT**: Results page route
- **PATTERN**: Follow `app/podcasts/[series]/[episodeId]/page.tsx`
- **IMPORTS**: Dynamic import
- **GOTCHA**: Validate scanId format
- **VALIDATE**: Navigate to results after scan

```typescript
import dynamic from "next/dynamic"
import { Id } from "@/convex/_generated/dataModel"

const MenuScanResults = dynamic(
  () => import("@/components/menu/MenuScanResults").then(mod => ({ default: mod.MenuScanResults })),
  { ssr: false }
)

export default function MenuScanResultsPage({
  params,
}: {
  params: { scanId: string }
}) {
  return <MenuScanResults scanId={params.scanId as Id<"menuScans">} />
}
```

#### Task 3.3: ADD query for scan results

- **IMPLEMENT**: Query in `convex/menuScanner.ts`
- **PATTERN**: Standard query pattern
- **IMPORTS**: Already imported
- **GOTCHA**: Check user ownership
- **VALIDATE**: Query returns correct data

```typescript
// Add to convex/menuScanner.ts

export const getScanById = query({
  args: {
    scanId: v.id("menuScans"),
  },
  handler: async (ctx, { scanId }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null

    const scan = await ctx.db.get(scanId)
    if (!scan || scan.userId !== identity.subject) {
      return null
    }

    return scan
  },
})

export const getUserScans = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 10 }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const scans = await ctx.db
      .query("menuScans")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(limit)

    return scans
  },
})
```

---

### PHASE 4: Enrichment & Polish

#### Task 4.1: ADD Perplexity enrichment for unknown sake

- **IMPLEMENT**: Query Perplexity for unmatched items
- **PATTERN**: Use `convex/perplexityAPI.ts` pattern
- **IMPORTS**: Already in menuMatcher.ts
- **GOTCHA**: Rate limit Perplexity calls
- **VALIDATE**: Test with unknown sake name

```typescript
// Add to convex/menuMatcher.ts

export const enrichUnknownSake = action({
  args: {
    sakeName: v.string(),
    sakeType: v.optional(v.string()),
  },
  handler: async (ctx, { sakeName, sakeType }) => {
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY
    if (!perplexityApiKey) {
      return null
    }

    try {
      const query = `Japanese sake: ${sakeName}${sakeType ? ` (${sakeType})` : ""}. Provide: brewery name, prefecture, brief description, flavor profile.`

      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${perplexityApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sonar",
          messages: [
            {
              role: "system",
              content: "You are a sake expert. Provide concise, factual information about Japanese sake."
            },
            {
              role: "user",
              content: query
            }
          ],
          max_tokens: 300,
          temperature: 0.2
        })
      })

      if (!response.ok) {
        console.error("Perplexity error:", response.status)
        return null
      }

      const result = await response.json()
      const answer = result.choices?.[0]?.message?.content

      if (!answer) return null

      // Parse response for structured data
      return {
        description: answer,
        // Could parse brewery, prefecture from answer
      }
    } catch (error) {
      console.error("Enrichment error:", error)
      return null
    }
  },
})
```

#### Task 4.2: ADD rate limiting for menu scans

- **IMPLEMENT**: 5 scans per day limit
- **PATTERN**: Use existing `convex/rateLimit.ts`
- **IMPORTS**: Import rateLimit functions
- **GOTCHA**: Check before creating scan
- **VALIDATE**: Test limit enforcement

```typescript
// Update convex/menuScanner.ts createMenuScan

export const createMenuScan = mutation({
  args: {
    imageStorageId: v.id("_storage"),
  },
  handler: async (ctx, { imageStorageId }) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    // Check rate limit (5 scans per day)
    const rateLimitCheck = await ctx.runQuery(api.rateLimit.checkRateLimit, {
      userId: identity.subject,
      type: "menu_scan",
      maxRequests: 5,
      windowMs: 24 * 60 * 60 * 1000, // 24 hours
    })

    if (!rateLimitCheck.allowed) {
      throw new Error(`Rate limit exceeded. ${rateLimitCheck.message}`)
    }

    // Create scan record
    const scanId = await ctx.db.insert("menuScans", {
      userId: identity.subject,
      imageStorageId,
      extractedItems: [],
      recommendations: [],
      status: "processing",
      createdAt: Date.now(),
    })

    // Trigger extraction (async)
    await ctx.scheduler.runAfter(0, api.menuScanner.processMenuScan, {
      scanId,
    })

    return scanId
  },
})
```

#### Task 4.3: ADD scan history component

- **IMPLEMENT**: List of past scans
- **PATTERN**: Similar to course list
- **IMPORTS**: Convex hooks, UI components
- **GOTCHA**: Show preview of top pick
- **VALIDATE**: Navigate to past scan

```typescript
// components/menu/MenuScanHistory.tsx

"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { useRouter } from "next/navigation"

export function MenuScanHistory() {
  const router = useRouter()
  const scans = useQuery(api.menuScanner.getUserScans, { limit: 10 })

  if (!scans || scans.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-600">No scan history yet</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-display font-bold text-ink">
        Recent Scans
      </h2>
      {scans.map((scan) => {
        const topPick = scan.recommendations[0]
        const topItem = topPick ? scan.extractedItems[topPick.itemIndex] : null

        return (
          <Card
            key={scan._id}
            className="p-4 cursor-pointer hover:shadow-retro-lg transition-all"
            onClick={() => router.push(`/menu-scan/${scan._id}`)}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">
                {new Date(scan.createdAt).toLocaleDateString()}
              </p>
              <Badge variant={scan.status === "completed" ? "success" : "default"}>
                {scan.status}
              </Badge>
            </div>

            {topItem && (
              <div>
                <p className="font-semibold">{topItem.name}</p>
                {topPick && (
                  <p className="text-sm text-gray-600">
                    {topPick.score}% match • {scan.extractedItems.length} items found
                  </p>
                )}
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
```

#### Task 4.4: ADD navigation from dashboard

- **IMPLEMENT**: "Scan Menu" button on dashboard
- **PATTERN**: Add to `app/HomeContent.tsx` quick actions
- **IMPORTS**: None needed
- **GOTCHA**: Prominent placement
- **VALIDATE**: Click navigates to scanner

```typescript
// Update app/HomeContent.tsx - add to quick actions grid

<Button
  variant="primary"
  size="lg"
  className="w-full"
  onClick={() => router.push("/menu-scan")}
>
  📸 Scan Menu
</Button>
```

---

## TESTING STRATEGY

### Unit Tests

**Not required for MVP** - Focus on manual testing and validation commands

### Integration Tests

**Manual Testing Checklist:**

1. **Image Upload Flow:**
   - Upload clear menu photo → Extracts sake correctly, scanType = "menu"
   - Upload bottle label photo → Extracts single sake, scanType = "bottle"
   - Upload blurry photo → Shows error message
   - Upload non-sake image → Returns empty results

2. **Menu Mode:**
   - Known sake (Dassai, Hakkaisan) → 100% match confidence
   - Multiple sake extracted → All ranked by score
   - Top 3 recommendations shown prominently

3. **Bottle Mode:**
   - Single sake extracted with details (brewery, prefecture, alcohol, RPR)
   - Match score and reasoning displayed
   - Similar sake recommendations shown (5 items)
   - Similar sake have meaningful similarity scores

4. **Matching Accuracy:**
   - Similar names → Fuzzy match works
   - Unknown sake → Perplexity enrichment triggers

5. **Recommendation Quality:**
   - User with wine profile → Wine-based reasoning
   - User with taste preferences → Taste-based reasoning
   - New user → General recommendations

6. **Mobile Experience:**
   - Camera opens on mobile
   - Photo capture works for both menus and bottles
   - Results display properly
   - Touch targets are 44x44px minimum

### Edge Cases

- **No sake found in image** → Show helpful message
- **Menu in poor lighting** → Suggest retaking photo
- **Bottle label partially visible** → Extract what's possible, note incomplete data
- **Multiple bottles in frame** → Process as menu mode with multiple items
- **Multiple pages** → Handle first page only (MVP)
- **Non-Japanese menu** → Extract what's possible
- **Rate limit hit** → Clear error with reset time

---

## VALIDATION COMMANDS

### Level 1: Syntax & Build

```bash
# TypeScript compilation
npx tsc --noEmit

# Next.js build
npm run build

# Convex deployment
npx convex dev --once
```

### Level 2: Manual Testing

**Test Sequence:**

1. Navigate to `/menu-scan`
2. **Menu Test**: Upload sample menu image (test-menu.jpg)
3. Wait for processing (should complete in 5-10 seconds)
4. Verify scanType = "menu"
5. Verify top 3 recommendations appear
6. Check reasoning makes sense
7. **Bottle Test**: Upload bottle label image (test-bottle.jpg)
8. Wait for processing
9. Verify scanType = "bottle"
10. Verify single sake details displayed (brewery, prefecture, alcohol, RPR)
11. Verify similar sake recommendations appear (5 items)
12. Click "Ask Kiki" → Context passed correctly
13. View scan history → Both scans appear with correct types

**Sample Test Images:**

- `test-menu-clear.jpg` - Clear, well-lit menu
- `test-menu-blurry.jpg` - Slightly blurry menu
- `test-menu-dark.jpg` - Poor lighting menu
- `test-bottle-front.jpg` - Clear bottle front label
- `test-bottle-back.jpg` - Bottle back label with details
- `test-bottle-angle.jpg` - Bottle at an angle
- `test-menu-english.jpg` - English sake names

### Level 3: API Testing

```bash
# Test Gemini Vision API
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Extract sake names from this menu"}]}]}'

# Test rate limiting
# Make 6 scan requests in quick succession
# 6th should fail with rate limit error
```

### Level 4: Performance

- **Image upload**: < 2 seconds
- **OCR extraction**: < 5 seconds
- **Full scan processing**: < 10 seconds total
- **Results page load**: < 1 second

---

## ACCEPTANCE CRITERIA

- [ ] User can capture menu or bottle photo via camera
- [ ] User can upload menu or bottle photo from gallery
- [ ] Gemini Vision detects scan type (menu vs bottle) automatically
- [ ] Gemini Vision extracts sake names with 80%+ accuracy
- [ ] **Menu Mode**: Extracts multiple sake, ranks all items, shows top 3
- [ ] **Bottle Mode**: Extracts single sake with details (brewery, prefecture, alcohol, RPR)
- [ ] **Bottle Mode**: Shows 5 similar sake recommendations
- [ ] Extracted items match against Tippsy database
- [ ] Unknown sake enriched via Perplexity
- [ ] Recommendations personalized to user taste profile
- [ ] "Ask Kiki" integration passes scan context
- [ ] Scan history shows past scans with correct types
- [ ] Rate limiting enforces 5 scans/day
- [ ] Mobile camera works on iOS and Android
- [ ] All validation commands pass
- [ ] Error states handled gracefully
- [ ] Loading states provide feedback

---

## COMPLETION CHECKLIST

- [ ] All Phase 1 tasks completed (Database & Backend)
- [ ] All Phase 2 tasks completed (Camera/Upload UI)
- [ ] All Phase 3 tasks completed (Results Display)
- [ ] All Phase 4 tasks completed (Enrichment & Polish)
- [ ] Manual testing checklist passed
- [ ] Edge cases handled
- [ ] Performance targets met
- [ ] Mobile testing completed
- [ ] Rate limiting verified
- [ ] Documentation updated

---

## NOTES

### Design Decisions

**Why Gemini Vision over OpenAI Vision?**
- Already using Gemini in stack
- Better Japanese text recognition (critical for bottle labels)
- Multimodal capabilities
- Cost-effective for menu scanning

**Why dual mode (menu + bottle)?**
- Covers both use cases: restaurants and retail stores
- Same underlying tech, different UI presentation
- Bottle mode enables "similar sake" discovery
- Increases feature utility and user engagement

**Why 5 scans/day limit?**
- Prevents API cost overruns (~$0.02/scan)
- Encourages thoughtful usage
- Can increase for premium users later

**Why fuzzy matching before Perplexity?**
- Faster for known sake
- More accurate product details
- Reduces API costs
- Perplexity as fallback for unknowns

**Why similar sake for bottles only?**
- Menu mode already provides ranked recommendations
- Bottle mode needs discovery path (user found one sake, wants more like it)
- Leverages existing vector search
- Encourages exploration and purchase

### Future Enhancements

- Multi-page menu support
- OCR confidence scores
- Save favorite menu items
- Share recommendations with friends
- Restaurant location tagging
- Offline mode with cached menus
- **Bottle mode**: Barcode scanning for instant lookup
- **Bottle mode**: Price comparison across retailers
- **Bottle mode**: Tasting notes from community
- AR overlay showing recommendations on physical menu

### Cost Estimates

**Per Scan:**
- Gemini Vision: ~$0.02
- Perplexity (3-5 unknown sake): ~$0.01
- Convex storage: ~$0.001
- **Total: ~$0.03/scan**

**Monthly (1000 users, 2 scans/month):**
- 2000 scans × $0.03 = $60/month

### Technical Risks

1. **OCR Accuracy**: Japanese text recognition may vary
   - Mitigation: Allow manual correction
2. **Camera Permissions**: Users may deny access
   - Mitigation: Fallback to file upload
3. **Rate Limiting**: Users may hit limits quickly
   - Mitigation: Clear messaging, upgrade path
4. **Matching Accuracy**: Fuzzy matching may fail
   - Mitigation: Perplexity enrichment fallback

---

**Confidence Score**: 8/10

This plan provides comprehensive implementation guidance with:
- ✅ Complete database schema
- ✅ Detailed API integration patterns
- ✅ Step-by-step frontend implementation
- ✅ Error handling and edge cases
- ✅ Testing strategy and validation
- ✅ Cost analysis and risk mitigation

The feature is technically feasible and aligns with existing codebase patterns. Main risk is OCR accuracy with varied menu formats, mitigated by manual correction and Perplexity fallback.
