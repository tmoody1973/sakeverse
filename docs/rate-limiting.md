# Rate Limiting System

## Overview

Sakécosm implements rate limiting to control API costs for voice and text chat features.

## Limits

### Voice Chat
- **20 requests per hour** per user
- Resets every hour from first request

### Text Chat
- **50 messages per hour** per user
- Resets every hour from first message

## Implementation

### Database Schema

```typescript
rateLimits: {
  userId: string,        // Clerk user ID
  type: "voice" | "text",
  count: number,         // Current request count
  windowStart: number,   // Timestamp of window start
  lastRequest: number,   // Last request timestamp
}
```

### Functions

**`checkRateLimit`** - Check and consume a rate limit
```typescript
const result = await checkRateLimit({ userId, type: "voice" })
// Returns: { allowed: boolean, remaining: number, resetAt: number, message?: string }
```

**`getRateLimitStatus`** - Get current status without consuming
```typescript
const status = await getRateLimitStatus({ userId, type: "text" })
// Returns: { remaining: number, resetAt: number, isLimited: boolean }
```

**`resetRateLimit`** - Admin function to reset limits
```typescript
await resetRateLimit({ userId, type: "voice" }) // Reset specific type
await resetRateLimit({ userId }) // Reset all types
```

## Usage

### React Hook

```typescript
import { useRateLimit } from "@/hooks/useRateLimit"

function MyComponent() {
  const { status, checkAndConsume } = useRateLimit("voice")
  
  const handleVoiceRequest = async () => {
    const result = await checkAndConsume()
    
    if (!result.allowed) {
      alert(result.message)
      return
    }
    
    // Proceed with voice request
    // Remaining: result.remaining
  }
  
  return (
    <div>
      {status && <RateLimitDisplay {...status} type="voice" />}
      <button onClick={handleVoiceRequest}>Start Voice</button>
    </div>
  )
}
```

### Display Component

```typescript
import { RateLimitDisplay } from "@/components/RateLimitDisplay"

<RateLimitDisplay 
  remaining={status.remaining} 
  resetAt={status.resetAt} 
  type="voice" 
/>
```

## Integration Points

### Voice Chat (`/kiki`)
- Check limit before starting voice session
- Display remaining requests
- Show error if limit exceeded

### Text Chat (C1 Chat)
- Check limit before sending message
- Display remaining messages
- Disable input if limit exceeded

## Cost Savings

### Voice Chat (OpenAI Realtime API)
- **Without limits**: Unlimited usage = unpredictable costs
- **With limits**: 20 requests/hour/user = ~$0.50/user/hour max
- **Monthly cap**: ~$360/user/month (assuming constant usage)

### Text Chat (Thesys C1)
- **Without limits**: Unlimited messages = high API costs
- **With limits**: 50 messages/hour/user = controlled costs
- **Typical usage**: Most users won't hit limits

## Monitoring

### Check User Limits
```bash
npx convex run rateLimit:getRateLimitStatus '{"userId": "user_xxx", "type": "voice"}'
```

### Reset User Limits
```bash
npx convex run rateLimit:resetRateLimit '{"userId": "user_xxx", "type": "voice"}'
```

### View All Rate Limits
```bash
npx convex run rateLimit:getAllRateLimits
```

## Adjusting Limits

Edit `convex/rateLimit.ts`:

```typescript
const RATE_LIMITS = {
  voice: {
    maxRequests: 20,  // Change this
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  text: {
    maxRequests: 50,  // Change this
    windowMs: 60 * 60 * 1000, // 1 hour
  },
};
```

Then deploy:
```bash
npx convex dev --once
```

## User Experience

### When Limit Not Reached
- Small indicator showing remaining requests
- Green/gray color
- Unobtrusive

### When Limit Close (≤5 remaining)
- Orange warning indicator
- More prominent display
- Suggests user is approaching limit

### When Limit Exceeded
- Red error message
- Clear explanation
- Shows time until reset
- Disables action buttons

## Future Enhancements

- [ ] Different limits for premium users
- [ ] Daily limits in addition to hourly
- [ ] Usage analytics dashboard
- [ ] Email notifications at 80% usage
- [ ] Automatic limit increases for trusted users
- [ ] Per-feature limits (e.g., podcast generation)

## Testing

```typescript
// Test rate limit
const userId = "test_user_123"

// Make 20 voice requests
for (let i = 0; i < 20; i++) {
  const result = await checkRateLimit({ userId, type: "voice" })
  console.log(`Request ${i + 1}: ${result.allowed}, remaining: ${result.remaining}`)
}

// 21st request should fail
const result = await checkRateLimit({ userId, type: "voice" })
console.log(`Request 21: ${result.allowed}, message: ${result.message}`)
```

## Notes

- Limits are per-user, not global
- Window resets after 1 hour from first request
- Limits persist across sessions
- Admin can manually reset limits if needed
- Consider increasing limits for beta testers
