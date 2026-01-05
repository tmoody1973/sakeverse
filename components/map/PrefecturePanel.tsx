"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import Link from "next/link"

interface PrefecturePanelProps {
  prefecture: string
  onClose: () => void
}

export function PrefecturePanel({ prefecture, onClose }: PrefecturePanelProps) {
  const breweries = useQuery(api.map.getBreweriesByPrefectureNormalized, { prefecture })
  const products = useQuery(api.map.getProductsByPrefecture, { prefecture })
  
  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="bg-sakura-pink border-b-3 border-ink sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{prefecture}</CardTitle>
          <button onClick={onClose} className="text-2xl hover:opacity-70 leading-none">×</button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Breweries */}
        <div>
          <h3 className="font-semibold mb-2">🏭 Breweries ({breweries?.length || 0})</h3>
          {breweries && breweries.length > 0 ? (
            <div className="space-y-2">
              {breweries.slice(0, 5).map((b) => (
                <div key={b._id} className="p-2 bg-white rounded-lg border-2 border-ink">
                  <p className="font-medium text-sm">{b.breweryName}</p>
                  {b.japaneseName && <p className="text-xs text-gray-500">{b.japaneseName}</p>}
                  {b.mainBrands.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {b.mainBrands.slice(0, 2).map((brand) => (
                        <Badge key={brand} variant="primary" size="sm">{brand}</Badge>
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
        
        {/* Products */}
        {products && products.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">🍶 Available Sake</h3>
            <div className="space-y-2">
              {products.slice(0, 4).map((p) => (
                <a key={p._id} href={p.url} target="_blank" rel="noopener noreferrer" 
                   className="block p-2 bg-white rounded-lg border-2 border-ink hover:shadow-retro transition-shadow">
                  <div className="flex gap-2">
                    {p.images[0] && (
                      <img src={p.images[0]} alt={p.productName} className="w-10 h-10 object-contain" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{p.productName}</p>
                      <p className="text-xs text-gray-500">${p.price}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
        
        <Link href={`/discover?prefecture=${encodeURIComponent(prefecture)}`}>
          <Button variant="primary" className="w-full">
            Explore All {prefecture} Sake →
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
