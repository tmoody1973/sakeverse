"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Trash2, ExternalLink, Wine } from "lucide-react"

function getSessionId() {
  if (typeof window === "undefined") return ""
  let id = localStorage.getItem("sakeverse_session")
  if (!id) {
    id = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`
    localStorage.setItem("sakeverse_session", id)
  }
  return id
}

export default function LibraryContent() {
  const [sessionId, setSessionId] = useState<string>("")
  
  useEffect(() => {
    setSessionId(getSessionId())
  }, [])

  const library = useQuery(
    api.userLibrary.getLibrary, 
    sessionId ? { sessionId } : "skip"
  )
  const removeSake = useMutation(api.userLibrary.removeSake)

  const handleRemove = async (sakeName: string) => {
    if (!sessionId) return
    await removeSake({ sessionId, sakeName })
  }

  if (!sessionId) {
    return <div className="min-h-screen bg-sakura-white p-6 flex items-center justify-center">Loading...</div>
  }

  return (
    <main className="min-h-screen bg-sakura-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-ink flex items-center gap-3">
              <Wine className="w-8 h-8" />
              My Sake Library
            </h1>
            <p className="text-gray-600 mt-1">
              Your saved sake collection • {library?.length || 0} bottles
            </p>
          </div>
          <Link 
            href="/kiki"
            className="px-4 py-2 bg-sakura-pink border-2 border-ink rounded-lg font-medium retro-shadow hover:translate-y-[-2px] transition-all"
          >
            Ask Kiki for more →
          </Link>
        </div>

        {/* Empty State */}
        {library?.length === 0 && (
          <div className="text-center py-16 bg-white border-2 border-ink rounded-xl retro-shadow">
            <div className="text-6xl mb-4">🍶</div>
            <h2 className="text-xl font-semibold text-ink mb-2">Your library is empty</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start exploring sake with Kiki and save your favorites here!
            </p>
            <Link 
              href="/kiki"
              className="inline-block px-6 py-3 bg-sakura-pink border-2 border-ink rounded-lg font-medium retro-shadow hover:translate-y-[-2px] transition-all"
            >
              Chat with Kiki 🎤
            </Link>
          </div>
        )}

        {/* Library Grid */}
        {library && library.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {library.map((item) => (
              <div 
                key={item._id}
                className="bg-white border-2 border-ink rounded-xl retro-shadow overflow-hidden hover:translate-y-[-4px] transition-all"
              >
                {/* Image */}
                <div className="aspect-square bg-sake-mist/30 relative">
                  <img 
                    src={item.image} 
                    alt={item.sakeName}
                    className="w-full h-full object-contain p-4"
                  />
                  <span className="absolute top-2 right-2 bg-sakura-pink px-2 py-1 rounded text-xs font-medium border border-ink">
                    {item.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-ink">{item.sakeName}</h3>
                  <p className="text-sm text-gray-600">{item.brewery} • {item.region}</p>
                  <p className="text-lg font-bold text-sakura-dark mt-1">${item.price}</p>
                  
                  {item.description && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.description}</p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-sakura-pink border-2 border-ink rounded-lg text-sm font-medium hover:bg-sakura-dark transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on Tippsy
                    </a>
                    <button
                      onClick={() => handleRemove(item.sakeName)}
                      className="px-3 py-2 bg-red-50 border-2 border-red-300 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
                      title="Remove from library"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-gray-400 mt-3">
                    Saved {new Date(item.savedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
