"use client"

import dynamic from "next/dynamic"

const AdminLearnContent = dynamic(() => import("./AdminLearnContent"), { ssr: false })

export default function AdminLearnPage() {
  return <AdminLearnContent />
}
