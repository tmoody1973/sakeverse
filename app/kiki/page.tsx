"use client"

import dynamic from "next/dynamic"

const VoiceChat = dynamic(() => import("@/components/voice/VoiceChat").then(mod => ({ default: mod.VoiceChat })), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">Loading Kiki...</div>
})

export default function KikiPage() {
  return (
    <div className="container-retro py-6 h-screen">
      <div className="max-w-4xl mx-auto h-full">
        <VoiceChat />
      </div>
    </div>
  )
}
