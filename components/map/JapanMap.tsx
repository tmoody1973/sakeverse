"use client"

import { useRef, useEffect, useState } from "react"
import mapboxgl from "mapbox-gl"
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
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  
  useEffect(() => {
    if (!mapContainer.current || map.current) return
    
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    console.log("Mapbox token:", token ? `${token.substring(0, 20)}...` : "NOT FOUND")
    
    if (!token) {
      console.error("Mapbox token not found in NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN")
      return
    }
    
    mapboxgl.accessToken = token
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [138.2529, 36.2048],
      zoom: 4.5,
      minZoom: 4,
      maxZoom: 8,
    })
    
    map.current.on("load", () => {
      setMapLoaded(true)
      
      map.current!.addSource("prefectures", {
        type: "geojson",
        data: "/japan-prefectures.geojson",
      })
      
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
  }, [onPrefectureSelect])
  
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
