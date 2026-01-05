"use client"

import { useUser } from "@clerk/nextjs"
import dynamic from "next/dynamic"
import { LandingPage } from "@/components/landing/LandingPage"

const DashboardContent = dynamic(
  () => import("@/components/dashboard/DashboardContent").then(mod => mod.DashboardContent),
  { ssr: false, loading: () => <div className="animate-pulse text-gray-500">Loading...</div> }
)

export default function HomeContent() {
  const { isSignedIn, isLoaded } = useUser()

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-gray-500">Loading...</div>
    </div>
  }

  if (!isSignedIn) {
    return <LandingPage />
  }

  return (
    <div className="container-retro py-8">
      <DashboardContent />
    </div>
  )
}
