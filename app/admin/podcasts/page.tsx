"use client"

import dynamic from "next/dynamic"

const AdminPodcastsContent = dynamic(
  () => import("./AdminPodcastsContent").then(mod => mod.AdminPodcastsContent),
  { ssr: false }
)

export default function AdminPodcastsPage() {
  return <AdminPodcastsContent />
}
