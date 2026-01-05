# Feature: Sakecosm Learning System

The following plan should be complete, but it's important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils, types, and models. Import from the right files etc.

## Feature Description

Build an Oboe.fyi-inspired AI-powered learning system where admins generate educational sake courses using Perplexity API + Gemini RAG, and users can browse, learn from, and track progress through courses on the `/learn` route. Includes gamification with XP, levels, streaks, and badges.

## User Story

As a sake enthusiast,
I want to take structured courses about sake with quizzes and progress tracking,
So that I can systematically learn about sake culture, brewing, and tasting while earning rewards.

As an admin,
I want to generate educational courses using AI,
So that I can quickly create high-quality content without manual writing.

## Problem Statement

Users currently have no structured way to learn about sake within Sakecosm. The app has voice chat and discovery features but lacks educational content that builds knowledge progressively.

## Solution Statement

Implement a full learning management system with:
1. AI-powered course generation (Perplexity + Gemini RAG)
2. Course catalog with categories and search
3. Chapter-based content with rich content blocks
4. Quiz system with chapter reviews and final exams
5. Progress tracking per user
6. Gamification (XP, levels, badges, streaks)

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: High
**Primary Systems Affected**: Convex database, Next.js routes, UI components
**Dependencies**: Perplexity API (existing), Gemini API (existing), Clerk auth (existing)

---

## CONTEXT REFERENCES

### Relevant Codebase Files - MUST READ BEFORE IMPLEMENTING!

- `convex/schema.ts` (lines 1-100) - Why: Existing schema patterns, table definitions, index patterns
- `convex/perplexityAPI.ts` (lines 1-80) - Why: Existing Perplexity integration pattern to mirror
- `convex/geminiRAG.ts` (lines 1-100) - Why: Existing Gemini integration pattern
- `convex/users.ts` - Why: User management patterns, Clerk ID usage
- `convex/userLibrary.ts` - Why: User-specific data patterns with clerkId
- `convex/pairingTips.ts` - Why: Caching pattern for AI-generated content
- `app/discover/page.tsx` + `DiscoverContent.tsx` - Why: Page structure pattern with dynamic import
- `components/ui/Card.tsx` - Why: RetroUI card component pattern
- `components/ui/Badge.tsx` - Why: Badge component for categories
- `components/dashboard/FoodPairingExpandable.tsx` - Why: Modal/expandable pattern
- `app/layout.tsx` - Why: Root layout with providers
- `middleware.ts` - Why: Route protection patterns

### New Files to Create

**Database Layer (Convex):**
- `convex/learn/schema.ts` - Learning system schema additions
- `convex/learn/courses.ts` - Course queries and mutations
- `convex/learn/chapters.ts` - Chapter queries
- `convex/learn/quizzes.ts` - Quiz queries and mutations
- `convex/learn/progress.ts` - User progress tracking
- `convex/learn/gamification.ts` - XP, badges, streaks
- `convex/learn/generation.ts` - AI course generation actions

**User-Facing Pages:**
- `app/learn/page.tsx` - Course catalog
- `app/learn/LearnContent.tsx` - Catalog content component
- `app/learn/[courseSlug]/page.tsx` - Course overview
- `app/learn/[courseSlug]/CourseContent.tsx` - Course detail component
- `app/learn/[courseSlug]/[chapter]/page.tsx` - Chapter view
- `app/learn/[courseSlug]/[chapter]/ChapterContent.tsx` - Chapter content
- `app/learn/[courseSlug]/quiz/page.tsx` - Final exam
- `app/learn/progress/page.tsx` - User progress dashboard

**Admin Pages:**
- `app/admin/learn/page.tsx` - Admin course list
- `app/admin/learn/new/page.tsx` - Generate new course
- `app/admin/learn/[id]/page.tsx` - Edit course

**Components:**
- `components/learn/CourseCard.tsx` - Course card for catalog
- `components/learn/CourseOutline.tsx` - Chapter list with progress
- `components/learn/ChapterContent.tsx` - Renders content blocks
- `components/learn/ContentBlock.tsx` - Individual block renderer
- `components/learn/QuizPlayer.tsx` - Quiz interface
- `components/learn/QuizQuestion.tsx` - Single question
- `components/learn/ProgressBar.tsx` - Course progress bar
- `components/learn/XpBar.tsx` - XP progress display
- `components/learn/BadgeCard.tsx` - Badge display
- `components/learn/StreakCounter.tsx` - Streak display

### Relevant Documentation - READ BEFORE IMPLEMENTING!

- [Convex Schema Docs](https://docs.convex.dev/database/schemas)
  - Table definitions, indexes, validators
- [Convex Actions](https://docs.convex.dev/functions/actions)
  - For AI API calls (Perplexity, Gemini)
- [Next.js App Router](https://nextjs.org/docs/app)
  - Dynamic routes, layouts
- [Clerk useUser Hook](https://clerk.com/docs/references/react/use-user)
  - Getting current user ID

### Patterns to Follow

**Convex Schema Pattern:**
```typescript
// From existing schema.ts
defineTable({
  fieldName: v.string(),
  optionalField: v.optional(v.string()),
  arrayField: v.array(v.string()),
  nestedObject: v.object({
    subField: v.number(),
  }),
  createdAt: v.number(),
})
  .index("by_field", ["fieldName"])
```

**Convex Action Pattern (for AI calls):**
```typescript
// From perplexityAPI.ts
export const actionName = action({
  args: { query: v.string() },
  handler: async (ctx, { query }) => {
    const apiKey = process.env.API_KEY
    if (!apiKey) throw new Error("API_KEY not found")
    
    const response = await fetch(url, { ... })
    if (!response.ok) throw new Error(`API error: ${response.status}`)
    
    return { result: await response.json() }
  },
})
```

**Page Pattern:**
```typescript
// From app/discover/page.tsx
"use client"
import dynamic from "next/dynamic"
const Content = dynamic(() => import("./ContentComponent"), { ssr: false })
export default function Page() {
  return <Content />
}
```

**User Data Query Pattern:**
```typescript
// From userLibrary.ts
const library = useQuery(
  api.userLibrary.getLibrary, 
  clerkId ? { clerkId } : "skip"
)
```

**RetroUI Card Pattern:**
```typescript
<Card className="bg-gradient-to-br from-sakura-pink to-petal-light">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

---

## IMPLEMENTATION PLAN

### Phase 1: Database Schema (Foundation)

Add learning system tables to Convex schema. This is the foundation everything else builds on.

**Tables to add:**
- `courses` - Course metadata, status, timestamps
- `chapters` - Chapter content with structured blocks
- `quizzes` - Quiz settings per chapter/course
- `questions` - Individual quiz questions
- `userProgress` - User's progress per course
- `quizAttempts` - User's quiz answers and scores
- `badges` - Badge definitions
- `userBadges` - User's earned badges
- `categories` - Course categories

### Phase 2: Core Convex Functions

Build the data layer with queries and mutations.

**Course Functions:**
- `listPublishedCourses` - Get courses for catalog
- `getCourseBySlug` - Get single course details
- `getCourseChapters` - Get chapters for a course

**Progress Functions:**
- `startCourse` - Initialize user progress
- `markChapterRead` - Track chapter completion
- `getUserProgress` - Get user's progress for a course
- `getUserCourseList` - Get all user's courses by status

**Quiz Functions:**
- `getQuiz` - Get quiz with questions
- `submitQuizAttempt` - Submit answers, calculate score
- `getQuizAttempts` - Get user's attempts

**Gamification Functions:**
- `awardXp` - Add XP to user
- `checkAndAwardBadges` - Check badge criteria
- `updateStreak` - Update daily streak
- `getUserStats` - Get XP, level, badges

### Phase 3: AI Course Generation

Build the admin course generation pipeline.

**Generation Flow:**
1. Admin enters topic, chapter count, category
2. Query Gemini RAG for foundational knowledge
3. Query Perplexity for current trends
4. Generate course outline (title, chapters, objectives)
5. Generate each chapter's content blocks
6. Generate quiz questions per chapter
7. Save as draft course

### Phase 4: User-Facing Pages

Build the learning experience UI.

**Pages:**
- `/learn` - Course catalog with filters, search
- `/learn/[slug]` - Course overview with chapter list
- `/learn/[slug]/[chapter]` - Chapter reading view
- `/learn/[slug]/quiz` - Final exam
- `/learn/progress` - User's progress dashboard

### Phase 5: Admin Pages

Build course management UI.

**Pages:**
- `/admin/learn` - Course list with stats
- `/admin/learn/new` - Generate course form
- `/admin/learn/[id]` - Edit course/chapters

### Phase 6: Gamification UI

Add XP, badges, streaks to the experience.

**Components:**
- XP bar in header/profile
- Badge unlock notifications
- Streak counter
- Level display

---

## STEP-BY-STEP TASKS

### Task 1: CREATE convex/schema.ts additions

- **IMPLEMENT**: Add learning system tables to existing schema
- **PATTERN**: Follow existing table patterns in schema.ts
- **IMPORTS**: Use existing `defineTable`, `v` from convex
- **GOTCHA**: Add tables AFTER existing tables, don't replace
- **VALIDATE**: `npx convex dev --once` - should show new tables

```typescript
// Add these tables to schema.ts

// Learning System Tables
courses: defineTable({
  slug: v.string(),
  title: v.string(),
  subtitle: v.optional(v.string()),
  description: v.string(),
  coverImage: v.optional(v.string()),
  category: v.string(),
  tags: v.array(v.string()),
  learningOutcomes: v.array(v.string()),
  estimatedMinutes: v.number(),
  chapterCount: v.number(),
  generatedBy: v.union(v.literal("ai"), v.literal("manual")),
  aiPrompt: v.optional(v.string()),
  status: v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
  publishedAt: v.optional(v.number()),
  enrollmentCount: v.number(),
  completionCount: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_slug", ["slug"])
  .index("by_status", ["status"])
  .index("by_category", ["category"]),

chapters: defineTable({
  courseId: v.id("courses"),
  order: v.number(),
  title: v.string(),
  description: v.optional(v.string()),
  contentBlocks: v.array(v.object({
    id: v.string(),
    type: v.string(),
    content: v.any(),
  })),
  learningObjectives: v.array(v.string()),
  keyTerms: v.array(v.object({
    term: v.string(),
    pronunciation: v.optional(v.string()),
    definition: v.string(),
  })),
  estimatedMinutes: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_course", ["courseId"])
  .index("by_course_order", ["courseId", "order"]),

quizzes: defineTable({
  courseId: v.id("courses"),
  chapterId: v.optional(v.id("chapters")),
  type: v.union(v.literal("chapter_review"), v.literal("course_final")),
  title: v.string(),
  passingScore: v.number(),
  createdAt: v.number(),
})
  .index("by_course", ["courseId"])
  .index("by_chapter", ["chapterId"]),

questions: defineTable({
  quizId: v.id("quizzes"),
  order: v.number(),
  type: v.union(v.literal("multiple_choice"), v.literal("true_false")),
  question: v.string(),
  options: v.array(v.object({
    id: v.string(),
    text: v.string(),
  })),
  correctAnswers: v.array(v.string()),
  explanation: v.string(),
  points: v.number(),
  createdAt: v.number(),
})
  .index("by_quiz", ["quizId"]),

userCourseProgress: defineTable({
  clerkId: v.string(),
  courseId: v.id("courses"),
  status: v.union(v.literal("not_started"), v.literal("in_progress"), v.literal("completed")),
  readChapterIds: v.array(v.id("chapters")),
  passedQuizIds: v.array(v.id("quizzes")),
  totalTimeSpent: v.number(),
  startedAt: v.number(),
  completedAt: v.optional(v.number()),
  updatedAt: v.number(),
})
  .index("by_user", ["clerkId"])
  .index("by_user_course", ["clerkId", "courseId"]),

quizAttempts: defineTable({
  clerkId: v.string(),
  quizId: v.id("quizzes"),
  courseId: v.id("courses"),
  score: v.number(),
  maxScore: v.number(),
  percentage: v.number(),
  passed: v.boolean(),
  answers: v.array(v.object({
    questionId: v.id("questions"),
    selectedAnswers: v.array(v.string()),
    isCorrect: v.boolean(),
  })),
  attemptNumber: v.number(),
  completedAt: v.number(),
})
  .index("by_user", ["clerkId"])
  .index("by_user_quiz", ["clerkId", "quizId"]),

learnBadges: defineTable({
  slug: v.string(),
  name: v.string(),
  description: v.string(),
  icon: v.string(),
  category: v.string(),
  rarity: v.string(),
  criteriaType: v.string(),
  criteriaValue: v.number(),
  xpReward: v.number(),
  isActive: v.boolean(),
  createdAt: v.number(),
})
  .index("by_slug", ["slug"]),

userLearnBadges: defineTable({
  clerkId: v.string(),
  badgeId: v.id("learnBadges"),
  earnedAt: v.number(),
})
  .index("by_user", ["clerkId"]),

learnCategories: defineTable({
  slug: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
  icon: v.optional(v.string()),
  displayOrder: v.number(),
  isActive: v.boolean(),
  createdAt: v.number(),
})
  .index("by_slug", ["slug"])
  .index("by_active", ["isActive"]),
```

### Task 2: CREATE convex/learn/courses.ts

- **IMPLEMENT**: Course queries and mutations
- **PATTERN**: Mirror `convex/discover.ts` query patterns
- **IMPORTS**: `query`, `mutation` from `./_generated/server`, `v` from `convex/values`
- **VALIDATE**: `npx convex dev --once`

```typescript
import { query, mutation } from "../_generated/server"
import { v } from "convex/values"

export const listPublishedCourses = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { category, search, limit = 20 }) => {
    let q = ctx.db.query("courses").withIndex("by_status", (q) => q.eq("status", "published"))
    
    const courses = await q.collect()
    
    let filtered = courses
    if (category) {
      filtered = filtered.filter(c => c.category === category)
    }
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower)
      )
    }
    
    return filtered.slice(0, limit)
  },
})

export const getCourseBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first()
  },
})

export const getCourseChapters = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, { courseId }) => {
    return await ctx.db
      .query("chapters")
      .withIndex("by_course", (q) => q.eq("courseId", courseId))
      .collect()
  },
})

export const getCategories = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("learnCategories")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect()
  },
})
```

### Task 3: CREATE convex/learn/progress.ts

- **IMPLEMENT**: User progress tracking
- **PATTERN**: Mirror `convex/userLibrary.ts` clerkId patterns
- **VALIDATE**: `npx convex dev --once`

### Task 4: CREATE convex/learn/quizzes.ts

- **IMPLEMENT**: Quiz queries and submission
- **VALIDATE**: `npx convex dev --once`

### Task 5: CREATE convex/learn/generation.ts

- **IMPLEMENT**: AI course generation action
- **PATTERN**: Mirror `convex/perplexityAPI.ts` action pattern
- **IMPORTS**: Use both Perplexity and Gemini APIs
- **VALIDATE**: `npx convex dev --once`

### Task 6: CREATE app/learn/page.tsx

- **IMPLEMENT**: Course catalog page wrapper
- **PATTERN**: Mirror `app/discover/page.tsx` dynamic import pattern
- **VALIDATE**: `npm run build`

### Task 7: CREATE app/learn/LearnContent.tsx

- **IMPLEMENT**: Course catalog with grid, filters, search
- **PATTERN**: Mirror `app/discover/DiscoverContent.tsx`
- **IMPORTS**: Use existing Card, Badge, Button components
- **VALIDATE**: `npm run build`

### Task 8: CREATE app/learn/[courseSlug]/page.tsx

- **IMPLEMENT**: Course overview page
- **VALIDATE**: `npm run build`

### Task 9: CREATE app/learn/[courseSlug]/[chapter]/page.tsx

- **IMPLEMENT**: Chapter reading view
- **VALIDATE**: `npm run build`

### Task 10: CREATE components/learn/CourseCard.tsx

- **IMPLEMENT**: Course card for catalog grid
- **PATTERN**: Mirror existing Card component usage
- **VALIDATE**: `npm run build`

### Task 11: CREATE components/learn/QuizPlayer.tsx

- **IMPLEMENT**: Quiz interface with questions, answers, results
- **VALIDATE**: `npm run build`

### Task 12: CREATE components/learn/ContentBlock.tsx

- **IMPLEMENT**: Render different content block types (text, callout, wine_bridge, sake_example, etc.)
- **VALIDATE**: `npm run build`

### Task 13: CREATE app/admin/learn/page.tsx

- **IMPLEMENT**: Admin course list
- **VALIDATE**: `npm run build`

### Task 14: CREATE app/admin/learn/new/page.tsx

- **IMPLEMENT**: Course generation form
- **VALIDATE**: `npm run build`

### Task 15: UPDATE components/layout/Header.tsx

- **IMPLEMENT**: Add "Learn" link to navigation
- **VALIDATE**: `npm run build`

### Task 16: SEED initial categories and sample course

- **IMPLEMENT**: Create seed script for categories and one sample course
- **VALIDATE**: `npx convex run learn/seed:seedCategories`

---

## TESTING STRATEGY

### Unit Tests

Not required for hackathon MVP, but structure code for testability.

### Integration Tests

Manual testing of full flows:
1. Browse course catalog
2. Start a course
3. Read chapters
4. Take quizzes
5. Complete course
6. Verify XP/badges awarded

### Edge Cases

- User not logged in → redirect to sign-in
- Course not found → 404 page
- Quiz already passed → show results
- All quizzes passed → unlock final exam

---

## VALIDATION COMMANDS

### Level 1: Syntax & Types

```bash
npx convex dev --once
npm run build
```

### Level 2: Schema Deployment

```bash
npx convex dev --once
# Should show all new tables created
```

### Level 3: Manual Validation

1. Visit `/learn` - should show course catalog
2. Click a course - should show overview
3. Click a chapter - should show content
4. Take quiz - should submit and show results
5. Check progress persists across page loads

---

## ACCEPTANCE CRITERIA

- [ ] Course catalog displays at `/learn`
- [ ] Courses can be filtered by category
- [ ] Course overview shows chapters and progress
- [ ] Chapters render content blocks correctly
- [ ] Quizzes can be taken and scored
- [ ] Progress is tracked per user (clerkId)
- [ ] XP is awarded for completions
- [ ] Admin can generate courses via AI
- [ ] All pages follow RetroUI styling
- [ ] Mobile responsive

---

## COMPLETION CHECKLIST

- [ ] Schema deployed to Convex
- [ ] All Convex functions working
- [ ] `/learn` page renders
- [ ] Course detail page renders
- [ ] Chapter page renders
- [ ] Quiz system works
- [ ] Progress tracking works
- [ ] Admin generation works
- [ ] Navigation updated
- [ ] Build passes with no errors

---

## NOTES

### Scope for Hackathon MVP

Focus on core learning flow:
1. Course catalog
2. Course overview
3. Chapter reading
4. Basic quiz (multiple choice)
5. Progress tracking

Defer to post-hackathon:
- Rich content editor for admin
- Analytics dashboard
- Badge system (can add later)
- Streak tracking (can add later)

### AI Generation Strategy

Use two-step generation:
1. **Outline first**: Generate course structure, let admin review
2. **Content second**: Generate chapters one at a time

This prevents wasted API calls if admin rejects outline.

### Content Block Types (MVP)

Start with these block types:
- `text` - Paragraph text
- `heading` - Section heading
- `callout` - Info/tip box
- `key_terms` - Glossary terms
- `wine_bridge` - Wine comparison (unique to Sakecosm)
- `sake_example` - Sake product reference

Add more block types post-MVP.

### Confidence Score: 7/10

High confidence on:
- Schema design (follows existing patterns)
- Convex functions (well-documented)
- Page structure (mirrors existing pages)

Medium confidence on:
- AI generation quality (depends on prompts)
- Quiz UX (needs iteration)
- Content block rendering (many edge cases)
