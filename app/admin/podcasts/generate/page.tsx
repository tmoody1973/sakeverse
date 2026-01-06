"use client"

import dynamic from "next/dynamic"

const GenerateContent = dynamic(
  () => import("./GenerateContent").then(mod => mod.GenerateContent),
  { ssr: false }
)

export default function GeneratePage() {
  return <GenerateContent />
}
