import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { transformStream } from "@crayonai/stream"
import { tools, executeToolCall } from "./tools"
import { sakeSystemPrompt } from "./systemPrompt"

const client = new OpenAI({
  baseURL: "https://api.thesys.dev/v1/embed",
  apiKey: process.env.THESYS_API_KEY,
})

// Use stable production model per docs
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

    // First call - check for tool calls
    const initialResponse = await client.chat.completions.create({
      model: C1_MODEL,
      messages,
      tools,
    })

    const choice = initialResponse.choices[0]
    const assistantMessage = choice.message as any

    // If tool calls, execute them and make second call
    if (assistantMessage.tool_calls?.length > 0) {
      const toolMessages: OpenAI.ChatCompletionMessageParam[] = [
        { role: "assistant", content: assistantMessage.content, tool_calls: assistantMessage.tool_calls },
      ]

      for (const tc of assistantMessage.tool_calls) {
        const fn = tc.function || tc
        const result = await executeToolCall(fn.name, JSON.parse(fn.arguments || "{}"))
        toolMessages.push({ role: "tool", tool_call_id: tc.id, content: result })
      }

      // Stream final response with tool results
      const llmStream = await client.chat.completions.create({
        model: C1_MODEL,
        messages: [...messages, ...toolMessages],
        stream: true,
      })

      const responseStream = transformStream(
        llmStream,
        (chunk) => chunk.choices[0]?.delta?.content || ""
      ) as ReadableStream

      return new NextResponse(responseStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      })
    }

    // No tool calls - stream directly
    const llmStream = await client.chat.completions.create({
      model: C1_MODEL,
      messages,
      stream: true,
    })

    const responseStream = transformStream(
      llmStream,
      (chunk) => chunk.choices[0]?.delta?.content || ""
    ) as ReadableStream

    return new NextResponse(responseStream, {
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
