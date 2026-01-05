"use client"

import { useRef, useEffect, useState } from "react"
import "mapbox-gl/dist/mapbox-gl.css"

interface JapanMapProps {
  prefectureStats: Record<string, { breweryCount: number; productCount: number }>
  onPrefectureSelect: (prefecture: string | null) => void
  selectedPrefecture: string | null
}

function normalizeGeoJsonName(name: string): string {
  return name.replace(/ Ken$/i, "").replace(/ Fu$/i, "").replace(/ To$/i, "").trim()
}

export function JapanMap({ prefectureStats, onPrefectureSelect, selectedPrefecture }: JapanMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    if (!mapContainer.current || map.current) return
    
    const initMap = async () => {
      try {
        const mapboxgl = (await import("mapbox-gl")).default
        
        const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "pk.eyJ1IjoidG1vb2R5MTk3MyIsImEiOiJjbWsxbXFobjcwN3NzM2Zwdnc2Zm5rMmV2In0.X-FrW3N8GF9JzLWDL6q9Nw"
        if (!token) {
          setError("Mapbox token not configured")
          return
        }
        
        mapboxgl.accessToken = token
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current!,
          style: "mapbox://styles/mapbox/light-v11",
          center: [138.2529, 36.2048],
          zoom: 4.5,
          minZoom: 4,
          maxZoom: 8,
        })
        
        map.current.on("load", () => {
          setMapLoaded(true)
          
          map.current.addSource("prefectures", {
            type: "geojson",
            data: "/japan-prefectures.geojson",
          })
          
          map.current.addLayer({
            id: "prefecture-fills",
            type: "fill",
            source: "prefectures",
            paint: {
              "fill-color": "#FFE4EC",
              "fill-opacity": 0.7,
            },
          })
          
          map.current.addLayer({
            id: "prefecture-borders",
            type: "line",
            source: "prefectures",
            paint: {
              "line-color": "#2D2D2D",
              "line-width": 1,
            },
          })
          
          map.current.addLayer({
            id: "prefecture-highlight",
            type: "fill",
            source: "prefectures",
            paint: {
              "fill-color": "#FFBAD2",
              "fill-opacity": 0.9,
            },
            filter: ["==", ["get", "nam"], ""],
          })
          
          map.current.on("click", "prefecture-fills", (e: any) => {
            if (e.features && e.features[0]) {
              const rawName = e.features[0].properties?.nam
              const normalized = normalizeGeoJsonName(rawName || "")
              onPrefectureSelect(normalized)
              map.current.setFilter("prefecture-highlight", ["==", ["get", "nam"], rawName])
            }
          })
          
          map.current.on("mouseenter", "prefecture-fills", () => {
            map.current.getCanvas().style.cursor = "pointer"
          })
          map.current.on("mouseleave", "prefecture-fills", () => {
            map.current.getCanvas().style.cursor = ""
          })
        })
        
        map.current.on("error", (e: any) => {
          console.error("Mapbox error:", e)
          setError(e.error?.message || "Map failed to load")
        })
        
      } catch (err) {
        console.error("Failed to initialize map:", err)
        setError("Failed to load map library")
      }
    }
    
    initMap()
    
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [onPrefectureSelect])
  
  if (error) {
    return (
      <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-red-50 rounded-xl border-3 border-red-300">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }
  
  return (
    <div className="relative w-full h-full min-h-[500px]">
      <div ref={mapContainer} className="absolute inset-0 rounded-xl border-3 border-ink" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-petal-light rounded-xl">
          <p className="text-gray-500 animate-pulse">Loading map...</p>
        </div>
      )}
    </div>
  )
}
