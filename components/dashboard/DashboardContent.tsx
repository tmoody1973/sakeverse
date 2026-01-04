"use client"

import { useQuery, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useEffect, useState } from "react"
import { ExternalLink, Newspaper, Sparkles } from "lucide-react"
import Link from "next/link"

type NewsHeadline = {
  title: string
  snippet: string
  emoji: string
}

type FeaturedSake = {
  name: string
  brewery: string
  price: number
  category: string
  image: string
  url: string
}

export function DashboardContent() {
  const [news, setNews] = useState<NewsHeadline[]>([])
  const [newsLoading, setNewsLoading] = useState(true)
  
  const featuredSake = useQuery(api.sake.getFeaturedTippsyProducts)
  const fetchNews = useAction(api.dashboard.fetchSakeNews)

  useEffect(() => {
    fetchNews().then((result) => {
      if (result.headlines) {
        setNews(result.headlines.slice(0, 3))
      }
      setNewsLoading(false)
    }).catch(() => setNewsLoading(false))
  }, [fetchNews])

  return (
    <div className="mt-6 space-y-6">
      {/* Sake News */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-plum-dark" />
            <span className="font-semibold text-ink">Sake News</span>
          </div>
          <span className="text-xs text-gray-500">Updated today</span>
        </div>
        
        <div className="space-y-2">
          {newsLoading ? (
            <div className="text-sm text-gray-500 animate-pulse">Loading news...</div>
          ) : news.length > 0 ? (
            news.map((item, i) => (
              <div key={i} className="flex items-start gap-2 p-2 bg-white/50 rounded-lg">
                <span className="text-lg">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-ink truncate">{item.title}</p>
                  <p className="text-xs text-gray-600 truncate">{item.snippet}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">No news available</div>
          )}
        </div>
      </div>

      {/* Featured Sake */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-plum-dark" />
            <span className="font-semibold text-ink">Featured Sake</span>
          </div>
          <Link href="/discover" className="text-xs text-plum-dark hover:underline">
            View All →
          </Link>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {featuredSake?.map((sake, i) => (
            <a 
              key={i} 
              href={sake.url || '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white rounded-lg p-2 border-2 border-ink shadow-[2px_2px_0px_#2D2D2D] hover:shadow-[4px_4px_0px_#2D2D2D] hover:-translate-y-1 transition-all"
            >
              {sake.image ? (
                <img src={sake.image} alt={sake.name} className="w-full h-16 object-contain bg-sakura-light rounded mb-1" />
              ) : (
                <div className="w-full h-16 bg-sakura-light rounded mb-1 flex items-center justify-center text-2xl">🍶</div>
              )}
              <p className="font-medium text-xs truncate">{sake.name}</p>
              <p className="text-xs text-gray-500 truncate">{sake.brewery}</p>
              <p className="font-bold text-xs text-plum-dark">${sake.price}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
