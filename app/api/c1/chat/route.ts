import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { tools } from "./tools"
import { sakeSystemPrompt } from "./systemPrompt"

const client = new OpenAI({
  baseURL: "https://api.thesys.dev/v1/embed",
  apiKey: process.env.THESYS_API_KEY,
})

const C1_MODEL = "c1/anthropic/claude-sonnet-4/v-20251130"

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    if (!process.env.THESYS_API_KEY) {
      return NextResponse.json({ error: "THESYS_API_KEY not configured" }, { status: 500 })
    }

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: sakeSystemPrompt },
      { role: "user", content: prompt },
    ]

    // Use runTools for automatic tool calling per C1 docs
    const runner = client.chat.completions.runTools({
      model: C1_MODEL,
      messages,
      tools,
      stream: true,
    })

    // Create a readable stream that yields content chunks
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        
        try {
          for await (const chunk of runner) {
            const content = chunk.choices[0]?.delta?.content
            if (content) {
              controller.enqueue(encoder.encode(content))
            }
          }
        } catch (error) {
          console.error("Stream error:", error)
        } finally {
          controller.close()
        }
      },
    })

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("C1 API error:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
