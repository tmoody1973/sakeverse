"use client"

import dynamic from "next/dynamic"

const EpisodeDetailContent = dynamic(
  () => import("./EpisodeDetailContent").then(mod => mod.EpisodeDetailContent),
  { ssr: false }
)

export default function EpisodeDetailPage() {
  return <EpisodeDetailContent />
}
