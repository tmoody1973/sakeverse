import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { transformStream } from "@crayonai/stream"
import { tools } from "./tools"
import { sakeSystemPrompt } from "./systemPrompt"
import { DBMessage, getMessageStore } from "./messageStore"

const client = new OpenAI({
  baseURL: "https://api.thesys.dev/v1/embed",
  apiKey: process.env.THESYS_API_KEY,
})

const C1_MODEL = "c1/anthropic/claude-sonnet-4/v-20251130"

export async function POST(req: NextRequest) {
  try {
    const { prompt, threadId = "default", responseId } = await req.json() as {
      prompt: DBMessage | string
      threadId?: string
      responseId?: string
    }

    if (!process.env.THESYS_API_KEY) {
      return NextResponse.json({ error: "THESYS_API_KEY not configured" }, { status: 500 })
    }

    const messageStore = getMessageStore(threadId)
    
    // Handle both C1Chat format (object with role/content) and simple string
    const userMessage: DBMessage = typeof prompt === 'string' 
      ? { role: "user", content: prompt }
      : prompt
    
    messageStore.addMessage(userMessage)

    // Build messages with system prompt
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: sakeSystemPrompt },
      ...messageStore.getOpenAICompatibleMessageList(),
    ]

    // Use runTools for automatic tool calling
    const runner = client.chat.completions.runTools({
      model: C1_MODEL,
      messages,
      tools,
      stream: true,
    })

    // Transform stream for C1Chat
    const responseStream = transformStream(
      runner,
      (chunk) => chunk.choices[0]?.delta?.content || "",
      {
        onEnd: ({ accumulated }) => {
          const message = accumulated.filter(Boolean).join("")
          if (message) {
            messageStore.addMessage({
              role: "assistant",
              content: message,
              id: responseId,
            })
          }
        },
      }
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
