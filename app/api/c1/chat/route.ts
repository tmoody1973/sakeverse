import { thesysClient, C1_MODELS } from '@/lib/thesys/client'
import { SAKE_UI_SYSTEM_PROMPT } from '@/lib/thesys/prompts'

export async function POST(request: Request) {
  try {
    const { messages, context } = await request.json()

    if (!process.env.THESYS_API_KEY) {
      return Response.json(
        { error: 'THESYS_API_KEY not configured' },
        { status: 500 }
      )
    }

    // Build conversation with sake context
    const systemMessage = {
      role: 'system' as const,
      content: SAKE_UI_SYSTEM_PROMPT + (context ? `\n\nAdditional context:\n${context}` : '')
    }

    const response = await thesysClient.chat.completions.create({
      model: C1_MODELS.nightly,
      messages: [systemMessage, ...messages],
    })

    return Response.json({
      content: response.choices[0]?.message?.content,
      isC1: true,
    })
  } catch (error) {
    console.error('C1 API error:', error)
    return Response.json(
      { error: 'Failed to generate UI' },
      { status: 500 }
    )
  }
}
