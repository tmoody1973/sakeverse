# Freemium Model Implementation Plan

## Overview
Add usage-based limits for free users with premium subscription for unlimited Kiki access.

## Pricing
- **Free**: 15 messages/day with Kiki
- **Premium**: $5-7/month for unlimited

## Implementation Steps

### Phase 1: Usage Tracking

1. **Schema Changes** (`convex/schema.ts`)
   - Add to `users` table:
     - `plan`: "free" | "premium" (default: "free")
     - `dailyMessageCount`: number
     - `lastMessageDate`: string (YYYY-MM-DD)

2. **Usage Mutation** (`convex/usage.ts`)
   - `checkAndIncrementUsage`: Check plan, reset daily count, enforce limit
   - Returns: `{ allowed, remaining, reason }`

3. **API Integration**
   - Call usage check before C1/voice API processes message
   - Return upgrade prompt if limit reached

### Phase 2: UI Changes

1. **Usage Display**
   - Show "X messages remaining today" for free users
   - Show "Unlimited" badge for premium

2. **Upgrade Prompt**
   - Modal when limit reached
   - "Upgrade to Premium" CTA

3. **Settings Page**
   - Show current plan
   - Upgrade/manage subscription button

### Phase 3: Stripe Integration

1. **Stripe Setup**
   - Create Product + Price in Stripe Dashboard
   - Set up Stripe Checkout for subscriptions

2. **API Routes**
   - `POST /api/stripe/checkout` - Create checkout session
   - `POST /api/stripe/webhook` - Handle subscription events

3. **Webhook Handlers**
   - `checkout.session.completed` → Set `plan: "premium"`
   - `customer.subscription.deleted` → Set `plan: "free"`

4. **Customer Portal**
   - Link to Stripe portal for subscription management

## Cost Analysis

| Usage | Est. Cost/User/Mo |
|-------|-------------------|
| Light (5 msg/day) | $4.50 |
| Medium (15 msg/day) | $13.50 |
| Heavy (50 msg/day) | $45.00 |

Free tier capped at 15/day = max $13.50/mo exposure per free user.
Premium at $7/mo profitable if avg <350 msgs/mo.

## Files to Create/Modify

```
convex/
├── schema.ts          # Add plan, usage fields
├── usage.ts           # NEW: checkAndIncrementUsage
└── users.ts           # Add getPlan query

app/
├── api/
│   └── stripe/
│       ├── checkout/route.ts   # NEW
│       └── webhook/route.ts    # NEW
├── kiki/page.tsx      # Add usage check
└── settings/          # Add subscription management

components/
├── UpgradeModal.tsx   # NEW: Limit reached prompt
└── UsageBadge.tsx     # NEW: Messages remaining
```

## Environment Variables Needed
```
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_PRICE_ID=price_...
```

## Testing Checklist
- [ ] Free user hits limit, sees upgrade prompt
- [ ] Daily count resets at midnight
- [ ] Stripe checkout completes, plan updates
- [ ] Premium user has unlimited access
- [ ] Subscription cancellation reverts to free
