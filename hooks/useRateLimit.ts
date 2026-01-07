import { useUser } from "@clerk/nextjs"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useCallback } from "react"

export function useRateLimit(type: "voice" | "text") {
  const { user } = useUser()
  const userId = user?.id
  
  const status = useQuery(
    api.rateLimit.getRateLimitStatus,
    userId ? { userId, type } : "skip"
  )
  
  const checkLimit = useMutation(api.rateLimit.checkRateLimit)
  
  const checkAndConsume = useCallback(async () => {
    if (!userId) {
      return { allowed: false, message: "Please sign in to continue" }
    }
    
    const result = await checkLimit({ userId, type })
    return result
  }, [userId, type, checkLimit])
  
  return {
    status,
    checkAndConsume,
    isLoading: status === undefined,
  }
}
