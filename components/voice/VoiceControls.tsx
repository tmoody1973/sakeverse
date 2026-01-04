"use client"

import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Mic, MicOff, Phone, PhoneOff, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface VoiceControlsProps {
  isConnected: boolean
  isListening: boolean
  isSpeaking: boolean
  onConnect: () => void
  onDisconnect: () => void
  className?: string
}

export function VoiceControls({
  isConnected,
  isListening,
  isSpeaking,
  onConnect,
  onDisconnect,
  className
}: VoiceControlsProps) {
  return (
    <div className={cn("flex items-center justify-center space-x-4", className)}>
      {/* Connection Status */}
      <div className="flex items-center space-x-2">
        <Badge 
          variant={isConnected ? "success" : "secondary"}
          className="text-xs"
        >
          {isConnected ? "Connected" : "Disconnected"}
        </Badge>
        
        {isListening && (
          <Badge variant="accent" className="text-xs animate-pulse">
            Listening...
          </Badge>
        )}
        
        {isSpeaking && (
          <Badge variant="warm" className="text-xs">
            <div className="flex items-center space-x-1">
              <span>Yuki speaking</span>
              <div className="soundwave">
                <div className="soundwave-bar h-2"></div>
                <div className="soundwave-bar h-3"></div>
                <div className="soundwave-bar h-2"></div>
                <div className="soundwave-bar h-4"></div>
              </div>
            </div>
          </Badge>
        )}
      </div>

      {/* Main Voice Button */}
      {!isConnected ? (
        <Button
          variant="accent"
          size="lg"
          onClick={onConnect}
          className={cn(
            "h-16 w-16 rounded-full text-2xl",
            "hover:scale-105 transition-transform duration-200"
          )}
        >
          <Phone className="h-6 w-6" />
        </Button>
      ) : (
        <div className="flex items-center space-x-3">
          {/* Microphone Status */}
          <Button
            variant={isListening ? "accent" : "secondary"}
            size="lg"
            className={cn(
              "h-14 w-14 rounded-full",
              isListening && "voice-pulse"
            )}
            disabled
          >
            {isListening ? (
              <Mic className="h-5 w-5" />
            ) : (
              <MicOff className="h-5 w-5" />
            )}
          </Button>

          {/* Disconnect Button */}
          <Button
            variant="secondary"
            size="lg"
            onClick={onDisconnect}
            className="h-14 w-14 rounded-full hover:bg-red-100 hover:border-red-500"
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Settings */}
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10"
      >
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  )
}
