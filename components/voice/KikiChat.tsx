"use client"

import { C1Chat, ThemeProvider } from "@thesysai/genui-sdk"
import "@crayonai/react-ui/styles/index.css"
import { useCallback, useEffect, useState, useRef } from "react"
import { Mic, MicOff, Volume2, BookmarkPlus } from "lucide-react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import Link from "next/link"

function getSessionId() {
  if (typeof window === "undefined") return "server"
  let id = localStorage.getItem("sakeverse_session")
  if (!id) {
    id = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`
    localStorage.setItem("sakeverse_session", id)
  }
  return id
}

// Voice tools for Realtime API
const voiceTools = [
  {
    type: "function",
    name: "search_sake",
    description: "Search for sake products. Use when user asks about sake recommendations, wants to find sake, or mentions preferences.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "What to search for" },
      },
      required: ["query"],
    },
  },
  {
    type: "function",
    name: "get_food_pairing",
    description: "Get sake pairing suggestions for a food. Use when user asks what sake goes with a dish.",
    parameters: {
      type: "object",
      properties: {
        food: { type: "string", description: "The food or dish to pair" },
      },
      required: ["food"],
    },
  },
  {
    type: "function",
    name: "wine_to_sake",
    description: "Translate wine preferences to sake recommendations. Use when user mentions wine they like.",
    parameters: {
      type: "object",
      properties: {
        winePreference: { type: "string", description: "Wine type or preference" },
      },
      required: ["winePreference"],
    },
  },
]

import { ExternalLink, BookmarkPlus as SaveIcon } from "lucide-react"

type SakeProduct = {
  name: string
  brewery: string
  price: number
  category: string
  description?: string
  image?: string
  url?: string
}

export function KikiChat() {
  const [sessionId, setSessionId] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const [lastTranscript, setLastTranscript] = useState<string>("")
  const [voiceProducts, setVoiceProducts] = useState<SakeProduct[]>([])
  
  const wsRef = useRef<WebSocket | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const nextPlayTimeRef = useRef<number>(0)
  const isSpeakingRef = useRef<boolean>(false)
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([])
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  
  useEffect(() => {
    setSessionId(getSessionId())
  }, [])

  const saveSake = useMutation(api.userLibrary.saveSake)
  const library = useQuery(
    api.userLibrary.getLibrary,
    sessionId ? { sessionId } : "skip"
  )

  // Handle tool calls from Realtime API
  const handleToolCall = useCallback(async (name: string, args: any, callId: string) => {
    let result = ""
    
    try {
      if (name === "search_sake") {
        const products = await fetch("/api/voice/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: args.query }),
        }).then(r => r.json())
        
        if (products.length > 0) {
          setVoiceProducts(products) // Show cards in UI
          result = `I found ${products.length} sake options. ${products.slice(0, 3).map((p: any) => 
            `${p.name} from ${p.brewery} at $${p.price}`
          ).join(". ")}. I'm showing you the details on screen.`
        } else {
          result = "I couldn't find any sake matching that. Try a different search."
        }
      } else if (name === "get_food_pairing") {
        const pairings = await fetch("/api/voice/pairing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ food: args.food }),
        }).then(r => r.json())
        
        // Also search for recommended sake
        const products = await fetch("/api/voice/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: `sake for ${args.food}` }),
        }).then(r => r.json())
        
        if (products.length > 0) {
          setVoiceProducts(products)
        }
        
        result = pairings.recommendation 
          ? `${pairings.recommendation} I'm showing you some options on screen.`
          : `For ${args.food}, I'd suggest a Junmai or Junmai Ginjo. Check out the options I'm showing you.`
      } else if (name === "wine_to_sake") {
        const rec = await fetch("/api/voice/wine-to-sake", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wine: args.winePreference }),
        }).then(r => r.json())
        
        // Search for recommended sake style
        const products = await fetch("/api/voice/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: args.winePreference }),
        }).then(r => r.json())
        
        if (products.length > 0) {
          setVoiceProducts(products)
        }
        
        result = rec.recommendation 
          ? `${rec.recommendation} I'm showing you some bottles to try.`
          : `Based on your love of ${args.winePreference}, try a Junmai Daiginjo. Check out the options on screen.`
      }
    } catch (e) {
      result = "Let me help you with that. Could you tell me more about what you're looking for?"
    }

    // Send tool result back
    wsRef.current?.send(JSON.stringify({
      type: "conversation.item.create",
      item: {
        type: "function_call_output",
        call_id: callId,
        output: result,
      }
    }))
    wsRef.current?.send(JSON.stringify({ type: "response.create" }))
  }, [])

  const connectVoice = useCallback(async () => {
    try {
      setVoiceError(null)

      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY?.trim()
      if (!apiKey) {
        setVoiceError("NEXT_PUBLIC_OPENAI_API_KEY not set")
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 24000 } 
      })
      mediaStreamRef.current = stream

      const audioContext = new AudioContext({ sampleRate: 24000 })
      audioContextRef.current = audioContext

      const ws = new WebSocket(
        'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17',
        ['realtime', `openai-insecure-api-key.${apiKey}`]
      )

      ws.onopen = () => {
        ws.send(JSON.stringify({
          type: 'session.update',
          session: {
            type: 'realtime',
            model: 'gpt-realtime',
            output_modalities: ['audio'],
            instructions: `You are Kiki (利き酒), a friendly sake sommelier. You help users discover sake based on their preferences, food pairings, and wine background. Keep responses conversational and brief - you're speaking, not writing. Use the tools to search for sake and provide recommendations. Be warm and enthusiastic about sake!`,
            tools: voiceTools,
            tool_choice: "auto",
            audio: {
              input: {
                format: { type: 'audio/pcm', rate: 24000 },
                turn_detection: { type: 'semantic_vad' }
              },
              output: {
                format: { type: 'audio/pcm', rate: 24000 },
                voice: 'alloy'
              }
            }
          }
        }))
        setIsConnected(true)
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        
        switch (data.type) {
          case 'input_audio_buffer.speech_started':
            setIsListening(true)
            activeSourcesRef.current.forEach(s => { try { s.stop() } catch(e){} })
            activeSourcesRef.current = []
            nextPlayTimeRef.current = 0
            break
            
          case 'input_audio_buffer.speech_stopped':
            setIsListening(false)
            break
            
          case 'conversation.item.input_audio_transcription.completed':
            if (data.transcript) setLastTranscript(data.transcript)
            break
            
          case 'response.function_call_arguments.done':
            handleToolCall(data.name, JSON.parse(data.arguments), data.call_id)
            break
            
          case 'response.created':
            activeSourcesRef.current.forEach(s => { try { s.stop() } catch(e){} })
            activeSourcesRef.current = []
            nextPlayTimeRef.current = 0
            break
            
          case 'response.output_audio.delta':
            setIsSpeaking(true)
            isSpeakingRef.current = true
            if (data.delta && audioContext.state === 'running') {
              try {
                const raw = atob(data.delta)
                const pcm16 = new Int16Array(raw.length / 2)
                for (let i = 0; i < pcm16.length; i++) {
                  pcm16[i] = raw.charCodeAt(i * 2) | (raw.charCodeAt(i * 2 + 1) << 8)
                }
                const float32 = new Float32Array(pcm16.length)
                for (let i = 0; i < pcm16.length; i++) {
                  float32[i] = pcm16[i] / 32768
                }
                const buffer = audioContext.createBuffer(1, float32.length, 24000)
                buffer.copyToChannel(float32, 0)
                const source = audioContext.createBufferSource()
                source.buffer = buffer
                source.connect(audioContext.destination)
                const now = audioContext.currentTime
                const startTime = Math.max(now, nextPlayTimeRef.current)
                source.start(startTime)
                nextPlayTimeRef.current = startTime + buffer.duration
                activeSourcesRef.current.push(source)
                source.onended = () => {
                  activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source)
                }
              } catch (e) {}
            }
            break
            
          case 'response.output_audio.done':
            setIsSpeaking(false)
            isSpeakingRef.current = false
            nextPlayTimeRef.current = 0
            break
            
          case 'error':
            console.error('Realtime error:', JSON.stringify(data, null, 2))
            setVoiceError(data.error?.message || data.message || 'Voice error')
            break
            
          default:
            // Log unhandled events for debugging
            if (data.type?.includes('error') || data.type?.includes('failed')) {
              console.warn('Unhandled event:', data.type, data)
            }
        }
      }

      ws.onerror = () => setVoiceError("Connection failed")
      ws.onclose = () => {
        setIsConnected(false)
        setIsListening(false)
        setIsSpeaking(false)
      }

      wsRef.current = ws

      const processor = audioContext.createScriptProcessor(4096, 1, 1)
      const source = audioContext.createMediaStreamSource(stream)
      processorRef.current = processor
      
      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN && !isSpeakingRef.current) {
          const input = e.inputBuffer.getChannelData(0)
          const pcm16 = new Int16Array(input.length)
          for (let i = 0; i < input.length; i++) {
            pcm16[i] = Math.max(-32768, Math.min(32767, input[i] * 32768))
          }
          ws.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)))
          }))
        }
      }
      
      source.connect(processor)
      processor.connect(audioContext.destination)

    } catch (err: any) {
      setVoiceError(err.message || "Failed to connect")
    }
  }, [handleToolCall])

  const disconnectVoice = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach(t => t.stop())
    processorRef.current?.disconnect()
    audioContextRef.current?.close()
    wsRef.current?.close()
    setIsConnected(false)
    setIsListening(false)
    setIsSpeaking(false)
  }, [])

  const handleAction = useCallback(async (event: any) => {
    if (event.type === "open_url" && event.params?.url) {
      window.open(event.params.url, "_blank")
    }
    if (event.type === "save_to_library" || event.params?.action === "save_to_library") {
      const sake = event.params?.sake || event.params
      if (sake && sessionId) {
        try {
          await saveSake({ sessionId, sake })
          alert("Saved to library!")
        } catch (e) {
          console.error("Save failed:", e)
        }
      }
    }
  }, [sessionId, saveSake])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-2 border-ink bg-sakura-light">
        <div className="flex items-center gap-3">
          <img src="/kiki-avatar.png" alt="Kiki" className="w-10 h-10 rounded-full border-2 border-ink" />
          <div>
            <h1 className="font-bold text-ink">Kiki</h1>
            <p className="text-xs text-gray-600">AI Sake Sommelier (利き酒)</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href="/library" className="flex items-center gap-1 px-3 py-2 bg-white border-2 border-ink rounded-lg text-sm font-medium hover:bg-sakura-light">
            <BookmarkPlus className="w-4 h-4" />
            Library ({library?.length || 0})
          </Link>

          {isListening && (
            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Listening...
            </span>
          )}
          {isSpeaking && (
            <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              <Volume2 className="w-3 h-3" />
              Speaking...
            </span>
          )}
          
          <button
            onClick={isConnected ? disconnectVoice : connectVoice}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-ink font-medium transition-all ${
              isConnected ? 'bg-red-100 text-red-700' : 'bg-sakura-pink text-ink'
            }`}
          >
            {isConnected ? <><MicOff className="w-4 h-4" />End Voice</> : <><Mic className="w-4 h-4" />Start Voice</>}
          </button>
        </div>
      </div>

      {voiceError && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border-2 border-red-300 rounded-lg text-red-700 text-sm">
          {voiceError}
        </div>
      )}

      {/* Voice transcript */}
      {lastTranscript && isConnected && (
        <div className="mx-4 mt-4 p-3 bg-white border-2 border-ink rounded-lg text-sm">
          <span className="text-gray-500">You:</span> {lastTranscript}
        </div>
      )}

      {/* Voice search results */}
      {voiceProducts.length > 0 && (
        <div className="mx-4 mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-ink">Kiki's Recommendations</h3>
            <button onClick={() => setVoiceProducts([])} className="text-xs text-gray-500 hover:text-ink">Clear</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {voiceProducts.map((p, i) => (
              <div key={i} className="bg-white border-2 border-ink rounded-xl p-3 shadow-[4px_4px_0px_#2D2D2D]">
                {p.image && (
                  <img src={p.image} alt={p.name} className="w-full h-32 object-contain bg-sakura-light rounded-lg mb-2" />
                )}
                <h4 className="font-bold text-sm">{p.name}</h4>
                <p className="text-xs text-gray-600">{p.brewery}</p>
                <p className="text-xs text-gray-500">{p.category}</p>
                <p className="font-bold text-sakura-pink mt-1">${p.price}</p>
                {p.description && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{p.description}</p>}
                <div className="flex gap-2 mt-2">
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noopener noreferrer" 
                       className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-sakura-pink border-2 border-ink rounded-lg text-xs font-medium hover:bg-pink-300">
                      <ExternalLink className="w-3 h-3" /> Tippsy
                    </a>
                  )}
                  <button 
                    onClick={() => saveSake({ sessionId, sake: { name: p.name, brewery: p.brewery, price: p.price, category: p.category, region: '', image: p.image || '', url: p.url || '', description: p.description } })}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-white border-2 border-ink rounded-lg text-xs font-medium hover:bg-sakura-light">
                    <SaveIcon className="w-3 h-3" /> Save
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* C1Chat for text fallback */}
      <div className="flex-1 min-h-0">
        <ThemeProvider>
          <C1Chat 
            apiUrl="/api/c1/chat"
            agentName="Kiki"
            logoUrl="/kiki-avatar.png"
            onAction={handleAction}
          />
        </ThemeProvider>
      </div>
    </div>
  )
}
