---
description: Deploy and verify Sakécosm to production
---

# Deploy to Production

Deploy Sakécosm to Vercel and verify all features work correctly.

## Pre-Deployment Checklist

- [ ] Build passes locally: `npm run build`
- [ ] Convex deployed: `npx convex deploy`
- [ ] No console.log statements in production code
- [ ] Environment variables set in Vercel

## Required Environment Variables

### Vercel (Next.js)
```
NEXT_PUBLIC_CONVEX_URL=https://[deployment].convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
THESYS_API_KEY=...
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk...
```

### Convex
```bash
npx convex env set OPENAI_API_KEY sk-...
npx convex env set GEMINI_API_KEY ...
npx convex env set PERPLEXITY_API_KEY ...
npx convex env set GEMINI_FILE_URI https://generativelanguage.googleapis.com/v1beta/files/...
```

## Deployment Steps

1. **Deploy Convex**
   ```bash
   npx convex deploy
   ```

2. **Push to GitHub** (triggers Vercel)
   ```bash
   git add -A
   git commit -m "Deploy: [description]"
   git push origin master
   ```

3. **Verify Deployment**
   - Check Vercel dashboard for build status
   - Visit https://dynamous-kiro-hackathon.vercel.app

## Post-Deployment Verification

### Core Features
- [ ] Landing page loads for logged-out users
- [ ] Sign in/sign up works via Clerk
- [ ] Dashboard shows real user stats
- [ ] Voice agent connects and responds

### RAG System
- [ ] Product search returns results
- [ ] Wine-to-sake recommendations work
- [ ] Food pairing tips load

### Learning System
- [ ] Course catalog displays
- [ ] Chapter content renders
- [ ] Quizzes function correctly
- [ ] XP awards on completion

### Podcasts
- [ ] Podcast hub shows episodes
- [ ] Audio player works
- [ ] Episode transcripts display

### Map
- [ ] Japan map renders
- [ ] Prefecture click shows panel
- [ ] AI descriptions generate/cache

## Rollback

If issues occur:
```bash
# Revert to previous commit
git revert HEAD
git push origin master

# Or restore Convex to previous deployment
npx convex deploy --preview
```
