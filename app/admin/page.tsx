"use client"

import Link from "next/link"

const adminSections = [
  {
    title: "Learning System",
    description: "Generate AI courses, manage chapters and quizzes",
    href: "/admin/learn",
    icon: "📚",
    color: "bg-sakura-200",
  },
  {
    title: "Podcast Network",
    description: "Generate episodes, manage shows and publishing",
    href: "/admin/podcasts",
    icon: "🎙️",
    color: "bg-sake-mist",
  },
]

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-sakura-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-ink mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 mb-8">Manage AI-generated content for Sakéverse</p>

        <div className="grid md:grid-cols-2 gap-6">
          {adminSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className={`${section.color} border-3 border-ink rounded-xl p-6 shadow-retro hover:shadow-retro-lg hover:-translate-y-1 transition-all`}
            >
              <div className="text-4xl mb-3">{section.icon}</div>
              <h2 className="text-xl font-bold text-ink mb-2">{section.title}</h2>
              <p className="text-gray-700">{section.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
