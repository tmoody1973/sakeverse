"use client"

import dynamic from "next/dynamic"

const CourseContent = dynamic(() => import("./CourseContent"), { ssr: false })

export default function CoursePage() {
  return <CourseContent />
}
