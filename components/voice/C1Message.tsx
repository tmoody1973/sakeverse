"use client"

import { C1Component, ThemeProvider } from "@thesysai/genui-sdk"
import "@crayonai/react-ui/styles/index.css"

interface C1MessageProps {
  content: string
  onAction: (action: { type: string; payload?: any }) => void
}

export function C1Message({ content, onAction }: C1MessageProps) {
  // Wrap the action handler to match C1's expected OnAction type
  const handleAction = (event: { type?: string; params?: Record<string, any> }) => {
    onAction({
      type: event.type || 'action',
      payload: event.params
    })
  }

  return (
    <div className="c1-message-wrapper">
      <ThemeProvider>
        <C1Component 
          c1Response={content}
          isStreaming={false}
          onAction={handleAction}
        />
      </ThemeProvider>
    </div>
  )
}
