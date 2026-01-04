import { NextResponse } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(req: Request) {
  const { wine } = await req.json()
  
  try {
    const results = await convex.action(api.wineToSake.searchWineToSake, { query: wine })
    if (results.length > 0) {
      return NextResponse.json({ recommendation: results[0].content })
    }
  } catch (e) {}
  
  return NextResponse.json({ recommendation: `Based on your love of ${wine}, you might enjoy exploring Junmai Daiginjo for elegance or aged Junmai for complexity.` })
}
