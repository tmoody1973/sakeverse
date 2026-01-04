"use client"

import { useQuery, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useEffect, useState } from "react"
import { ExternalLink, Newspaper, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

type NewsHeadline = {
  title: string
  snippet: string
  emoji: string
  url?: string
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
            <>
              {[1,2,3].map(i => (
                <div key={i} className="p-3 bg-white/50 rounded-xl animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </>
          ) : news.length > 0 ? (
            news.map((item, i) => (
              <a 
                key={i} 
                href={item.url || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-start gap-3 p-3 bg-white/60 hover:bg-white rounded-xl border-2 border-transparent hover:border-ink hover:shadow-[3px_3px_0px_#2D2D2D] transition-all cursor-pointer"
                aria-label={`Read more: ${item.title}`}
              >
                <span className="text-2xl flex-shrink-0" role="img" aria-hidden="true">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-ink group-hover:text-plum-dark transition-colors line-clamp-1">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">{item.snippet}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-plum-dark flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
              </a>
            ))
          ) : (
            <div className="text-sm text-gray-500 p-3 bg-white/50 rounded-xl">No news available</div>
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
          <Link 
            href="/discover" 
            className="flex items-center gap-1 text-xs text-plum-dark hover:underline font-medium"
          >
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {featuredSake?.map((sake, i) => (
            <a 
              key={i} 
              href={sake.url || '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group bg-white rounded-xl p-3 border-2 border-ink shadow-[3px_3px_0px_#2D2D2D] hover:shadow-[5px_5px_0px_#6B4E71] hover:-translate-y-1 transition-all focus:outline-none focus:ring-2 focus:ring-plum-dark focus:ring-offset-2"
              aria-label={`${sake.name} by ${sake.brewery}, $${sake.price}`}
            >
              <div className="aspect-square bg-gradient-to-br from-sakura-light to-petal-light rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                {sake.image ? (
                  <img 
                    src={sake.image} 
                    alt={sake.name} 
                    className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform" 
                  />
                ) : (
                  <span className="text-4xl">🍶</span>
                )}
              </div>
              <p className="font-bold text-sm text-ink truncate group-hover:text-plum-dark transition-colors">
                {sake.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{sake.brewery}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-bold text-plum-dark">${sake.price}</span>
                <span className="text-xs bg-sakura-light text-plum-dark px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  View →
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
