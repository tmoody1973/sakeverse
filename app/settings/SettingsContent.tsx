"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import Link from "next/link"
import { ArrowLeft, Check } from "lucide-react"

const foodOptions = ["Sushi", "Ramen", "BBQ", "Seafood", "Tempura", "Curry", "Vegetarian", "Spicy Food"]
const wineOptions = ["Pinot Noir", "Chardonnay", "Cabernet", "Sauvignon Blanc", "Riesling", "Champagne", "Rosé", "None"]

export default function SettingsContent() {
  const { user } = useUser()
  const preferences = useQuery(api.users.getUserPreferences, 
    user?.id ? { clerkId: user.id } : "skip"
  )
  const savePreferences = useMutation(api.users.saveUserPreferences)
  
  const [experienceLevel, setExperienceLevel] = useState("beginner")
  const [sweetness, setSweetness] = useState(3)
  const [richness, setRichness] = useState(3)
  const [foodPrefs, setFoodPrefs] = useState<string[]>([])
  const [winePrefs, setWinePrefs] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (preferences) {
      setExperienceLevel(preferences.experienceLevel || "beginner")
      setSweetness(preferences.tastePreferences?.sweetness || 3)
      setRichness(preferences.tastePreferences?.richness || 3)
      setFoodPrefs(preferences.foodPreferences || [])
      setWinePrefs(preferences.winePreferences || [])
    }
  }, [preferences])

  const handleSave = async () => {
    if (!user?.id) return
    setSaving(true)
    await savePreferences({
      clerkId: user.id,
      preferences: {
        experienceLevel,
        tastePreferences: { sweetness, richness },
        foodPreferences: foodPrefs,
        winePreferences: winePrefs,
        onboardingComplete: true,
      },
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggleFood = (food: string) => {
    setFoodPrefs(prev => prev.includes(food) ? prev.filter(f => f !== food) : [...prev, food])
  }

  const toggleWine = (wine: string) => {
    setWinePrefs(prev => prev.includes(wine) ? prev.filter(w => w !== wine) : [...prev, wine])
  }

  return (
    <div className="container-retro py-8">
      <Link href="/" className="inline-flex items-center text-plum-dark hover:underline mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Link>

      <h1 className="text-3xl font-display font-bold text-ink mb-8">Preferences</h1>

      <div className="max-w-2xl space-y-6">
        {/* Experience Level */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Experience Level</h2>
          <div className="flex gap-3">
            {["beginner", "intermediate", "expert"].map((level) => (
              <button
                key={level}
                onClick={() => setExperienceLevel(level)}
                className={`px-4 py-2 rounded-lg border-2 border-ink capitalize transition-all ${
                  experienceLevel === level
                    ? "bg-sakura-pink shadow-retro"
                    : "bg-white hover:bg-sakura-light"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </Card>

        {/* Taste Preferences */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Taste Preferences</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Sweetness: {sweetness}/5
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={sweetness}
                onChange={(e) => setSweetness(Number(e.target.value))}
                className="w-full accent-sakura-pink"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Dry</span>
                <span>Sweet</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Richness: {richness}/5
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={richness}
                onChange={(e) => setRichness(Number(e.target.value))}
                className="w-full accent-sakura-pink"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Light</span>
                <span>Full-bodied</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Food Preferences */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Food Preferences</h2>
          <div className="flex flex-wrap gap-2">
            {foodOptions.map((food) => (
              <button
                key={food}
                onClick={() => toggleFood(food)}
                className={`px-3 py-1.5 rounded-full border-2 border-ink text-sm transition-all ${
                  foodPrefs.includes(food)
                    ? "bg-sakura-pink shadow-retro-sm"
                    : "bg-white hover:bg-sakura-light"
                }`}
              >
                {food}
              </button>
            ))}
          </div>
        </Card>

        {/* Wine Background */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Wine Background (Optional)</h2>
          <p className="text-sm text-gray-600 mb-3">Help Kiki translate your wine preferences to sake</p>
          <div className="flex flex-wrap gap-2">
            {wineOptions.map((wine) => (
              <button
                key={wine}
                onClick={() => toggleWine(wine)}
                className={`px-3 py-1.5 rounded-full border-2 border-ink text-sm transition-all ${
                  winePrefs.includes(wine)
                    ? "bg-plum-dark text-white shadow-retro-sm"
                    : "bg-white hover:bg-sakura-light"
                }`}
              >
                {wine}
              </button>
            ))}
          </div>
        </Card>

        {/* Save Button */}
        <Button 
          variant="primary" 
          size="lg" 
          onClick={handleSave}
          disabled={saving}
          className="w-full"
        >
          {saved ? (
            <>
              <Check className="w-5 h-5 mr-2" />
              Saved!
            </>
          ) : saving ? (
            "Saving..."
          ) : (
            "Save Preferences"
          )}
        </Button>
      </div>
    </div>
  )
}
