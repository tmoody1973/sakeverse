"use node"

import { action } from "./_generated/server"
import { internal } from "./_generated/api"
import { v } from "convex/values"

// eslint-disable-next-line @typescript-eslint/no-require-imports
const lamejs = require("lamejs")

type AudioResult = {
  success: boolean
  duration?: number
  url?: string
  error?: string
}

// Voice assignments for multi-host
const VOICES = {
  TOJI: "Kore",
  KOJI: "Puck",
  NARRATOR: "Kore"
}

export const generateAudio = action({
  args: {
    episodeId: v.id("podcastEpisodes"),
  },
  handler: async (ctx, { episodeId }): Promise<AudioResult> => {
    const episode = await ctx.runQuery(internal.podcastEpisodes.getByIdInternal, { episodeId })
    if (!episode?.script?.content) {
      return { success: false, error: "No script found for episode" }
    }

    const geminiKey = process.env.GEMINI_API_KEY
    if (!geminiKey) {
      return { success: false, error: "GEMINI_API_KEY not configured" }
    }

    console.log("Generating audio for episode:", episode.title)

    try {
      // Chunk the entire script by character limit (preserving line breaks)
      const chunks = chunkScript(episode.script.content, 4000)
      console.log(`Script chunked into ${chunks.length} parts: ${chunks.map(c => c.length).join(', ')} chars`)

      const audioChunks: Int16Array[] = []
      
      for (let i = 0; i < chunks.length; i++) {
        // Check if cancelled before each chunk
        const cancelled = await ctx.runQuery(internal.podcastEpisodes.isCancelled, { episodeId })
        if (cancelled) {
          console.log("Generation cancelled by user")
          return { success: false, error: "Cancelled by user" }
        }
        
        console.log(`Processing chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)`)
        
        const pcmData = await callTTS(chunks[i], VOICES.TOJI, geminiKey)
        if (pcmData) {
          audioChunks.push(pcmData)
        }
        
        // Rate limiting between chunks
        if (i < chunks.length - 1) {
          await new Promise(r => setTimeout(r, 1500))
        }
      }

      if (audioChunks.length === 0) {
        return { success: false, error: "No audio generated" }
      }

      const totalLength = audioChunks.reduce((acc, chunk) => acc + chunk.length, 0)
      const combinedSamples = new Int16Array(totalLength)
      let offset = 0
      for (const chunk of audioChunks) {
        combinedSamples.set(chunk, offset)
        offset += chunk.length
      }

      console.log("Encoding to MP3...")
      const mp3Buffer = encodeMp3(combinedSamples, 24000)

      const blob = new Blob([mp3Buffer.buffer as ArrayBuffer], { type: "audio/mpeg" })
      const storageId = await ctx.storage.store(blob)
      const url = await ctx.storage.getUrl(storageId)

      if (!url) {
        return { success: false, error: "Failed to get storage URL" }
      }

      const durationSeconds = combinedSamples.length / 24000

      await ctx.runMutation(internal.podcastEpisodes.updateAudio, {
        episodeId,
        audio: {
          storageId,
          url,
          duration: Math.round(durationSeconds),
          format: "mp3",
          generatedAt: Date.now(),
        },
      })

      console.log("Audio saved: MP3,", Math.round(durationSeconds), "seconds")
      return { success: true, duration: Math.round(durationSeconds), url }
    } catch (e: unknown) {
      const error = e instanceof Error ? e.message : "Unknown error"
      console.error("TTS error:", error)
      return { success: false, error }
    }
  },
})

// Chunk script by character limit, splitting at line breaks
function chunkScript(script: string, maxChars: number = 4000): string[] {
  const lines = script.split('\n').filter(l => l.trim())
  const chunks: string[] = []
  let currentChunk: string[] = []
  let currentSize = 0

  for (const line of lines) {
    if (currentSize + line.length + 1 > maxChars && currentChunk.length > 0) {
      chunks.push(currentChunk.join('\n'))
      currentChunk = []
      currentSize = 0
    }
    currentChunk.push(line)
    currentSize += line.length + 1
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('\n'))
  }

  return chunks
}

async function callTTS(text: string, voice: string, apiKey: string, retries = 3): Promise<Int16Array | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`TTS attempt ${attempt}: ${text.length} chars, voice: ${voice}`)
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text }] }],
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: voice }
                }
              }
            }
          }),
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`TTS error ${response.status} (attempt ${attempt}):`, errorText.substring(0, 300))
        
        if (response.status === 500 && attempt < retries) {
          // Wait longer on 500 errors (server overload)
          await new Promise(r => setTimeout(r, 2000 * attempt))
          continue
        }
        return null
      }

      const result = await response.json()
      
      // Debug: log response structure
      console.log("TTS response keys:", Object.keys(result))
      if (result.candidates?.[0]) {
        console.log("Candidate keys:", Object.keys(result.candidates[0]))
        if (result.candidates[0].content) {
          console.log("Content keys:", Object.keys(result.candidates[0].content))
          console.log("Parts count:", result.candidates[0].content.parts?.length)
          if (result.candidates[0].content.parts?.[0]) {
            console.log("Part 0 keys:", Object.keys(result.candidates[0].content.parts[0]))
          }
        }
      }
      
      const audioData = result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data

      if (!audioData) {
        console.error("No audio data in response, full response:", JSON.stringify(result).substring(0, 500))
        return null
      }

      const binaryString = atob(audioData)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      
      return new Int16Array(bytes.buffer)
    } catch (e) {
      console.error(`TTS call failed (attempt ${attempt}):`, e)
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1000 * attempt))
      }
    }
  }
  return null
}

function encodeMp3(samples: Int16Array, sampleRate: number): Uint8Array {
  const mp3encoder = new lamejs.Mp3Encoder(1, sampleRate, 128)
  const mp3Data: Uint8Array[] = []
  
  const blockSize = 1152
  for (let i = 0; i < samples.length; i += blockSize) {
    const chunk = samples.subarray(i, i + blockSize)
    const mp3buf = mp3encoder.encodeBuffer(chunk)
    if (mp3buf.length > 0) {
      mp3Data.push(new Uint8Array(mp3buf))
    }
  }
  
  const end = mp3encoder.flush()
  if (end.length > 0) {
    mp3Data.push(new Uint8Array(end))
  }
  
  const totalLength = mp3Data.reduce((acc, arr) => acc + arr.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of mp3Data) {
    result.set(chunk, offset)
    offset += chunk.length
  }
  
  return result
}
