"use node"

import { action } from "./_generated/server"
import { internal } from "./_generated/api"
import { v } from "convex/values"
// @ts-ignore - lamejs doesn't have types
import lamejs from "lamejs"

type AudioResult = {
  success: boolean
  duration?: number
  url?: string
  error?: string
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
      // 1. Generate audio with Gemini TTS
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

      // 2. Convert base64 to PCM bytes (16-bit signed)
      const binaryString = atob(audioData)
      const pcmBytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        pcmBytes[i] = binaryString.charCodeAt(i)
      }

      // 3. Convert PCM to Int16Array for lamejs
      const samples = new Int16Array(pcmBytes.buffer)
      
      // 4. Encode to MP3 using lamejs
      const mp3Buffer = encodeMp3(samples, 24000)
      console.log("MP3 encoded, size:", mp3Buffer.length)

      // 5. Upload to Convex storage
      const blob = new Blob([mp3Buffer.buffer as ArrayBuffer], { type: "audio/mpeg" })
      const storageId = await ctx.storage.store(blob)
      const url = await ctx.storage.getUrl(storageId)

      if (!url) {
        return { success: false, error: "Failed to get storage URL" }
      }

      // Duration: samples / sampleRate
      const durationSeconds = samples.length / 24000

      // 6. Update episode
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

// Encode PCM samples to MP3 using lamejs
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
  
  // Combine all chunks
  const totalLength = mp3Data.reduce((acc, arr) => acc + arr.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of mp3Data) {
    result.set(chunk, offset)
    offset += chunk.length
  }
  
  return result
}
