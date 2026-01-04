"use client"

import dynamic from "next/dynamic"

const OnboardingContent = dynamic(
  () => import("@/components/onboarding/OnboardingContent"),
  { ssr: false, loading: () => <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse">Loading...</div></div> }
)

export default function OnboardingPage() {
  return <OnboardingContent />
}
