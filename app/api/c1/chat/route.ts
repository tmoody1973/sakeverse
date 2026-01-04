import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { sakeTools, executeToolCall } from "./tools"
import { sakeSystemPrompt } from "./systemPrompt"

const client = new OpenAI({
  baseURL: "https://api.thesys.dev/v1/embed",
  apiKey: process.env.THESYS_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { prompt, previousC1Response } = await req.json()

    if (!process.env.THESYS_API_KEY) {
      return NextResponse.json(
        { error: "THESYS_API_KEY not configured" },
        { status: 500 }
      )
    }

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: sakeSystemPrompt },
    ]

    if (previousC1Response) {
      messages.push({ role: "assistant", content: previousC1Response })
    }

    messages.push({ role: "user", content: prompt })

    // First call to get tool calls or direct response
    const response = await client.chat.completions.create({
      model: "c1-nightly",
      messages,
      tools: sakeTools,
    })

    const choice = response.choices[0]
    const message = choice.message as any
    
    // If no tool calls, return the content directly
    if (!message.tool_calls || message.tool_calls.length === 0) {
      return NextResponse.json({ content: message.content || "" })
    }

    // Execute tool calls
    const toolResults: OpenAI.ChatCompletionMessageParam[] = [{
      role: "assistant",
      content: message.content,
      tool_calls: message.tool_calls,
    }]
    
    for (const toolCall of message.tool_calls) {
      const fn = toolCall.function || toolCall
      const args = JSON.parse(fn.arguments || "{}")
      const result = await executeToolCall(fn.name, args)
      
      toolResults.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: result,
      })
    }

    // Second call with tool results
    const finalResponse = await client.chat.completions.create({
      model: "c1-nightly",
      messages: [...messages, ...toolResults],
    })

    return NextResponse.json({ 
      content: (finalResponse.choices[0].message as any).content || "" 
    })
  } catch (error) {
    console.error("C1 API error:", error)
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    )
  }
}
