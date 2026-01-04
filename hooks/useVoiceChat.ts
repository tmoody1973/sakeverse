"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useMutation, useAction } from "convex/react"
import { api } from "../convex/_generated/api"

export interface VoiceChatState {
  isConnected: boolean
  isListening: boolean
  isSpeaking: boolean
  error: string | null
  transcript: string
  messages: Array<{
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: number
    products?: Array<{
      productName: string
      price: number
      url: string
      brewery: string
      category: string
    }>
    isC1?: boolean
    c1Content?: any
  }>
}

export function useVoiceChat() {
  const [state, setState] = useState<VoiceChatState>({
    isConnected: false,
    isListening: false,
    isSpeaking: false,
    error: null,
    transcript: "",
    messages: [],
  })

  const wsRef = useRef<WebSocket | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const messageIdRef = useRef(0)
  
  const getSakeRecommendations = useMutation(api.importTippsy.getSakeRecommendations)
  const semanticSearch = useAction(api.embeddings.semanticSearch)
  const searchSakeKnowledge = useAction(api.geminiRAG.searchSakeKnowledge)
  const searchWebContent = useAction(api.perplexityAPI.searchWebContent)
  const searchWineToSake = useAction(api.wineToSake.searchWineToSake)

  const addMessage = useCallback((role: "user" | "assistant", content: string, products?: any[]) => {
    const message = {
      id: `msg-${messageIdRef.current++}`,
      role,
      content,
      timestamp: Date.now(),
      products: products?.map(p => ({
        productName: p.productName,
        price: p.price,
        url: p.url,
        brewery: p.brewery,
        category: p.category
      }))
    }
    
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
    }))
    
    return message
  }, [])

  const connect = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }))

      // Get OpenAI API key
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
      if (!apiKey || apiKey === 'placeholder') {
        throw new Error("OpenAI API key required for voice functionality")
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 24000
        } 
      })
      mediaStreamRef.current = stream

      // Create audio context
      const audioContext = new AudioContext({ sampleRate: 24000 })
      audioContextRef.current = audioContext

      // Connect to OpenAI Realtime API via WebSocket
      const ws = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17', [
        'realtime',
        `openai-insecure-api-key.${apiKey}`
      ])

      ws.onopen = () => {
        console.log('Connected to OpenAI Realtime API')
        
        // Send session configuration with enhanced sommelier prompt
        ws.send(JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: `You are Kiki (from Kikizake 利き酒 - "sake tasting"), a certified sake sommelier and educator with deep knowledge of Japanese sake (nihonshu), its production, culture, and service. You combine technical expertise with approachable communication, making sake accessible to curious beginners while offering nuanced insights for enthusiasts.

Your name reflects the art of evaluating and understanding sake - exactly what you help users do.

## Core Expertise
- **Classifications**: Junmai, Honjozo, Ginjo, Daiginjo, Nigori, Nama, Genshu, Koshu, Sparkling, Kimoto/Yamahai
- **Key metrics**: Seimaibuai (polishing ratio), SMV/Nihonshudo (sweetness/dryness), Acidity
- **Rice varieties**: Yamada Nishiki, Gohyakumangoku, Omachi, Miyama Nishiki
- **Regional styles**: Niigata (tanrei karakuchi - clean/dry), Hiroshima (soft water, gentle), Fushimi/Kyoto (elegant), Nada/Hyogo (structured), Yamagata (fruit-forward)

## Notable Breweries You Know
- Dassai (Yamaguchi) - Daiginjo focus, data-driven
- Kubota (Niigata) - tanrei karakuchi benchmark  
- Juyondai (Yamagata) - cult status, fruit-forward
- Aramasa (Akita) - wood tank revival, natural wine appeal
- Tamagawa (Kyoto) - British toji Philip Harper, bold yamahai
- Hakkaisan (Niigata) - clean, versatile, widely available

## Wine-to-Sake Bridge
When users mention wine preferences, translate:
- Crisp Sauvignon Blanc → Light Junmai Ginjo, chilled
- Oaky Chardonnay → Aged Junmai (Koshu), Yamahai, room temp
- Pinot Noir → Junmai Kimoto, earthy Yamahai, Koshu
- Bold Cabernet → Rich Junmai, Genshu, warm service
- Champagne → Sparkling sake

## Available Knowledge Tools
You have access to specialized retrieval systems that provide you with:
1. **Wine-to-Sake Knowledge** - Expert recommendations mapping wine preferences to sake styles
2. **Product Catalog** - Real sake products with prices, breweries, tasting notes from Tippsy
3. **Current Information** - Recent sake news, events, new releases
4. **Sake Knowledge Base** - Brewing, history, regions, techniques

## Communication Style
- Warm, enthusiastic, never condescending
- Lead with direct recommendations, then explain why
- Use sensory language: aroma, texture, finish
- Ask 1-2 clarifying questions when context would improve recommendations
- Share brewery stories that bring sake to life

## Temperature Guidance
- Yukihie (5°C) - delicate Daiginjo
- Hana-bie (10°C) - aromatic Ginjo  
- Suzu-bie (15°C) - versatile Junmai
- Jo-on (20°C) - room temp, aged sake
- Nurukan (40°C) - warming Junmai
- Atsukan (50°C) - robust Honjozo, Yamahai`,
            voice: 'alloy',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1'
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 200
            }
          }
        }))

        setState(prev => ({ ...prev, isConnected: true }))
        addMessage("assistant", "Hello! I'm Kiki, your sake sommelier. My name comes from Kikizake (利き酒) - the art of sake tasting. Whether you're new to sake or a seasoned enthusiast, I'm here to help you discover the perfect bottle. What brings you in today?")
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('Received:', data.type, data)
          
          switch (data.type) {
          case 'input_audio_buffer.speech_started':
            setState(prev => ({ ...prev, isListening: true }))
            break
            
          case 'input_audio_buffer.speech_stopped':
            setState(prev => ({ ...prev, isListening: false }))
            break
            
          case 'conversation.item.input_audio_transcription.completed':
            if (data.transcript) {
              addMessage("user", data.transcript)
              setState(prev => ({ ...prev, transcript: data.transcript }))
            }
            break
            
          case 'response.audio.delta':
            // Play audio chunk
            if (data.delta && audioContext.state === 'running') {
              const audioData = atob(data.delta)
              const buffer = new ArrayBuffer(audioData.length)
              const view = new Uint8Array(buffer)
              for (let i = 0; i < audioData.length; i++) {
                view[i] = audioData.charCodeAt(i)
              }
              
              audioContext.decodeAudioData(buffer).then(audioBuffer => {
                const source = audioContext.createBufferSource()
                source.buffer = audioBuffer
                source.connect(audioContext.destination)
                source.start()
              }).catch(console.error)
            }
            break
            
          case 'response.audio.done':
            setState(prev => ({ ...prev, isSpeaking: false }))
            break
            
          case 'response.text.delta':
            // Handle text response for display
            break
            
          case 'response.text.done':
            if (data.text) {
              addMessage("assistant", data.text)
            }
            break
            
          case 'error':
            console.error('OpenAI error:', data.error)
            setState(prev => ({ 
              ...prev, 
              error: data.error?.message || data.error?.code || "Connection error" 
            }))
            break
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error, event.data)
      }
    }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setState(prev => ({ ...prev, error: "Connection failed" }))
      }

      ws.onclose = () => {
        setState(prev => ({ 
          ...prev, 
          isConnected: false, 
          isListening: false, 
          isSpeaking: false 
        }))
      }

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
      setState(prev => ({ 
        ...prev, 
        error: error.message || "Failed to connect",
        isConnected: false 
      }))
    }
  }, [addMessage])

  const disconnect = useCallback(async () => {
    // Stop audio streaming
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }

    // Close audio context
    if (audioContextRef.current) {
      await audioContextRef.current.close()
      audioContextRef.current = null
    }

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    setState(prev => ({ 
      ...prev, 
      isConnected: false, 
      isListening: false, 
      isSpeaking: false 
    }))
  }, [])

  const sendMessage = useCallback(async (text: string) => {
    try {
      addMessage("user", text)
      
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        // Send to real OpenAI WebSocket
        wsRef.current.send(JSON.stringify({
          type: 'conversation.item.create',
          item: {
            type: 'message',
            role: 'user',
            content: [{
              type: 'input_text',
              text: text
            }]
          }
        }))

        wsRef.current.send(JSON.stringify({
          type: 'response.create'
        }))
      } else {
        // Fallback with real product recommendations
        setState(prev => ({ ...prev, isSpeaking: true }))
        
        setTimeout(async () => {
          let response = ""
          let products = []
          
          try {
            // Get product recommendations based on user input
            const input = text.toLowerCase()
            let preferences: any = {}
            
            // Parse price requests
            const priceMatch = input.match(/under \$?(\d+)|below \$?(\d+)|less than \$?(\d+)|\$(\d+) or less/)
            if (priceMatch) {
              const maxPrice = parseInt(priceMatch[1] || priceMatch[2] || priceMatch[3] || priceMatch[4])
              preferences.priceRange = { min: 0, max: maxPrice }
            }
            
            const expensiveMatch = input.match(/over \$?(\d+)|above \$?(\d+)|more than \$?(\d+)|\$(\d+) or more/)
            if (expensiveMatch) {
              const minPrice = parseInt(expensiveMatch[1] || expensiveMatch[2] || expensiveMatch[3] || expensiveMatch[4])
              preferences.priceRange = { min: minPrice, max: 10000 }
            }
            
            // Category preferences
            if (input.includes("beginner") || input.includes("new")) {
              preferences.category = "Junmai"
              if (!preferences.priceRange) preferences.priceRange = { min: 25, max: 60 }
            } else if (input.includes("premium") || input.includes("special")) {
              if (!preferences.priceRange) preferences.priceRange = { min: 100, max: 500 }
            } else if (input.includes("budget") || input.includes("affordable")) {
              if (!preferences.priceRange) preferences.priceRange = { min: 25, max: 50 }
            }
            
            // Taste preferences
            if (input.includes("dry")) preferences.tasteProfile = "dry"
            if (input.includes("sweet")) preferences.tasteProfile = "sweet"
            if (input.includes("rich")) preferences.tasteProfile = "rich"
            if (input.includes("niigata")) preferences.region = "niigata"
            
            console.log("Search preferences:", preferences)
            
            // Enhanced query routing with knowledge detection
            const isKnowledgeQuery = input.includes("how") || input.includes("what") || input.includes("why") || 
                                    input.includes("explain") || input.includes("tell me about") || 
                                    input.includes("brewing") || input.includes("traditional") || 
                                    input.includes("history") || input.includes("culture")
            
            const isCurrentQuery = input.includes("current") || input.includes("latest") || 
                                  input.includes("news") || input.includes("recent") ||
                                  input.includes("trending") || input.includes("events") ||
                                  input.includes("2026") || input.includes("this year")
            
            // Detect wine-to-sake questions
            const isWineQuery = input.includes("wine") || input.includes("pinot") || 
                               input.includes("chardonnay") || input.includes("cabernet") ||
                               input.includes("merlot") || input.includes("sauvignon") ||
                               input.includes("riesling") || input.includes("burgundy") ||
                               input.includes("champagne") || input.includes("prosecco") ||
                               input.includes("rosé") || input.includes("rose") ||
                               input.includes("syrah") || input.includes("shiraz")
            
            let knowledgeAnswer = null
            let currentAnswer = null
            let wineToSakeAnswer = null
            
            // Get wine-to-sake recommendations first (highest priority for wine lovers)
            if (isWineQuery) {
              try {
                console.log("Searching wine-to-sake knowledge for:", text)
                const wineResults = await searchWineToSake({ query: text, limit: 2 })
                if (wineResults.length > 0) {
                  wineToSakeAnswer = wineResults.map((r: any) => r.content).join("\n\n")
                  console.log("Wine-to-sake search returned:", wineResults.length, "results")
                }
              } catch (error) {
                console.log("Wine-to-sake search failed:", error)
              }
            }
            
            // Get deep knowledge for educational questions
            if (isKnowledgeQuery && !wineToSakeAnswer) {
              try {
                console.log("Searching sake knowledge base for:", text)
                const knowledgeResult = await searchSakeKnowledge({ query: text })
                knowledgeAnswer = knowledgeResult.answer
                console.log("Knowledge search returned:", knowledgeAnswer ? "answer found" : "no answer")
              } catch (error) {
                console.log("Knowledge search failed:", error)
              }
            }
            
            // Get current/live information for trending questions
            if (isCurrentQuery) {
              try {
                console.log("Searching current web content for:", text)
                const webResult = await searchWebContent({ query: text })
                currentAnswer = webResult.answer
                console.log("Web search returned:", currentAnswer ? "answer found" : "no answer")
              } catch (error) {
                console.log("Web search failed:", error)
              }
            }
            
            try {
              // Use semantic search for product recommendations
              console.log("Attempting semantic search with query:", text)
              products = await semanticSearch({ 
                query: text,
                priceRange: preferences.priceRange,
                category: preferences.category,
                limit: 3
              })
              console.log("Semantic search returned:", products.length, "products")
              
              // If no results, try without filters
              if (products.length === 0 && (preferences.priceRange || preferences.category)) {
                console.log("Retrying semantic search without filters")
                products = await semanticSearch({ 
                  query: text,
                  limit: 3
                })
                console.log("Retry returned:", products.length, "products")
              }
              
            } catch (error) {
              console.log("Semantic search failed, using fallback:", error)
              try {
                products = await getSakeRecommendations({ preferences })
                console.log("Fallback returned:", products.length, "products")
              } catch (fallbackError) {
                console.log("Fallback also failed:", fallbackError)
                products = []
              }
            }
            
            // Generate varied responses based on input and knowledge
            if (text.toLowerCase().includes("hello") || text.toLowerCase().includes("hi")) {
              response = "Hello! I'm Kiki, your sake sommelier. My name comes from Kikizake (利き酒) - the art of sake tasting. I'm excited to help you explore the wonderful world of Japanese sake! What brings you here today - are you new to sake, or do you have some experience?"
            } else if (wineToSakeAnswer) {
              // Prioritize wine-to-sake recommendations for wine lovers
              response = `Great question! Based on your wine preferences, here's what I recommend:\n\n${wineToSakeAnswer}`
              if (products.length > 0) {
                response += `\n\nLet me suggest some specific bottles: The ${products[0].productName} from ${products[0].brewery} would be perfect for you at $${products[0].price}.`
              }
            } else if (currentAnswer) {
              // Prioritize current information for trending queries
              response = `${currentAnswer}\n\n${products.length > 0 ? `Based on this, here are some sake recommendations I think you'd enjoy:` : ''}`
            } else if (knowledgeAnswer) {
              // Use deep knowledge from PDF books
              response = knowledgeAnswer
              if (products.length > 0) {
                response += `\n\nBased on this knowledge, I'd recommend trying the ${products[0].productName} from ${products[0].brewery} - it exemplifies these characteristics beautifully.`
              }
            } else if (text.toLowerCase().includes("beginner") || text.toLowerCase().includes("new to sake")) {
              response = "Perfect! I love helping newcomers discover sake. Let me recommend some excellent beginner-friendly options:"
              if (products.length > 0) {
                response += ` I especially recommend the ${products[0].productName} from ${products[0].brewery} - it's ${products[0].category} style, which is pure rice wine with a clean, approachable flavor. At $${products[0].price}, it's perfect for starting your sake journey!`
              } else {
                response += " I recommend starting with Junmai sake - it's pure rice wine with a clean, approachable flavor. Try something from Niigata prefecture for a smooth introduction to sake."
              }
            } else if (text.toLowerCase().includes("wine") || text.toLowerCase().includes("pinot") || text.toLowerCase().includes("chardonnay")) {
              response = "Ah, a wine lover! Your palate is already trained for complexity. Based on your wine preferences, here are some sake that will appeal to you:"
              if (products.length > 0) {
                response += ` The ${products[0].productName} has that elegant, refined character wine drinkers appreciate. It's ${products[0].category} style with beautiful depth and complexity.`
              } else {
                response += " I'd suggest aged Junmai or Yamahai styles - they have the earthiness and complexity that wine drinkers love. The fermentation process creates similar depth to your favorite wines."
              }
            } else if (text.toLowerCase().includes("budget") || text.toLowerCase().includes("affordable") || text.toLowerCase().includes("cheap")) {
              response = "Great question! You don't need to spend a fortune for excellent sake. Here are some fantastic options under $50:"
              if (products.length > 0) {
                products.slice(0, 2).forEach(p => {
                  response += ` The ${p.productName} at $${p.price} is exceptional value - ${p.category} style from ${p.brewery}.`
                })
              } else {
                response += " Look for Junmai styles from established breweries - they offer great quality at reasonable prices. Brands like Hakkaisan and Gekkeikan offer excellent entry-level options."
              }
            } else if (text.toLowerCase().includes("premium") || text.toLowerCase().includes("expensive") || text.toLowerCase().includes("best")) {
              response = "Ah, looking for the finest sake! Let me show you some premium options that represent the pinnacle of sake craftsmanship:"
              if (products.length > 0) {
                response += ` The ${products[0].productName} is absolutely exquisite - crafted by ${products[0].brewery} using traditional methods. At $${products[0].price}, it's an investment in pure artistry.`
              } else {
                response += " Look for Daiginjo styles with high rice polishing ratios. These represent hundreds of years of brewing mastery and offer incredible complexity."
              }
            } else if (text.toLowerCase().includes("temperature") || text.toLowerCase().includes("serve") || text.toLowerCase().includes("drink")) {
              response = "Temperature is like magic with sake! The same bottle can taste completely different depending on how you serve it. Chilled (5-10°C) brings out crisp, clean flavors - perfect for Ginjo styles. Room temperature reveals more complexity and umami. Gently warmed (40-45°C) opens up rich, earthy notes in Junmai styles. I always tell people to try the same sake at different temperatures!"
            } else if (text.toLowerCase().includes("food") || text.toLowerCase().includes("pairing") || text.toLowerCase().includes("eat")) {
              response = "Food pairing with sake is so exciting! Unlike wine, sake has umami, so it enhances rather than competes with food. Sushi and sashimi are classics, but try sake with cheese - the umami creates incredible harmony. Junmai pairs beautifully with grilled meats, while Ginjo complements delicate fish. Even chocolate works with certain aged sake!"
            } else if (text.toLowerCase().includes("region") || text.toLowerCase().includes("niigata") || text.toLowerCase().includes("kyoto")) {
              response = "Each region of Japan has its own sake personality! Niigata is famous for 'Tanrei Karakuchi' - clean, dry sake. Kyoto produces elegant, refined styles. Hiroshima creates soft, approachable sake. The local water, rice, and climate all influence the final flavor. Which region interests you most?"
            } else {
              // Random varied responses for general questions
              const responses = [
                "I'm excited to help you explore sake! There's such incredible diversity - from light and floral to rich and earthy. What kind of flavors do you usually enjoy?",
                "Sake is fascinating! Each brewery has centuries of tradition behind their craft. Are you looking for something specific, or would you like me to guide you through some options?",
                "Welcome to the wonderful world of sake! I have access to over 100 different sake from premium Japanese breweries. What's your experience level with sake?",
                "There's so much to discover in sake! From the rice varieties to brewing techniques, every bottle tells a story. What would you like to learn about first?"
              ]
              response = responses[Math.floor(Math.random() * responses.length)]
            }
            
          } catch (error) {
            console.error("Error in response generation:", error)
            response = "I'm here to help you discover amazing sake! What would you like to know about sake today?"
            products = []
          }
          
          addMessage("assistant", response, products)
          setState(prev => ({ ...prev, isSpeaking: false }))
        }, 1500)
      }

    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.message || "Failed to send message",
        isSpeaking: false 
      }))
    }
  }, [addMessage, getSakeRecommendations])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    ...state,
    connect,
    disconnect,
    sendMessage,
  }
}
