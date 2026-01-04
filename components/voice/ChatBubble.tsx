"use client"

import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"

// Dynamically import C1Message to avoid SSR issues
const C1Message = dynamic(() => import("./C1Message").then(mod => ({ default: mod.C1Message })), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-sake-mist/30 rounded-lg h-32" />
})

interface ChatBubbleProps {
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
  onC1Action?: (action: { type: string; payload?: any }) => void
  onContinueConversation?: (message: string) => void
  className?: string
}

export function ChatBubble({ 
  role, 
  content, 
  timestamp, 
  products, 
  isC1,
  c1Content,
  onC1Action,
  onContinueConversation,
  className 
}: ChatBubbleProps) {
  const isUser = role === "user"
  const time = new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })

  return (
    <div className={cn(
      "flex w-full mb-4",
      isUser ? "justify-end" : "justify-start",
      className
    )}>
      <div className={cn(
        "max-w-[80%] rounded-xl border-2 border-ink p-4 retro-shadow",
        isUser 
          ? "bg-sakura-pink text-ink ml-4" 
          : "bg-white text-ink mr-4"
      )}>
        {/* Avatar and Name */}
        <div className="flex items-center mb-2">
          <div className={cn(
            "w-6 h-6 rounded-full border-2 border-ink flex items-center justify-center text-xs mr-2",
            isUser ? "bg-white" : "bg-sake-mist"
          )}>
            {isUser ? "👤" : "🎤"}
          </div>
          <span className="text-xs font-semibold text-gray-600">
            {isUser ? "You" : "Kiki"}
          </span>
          <span className="text-xs text-gray-400 ml-2">{time}</span>
        </div>

        {/* C1 Dynamic UI Content */}
        {isC1 && c1Content && onC1Action ? (
          <C1Message 
            content={c1Content} 
            onAction={onC1Action}
            onContinueConversation={onContinueConversation}
          />
        ) : (
          <>
            {/* Message Content */}
            <div className="text-sm leading-relaxed">
              {content}
            </div>

            {/* Product Recommendations */}
            {products && products.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="text-xs font-semibold text-gray-600 mb-2">
                  🍶 Recommended Sake:
                </div>
                {products.slice(0, 3).map((product, index) => (
                  <div key={index} className="bg-sake-mist/30 rounded-lg border border-ink/20 p-3">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-xs text-ink">{product.productName}</h4>
                      <span className="text-xs font-bold text-sakura-dark">${product.price}</span>
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      {product.brewery} • {product.category}
                    </div>
                    <a 
                      href={product.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block bg-sakura-pink text-ink text-xs px-3 py-1 rounded border border-ink hover:bg-sakura-dark transition-colors"
                    >
                      View on Tippsy →
                    </a>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
