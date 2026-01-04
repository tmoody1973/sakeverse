import { NextResponse } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(req: Request) {
  const { food } = await req.json()
  
  try {
    const results = await convex.action(api.foodPairing.searchFoodPairing, { query: food })
    if (results.length > 0) {
      return NextResponse.json({ recommendation: results[0].content })
    }
  } catch (e) {}
  
  return NextResponse.json({ recommendation: `For ${food}, I'd recommend a versatile Junmai or Junmai Ginjo that complements the flavors.` })
}
