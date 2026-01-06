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

// Generate audio from script using Gemini TTS
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
    console.log("Script length:", episode.script.content.length, "characters")

    try {
      // Use Gemini 2.5 Flash TTS
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Read this podcast script in a warm, engaging voice suitable for an educational sake podcast. 
Speak clearly with good pacing, emphasizing Japanese terms.

${episode.script.content}`
              }]
            }],
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: "Kore"
                  }
                }
              }
            }
          }),
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error("TTS API error:", errorText)
        return { success: false, error: `TTS generation failed: ${response.status}` }
      }

      const result = await response.json()
      const audioData = result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data as string | undefined

      if (!audioData) {
        return { success: false, error: "No audio data returned from TTS" }
      }

      console.log("Audio generated, uploading to storage...")

      // Convert base64 to Uint8Array
      const binaryString = atob(audioData)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      // Create WAV file with proper headers
      const wavBuffer = createWavFile(bytes)
      const blob = new Blob([new Uint8Array(wavBuffer).buffer], { type: "audio/wav" })
      
      const storageId = await ctx.storage.store(blob)
      const url = await ctx.storage.getUrl(storageId)

      if (!url) {
        return { success: false, error: "Failed to get storage URL" }
      }

      // Calculate duration (24000 Hz, 16-bit mono = 48000 bytes per second)
      const durationSeconds = bytes.length / 48000

      // Update episode with audio info
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

      console.log("Audio saved, duration:", Math.round(durationSeconds), "seconds")

      return { 
        success: true, 
        duration: Math.round(durationSeconds),
        url,
      }
    } catch (e: unknown) {
      const error = e instanceof Error ? e.message : "Unknown error"
      console.error("TTS error:", error)
      return { success: false, error }
    }
  },
})

// Create WAV file from PCM data
function createWavFile(pcmData: Uint8Array): Uint8Array {
  const sampleRate = 24000
  const numChannels = 1
  const bitsPerSample = 16
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8)
  const blockAlign = numChannels * (bitsPerSample / 8)
  const dataSize = pcmData.length
  const headerSize = 44
  
  const buffer = new ArrayBuffer(headerSize + dataSize)
  const view = new DataView(buffer)
  const uint8 = new Uint8Array(buffer)
  
  // RIFF header
  writeString(uint8, 0, "RIFF")
  view.setUint32(4, 36 + dataSize, true)
  writeString(uint8, 8, "WAVE")
  
  // fmt chunk
  writeString(uint8, 12, "fmt ")
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitsPerSample, true)
  
  // data chunk
  writeString(uint8, 36, "data")
  view.setUint32(40, dataSize, true)
  uint8.set(pcmData, 44)
  
  return uint8
}

function writeString(buffer: Uint8Array, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    buffer[offset + i] = str.charCodeAt(i)
  }
}
