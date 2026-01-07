import { AlertCircle } from "lucide-react"

interface RateLimitDisplayProps {
  remaining: number
  resetAt: number
  type: "voice" | "text"
}

export function RateLimitDisplay({ remaining, resetAt, type }: RateLimitDisplayProps) {
  const resetDate = new Date(resetAt)
  const now = new Date()
  const minutesUntilReset = Math.ceil((resetDate.getTime() - now.getTime()) / 60000)
  
  const getColor = () => {
    if (remaining === 0) return "text-red-600 bg-red-50 border-red-200"
    if (remaining <= 5) return "text-orange-600 bg-orange-50 border-orange-200"
    return "text-gray-600 bg-gray-50 border-gray-200"
  }
  
  if (remaining === 0) {
    return (
      <div className={`flex items-center gap-2 p-3 rounded-lg border-2 ${getColor()}`}>
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <div className="text-sm">
          <span className="font-semibold">Rate limit reached.</span>
          {" "}Resets in {minutesUntilReset} {minutesUntilReset === 1 ? "minute" : "minutes"}.
        </div>
      </div>
    )
  }
  
  return (
    <div className={`text-xs p-2 rounded border ${getColor()}`}>
      {remaining} {type} {remaining === 1 ? "request" : "requests"} remaining this hour
    </div>
  )
}
