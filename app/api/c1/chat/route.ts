import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { DBMessage, getMessageStore } from "./messageStore"
import { tools } from "./tools"
import { sakeSystemPrompt } from "./systemPrompt"

const client = new OpenAI({
  baseURL: "https://api.thesys.dev/v1/embed/",
  apiKey: process.env.THESYS_API_KEY,
})

const C1_MODEL = "c1/anthropic/claude-sonnet-4/v-20251130"

export async function POST(req: NextRequest) {
  try {
    const { prompt, threadId, responseId } = (await req.json()) as {
      prompt: DBMessage
      threadId: string
      responseId: string
    }

    if (!process.env.THESYS_API_KEY) {
      return NextResponse.json({ error: "THESYS_API_KEY not configured" }, { status: 500 })
    }

    const messageStore = getMessageStore(threadId)

    // Add system prompt if this is a new thread
    if (messageStore.messageList.length === 0) {
      messageStore.addMessage({ role: "system", content: sakeSystemPrompt })
    }

    messageStore.addMessage(prompt)

    // Use runTools for automatic tool calling
    const runner = client.chat.completions.runTools({
      model: C1_MODEL,
      temperature: 0.7,
      messages: messageStore.getOpenAICompatibleMessageList(),
      stream: true,
      tool_choice: tools.length > 0 ? "auto" : "none",
      tools,
    })

    // Create a readable stream that manually iterates over the runner
    const encoder = new TextEncoder()
    let fullContent = ""

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of runner) {
            if (event.choices?.[0]?.delta?.content) {
              const content = event.choices[0].delta.content
              fullContent += content
              controller.enqueue(encoder.encode(content))
            }
          }
          
          // Save the complete message
          messageStore.addMessage({
            role: "assistant",
            content: fullContent,
            id: responseId,
          })
          
          controller.close()
        } catch (error) {
          console.error("Stream error:", error)
          controller.error(error)
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
    console.error("API route error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
