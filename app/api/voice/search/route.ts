import { NextResponse } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
  const { query } = await req.json()
  
  try {
    const products = await convex.action(api.embeddings.semanticSearch, {
      query,
      limit: 3,
    })
    
    return NextResponse.json(products.map((p: any) => ({
      name: p.productName,
      brewery: p.brewery,
      price: p.price,
      category: p.category,
      description: p.tasteProfile || p.description,
      image: p.images?.[0] || '',
      url: p.url || '',
    })))
  } catch (e) {
    return NextResponse.json([])
  }
}
