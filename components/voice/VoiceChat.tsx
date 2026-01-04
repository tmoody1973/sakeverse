"use client"

import { useVoiceChat } from "@/hooks/useVoiceChat"
import { ChatBubble } from "./ChatBubble"
import { VoiceControls } from "./VoiceControls"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useState, useRef, useEffect } from "react"
import { Send, AlertCircle } from "lucide-react"

export function VoiceChat() {
  const {
    isConnected,
    isListening,
    isSpeaking,
    error,
    messages,
    connect,
    disconnect,
    sendMessage,
  } = useVoiceChat()

  const [textInput, setTextInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendText = async () => {
    if (!textInput.trim()) return
    
    await sendMessage(textInput)
    setTextInput("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendText()
    }
  }

  return (
    <div className="flex flex-col h-full max-h-screen">
      {/* Header */}
      <Card className="mb-4">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <span className="text-2xl">🎤</span>
            <span>Chat with Kiki</span>
            <span className="text-sm font-normal text-gray-600">
              Your AI Sake Sommelier (利き酒)
            </span>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="mb-4 border-red-500 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Voice Controls */}
      <div className="mb-6">
        <VoiceControls
          isConnected={isConnected}
          isListening={isListening}
          isSpeaking={isSpeaking}
          onConnect={connect}
          onDisconnect={disconnect}
        />
      </div>

      {/* Chat Messages */}
      <Card className="flex-1 flex flex-col min-h-0">
        <CardContent className="flex-1 flex flex-col p-4">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4 max-w-md">
                <div className="text-6xl">🍶</div>
                <h3 className="text-xl font-semibold text-ink">
                  Welcome to Sakéverse!
                </h3>
                <p className="text-gray-600">
                  I'm Kiki, your AI sake sommelier. Connect to start our conversation about Japanese sake, 
                  or type a message below to get started.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>Try asking me:</p>
                  <ul className="space-y-1">
                    <li>"What sake would you recommend for a beginner?"</li>
                    <li>"I love Pinot Noir, what sake might I enjoy?"</li>
                    <li>"Tell me about Niigata sake"</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div className="flex-1 overflow-y-auto space-y-2 mb-4 min-h-0 max-h-96">
              {messages.map((message) => (
                <ChatBubble
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                  products={message.products}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Text Input */}
          <div className="flex space-x-2 pt-4 border-t-2 border-ink">
            <Input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isConnected 
                  ? "Type a message or use voice..." 
                  : "Type a message to get started..."
              }
              className="flex-1"
              disabled={isSpeaking}
            />
            <Button
              onClick={handleSendText}
              disabled={!textInput.trim() || isSpeaking}
              variant="primary"
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
