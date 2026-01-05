"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Star, Filter, ChevronDown, ExternalLink, Heart } from "lucide-react"
import Link from "next/link"

const sortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
]

export default function DiscoverContent() {
  const [category, setCategory] = useState("All")
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(200)
  const [region, setRegion] = useState("All")
  const [sort, setSort] = useState("recommended")
  const [showFilters, setShowFilters] = useState(false)

  // Session for library
  const [sessionId, setSessionId] = useState<string | null>(null)
  useEffect(() => {
    let id = sessionStorage.getItem('sakeverse-session')
    if (!id) {
      id = crypto.randomUUID()
      sessionStorage.setItem('sakeverse-session', id)
    }
    setSessionId(id)
  }, [])

  const categories = useQuery(api.discover.getCategories)
  const regions = useQuery(api.discover.getRegions)
  const data = useQuery(api.discover.getDiscoverProducts, {
    category: category !== "All" ? category : undefined,
    minPrice: minPrice > 0 ? minPrice : undefined,
    maxPrice: maxPrice < 200 ? maxPrice : undefined,
    region: region !== "All" ? region : undefined,
    sort,
    limit: 24,
  })

  const saveSake = useMutation(api.userLibrary.saveSake)

  const handleSave = async (product: any) => {
    if (!sessionId) return
    await saveSake({
      sessionId,
      sake: {
        name: product.productName,
        brewery: product.brewery,
        region: product.prefecture || product.region || "",
        category: product.category,
        price: product.price,
        image: product.images?.[0] || "",
        url: product.url || "",
      },
    })
  }

  return (
    <div className="container-retro py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-ink">Discover Sake</h1>
          <p className="text-gray-600 mt-1">
            {data?.total || 0} sake to explore
          </p>
        </div>
        <Button 
          variant="secondary" 
          className="lg:hidden"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Mobile Filter Chips */}
      <div className="lg:hidden overflow-x-auto pb-4 -mx-4 px-4">
        <div className="flex gap-2">
          {categories?.slice(0, 6).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full border-2 border-ink text-sm whitespace-nowrap transition-all ${
                category === cat
                  ? "bg-sakura-pink shadow-retro-sm"
                  : "bg-white hover:bg-sakura-light"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Filter Sidebar - Desktop */}
        <aside className={`lg:col-span-3 space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
          {/* Category */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-ink mb-3">Category</h3>
              <div className="flex flex-wrap gap-2">
                {categories?.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-full border-2 border-ink text-sm transition-all ${
                      category === cat
                        ? "bg-sakura-pink shadow-retro-sm"
                        : "bg-white hover:bg-sakura-light"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Price Range */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-ink mb-3">Price Range</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">${minPrice}</span>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="flex-1 accent-sakura-pink"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">${maxPrice}</span>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="flex-1 accent-sakura-pink"
                  />
                </div>
                <p className="text-xs text-gray-500 text-center">
                  ${minPrice} - ${maxPrice === 200 ? "200+" : maxPrice}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Region */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-ink mb-3">Region</h3>
              <div className="relative">
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full p-2 pr-8 border-2 border-ink rounded-lg bg-white appearance-none cursor-pointer"
                >
                  {regions?.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
              </div>
            </CardContent>
          </Card>

          {/* Sort */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-ink mb-3">Sort By</h3>
              <div className="space-y-2">
                {sortOptions.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sort"
                      value={opt.value}
                      checked={sort === opt.value}
                      onChange={(e) => setSort(e.target.value)}
                      className="accent-sakura-pink"
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Clear Filters */}
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={() => {
              setCategory("All")
              setMinPrice(0)
              setMaxPrice(200)
              setRegion("All")
              setSort("recommended")
            }}
          >
            Clear All Filters
          </Button>
        </aside>

        {/* Product Grid */}
        <main className="lg:col-span-9">
          {/* Sort - Desktop */}
          <div className="hidden lg:flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              Showing {data?.products.length || 0} of {data?.total || 0} results
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="p-2 border-2 border-ink rounded-lg bg-white"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data?.products.map((product) => (
              <Card key={product._id} className="group">
                <CardContent className="p-3">
                  <div className="aspect-square bg-gradient-to-br from-sakura-light to-petal-light rounded-lg mb-3 flex items-center justify-center overflow-hidden relative">
                    {product.images?.[0] ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.productName}
                        className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <span className="text-4xl">🍶</span>
                    )}
                    <Badge className="absolute top-2 left-2 text-xs" variant="primary">
                      {product.category.split(" ")[0]}
                    </Badge>
                    <button
                      onClick={() => handleSave(product)}
                      className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-sakura-pink"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-semibold text-sm text-ink truncate group-hover:text-plum-dark transition-colors">
                    {product.productName}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">{product.brewery}</p>
                  <p className="text-xs text-gray-400 truncate">{product.prefecture}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-plum-dark">${product.price}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-600">{product.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-sakura-pink border-2 border-ink rounded-lg text-xs font-medium hover:shadow-retro-sm transition-all"
                  >
                    View on Tippsy
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {data?.products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No sake found matching your filters</p>
              <Button variant="primary" onClick={() => {
                setCategory("All")
                setMinPrice(0)
                setMaxPrice(200)
                setRegion("All")
              }}>
                Clear Filters
              </Button>
            </div>
          )}

          {/* Load More */}
          {data?.hasMore && (
            <div className="text-center mt-8">
              <Button variant="secondary">
                Load More
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
