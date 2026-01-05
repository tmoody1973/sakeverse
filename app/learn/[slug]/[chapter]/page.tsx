"use client"

import dynamic from "next/dynamic"

const ChapterContent = dynamic(() => import("./ChapterContent"), { ssr: false })

export default function ChapterPage() {
  return <ChapterContent />
}
