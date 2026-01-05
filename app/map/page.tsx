"use client"

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
