"use client"

import dynamic from "next/dynamic"

const PodcastsContent = dynamic(
  () => import("./PodcastsContent").then(mod => mod.PodcastsContent),
  { ssr: false }
)

export default function PodcastsPage() {
  return <PodcastsContent />
}
