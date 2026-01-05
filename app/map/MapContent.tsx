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
        <h1 className="text-2xl font-display font-bold mb-4">🗾 Explore Japan&apos;s Sake Regions</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4" style={{ height: "calc(100vh - 180px)" }}>
          <div className="lg:col-span-8 h-full min-h-[400px]">
            <JapanMap
              prefectureStats={prefectureStats}
              onPrefectureSelect={setSelectedPrefecture}
              selectedPrefecture={selectedPrefecture}
            />
          </div>
          
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
