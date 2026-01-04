import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { transformStream } from "@crayonai/stream"
import { DBMessage, getMessageStore } from "./messageStore"
import { tools } from "./tools"
import { sakeSystemPrompt } from "./systemPrompt"

const client = new OpenAI({
  baseURL: "https://api.thesys.dev/v1/embed/",
  apiKey: process.env.THESYS_API_KEY,
})

const C1_MODEL = "c1/anthropic/claude-sonnet-4/v-20251130"

export async function POST(req: NextRequest) {
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

  // Use runTools for automatic tool calling (SDK v6 uses chat.completions.runTools)
  const llmStream = await client.chat.completions.runTools({
    model: C1_MODEL,
    temperature: 0.7,
    messages: messageStore.getOpenAICompatibleMessageList(),
    stream: true,
    tool_choice: tools.length > 0 ? "auto" : "none",
    tools,
  })

  const responseStream = transformStream(
    llmStream,
    (chunk) => chunk.choices?.[0]?.delta?.content ?? "",
    {
      onEnd: ({ accumulated }) => {
        const message = accumulated.filter((m) => m).join("")
        messageStore.addMessage({
          role: "assistant",
          content: message,
          id: responseId,
        })
      },
    }
  ) as ReadableStream<string>

  return new NextResponse(responseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}
