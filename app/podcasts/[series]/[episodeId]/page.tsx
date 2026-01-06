"use client"

import dynamic from "next/dynamic"

const EpisodePlayerContent = dynamic(
  () => import("./EpisodePlayerContent").then(mod => mod.EpisodePlayerContent),
  { ssr: false }
)

export default function EpisodePlayerPage() {
  return <EpisodePlayerContent />
}
