"use client"

import { useRef, useEffect } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"

interface JapanMapProps {
  prefectureStats: Record<string, { breweryCount: number; productCount: number }>
  onPrefectureSelect: (prefecture: string | null) => void
  selectedPrefecture: string | null
}

// Convert GeoJSON "nam" (e.g., "Niigata Ken") to normalized name
function normalizeGeoJsonName(name: string): string {
  return name.replace(/ Ken$/i, "").replace(/ Fu$/i, "").replace(/ To$/i, "").trim()
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
      center: [138.2529, 36.2048],
      zoom: 4.5,
      minZoom: 4,
      maxZoom: 8,
    })
    
    map.current.on("load", () => {
      map.current!.addSource("prefectures", {
        type: "geojson",
        data: "/japan-prefectures.geojson",
      })
      
      // Create color expression based on data
      const prefNames = Object.keys(prefectureStats)
      
      map.current!.addLayer({
        id: "prefecture-fills",
        type: "fill",
        source: "prefectures",
        paint: {
          "fill-color": "#FFE4EC",
          "fill-opacity": 0.7,
        },
      })
      
      map.current!.addLayer({
        id: "prefecture-borders",
        type: "line",
        source: "prefectures",
        paint: {
          "line-color": "#2D2D2D",
          "line-width": 1,
        },
      })
      
      // Highlight layer for selected
      map.current!.addLayer({
        id: "prefecture-highlight",
        type: "fill",
        source: "prefectures",
        paint: {
          "fill-color": "#FFBAD2",
          "fill-opacity": 0.9,
        },
        filter: ["==", ["get", "nam"], ""],
      })
      
      map.current!.on("click", "prefecture-fills", (e) => {
        if (e.features && e.features[0]) {
          const rawName = e.features[0].properties?.nam
          const normalized = normalizeGeoJsonName(rawName || "")
          onPrefectureSelect(normalized)
          
          // Update highlight filter
          map.current!.setFilter("prefecture-highlight", ["==", ["get", "nam"], rawName])
        }
      })
      
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
  }, [prefectureStats, onPrefectureSelect])
  
  return (
    <div ref={mapContainer} className="w-full h-full rounded-xl border-3 border-ink" />
  )
}
