"use client"

import { useState, useCallback, useMemo } from "react"
import Map, { Layer, Source } from "react-map-gl/mapbox"
import "mapbox-gl/dist/mapbox-gl.css"

interface JapanMapProps {
  prefectureStats: Record<string, { breweryCount: number; productCount: number }>
  onPrefectureSelect: (prefecture: string | null) => void
  selectedPrefecture: string | null
}

function normalizeGeoJsonName(name: string): string {
  return name.replace(/ Ken$/i, "").replace(/ Fu$/i, "").replace(/ To$/i, "").trim()
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "pk.eyJ1IjoidG1vb2R5MTk3MyIsImEiOiJjbWsxbXFobjcwN3NzM2Zwdnc2Zm5rMmV2In0.X-FrW3N8GF9JzLWDL6q9Nw"

export function JapanMap({ prefectureStats, onPrefectureSelect, selectedPrefecture }: JapanMapProps) {
  const [cursor, setCursor] = useState("grab")

  // Build list of prefecture names (with Ken suffix) that have breweries
  const prefecturesWithBreweries = useMemo(() => {
    return Object.keys(prefectureStats).map(name => `${name} Ken`)
  }, [prefectureStats])

  const onClick = useCallback((event: any) => {
    const feature = event.features?.[0]
    if (feature) {
      const rawName = feature.properties?.nam
      const normalized = normalizeGeoJsonName(rawName || "")
      onPrefectureSelect(normalized)
    }
  }, [onPrefectureSelect])

  const onMouseEnter = useCallback(() => setCursor("pointer"), [])
  const onMouseLeave = useCallback(() => setCursor("grab"), [])

  // Color expression: pink if has breweries, gray if not
  const fillColor: any = [
    "case",
    ["in", ["get", "nam"], ["literal", prefecturesWithBreweries]],
    "#FFBAD2", // sakura-pink for prefectures with breweries
    "#e5e5e5"  // gray for others
  ]

  return (
    <Map
      mapboxAccessToken={MAPBOX_TOKEN}
      initialViewState={{
        longitude: 138.2529,
        latitude: 36.2048,
        zoom: 4.5,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/light-v11"
      interactiveLayerIds={["prefecture-fills"]}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      cursor={cursor}
    >
      <Source id="prefectures" type="geojson" data="/japan-prefectures.geojson">
        <Layer
          id="prefecture-fills"
          type="fill"
          paint={{
            "fill-color": fillColor,
            "fill-opacity": 0.7,
          }}
        />
        <Layer
          id="prefecture-borders"
          type="line"
          paint={{
            "line-color": "#2D2D2D",
            "line-width": 1,
          }}
        />
        <Layer
          id="prefecture-highlight"
          type="fill"
          filter={["==", ["get", "nam"], selectedPrefecture ? `${selectedPrefecture} Ken` : ""]}
          paint={{
            "fill-color": "#6B4E71", // plum-dark when selected
            "fill-opacity": 0.8,
          }}
        />
      </Source>
    </Map>
  )
}
