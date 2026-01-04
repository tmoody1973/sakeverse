"use client"

import { useState, useRef, useCallback, useEffect } from "react"

interface VoiceState {
  isConnected: boolean
  isListening: boolean
  isSpeaking: boolean
  error: string | null
  transcript: string
}

interface UseVoiceToC1Options {
  onTranscript: (text: string) => void
  onGenerateUI: (context: string) => Promise<void>
}

export function useVoiceToC1({ onTranscript, onGenerateUI }: UseVoiceToC1Options) {
  const [state, setState] = useState<VoiceState>({
    isConnected: false,
    isListening: false,
    isSpeaking: false,
    error: null,
    transcript: "",
  })

  const wsRef = useRef<WebSocket | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  const connect = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }))

      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
      if (!apiKey || apiKey === 'placeholder') {
        throw new Error("OpenAI API key required for voice")
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 24000 } 
      })
      mediaStreamRef.current = stream

      const audioContext = new AudioContext({ sampleRate: 24000 })
      audioContextRef.current = audioContext

      const ws = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17', [
        'realtime',
        `openai-insecure-api-key.${apiKey}`
      ])

      ws.onopen = () => {
        // Configure session with function tool for UI generation
        ws.send(JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: `You are Kiki, a sake sommelier. When users ask about sake, you can generate visual UI to help them.

IMPORTANT: When you have information to display visually (products, comparisons, temperature guides, etc.), call the generate_ui function to create a rich visual interface.

Call generate_ui when:
- Recommending specific sake products
- Comparing sake types or styles
- Showing temperature guides
- Displaying food pairings
- Presenting educational content about regions or brewing`,
            voice: 'alloy',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: { model: 'whisper-1' },
            turn_detection: { type: 'server_vad', threshold: 0.5, silence_duration_ms: 500 },
            tools: [{
              type: 'function',
              name: 'generate_ui',
              description: 'Generate a dynamic UI component for the user to see. Use this when you have visual information like product recommendations, comparisons, or guides.',
              parameters: {
                type: 'object',
                properties: {
                  ui_request: { type: 'string', description: 'What UI to generate (e.g., "sake product cards", "temperature guide", "comparison table")' },
                  context: { type: 'string', description: 'The data/context for the UI (e.g., sake names, prices, details)' },
                  user_query: { type: 'string', description: 'The original user question' }
                },
                required: ['ui_request', 'context', 'user_query']
              }
            }]
          }
        }))

        setState(prev => ({ ...prev, isConnected: true }))
      }

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data)
          
          switch (data.type) {
            case 'input_audio_buffer.speech_started':
              setState(prev => ({ ...prev, isListening: true }))
              break
              
            case 'input_audio_buffer.speech_stopped':
              setState(prev => ({ ...prev, isListening: false }))
              break
              
            case 'conversation.item.input_audio_transcription.completed':
              if (data.transcript) {
                setState(prev => ({ ...prev, transcript: data.transcript }))
                onTranscript(data.transcript)
              }
              break
              
            case 'response.function_call_arguments.done':
              // Handle generate_ui function call
              if (data.name === 'generate_ui') {
                try {
                  const args = JSON.parse(data.arguments)
                  const prompt = `${args.ui_request}\n\nUser asked: ${args.user_query}\n\nContext: ${args.context}`
                  await onGenerateUI(prompt)
                  
                  // Send function result back
                  ws.send(JSON.stringify({
                    type: 'conversation.item.create',
                    item: {
                      type: 'function_call_output',
                      call_id: data.call_id,
                      output: JSON.stringify({ success: true, message: 'UI generated and displayed to user' })
                    }
                  }))
                  ws.send(JSON.stringify({ type: 'response.create' }))
                } catch (e) {
                  console.error('Function call error:', e)
                }
              }
              break
              
            case 'response.audio.delta':
              setState(prev => ({ ...prev, isSpeaking: true }))
              if (data.delta && audioContext.state === 'running') {
                try {
                  const audioData = atob(data.delta)
                  const buffer = new ArrayBuffer(audioData.length)
                  const view = new Uint8Array(buffer)
                  for (let i = 0; i < audioData.length; i++) {
                    view[i] = audioData.charCodeAt(i)
                  }
                  // Play audio...
                } catch (e) { /* ignore audio errors */ }
              }
              break
              
            case 'response.audio.done':
              setState(prev => ({ ...prev, isSpeaking: false }))
              break
              
            case 'error':
              setState(prev => ({ ...prev, error: data.error?.message || "Error" }))
              break
          }
        } catch (e) {
          console.error('WebSocket message error:', e)
        }
      }

      ws.onerror = () => setState(prev => ({ ...prev, error: "Connection failed" }))
      ws.onclose = () => setState(prev => ({ ...prev, isConnected: false, isListening: false, isSpeaking: false }))

      wsRef.current = ws

      // Set up audio streaming
      const processor = audioContext.createScriptProcessor(4096, 1, 1)
      const source = audioContext.createMediaStreamSource(stream)
      
      processor.onaudioprocess = (event) => {
        if (ws.readyState === WebSocket.OPEN) {
          const inputBuffer = event.inputBuffer.getChannelData(0)
          const pcm16 = new Int16Array(inputBuffer.length)
          for (let i = 0; i < inputBuffer.length; i++) {
            pcm16[i] = Math.max(-32768, Math.min(32767, inputBuffer[i] * 32768))
          }
          ws.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)))
          }))
        }
      }
      
      source.connect(processor)
      processor.connect(audioContext.destination)

    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message, isConnected: false }))
    }
  }, [onTranscript, onGenerateUI])

  const disconnect = useCallback(async () => {
    mediaStreamRef.current?.getTracks().forEach(track => track.stop())
    await audioContextRef.current?.close()
    wsRef.current?.close()
    setState({ isConnected: false, isListening: false, isSpeaking: false, error: null, transcript: "" })
  }, [])

  useEffect(() => {
    return () => { disconnect() }
  }, [disconnect])

  return { ...state, connect, disconnect }
}
