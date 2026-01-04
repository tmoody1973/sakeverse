import OpenAI from 'openai'

// Thesys C1 uses OpenAI-compatible API
export const thesysClient = new OpenAI({
  apiKey: process.env.THESYS_API_KEY!,
  baseURL: 'https://api.thesys.dev/v1/embed',
})

export const C1_MODELS = {
  nightly: 'c1-nightly',
  stable: 'c1-stable',
} as const

export type C1Model = typeof C1_MODELS[keyof typeof C1_MODELS]
