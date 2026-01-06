"use node"

import { action } from "./_generated/server"
import { internal } from "./_generated/api"
import { v } from "convex/values"

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

    try {
      // Chunk the entire script by character limit (preserving line breaks)
      const chunks = chunkScript(episode.script.content, 4000)

      const audioChunks: Int16Array[] = []
      
      for (let i = 0; i < chunks.length; i++) {
        // Check if cancelled before each chunk
        const cancelled = await ctx.runQuery(internal.podcastEpisodes.isCancelled, { episodeId })
        if (cancelled) {
          return { success: false, error: "Cancelled by user" }
        }
        
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

      const wavBuffer = createWavBuffer(combinedSamples, 24000)

      const blob = new Blob([wavBuffer], { type: "audio/wav" })
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
          format: "wav",
          generatedAt: Date.now(),
        },
      })

      console.log("Audio saved: WAV,", Math.round(durationSeconds), "seconds")
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

function createWavBuffer(samples: Int16Array, sampleRate: number): ArrayBuffer {
  const numChannels = 1
  const bitsPerSample = 16
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8)
  const blockAlign = numChannels * (bitsPerSample / 8)
  const dataSize = samples.length * (bitsPerSample / 8)
  const headerSize = 44
  
  const buffer = new ArrayBuffer(headerSize + dataSize)
  const view = new DataView(buffer)
  
  // RIFF header
  writeString(view, 0, "RIFF")
  view.setUint32(4, 36 + dataSize, true)
  writeString(view, 8, "WAVE")
  
  // fmt chunk
  writeString(view, 12, "fmt ")
  view.setUint32(16, 16, true) // chunk size
  view.setUint16(20, 1, true) // PCM format
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitsPerSample, true)
  
  // data chunk
  writeString(view, 36, "data")
  view.setUint32(40, dataSize, true)
  
  // Write samples
  const dataView = new Int16Array(buffer, headerSize)
  dataView.set(samples)
  
  return buffer
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}
