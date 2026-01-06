"use client"

import dynamic from "next/dynamic"

const SeriesContent = dynamic(
  () => import("./SeriesContent").then(mod => mod.SeriesContent),
  { ssr: false }
)

export default function SeriesPage() {
  return <SeriesContent />
}
