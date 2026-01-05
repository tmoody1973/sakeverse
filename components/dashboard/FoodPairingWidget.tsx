"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Shuffle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"

// Sake type display names
const sakeTypeNames: Record<string, string> = {
  junmai: "Junmai",
  junmai_ginjo: "Junmai Ginjo",
  junmai_daiginjo: "Junmai Daiginjo",
  honjozo: "Honjozo",
  nigori: "Nigori",
  sparkling: "Sparkling",
}

interface Dish {
  id: string
  name: string
  shortDescription: string
  flavorProfile: string[]
  recommendedSakeTypes: string[]
  pairingNotes: string
}

interface Cuisine {
  id: string
  name: string
  dishes: Dish[]
}

interface PairingData {
  cuisines: Cuisine[]
}

export function FoodPairingWidget() {
  const [expanded, setExpanded] = useState(false)
  const [pairingData, setPairingData] = useState<PairingData | null>(null)
  const [currentPairing, setCurrentPairing] = useState<{ dish: Dish; cuisine: string } | null>(null)

  useEffect(() => {
    fetch("/sake_pairing_database.json")
      .then(res => res.json())
      .then((data: PairingData) => {
        setPairingData(data)
        pickRandomPairing(data)
      })
      .catch(() => {})
  }, [])

  const pickRandomPairing = (data: PairingData) => {
    const allDishes: { dish: Dish; cuisine: string }[] = []
    data.cuisines.forEach(c => {
      c.dishes.forEach(d => allDishes.push({ dish: d, cuisine: c.name }))
    })
    if (allDishes.length > 0) {
      setCurrentPairing(allDishes[Math.floor(Math.random() * allDishes.length)])
    }
  }

  const handleShuffle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (pairingData) pickRandomPairing(pairingData)
  }

  if (!currentPairing) {
    return (
      <Card className="bg-gradient-to-br from-sake-warm/30 to-white">
        <CardContent className="p-4">
          <div className="animate-pulse flex items-center gap-3">
            <div className="text-2xl">🍜</div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-200 rounded w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { dish, cuisine } = currentPairing
  const primarySake = dish.recommendedSakeTypes[0]

  return (
    <Card 
      className="bg-gradient-to-br from-sake-warm/30 to-white cursor-pointer overflow-hidden"
      onClick={() => setExpanded(!expanded)}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="text-2xl">🍜</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-gray-500 font-medium">Tonight's Pairing</p>
              <div className="flex items-center gap-1">
                <button 
                  onClick={handleShuffle}
                  className="p-1 hover:bg-sake-warm/50 rounded transition-colors"
                  title="Get new pairing"
                >
                  <Shuffle className="h-3 w-3 text-gray-500" />
                </button>
                <motion.div
                  animate={{ rotate: expanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </motion.div>
              </div>
            </div>
            <p className="text-sm text-ink font-semibold truncate">
              {dish.name} + {sakeTypeNames[primarySake] || primarySake}
            </p>
            <p className="text-xs text-gray-500">{cuisine}</p>
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-3 border-t border-sake-warm/50 space-y-3">
                {/* Dish Description */}
                <p className="text-xs text-gray-600">{dish.shortDescription}</p>

                {/* Flavor Profile */}
                <div className="flex flex-wrap gap-1">
                  {dish.flavorProfile.map(f => (
                    <Badge key={f} variant="secondary" size="sm" className="text-[10px]">
                      {f}
                    </Badge>
                  ))}
                </div>

                {/* Recommended Sake */}
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Best with</p>
                  <div className="flex flex-wrap gap-1">
                    {dish.recommendedSakeTypes.map(s => (
                      <Badge key={s} variant="primary" size="sm" className="text-[10px]">
                        {sakeTypeNames[s] || s}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Pairing Notes */}
                <p className="text-xs text-gray-600 italic">"{dish.pairingNotes}"</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
