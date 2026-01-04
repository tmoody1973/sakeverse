"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { ChevronRight, ChevronLeft, Check } from "lucide-react"

const experienceLevels = [
  { id: "beginner", label: "Beginner", emoji: "🌱", desc: "New to sake, eager to learn" },
  { id: "intermediate", label: "Intermediate", emoji: "🌿", desc: "Tried several types, know basics" },
  { id: "expert", label: "Expert", emoji: "🌳", desc: "Deep knowledge, refined palate" },
]

const foodOptions = [
  { id: "sushi", label: "Sushi & Sashimi", emoji: "🍣" },
  { id: "bbq", label: "BBQ & Grilled", emoji: "🍖" },
  { id: "cheese", label: "Cheese", emoji: "🧀" },
  { id: "spicy", label: "Spicy Food", emoji: "🌶️" },
  { id: "seafood", label: "Seafood", emoji: "🦐" },
  { id: "pasta", label: "Pasta & Italian", emoji: "🍝" },
  { id: "fried", label: "Fried Food", emoji: "🍟" },
  { id: "dessert", label: "Desserts", emoji: "🍰" },
]

const wineOptions = [
  { id: "pinot-noir", label: "Pinot Noir", emoji: "🍷" },
  { id: "chardonnay", label: "Chardonnay", emoji: "🥂" },
  { id: "cabernet", label: "Cabernet Sauvignon", emoji: "🍷" },
  { id: "sauvignon-blanc", label: "Sauvignon Blanc", emoji: "🥂" },
  { id: "riesling", label: "Riesling", emoji: "🥂" },
  { id: "champagne", label: "Champagne/Sparkling", emoji: "🍾" },
  { id: "rose", label: "Rosé", emoji: "🌸" },
  { id: "none", label: "I don't drink wine", emoji: "🚫" },
]

export default function OnboardingContent() {
  const router = useRouter()
  const { user } = useUser()
  const [step, setStep] = useState(1)
  const [preferences, setPreferences] = useState({
    experienceLevel: "",
    sweetness: 3,
    richness: 3,
    foodPreferences: [] as string[],
    winePreferences: [] as string[],
  })

  const savePreferences = useMutation(api.users.saveUserPreferences)

  const handleNext = () => setStep(s => Math.min(s + 1, 4))
  const handleBack = () => setStep(s => Math.max(s - 1, 1))

  const handleComplete = async () => {
    if (user) {
      await savePreferences({
        clerkId: user.id,
        preferences: {
          experienceLevel: preferences.experienceLevel,
          tastePreferences: {
            sweetness: preferences.sweetness,
            richness: preferences.richness,
          },
          foodPreferences: preferences.foodPreferences,
          winePreferences: preferences.winePreferences.filter(w => w !== "none"),
          onboardingComplete: true,
        },
      })
    }
    router.push("/")
  }

  const toggleArray = (arr: string[], item: string) => 
    arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Personalize Your Experience</CardTitle>
            <span className="text-sm text-gray-500">Step {step} of 4</span>
          </div>
          <div className="flex gap-2">
            {[1,2,3,4].map(s => (
              <div key={s} className={`h-2 flex-1 rounded-full ${s <= step ? 'bg-sakura-pink' : 'bg-gray-200'}`} />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">What's your sake experience?</h3>
              <div className="grid gap-3">
                {experienceLevels.map(level => (
                  <button
                    key={level.id}
                    onClick={() => setPreferences(p => ({ ...p, experienceLevel: level.id }))}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                      preferences.experienceLevel === level.id 
                        ? 'border-plum-dark bg-sakura-light shadow-[4px_4px_0px_#6B4E71]' 
                        : 'border-ink hover:bg-sakura-light'
                    }`}
                  >
                    <span className="text-3xl">{level.emoji}</span>
                    <div>
                      <div className="font-semibold">{level.label}</div>
                      <div className="text-sm text-gray-600">{level.desc}</div>
                    </div>
                    {preferences.experienceLevel === level.id && (
                      <Check className="ml-auto w-5 h-5 text-plum-dark" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">What flavors do you prefer?</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Dry</span>
                    <span className="text-sm font-medium">Sweet</span>
                  </div>
                  <input
                    type="range" min="1" max="5"
                    value={preferences.sweetness}
                    onChange={e => setPreferences(p => ({ ...p, sweetness: Number(e.target.value) }))}
                    className="w-full h-3 bg-sakura-light rounded-full appearance-none cursor-pointer accent-plum-dark"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Light</span>
                    <span className="text-sm font-medium">Rich</span>
                  </div>
                  <input
                    type="range" min="1" max="5"
                    value={preferences.richness}
                    onChange={e => setPreferences(p => ({ ...p, richness: Number(e.target.value) }))}
                    className="w-full h-3 bg-sakura-light rounded-full appearance-none cursor-pointer accent-plum-dark"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">What foods do you enjoy?</h3>
              <div className="grid grid-cols-2 gap-3">
                {foodOptions.map(food => (
                  <button
                    key={food.id}
                    onClick={() => setPreferences(p => ({ ...p, foodPreferences: toggleArray(p.foodPreferences, food.id) }))}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                      preferences.foodPreferences.includes(food.id)
                        ? 'border-plum-dark bg-sakura-light shadow-[3px_3px_0px_#6B4E71]'
                        : 'border-ink hover:bg-sakura-light'
                    }`}
                  >
                    <span className="text-2xl">{food.emoji}</span>
                    <span className="font-medium text-sm">{food.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Do you have wine preferences?</h3>
              <p className="text-sm text-gray-600">Optional — helps us translate your taste</p>
              <div className="grid grid-cols-2 gap-3">
                {wineOptions.map(wine => (
                  <button
                    key={wine.id}
                    onClick={() => setPreferences(p => ({ 
                      ...p, 
                      winePreferences: wine.id === "none" ? ["none"] : toggleArray(p.winePreferences.filter(w => w !== "none"), wine.id)
                    }))}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                      preferences.winePreferences.includes(wine.id)
                        ? 'border-plum-dark bg-sakura-light shadow-[3px_3px_0px_#6B4E71]'
                        : 'border-ink hover:bg-sakura-light'
                    }`}
                  >
                    <span className="text-2xl">{wine.emoji}</span>
                    <span className="font-medium text-sm">{wine.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <Button variant="ghost" onClick={handleBack} disabled={step === 1}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            {step < 4 ? (
              <Button variant="primary" onClick={handleNext} disabled={step === 1 && !preferences.experienceLevel}>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button variant="accent" onClick={handleComplete}>
                Complete Setup <Check className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
