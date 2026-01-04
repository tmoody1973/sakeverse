"use client"

import { C1Chat, ThemeProvider } from "@thesysai/genui-sdk"
import "@crayonai/react-ui/styles/index.css"
import { useVoiceToC1 } from "@/hooks/useVoiceToC1"
import { useCallback } from "react"
import { Mic, MicOff, Volume2 } from "lucide-react"

export function KikiChat() {
  const handleTranscript = useCallback((text: string) => {
    console.log("Voice transcript:", text)
  }, [])

  const handleGenerateUI = useCallback(async (prompt: string) => {
    console.log("Generate UI for:", prompt)
  }, [])

  const voice = useVoiceToC1({
    onTranscript: handleTranscript,
    onGenerateUI: handleGenerateUI,
  })

  return (
    <div className="flex flex-col h-full">
      {/* Voice Controls Header */}
      <div className="flex items-center justify-between p-4 border-b-2 border-ink bg-sakura-light">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎤</span>
          <div>
            <h1 className="font-bold text-ink">Kiki</h1>
            <p className="text-xs text-gray-600">Your AI Sake Sommelier (利き酒)</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {voice.isListening && (
            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Listening...
            </span>
          )}
          {voice.isSpeaking && (
            <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              <Volume2 className="w-3 h-3" />
              Speaking...
            </span>
          )}
          
          <button
            onClick={voice.isConnected ? voice.disconnect : voice.connect}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-ink font-medium
              transition-all retro-shadow hover:translate-y-[-2px]
              ${voice.isConnected 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-sakura-pink text-ink hover:bg-sakura-dark'
              }
            `}
          >
            {voice.isConnected ? (
              <><MicOff className="w-4 h-4" />End Voice</>
            ) : (
              <><Mic className="w-4 h-4" />Start Voice</>
            )}
          </button>
        </div>
      </div>

      {voice.error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border-2 border-red-300 rounded-lg text-red-700 text-sm">
          {voice.error}
        </div>
      )}

      {/* C1Chat with ThemeProvider */}
      <div className="flex-1 min-h-0">
        <ThemeProvider>
          <C1Chat 
            apiUrl="/api/c1/chat"
            agentName="Kiki"
            logoUrl="/sake-icon.png"
          />
        </ThemeProvider>
      </div>
    </div>
  )
}
