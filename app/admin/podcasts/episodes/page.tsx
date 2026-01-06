"use client"

import dynamic from "next/dynamic"

const EpisodePreviewContent = dynamic(
  () => import("./EpisodePreviewContent").then(mod => mod.EpisodePreviewContent),
  { ssr: false }
)

export default function EpisodePreviewPage() {
  return <EpisodePreviewContent />
}
