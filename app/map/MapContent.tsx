"use client"

import { useState, useEffect } from "react"
import { useQuery, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { JapanMap } from "@/components/map/JapanMap"
import { PrefecturePanel } from "@/components/map/PrefecturePanel"
import { Badge } from "@/components/ui/Badge"

export default function MapContent() {
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null)
  const prefectureStats = useQuery(api.map.getPrefectureStats) || {}
  const cachedDescription = useQuery(
    api.map.getPrefectureDescription, 
    selectedPrefecture ? { prefecture: selectedPrefecture } : "skip"
  )
  const generateDescription = useAction(api.map.generatePrefectureDescription)
  
  const [description, setDescription] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    if (!selectedPrefecture) {
      setDescription(null)
      return
    }
    
    if (cachedDescription) {
      setDescription(cachedDescription)
    } else if (!loading) {
      setLoading(true)
      generateDescription({ prefecture: selectedPrefecture })
        .then(setDescription)
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [cachedDescription, selectedPrefecture, generateDescription, loading])
  
  // Reset description when prefecture changes
  useEffect(() => {
    setDescription(cachedDescription || null)
    setLoading(false)
  }, [selectedPrefecture, cachedDescription])
  
  // Simple markdown to HTML (handles **bold**, *italic*)
  const renderMarkdown = (text: string) => {
    if (!text) return ""
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p class="mb-2">')
  }
  
  return (
    <div className="min-h-screen bg-sakura-white pb-20 md:pb-0">
      <div className="container-retro py-4">
        <h1 className="text-2xl font-display font-bold mb-4">🗾 Explore Japan&apos;s Sake Regions</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Map */}
          <div className="lg:col-span-8 h-[500px]">
            <JapanMap
              prefectureStats={prefectureStats}
              onPrefectureSelect={setSelectedPrefecture}
              selectedPrefecture={selectedPrefecture}
            />
          </div>
          
          {/* Side Panel - Breweries & Products */}
          <div className="lg:col-span-4 h-[500px]">
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
        
        {/* Description Below Map */}
        {selectedPrefecture && (
          <div className="mt-6 bg-white rounded-xl border-3 border-ink p-6 shadow-retro">
            <h2 className="text-xl font-display font-bold mb-4 text-plum-dark">
              About {selectedPrefecture} Sake
            </h2>
            
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ) : description ? (
              <div className="space-y-4">
                {/* Overview */}
                <div 
                  className="text-ink leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(description.overview) }}
                />
                
                {/* Sake Style */}
                {description.sakeStyle && (
                  <div className="p-4 bg-sake-mist rounded-lg border-2 border-ink">
                    <h3 className="font-semibold text-plum-dark mb-2">🍶 Regional Sake Style</h3>
                    <div 
                      className="text-sm text-ink"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(description.sakeStyle) }}
                    />
                  </div>
                )}
                
                {/* Key Characteristics */}
                {description.keyCharacteristics?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-ink mb-2">✨ Key Characteristics</h3>
                    <div className="flex flex-wrap gap-2">
                      {description.keyCharacteristics.map((c: string, i: number) => (
                        <Badge key={i} variant="primary" size="sm">{c}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Famous Breweries */}
                {description.famousBreweries?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-ink mb-2">🏭 Famous Breweries</h3>
                    <div className="flex flex-wrap gap-2">
                      {description.famousBreweries.map((b: string, i: number) => (
                        <Badge key={i} variant="secondary" size="sm">{b}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Recommended Sake */}
                {description.recommendedSake?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-ink mb-2">⭐ Recommended Sake</h3>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                      {description.recommendedSake.map((s: string, i: number) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
