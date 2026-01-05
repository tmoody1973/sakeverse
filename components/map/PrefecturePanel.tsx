"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import Link from "next/link"

const REGIONAL_STYLES: Record<string, { style: string; description: string }> = {
  "Niigata": { style: "Tanrei Karakuchi", description: "Light, dry, and crisp - the epitome of clean sake" },
  "Hyogo": { style: "Nada Style", description: "Bold and masculine, known for Yamada Nishiki rice" },
  "Yamaguchi": { style: "Modern Daiginjo", description: "Innovative, fruity, and aromatic" },
  "Akita": { style: "Rich Junmai", description: "Full-bodied with excellent rice character" },
  "Fukushima": { style: "Award-Winning", description: "Consistently top-ranked in national competitions" },
  "Yamagata": { style: "Elegant Ginjo", description: "Refined and aromatic, known for Dewa Sansan rice" },
  "Hiroshima": { style: "Soft Water Style", description: "Gentle and smooth, pioneered soft water brewing" },
  "Kyoto": { style: "Fushimi Style", description: "Feminine and elegant, using famous Fushimi water" },
  "Nagano": { style: "Alpine Fresh", description: "Clean and crisp from mountain water sources" },
  "Ishikawa": { style: "Noto Toji", description: "Traditional craftsmanship from master brewers" },
}

interface PrefecturePanelProps {
  prefecture: string
  onClose: () => void
}

export function PrefecturePanel({ prefecture, onClose }: PrefecturePanelProps) {
  const breweries = useQuery(api.map.getBreweriesByPrefectureNormalized, { prefecture })
  const products = useQuery(api.map.getProductsByPrefecture, { prefecture })
  
  const regionalStyle = REGIONAL_STYLES[prefecture]
  
  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="bg-sakura-pink border-b-3 border-ink sticky top-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{prefecture}</CardTitle>
          <button onClick={onClose} className="text-2xl hover:opacity-70 leading-none">×</button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {regionalStyle && (
          <div className="p-3 bg-sake-mist rounded-lg border-2 border-ink">
            <p className="text-sm font-semibold text-plum-dark">{regionalStyle.style}</p>
            <p className="text-sm text-gray-600">{regionalStyle.description}</p>
          </div>
        )}
        
        <div>
          <h3 className="font-semibold mb-2">🏭 Breweries ({breweries?.length || 0})</h3>
          {breweries && breweries.length > 0 ? (
            <div className="space-y-2">
              {breweries.slice(0, 5).map((b) => (
                <div key={b._id} className="p-2 bg-petal-light rounded-lg">
                  <p className="font-medium text-sm">{b.breweryName}</p>
                  {b.japaneseName && <p className="text-xs text-gray-500">{b.japaneseName}</p>}
                  {b.mainBrands.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {b.mainBrands.slice(0, 2).map((brand) => (
                        <Badge key={brand} variant="secondary" size="sm">{brand}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No breweries in database yet</p>
          )}
        </div>
        
        {products && products.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">🍶 Featured Sake</h3>
            <div className="space-y-2">
              {products.slice(0, 3).map((p) => (
                <a key={p._id} href={p.url} target="_blank" rel="noopener noreferrer" 
                   className="block p-2 bg-white rounded-lg border-2 border-ink hover:shadow-retro transition-shadow">
                  <div className="flex gap-2">
                    {p.images[0] && (
                      <img src={p.images[0]} alt={p.productName} className="w-12 h-12 object-contain" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{p.productName}</p>
                      <p className="text-xs text-gray-500">{p.category} • ${p.price}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
        
        <Link href={`/discover?prefecture=${encodeURIComponent(prefecture)}`}>
          <Button variant="primary" className="w-full">
            Explore {prefecture} Sake →
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
