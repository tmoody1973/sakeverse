"use client"

import dynamic from "next/dynamic"

// Dynamic import to avoid SSR issues with C1Chat
const KikiChat = dynamic(
  () => import("@/components/voice/KikiChat").then(mod => ({ default: mod.KikiChat })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen bg-sakura-white">
        <div className="text-center">
          <div className="text-6xl mb-4">🍶</div>
          <p className="text-gray-600">Loading Kiki...</p>
        </div>
      </div>
    )
  }
)

export default function KikiPage() {
  return (
    <main className="h-screen bg-sakura-white">
      <KikiChat />
    </main>
  )
}
