import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Temperature conversion utilities
export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9/5) + 32
}

export function getTemperatureStyle(celsius: number): string {
  if (celsius <= 5) return "Yuki-bie (Snow Cold)"
  if (celsius <= 10) return "Hana-bie (Flower Cold)"
  if (celsius <= 15) return "Suzu-bie (Cool Breeze)"
  if (celsius <= 20) return "Jō-on (Room Temperature)"
  if (celsius <= 30) return "Hinata-kan (Sunlight Warm)"
  if (celsius <= 35) return "Hitohada-kan (Body Temperature)"
  if (celsius <= 40) return "Nuru-kan (Luke Warm)"
  if (celsius <= 45) return "Jō-kan (Warm)"
  if (celsius <= 50) return "Atsukan (Hot)"
  return "Tobikiri-kan (Piping Hot)"
}

// Sake type utilities
export function getSakeTypeColor(type: string): string {
  const colors: Record<string, string> = {
    "Junmai": "bg-sakura-pink",
    "Ginjo": "bg-sake-mist", 
    "Daiginjo": "bg-petal-light",
    "Honjozo": "bg-sake-warm",
    "Nigori": "bg-matcha",
    "Sparkling": "bg-sakura-light",
    "Yamahai": "bg-plum-dark text-white",
    "Kimoto": "bg-ink text-white",
  }
  return colors[type] || "bg-gray-200"
}

// Format price
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

// Format Japanese names
export function formatJapaneseName(name: string, romaji?: string): string {
  if (romaji) {
    return `${name} (${romaji})`
  }
  return name
}

// Calculate taste compatibility
export function calculateTasteCompatibility(
  userPrefs: { sweetness: number; acidity: number; richness: number; umami: number },
  sakeProfile: { sweetness: number; acidity: number; richness: number; umami: number }
): number {
  const sweetnessScore = 5 - Math.abs(userPrefs.sweetness - sakeProfile.sweetness)
  const acidityScore = 5 - Math.abs(userPrefs.acidity - sakeProfile.acidity)
  const richnessScore = 5 - Math.abs(userPrefs.richness - sakeProfile.richness)
  const umamiScore = 5 - Math.abs(userPrefs.umami - sakeProfile.umami)
  
  return (sweetnessScore + acidityScore + richnessScore + umamiScore) / 4
}

// Generate taste description
export function generateTasteDescription(profile: {
  sweetness: number;
  acidity: number;
  richness: number;
  umami: number;
}): string {
  const descriptors = []
  
  if (profile.sweetness >= 4) descriptors.push("sweet")
  else if (profile.sweetness <= 2) descriptors.push("dry")
  
  if (profile.acidity >= 4) descriptors.push("crisp")
  else if (profile.acidity <= 2) descriptors.push("smooth")
  
  if (profile.richness >= 4) descriptors.push("full-bodied")
  else if (profile.richness <= 2) descriptors.push("light")
  
  if (profile.umami >= 4) descriptors.push("savory")
  
  return descriptors.join(", ") || "balanced"
}

// XP and level utilities
export function calculateLevel(xp: number): number {
  return Math.floor(xp / 100) + 1
}

export function getXpForNextLevel(currentXp: number): number {
  const currentLevel = calculateLevel(currentXp)
  return currentLevel * 100 - currentXp
}

export function getLevelProgress(xp: number): number {
  const currentLevel = calculateLevel(xp)
  const xpInCurrentLevel = xp - ((currentLevel - 1) * 100)
  return (xpInCurrentLevel / 100) * 100
}
