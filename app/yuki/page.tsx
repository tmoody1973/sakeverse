"use client"

import dynamic from "next/dynamic"

const VoiceChat = dynamic(() => import("@/components/voice/VoiceChat").then(mod => ({ default: mod.VoiceChat })), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">Loading Yuki...</div>
})

export default function YukiPage() {
  return (
    <div className="container-retro py-6 h-screen">
      <div className="max-w-4xl mx-auto h-full">
        <VoiceChat />
      </div>
    </div>
  )
}
