# Plan: Landing Page, Clerk Auth & Onboarding

## Overview
- Landing page for logged-out users, dashboard for logged-in
- Clerk authentication with real API keys
- Onboarding flow to personalize sake recommendations
- Profile settings to edit preferences

## Tasks

### Phase 1: Clerk Setup
1. [ ] Update `.env.local` with real Clerk keys
2. [ ] Re-enable ClerkProvider in `app/layout.tsx`
3. [ ] Create `/sign-in` and `/sign-up` pages using Clerk components
4. [ ] Add Convex user sync (store user preferences in Convex)

### Phase 2: Landing Page
5. [ ] Create `components/landing/LandingPage.tsx` with:
   - Hero section (headline, subheadline, CTA)
   - Features section (voice agent, recommendations, learning)
   - How it works (3 steps)
   - Final CTA
6. [ ] Update `app/page.tsx` to show Landing (logged-out) or Dashboard (logged-in)

### Phase 3: Onboarding Flow
7. [ ] Create `app/onboarding/page.tsx` with multi-step form:
   - Step 1: Experience level (beginner/intermediate/expert)
   - Step 2: Taste preferences (sweet/dry slider, light/rich slider)
   - Step 3: Food preferences (multi-select: sushi, BBQ, cheese, etc.)
   - Step 4: Wine preferences (optional, multi-select)
8. [ ] Create Convex mutation to save user preferences
9. [ ] Redirect new users to onboarding after sign-up

### Phase 4: Profile Settings
10. [ ] Create `app/profile/page.tsx` with:
    - View current preferences
    - Edit preferences (reuse onboarding components)
    - Account settings link to Clerk

## Preferences Schema
```typescript
{
  experienceLevel: "beginner" | "intermediate" | "expert",
  tastePreferences: {
    sweetness: 1-5,  // 1=dry, 5=sweet
    richness: 1-5,   // 1=light, 5=rich
  },
  foodPreferences: string[],  // ["sushi", "bbq", "cheese", ...]
  winePreferences?: string[], // optional ["Pinot Noir", "Chardonnay", ...]
  onboardingComplete: boolean
}
```

## Execution Order
1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10
