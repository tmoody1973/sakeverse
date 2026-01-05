"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { Trash2, ExternalLink, Wine } from "lucide-react"

export default function LibraryContent() {
  const { user, isLoaded } = useUser()
  const clerkId = user?.id

  const library = useQuery(
    api.userLibrary.getLibrary, 
    isLoaded ? { clerkId: clerkId || undefined } : "skip"
  )
  const removeSake = useMutation(api.userLibrary.removeSake)

  const handleRemove = async (sakeName: string) => {
    if (!clerkId) return
    await removeSake({ clerkId, sakeName })
  }

  if (!isLoaded) {
    return <div className="min-h-screen bg-sakura-white p-6 flex items-center justify-center">Loading...</div>
  }

  if (!clerkId) {
    return (
      <main className="min-h-screen bg-sakura-white p-6">
        <div className="max-w-6xl mx-auto text-center py-20">
          <Wine className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-ink mb-2">Sign in to view your library</h1>
          <p className="text-gray-600 mb-6">Save your favorite sake and access them anywhere</p>
          <Link href="/sign-in" className="btn-primary">Sign In</Link>
        </div>
      </main>
    )
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
              {library?.length || 0} sake saved
            </p>
          </div>
          <Link 
            href="/discover" 
            className="btn-primary"
          >
            Discover More
          </Link>
        </div>

        {/* Library Grid */}
        {!library || library.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-ink shadow-retro">
            <Wine className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold text-ink mb-2">Your library is empty</h2>
            <p className="text-gray-600 mb-6">Start exploring and save sake you love!</p>
            <Link href="/discover" className="btn-primary">
              Browse Sake
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {library.map((item) => (
              <div 
                key={item._id} 
                className="bg-white rounded-xl border-2 border-ink shadow-retro p-4 hover:shadow-retro-lg transition-shadow"
              >
                <div className="flex gap-4">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.sakeName}
                      className="w-20 h-28 object-contain rounded-lg bg-sakura-light"
                    />
                  ) : (
                    <div className="w-20 h-28 bg-sakura-light rounded-lg flex items-center justify-center text-3xl">
                      🍶
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-ink truncate">{item.sakeName}</h3>
                    <p className="text-sm text-gray-600 truncate">{item.brewery}</p>
                    <p className="text-sm text-gray-500">{item.region}</p>
                    <p className="text-lg font-bold text-plum-dark mt-1">${item.price}</p>
                    <span className="inline-block text-xs bg-sakura-light px-2 py-0.5 rounded-full mt-1">
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 btn-secondary text-sm flex items-center justify-center gap-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on Tippsy
                  </a>
                  <button
                    onClick={() => handleRemove(item.sakeName)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove from library"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
