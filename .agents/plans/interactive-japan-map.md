# Feature: Interactive Japan Brewery Map

The following plan should be complete, but validate documentation and codebase patterns before implementing.

Pay special attention to naming of existing utils, types, and models. Import from the right files.

## Feature Description

An interactive map of Japan showing sake-producing prefectures with brewery exploration. Users can click on prefectures to see regional sake styles, top breweries, and products from that region. The map integrates with the existing gamification system to show user progress (visited/explored/mastered regions).

## User Story

As a sake enthusiast
I want to explore Japan's sake regions on an interactive map
So that I can discover breweries and sake by geographic origin and understand regional styles

## Problem Statement

Users have no visual way to explore sake by region. The existing brewery data (50+ breweries across Japan) and product data (104 Tippsy products with prefecture info) are not surfaced geographically. Users miss the connection between sake characteristics and their regional origins.

## Solution Statement

Build an interactive Mapbox GL map showing Japan's 47 prefectures with:
- Prefecture polygons colored by user exploration status
- Click-to-select prefecture with detail panel
- Regional sake style descriptions
- Brewery list with links to products
- Integration with user progress/gamification

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Medium
**Primary Systems Affected**: Frontend (new page), Convex (new queries)
**Dependencies**: mapbox-gl, react-map-gl, Japan prefecture GeoJSON

---

## CONTEXT REFERENCES

### Relevant Codebase Files - MUST READ BEFORE IMPLEMENTING

- `convex/schema.ts` (lines 471-494) - sakeBreweries table schema
- `convex/sakeBreweries.ts` (lines 1-80) - Existing brewery queries (getBreweriesByPrefecture, getBreweriesByRegion)
- `convex/schema.ts` (lines 156-185) - regions table with mapData coordinates
- `components/layout/BottomNav.tsx` - Navigation pattern to add Map link
- `components/layout/Header.tsx` - Desktop navigation pattern
- `app/discover/DiscoverContent.tsx` - Page component pattern with Convex queries
- `app/learn/LearnContent.tsx` - Card grid layout pattern
- `research/SAKEVERSE-INTERFACE-SPEC.md` (lines 545-610) - Map UI specification
- `tailwind.config.js` - RetroUI color tokens (sakura-pink, plum-dark, sake-mist)

### New Files to Create

- `app/map/page.tsx` - Map page wrapper with dynamic import
- `app/map/MapContent.tsx` - Main map component with Mapbox
- `components/map/JapanMap.tsx` - Mapbox GL map component
- `components/map/PrefecturePanel.tsx` - Detail panel for selected prefecture
- `components/map/MapLegend.tsx` - Legend showing exploration status
- `convex/map.ts` - Map-specific queries (prefectures with stats)
- `public/japan-prefectures.geojson` - Prefecture boundary data

### Relevant Documentation - READ BEFORE IMPLEMENTING

- [react-map-gl Getting Started](https://visgl.github.io/react-map-gl/docs/get-started)
  - Installation and basic setup
  - Why: Core library for Mapbox in React
- [Mapbox GL JS Choropleth Tutorial](https://docs.mapbox.com/mapbox-gl-js/example/data-join/)
  - Coloring polygons by data
  - Why: Prefecture coloring by exploration status
- [SimpleMaps Japan GeoJSON](https://simplemaps.com/gis/country/jp)
  - Free prefecture boundaries (CC BY 4.0)
  - Why: Source for prefecture polygon data

### Patterns to Follow

**Dynamic Import Pattern (from app/learn/page.tsx):**
```tsx
import dynamic from "next/dynamic"

const MapContent = dynamic(() => import("./MapContent"), { 
  ssr: false,
  loading: () => <div className="animate-pulse">Loading map...</div>
})

export default function MapPage() {
  return <MapContent />
}
```

**Convex Query Pattern (from app/HomeContent.tsx):**
```tsx
const breweries = useQuery(api.sakeBreweries.getBreweriesByPrefecture, 
  selectedPrefecture ? { prefecture: selectedPrefecture } : "skip"
)
```

**Card Component Pattern (from components/ui/Card.tsx):**
```tsx
<Card className="bg-white border-3 border-ink shadow-retro">
  <CardHeader>
    <CardTitle className="text-lg">{title}</CardTitle>
  </CardHeader>
  <CardContent>{children}</CardContent>
</Card>
```

**RetroUI Color Classes:**
- Primary: `bg-sakura-pink`, `text-plum-dark`
- Secondary: `bg-sake-mist`, `bg-petal-light`
- Borders: `border-3 border-ink`
- Shadows: `shadow-retro`, `shadow-retro-lg`

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation

- Install mapbox-gl and react-map-gl dependencies
- Download and add Japan prefecture GeoJSON to public folder
- Create Convex queries for map data (prefectures with brewery counts)

### Phase 2: Core Implementation

- Create JapanMap component with Mapbox GL
- Implement prefecture polygon layer with click interaction
- Create PrefecturePanel component for detail view
- Add MapLegend component

### Phase 3: Integration

- Create map page with dynamic import
- Add Map link to BottomNav and Header
- Connect to existing brewery and product data
- Add user exploration status (optional - can be hardcoded for MVP)

### Phase 4: Testing & Validation

- Test map renders on desktop and mobile
- Verify prefecture click selects correctly
- Confirm brewery data loads for each prefecture
- Build passes with no errors

---

## STEP-BY-STEP TASKS

### Task 1: CREATE package dependencies

**IMPLEMENT**: Install mapbox-gl and react-map-gl
```bash
npm install mapbox-gl react-map-gl @types/mapbox-gl
```

**VALIDATE**: `npm ls mapbox-gl react-map-gl`

---

### Task 2: CREATE public/japan-prefectures.geojson

**IMPLEMENT**: Download Japan prefecture GeoJSON from SimpleMaps
- Source: https://simplemaps.com/static/svg/country/jp/jp.json
- Save to `public/japan-prefectures.geojson`
- Ensure each feature has `name` property for prefecture name

**PATTERN**: GeoJSON structure should have:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "name": "Niigata", "name_ja": "新潟県" },
      "geometry": { "type": "Polygon", "coordinates": [...] }
    }
  ]
}
```

**GOTCHA**: SimpleMaps uses `name` property - verify this matches or map accordingly

**VALIDATE**: `cat public/japan-prefectures.geojson | head -50`

---

### Task 3: CREATE convex/map.ts

**IMPLEMENT**: Map-specific Convex queries

```typescript
import { query } from "./_generated/server"
import { v } from "convex/values"

// Prefecture data with brewery counts
export const getPrefectureStats = query({
  args: {},
  handler: async (ctx) => {
    const breweries = await ctx.db.query("sakeBreweries").collect()
    const products = await ctx.db.query("tippsyProducts").collect()
    
    // Group by prefecture
    const stats: Record<string, { breweryCount: number; productCount: number }> = {}
    
    for (const b of breweries) {
      const pref = b.prefecture
      if (!stats[pref]) stats[pref] = { breweryCount: 0, productCount: 0 }
      stats[pref].breweryCount++
    }
    
    for (const p of products) {
      const pref = p.prefecture
      if (!stats[pref]) stats[pref] = { breweryCount: 0, productCount: 0 }
      stats[pref].productCount++
    }
    
    return stats
  },
})

// Get products by prefecture
export const getProductsByPrefecture = query({
  args: { prefecture: v.string() },
  handler: async (ctx, { prefecture }) => {
    return await ctx.db
      .query("tippsyProducts")
      .withIndex("by_prefecture", (q) => q.eq("prefecture", prefecture))
      .take(6)
  },
})
```

**IMPORTS**: Use existing Convex patterns from `convex/sakeBreweries.ts`

**VALIDATE**: `npx convex dev --once`

---

### Task 4: CREATE components/map/JapanMap.tsx

**IMPLEMENT**: Mapbox GL map component with prefecture layer

```tsx
"use client"

import { useRef, useEffect, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"

interface JapanMapProps {
  prefectureStats: Record<string, { breweryCount: number; productCount: number }>
  onPrefectureSelect: (prefecture: string | null) => void
  selectedPrefecture: string | null
}

export function JapanMap({ prefectureStats, onPrefectureSelect, selectedPrefecture }: JapanMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  
  useEffect(() => {
    if (!mapContainer.current || map.current) return
    
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [138.2529, 36.2048], // Center of Japan
      zoom: 4.5,
      minZoom: 4,
      maxZoom: 8,
    })
    
    map.current.on("load", () => {
      // Add prefecture boundaries source
      map.current!.addSource("prefectures", {
        type: "geojson",
        data: "/japan-prefectures.geojson",
      })
      
      // Add fill layer
      map.current!.addLayer({
        id: "prefecture-fills",
        type: "fill",
        source: "prefectures",
        paint: {
          "fill-color": [
            "case",
            ["==", ["get", "name"], selectedPrefecture], "#FFBAD2", // sakura-pink when selected
            ["has", ["get", "name"], ["literal", Object.keys(prefectureStats)]], "#FFE4EC", // petal-light if has data
            "#f0f0f0", // gray if no data
          ],
          "fill-opacity": 0.7,
        },
      })
      
      // Add border layer
      map.current!.addLayer({
        id: "prefecture-borders",
        type: "line",
        source: "prefectures",
        paint: {
          "line-color": "#2D2D2D",
          "line-width": 1,
        },
      })
      
      // Click handler
      map.current!.on("click", "prefecture-fills", (e) => {
        if (e.features && e.features[0]) {
          const name = e.features[0].properties?.name
          onPrefectureSelect(name || null)
        }
      })
      
      // Cursor change on hover
      map.current!.on("mouseenter", "prefecture-fills", () => {
        map.current!.getCanvas().style.cursor = "pointer"
      })
      map.current!.on("mouseleave", "prefecture-fills", () => {
        map.current!.getCanvas().style.cursor = ""
      })
    })
    
    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])
  
  // Update selected prefecture styling
  useEffect(() => {
    if (!map.current?.isStyleLoaded()) return
    
    map.current.setPaintProperty("prefecture-fills", "fill-color", [
      "case",
      ["==", ["get", "name"], selectedPrefecture || ""], "#FFBAD2",
      "#FFE4EC",
    ])
  }, [selectedPrefecture])
  
  return (
    <div ref={mapContainer} className="w-full h-full rounded-xl border-3 border-ink" />
  )
}
```

**GOTCHA**: Must use `"use client"` directive - Mapbox requires browser APIs
**GOTCHA**: Access token must be set via NEXT_PUBLIC_MAPBOX_TOKEN env var

**VALIDATE**: Component compiles without TypeScript errors

---

### Task 5: CREATE components/map/PrefecturePanel.tsx

**IMPLEMENT**: Detail panel for selected prefecture

```tsx
"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import Link from "next/link"

// Regional sake style descriptions
const REGIONAL_STYLES: Record<string, { style: string; description: string }> = {
  "Niigata": { style: "Tanrei Karakuchi", description: "Light, dry, and crisp - the epitome of clean sake" },
  "Hyogo": { style: "Nada Style", description: "Bold and masculine, known for Yamada Nishiki rice" },
  "Yamaguchi": { style: "Modern Daiginjo", description: "Innovative, fruity, and aromatic" },
  "Akita": { style: "Rich Junmai", description: "Full-bodied with excellent rice character" },
  "Fukushima": { style: "Award-Winning", description: "Consistently top-ranked in national competitions" },
  // Add more as needed
}

interface PrefecturePanelProps {
  prefecture: string
  onClose: () => void
}

export function PrefecturePanel({ prefecture, onClose }: PrefecturePanelProps) {
  const breweries = useQuery(api.sakeBreweries.getBreweriesByPrefecture, { prefecture })
  const products = useQuery(api.map.getProductsByPrefecture, { prefecture })
  
  const regionalStyle = REGIONAL_STYLES[prefecture]
  
  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="bg-sakura-pink border-b-3 border-ink">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{prefecture}</CardTitle>
          <button onClick={onClose} className="text-2xl hover:opacity-70">×</button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Regional Style */}
        {regionalStyle && (
          <div className="p-3 bg-sake-mist rounded-lg border-2 border-ink">
            <p className="text-sm font-semibold text-plum-dark">{regionalStyle.style}</p>
            <p className="text-sm text-gray-600">{regionalStyle.description}</p>
          </div>
        )}
        
        {/* Breweries */}
        <div>
          <h3 className="font-semibold mb-2">Breweries ({breweries?.length || 0})</h3>
          <div className="space-y-2">
            {breweries?.slice(0, 5).map((b) => (
              <div key={b._id} className="p-2 bg-petal-light rounded-lg">
                <p className="font-medium text-sm">{b.breweryName}</p>
                {b.japaneseName && <p className="text-xs text-gray-500">{b.japaneseName}</p>}
                {b.mainBrands.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {b.mainBrands.slice(0, 2).map((brand) => (
                      <Badge key={brand} variant="secondary" size="sm">{brand}</Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Products */}
        {products && products.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Featured Sake</h3>
            <div className="space-y-2">
              {products.slice(0, 3).map((p) => (
                <a key={p._id} href={p.url} target="_blank" rel="noopener noreferrer" 
                   className="block p-2 bg-white rounded-lg border-2 border-ink hover:shadow-retro transition-shadow">
                  <p className="font-medium text-sm truncate">{p.productName}</p>
                  <p className="text-xs text-gray-500">{p.category} • ${p.price}</p>
                </a>
              ))}
            </div>
          </div>
        )}
        
        {/* CTA */}
        <Link href={`/discover?prefecture=${encodeURIComponent(prefecture)}`}>
          <Button variant="primary" className="w-full">
            Explore {prefecture} Sake →
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
```

**PATTERN**: Mirror Card usage from `components/ui/Card.tsx`
**IMPORTS**: Use existing Badge, Button, Card components

**VALIDATE**: TypeScript compiles without errors

---

### Task 6: CREATE app/map/MapContent.tsx

**IMPLEMENT**: Main map page content component

```tsx
"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { JapanMap } from "@/components/map/JapanMap"
import { PrefecturePanel } from "@/components/map/PrefecturePanel"

export default function MapContent() {
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null)
  const prefectureStats = useQuery(api.map.getPrefectureStats) || {}
  
  return (
    <div className="min-h-screen bg-sakura-white pb-20 md:pb-0">
      <div className="container-retro py-4">
        <h1 className="text-2xl font-display font-bold mb-4">🗾 Explore Japan's Sake Regions</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-180px)]">
          {/* Map Area */}
          <div className="lg:col-span-8 h-full min-h-[400px]">
            <JapanMap
              prefectureStats={prefectureStats}
              onPrefectureSelect={setSelectedPrefecture}
              selectedPrefecture={selectedPrefecture}
            />
          </div>
          
          {/* Detail Panel */}
          <div className="lg:col-span-4 h-full">
            {selectedPrefecture ? (
              <PrefecturePanel
                prefecture={selectedPrefecture}
                onClose={() => setSelectedPrefecture(null)}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-petal-light rounded-xl border-3 border-ink p-6 text-center">
                <div>
                  <p className="text-4xl mb-4">🍶</p>
                  <p className="text-lg font-semibold text-ink">Select a Prefecture</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Click on any region to explore its breweries and sake
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

**PATTERN**: Mirror layout from `app/HomeContent.tsx` grid pattern

**VALIDATE**: Component renders without errors

---

### Task 7: CREATE app/map/page.tsx

**IMPLEMENT**: Map page with dynamic import (SSR disabled for Mapbox)

```tsx
import dynamic from "next/dynamic"

const MapContent = dynamic(() => import("./MapContent"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-sakura-white flex items-center justify-center">
      <div className="animate-pulse text-gray-500">Loading map...</div>
    </div>
  ),
})

export default function MapPage() {
  return <MapContent />
}
```

**PATTERN**: Mirror `app/learn/page.tsx` dynamic import pattern
**GOTCHA**: Must disable SSR - Mapbox requires window/document

**VALIDATE**: `npm run build` passes

---

### Task 8: UPDATE components/layout/BottomNav.tsx

**IMPLEMENT**: Add Map link to mobile navigation

```tsx
// Add to imports
import { Map } from "lucide-react"

// Update navigation array (insert after Discover)
const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Discover", href: "/discover", icon: Search },
  { name: "Map", href: "/map", icon: Map },
  { name: "Kiki", href: "/kiki", icon: Mic },
  { name: "Learn", href: "/learn", icon: BookOpen },
]
```

**GOTCHA**: Remove Profile from nav to keep 5 items, or adjust grid to 6 columns

**VALIDATE**: Navigation renders correctly on mobile

---

### Task 9: UPDATE components/layout/Header.tsx

**IMPLEMENT**: Add Map link to desktop navigation

Find the navigation links section and add Map:

```tsx
// Add Map link after Discover in the desktop nav
<Link href="/map" className={cn(navLinkClass, pathname === "/map" && activeClass)}>
  Map
</Link>
```

**VALIDATE**: Desktop navigation shows Map link

---

### Task 10: ADD environment variable

**IMPLEMENT**: Add Mapbox token to .env.local

```
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_public_token_here
```

**GOTCHA**: Must use NEXT_PUBLIC_ prefix for client-side access
**GOTCHA**: Get free token from https://account.mapbox.com/access-tokens/

**VALIDATE**: Token is accessible in browser console: `console.log(process.env.NEXT_PUBLIC_MAPBOX_TOKEN)`

---

## TESTING STRATEGY

### Unit Tests

Not required for MVP - focus on manual validation

### Integration Tests

Not required for MVP

### Edge Cases

- [ ] Prefecture with no breweries shows empty state
- [ ] Prefecture with no products shows "No products" message
- [ ] Map loads on slow connection (loading state)
- [ ] Mobile layout shows map full-width with bottom sheet panel

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style

```bash
npm run type-check
npm run lint
```

### Level 2: Build

```bash
npx convex dev --once
npm run build
```

### Level 3: Manual Validation

1. Navigate to `/map`
2. Verify Japan map renders with prefecture boundaries
3. Click on Niigata - verify panel shows breweries
4. Click on Yamaguchi - verify Dassai brewery appears
5. Click "Explore Sake" button - verify redirects to discover page
6. Test on mobile viewport - verify responsive layout

---

## ACCEPTANCE CRITERIA

- [ ] Map page accessible at `/map`
- [ ] Japan prefectures render as clickable polygons
- [ ] Clicking prefecture shows detail panel with breweries
- [ ] Panel shows regional sake style description
- [ ] Panel shows featured products with Tippsy links
- [ ] "Explore Sake" button links to filtered discover page
- [ ] Map link appears in BottomNav and Header
- [ ] Build passes with no errors
- [ ] Works on mobile and desktop viewports

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] Convex deployed successfully
- [ ] Build passes
- [ ] Map renders on /map route
- [ ] Prefecture selection works
- [ ] Brewery data loads correctly
- [ ] Navigation updated
- [ ] Mobile responsive

---

## NOTES

### Design Decisions

1. **Mapbox over Leaflet**: Better performance, nicer default styles, easier choropleth implementation
2. **Dynamic import**: Required because Mapbox GL uses browser APIs not available during SSR
3. **Prefecture stats query**: Aggregates brewery/product counts to color map by data density
4. **Regional styles hardcoded**: MVP approach - can be moved to database later

### Trade-offs

- **No user progress tracking**: Gamification integration deferred to keep scope manageable
- **Limited regional descriptions**: Only major sake regions have descriptions initially
- **No 3D terrain**: Keeping map simple for performance

### Future Enhancements

- User exploration progress (visited/mastered prefectures)
- Brewery markers with popups
- Region-specific sake style courses
- Prefecture comparison feature

### Risks

1. **GeoJSON format mismatch**: SimpleMaps data may need property name mapping
2. **Mapbox token exposure**: Public token is visible in client - use URL restrictions
3. **Mobile performance**: Large GeoJSON may be slow on older devices

### Confidence Score: 8/10

High confidence due to:
- Clear UI spec from interface document
- Existing brewery data already imported
- Well-documented Mapbox GL patterns
- Similar dynamic import patterns in codebase

Risk factors:
- GeoJSON property names may need adjustment
- First Mapbox integration in this codebase
