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

// Voice assignments for multi-host
const VOICES = {
  TOJI: "Kore",    // The master brewer - warm, knowledgeable guide
  KOJI: "Puck",    // The catalyst - curious, energetic co-host
  NARRATOR: "Kore" // Default/narrator voice
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

    console.log("Generating multi-host audio for episode:", episode.title)

    try {
      // Parse script into segments by speaker
      const segments = parseScriptSegments(episode.script.content)
      console.log(`Parsed ${segments.length} segments`)

      // Generate audio for each segment
      const audioChunks: Int16Array[] = []
      
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i]
        console.log(`Generating segment ${i + 1}/${segments.length}: ${segment.speaker}`)
        
        const pcmData = await generateSegmentAudio(segment.text, segment.voice, geminiKey)
        if (pcmData) {
          audioChunks.push(pcmData)
          // Add small pause between speakers (0.3 sec of silence at 24kHz)
          if (i < segments.length - 1) {
            audioChunks.push(new Int16Array(7200)) // 0.3s silence
          }
        }
      }

      if (audioChunks.length === 0) {
        return { success: false, error: "No audio generated" }
      }

      // Combine all chunks
      const totalLength = audioChunks.reduce((acc, chunk) => acc + chunk.length, 0)
      const combinedSamples = new Int16Array(totalLength)
      let offset = 0
      for (const chunk of audioChunks) {
        combinedSamples.set(chunk, offset)
        offset += chunk.length
      }

      console.log("Encoding to MP3...")
      const mp3Buffer = encodeMp3(combinedSamples, 24000)
      console.log("MP3 encoded, size:", mp3Buffer.length)

      // Upload to Convex storage
      const blob = new Blob([mp3Buffer.buffer as ArrayBuffer], { type: "audio/mpeg" })
      const storageId = await ctx.storage.store(blob)
      const url = await ctx.storage.getUrl(storageId)

      if (!url) {
        return { success: false, error: "Failed to get storage URL" }
      }

      // Duration: samples / sampleRate
      const durationSeconds = combinedSamples.length / 24000

      // Update episode
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

// Parse script into speaker segments
function parseScriptSegments(script: string): { speaker: string; voice: string; text: string }[] {
  const segments: { speaker: string; voice: string; text: string }[] = []
  const lines = script.split('\n')
  
  let currentSpeaker = "NARRATOR"
  let currentText = ""
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    
    // Check for speaker prefix
    const tojiMatch = trimmed.match(/^TOJI:\s*(.*)$/i)
    const kojiMatch = trimmed.match(/^KOJI:\s*(.*)$/i)
    
    if (tojiMatch) {
      // Save previous segment
      if (currentText.trim()) {
        segments.push({
          speaker: currentSpeaker,
          voice: VOICES[currentSpeaker as keyof typeof VOICES] || VOICES.NARRATOR,
          text: currentText.trim()
        })
      }
      currentSpeaker = "TOJI"
      currentText = tojiMatch[1]
    } else if (kojiMatch) {
      // Save previous segment
      if (currentText.trim()) {
        segments.push({
          speaker: currentSpeaker,
          voice: VOICES[currentSpeaker as keyof typeof VOICES] || VOICES.NARRATOR,
          text: currentText.trim()
        })
      }
      currentSpeaker = "KOJI"
      currentText = kojiMatch[1]
    } else {
      // Continue current speaker's text
      currentText += " " + trimmed
    }
  }
  
  // Don't forget last segment
  if (currentText.trim()) {
    segments.push({
      speaker: currentSpeaker,
      voice: VOICES[currentSpeaker as keyof typeof VOICES] || VOICES.NARRATOR,
      text: currentText.trim()
    })
  }
  
  return segments
}

// Generate audio for a single segment
async function generateSegmentAudio(text: string, voice: string, apiKey: string): Promise<Int16Array | null> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text }]
          }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voice
                }
              }
            }
          }
        }),
      }
    )

    if (!response.ok) {
      console.error("TTS API error:", response.status)
      return null
    }

    const result = await response.json()
    const audioData = result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data as string | undefined

    if (!audioData) {
      return null
    }

    // Convert base64 to Int16Array
    const binaryString = atob(audioData)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    
    return new Int16Array(bytes.buffer)
  } catch (e) {
    console.error("Segment TTS error:", e)
    return null
  }
}

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
