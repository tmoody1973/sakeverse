"use client"

import { C1Component, ThemeProvider } from "@thesysai/genui-sdk"
import "@crayonai/react-ui/styles/index.css"

interface C1MessageProps {
  content: string
  isStreaming?: boolean
  onAction: (action: { type: string; payload?: any }) => void
  onContinueConversation?: (message: string) => void
}

export function C1Message({ content, isStreaming = false, onAction, onContinueConversation }: C1MessageProps) {
  const handleAction = (event: { type?: string; params?: Record<string, any> }) => {
    switch (event.type) {
      case "open_url":
        // Open external links
        if (event.params?.url) {
          window.open(event.params.url, "_blank", "noopener,noreferrer")
        }
        break
        
      case "continue_conversation":
        // Handle follow-up questions and form submissions
        const { llmFriendlyMessage, humanFriendlyMessage } = event.params || {}
        if (onContinueConversation && llmFriendlyMessage) {
          onContinueConversation(llmFriendlyMessage)
        }
        // Also notify parent for UI updates
        onAction({
          type: "continue_conversation",
          payload: { llmFriendlyMessage, humanFriendlyMessage }
        })
        break
        
      case "add_to_cart":
        onAction({ type: "add_to_cart", payload: event.params })
        break
        
      case "learn_more":
        // Trigger a follow-up question about the topic
        if (onContinueConversation && event.params?.topic) {
          onContinueConversation(`Tell me more about ${event.params.topic}`)
        }
        break
        
      case "explore_region":
        if (onContinueConversation && event.params?.region) {
          onContinueConversation(`What sake should I try from ${event.params.region}?`)
        }
        break
        
      case "compare_sake":
        if (onContinueConversation && event.params?.items) {
          onContinueConversation(`Compare these sake: ${event.params.items.join(", ")}`)
        }
        break
        
      default:
        // Pass through any other actions
        onAction({
          type: event.type || "action",
          payload: event.params
        })
    }
  }

  return (
    <div className="c1-message-wrapper">
      <ThemeProvider>
        <C1Component 
          c1Response={content}
          isStreaming={isStreaming}
          onAction={handleAction}
        />
      </ThemeProvider>
    </div>
  )
}
