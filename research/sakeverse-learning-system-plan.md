# Sakéverse Learning System - Comprehensive Planning Document

## Project Overview

### Vision
Build an Oboe.fyi-inspired AI-powered learning system for Sakéverse where admins generate educational sake courses using Perplexity API, and all users can access, learn from, and track their progress through these courses on the `/learn` route.

### Core Concept
- **Admin generates courses** → Perplexity AI creates structured content → Stored in Convex
- **Users consume courses** → Interactive chapters, quizzes, progress tracking, badges
- **Gamification** → XP, levels, streaks, achievements motivate continued learning
- **Accessible learning** → All content designed to be approachable regardless of prior knowledge
- **Quiz-gated completion** → Users must pass chapter quizzes to mark course complete

### Design Principles
- **No difficulty gatekeeping** - All courses accessible to everyone
- **Chapters are open** - Users can explore any chapter in any order
- **Quizzes are required** - Must pass all chapter quizzes + final exam to complete a course
- **No competitive elements** - No leaderboards; learning is personal, not competitive

### Design Inspiration
The UI should capture Oboe.fyi's aesthetic:
- Clean, minimalist layouts with generous whitespace
- Card-based course browsing
- Smooth transitions and micro-interactions
- Progress indicators that feel rewarding
- Typography-focused design
- Light, approachable color palette (adapted to Sakéverse's cherry blossom theme)

---

## User Stories

### Admin User Stories

```
ADMIN-001: Generate Course from Topic
As an admin, I want to enter a topic and have AI generate a complete course
So that I can quickly create educational content without manual writing

Acceptance Criteria:
- Admin can enter a course topic/title
- Admin can specify number of chapters (4-10)
- Admin can select target audience (for tone, not difficulty)
- Admin can select category (fundamentals, brewing, tasting, etc.)
- System generates course outline first for review
- Admin can approve or regenerate outline
- System generates full chapter content and quizzes
- Course is saved as "draft" status
- Admin receives confirmation with course details
```

```
ADMIN-002: Review and Edit Generated Course
As an admin, I want to review and edit AI-generated content before publishing
So that I can ensure quality and accuracy

Acceptance Criteria:
- Admin can view full course content in preview mode
- Admin can edit course title, description, tags
- Admin can edit individual chapter content
- Admin can edit/add/remove quiz questions
- Admin can reorder chapters
- Admin can delete chapters
- Changes are saved immediately (auto-save)
```

```
ADMIN-003: Publish Course
As an admin, I want to publish a draft course to make it available to users
So that learners can access the content

Acceptance Criteria:
- Admin can change course status from "draft" to "published"
- Published courses appear on /learn for all users
- Admin can unpublish (archive) courses
- Admin sees publish date and view counts
```

```
ADMIN-004: View Course Analytics
As an admin, I want to see how users engage with courses
So that I can improve content and identify popular topics

Acceptance Criteria:
- Admin sees total enrollments per course
- Admin sees completion rate per course
- Admin sees average quiz scores
- Admin sees time spent per chapter
- Admin can filter by date range
```

```
ADMIN-005: Manage Course Categories
As an admin, I want to organize courses into categories
So that users can easily find relevant content

Acceptance Criteria:
- Admin can create/edit/delete categories
- Admin can assign courses to categories
- Admin can set category display order
- Categories appear as filters on /learn
```

### Learner User Stories

```
LEARN-001: Browse Available Courses
As a learner, I want to browse all available courses on /learn
So that I can find topics I'm interested in learning

Acceptance Criteria:
- User sees grid of course cards
- Each card shows: title, description, duration, chapter count
- Cards show user's progress if started
- User can filter by category
- User can search by keyword
- User can sort by: newest, popular, recommended
```

```
LEARN-002: View Course Details
As a learner, I want to view course details before starting
So that I can decide if the course is right for me

Acceptance Criteria:
- User sees full course description
- User sees learning outcomes
- User sees chapter list with titles (all accessible)
- User sees estimated time to complete
- User sees "Start Course" or "Continue" button
- User sees their progress if already started
- User sees which quizzes are passed/pending
```

```
LEARN-003: Read Chapter Content
As a learner, I want to read chapter content in a focused view
So that I can learn without distractions

Acceptance Criteria:
- User can access any chapter in any order (not locked)
- User sees chapter title and content
- Content renders with proper formatting (headings, callouts, etc.)
- User sees key terms with definitions
- User sees sake examples with details
- User sees wine bridge comparisons (if applicable)
- User sees progress through chapter (scroll indicator)
- User can navigate to any other chapter
- Chapter is marked as "read" when user reaches end
- User is prompted to take quiz after reading
```

```
LEARN-004: Take Chapter Quiz
As a learner, I want to take a quiz after each chapter
So that I can test my understanding and complete the course

Acceptance Criteria:
- Quiz is accessible after reading chapter content
- User sees one question at a time
- User can select answer(s)
- User clicks "Check Answer" to see if correct
- User sees explanation after answering
- User sees their score at the end
- User can retry quiz unlimited times
- Passing quiz marks that chapter quiz as "passed"
- All chapter quizzes must be passed to complete course
```

```
LEARN-005: Take Final Exam
As a learner, I want to take a final exam at the end of a course
So that I can prove my mastery and complete the course

Acceptance Criteria:
- Final exam unlocks after ALL chapter quizzes are passed
- Exam has more questions than chapter quizzes
- User sees final score and pass/fail
- User can retry exam unlimited times
- Passing exam marks course as "completed"
- User earns XP and potentially badges on completion
```

```
LEARN-006: Track My Progress
As a learner, I want to see my learning progress
So that I can stay motivated and know what to do next

Acceptance Criteria:
- User sees overall progress on /learn dashboard
- User sees courses in progress with % complete
- User sees completed courses
- User sees total learning time
- User sees current streak
- User sees next recommended course
```

```
LEARN-007: Earn Badges and XP
As a learner, I want to earn badges and XP for learning
So that I feel rewarded for my progress

Acceptance Criteria:
- User earns XP for: completing chapters, passing quizzes, finishing courses
- User sees XP progress bar toward next level
- User earns badges for achievements
- User sees notification when badge earned
- User can view all badges (earned and locked)
- Badges show rarity and description
```

```
LEARN-008: View My Profile
As a learner, I want to see my learning profile
So that I can see my achievements and stats

Acceptance Criteria:
- User sees their level and XP
- User sees badges earned
- User sees courses completed
- User sees total learning time
- User sees current/longest streak
- User sees quiz performance stats
```

---

## Technical Architecture

### Tech Stack
- **Frontend**: Next.js 14+ (App Router)
- **Backend**: Convex (database, real-time, actions)
- **Authentication**: Clerk
- **AI Generation**: Perplexity API (current trends, web research)
- **Knowledge Base**: Gemini File Search RAG (sake literature, books)
- **Styling**: Tailwind CSS + RetroUI (neobrutalism)
- **State Management**: Convex React hooks + Zustand (local quiz state)
- **Animations**: Framer Motion

### Knowledge Sources
The course generation system pulls from two complementary sources:

1. **Gemini File Search RAG** (Primary Knowledge)
   - Processed sake books and literature
   - Deep educational content
   - Traditional brewing methods
   - Historical context
   - Tasting terminology
   - Regional information

2. **Perplexity API** (Current Context)
   - Latest sake trends
   - Current brewery news
   - Modern food pairings
   - Recent awards and recognition
   - Up-to-date product information

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SAKÉVERSE LEARNING                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         ADMIN LAYER                                  │   │
│  │                                                                      │   │
│  │  /admin/learn/courses ─── List all courses, stats                   │   │
│  │  /admin/learn/courses/new ─── Generate new course UI                │   │
│  │  /admin/learn/courses/[id] ─── Edit course details                  │   │
│  │  /admin/learn/courses/[id]/chapters/[chapterId] ─── Edit chapter    │   │
│  │  /admin/learn/analytics ─── View learning analytics                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      KNOWLEDGE SOURCES                               │   │
│  │                                                                      │   │
│  │  ┌─────────────────────┐      ┌─────────────────────┐              │   │
│  │  │  GEMINI FILE SEARCH │      │   PERPLEXITY API    │              │   │
│  │  │        RAG          │      │                     │              │   │
│  │  │                     │      │                     │              │   │
│  │  │  📚 Sake books      │      │  🌐 Current trends  │              │   │
│  │  │  📖 Literature      │      │  📰 Brewery news    │              │   │
│  │  │  🏯 History         │      │  🍽️ Modern pairings │              │   │
│  │  │  🍶 Terminology     │      │  🏆 Recent awards   │              │   │
│  │  │  🗾 Regional info   │      │  📊 Market data     │              │   │
│  │  └──────────┬──────────┘      └──────────┬──────────┘              │   │
│  │             │                            │                          │   │
│  │             └────────────┬───────────────┘                          │   │
│  │                          ▼                                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      GENERATION PIPELINE                             │   │
│  │                                                                      │   │
│  │  1. Query Gemini RAG ─── Get foundational knowledge on topic        │   │
│  │  2. Query Perplexity ─── Get current context and trends             │   │
│  │  3. Generate Outline ─── Combine sources into course structure      │   │
│  │  4. Generate Chapters ── Rich content with examples from both       │   │
│  │  5. Generate Quizzes ─── Questions testing key concepts             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                       CONVEX DATABASE                                │   │
│  │                                                                      │   │
│  │  courses ────────── Course metadata, status, timestamps             │   │
│  │  chapters ───────── Chapter content blocks, key terms               │   │
│  │  quizzes ────────── Quiz settings, passing score                    │   │
│  │  questions ──────── Individual quiz questions                       │   │
│  │  userProgress ───── User's progress per course                      │   │
│  │  quizAttempts ───── User's quiz answers and scores                  │   │
│  │  badges ─────────── Badge definitions                               │   │
│  │  userBadges ─────── User's earned badges                            │   │
│  │  userStats ──────── User's XP, level, streaks                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        USER LAYER                                    │   │
│  │                                                                      │   │
│  │  /learn ─────────────────── Course catalog (Oboe-style grid)        │   │
│  │  /learn/[courseSlug] ────── Course overview page                    │   │
│  │  /learn/[courseSlug]/[chapterIndex] ─── Chapter content view        │   │
│  │  /learn/[courseSlug]/quiz ─ Final exam                              │   │
│  │  /learn/progress ────────── User's progress dashboard               │   │
│  │  /profile/badges ────────── User's badge collection                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Convex Schema Definition

```typescript
// convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================
  // COURSE CONTENT TABLES
  // ============================================
  
  courses: defineTable({
    // Identifiers
    slug: v.string(), // URL-friendly identifier
    
    // Core content
    title: v.string(),
    subtitle: v.optional(v.string()),
    description: v.string(),
    coverImage: v.optional(v.string()),
    
    // Classification
    category: v.string(), // e.g., "fundamentals", "brewing", "tasting"
    tags: v.array(v.string()),
    
    // Learning outcomes
    learningOutcomes: v.array(v.string()),
    
    // Metadata
    estimatedMinutes: v.number(),
    chapterCount: v.number(),
    
    // Generation info
    generatedBy: v.union(v.literal("ai"), v.literal("manual")),
    aiPrompt: v.optional(v.string()),
    
    // Knowledge sources (for transparency/attribution)
    sources: v.optional(v.object({
      ragSources: v.array(v.string()),    // Books/literature from Gemini RAG
      webCitations: v.array(v.string()),   // URLs from Perplexity
    })),
    
    // Publishing
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    ),
    publishedAt: v.optional(v.number()),
    
    // Stats (denormalized for performance)
    enrollmentCount: v.number(),
    completionCount: v.number(),
    averageRating: v.optional(v.number()),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_status_category", ["status", "category"]),

  chapters: defineTable({
    courseId: v.id("courses"),
    
    // Position
    order: v.number(), // 1-indexed
    
    // Content
    title: v.string(),
    description: v.optional(v.string()),
    
    // Structured content blocks
    contentBlocks: v.array(v.object({
      id: v.string(), // unique block ID
      type: v.union(
        v.literal("text"),
        v.literal("heading"),
        v.literal("callout"),
        v.literal("key_points"),
        v.literal("wine_bridge"),
        v.literal("sake_example"),
        v.literal("pro_tip"),
        v.literal("image"),
        v.literal("misconception"),
        v.literal("exercise")
      ),
      content: v.any(), // Structure depends on type
    })),
    
    // Learning elements
    learningObjectives: v.array(v.string()),
    keyTerms: v.array(v.object({
      term: v.string(),
      pronunciation: v.optional(v.string()),
      definition: v.string(),
    })),
    
    // Metadata
    estimatedMinutes: v.number(),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_course", ["courseId"])
    .index("by_course_order", ["courseId", "order"]),

  quizzes: defineTable({
    // Parent references
    courseId: v.id("courses"),
    chapterId: v.optional(v.id("chapters")), // null for final exam
    
    // Type
    type: v.union(
      v.literal("chapter_review"),
      v.literal("course_final")
    ),
    
    // Display
    title: v.string(),
    description: v.optional(v.string()),
    
    // Settings
    passingScore: v.number(), // percentage (0-100)
    shuffleQuestions: v.boolean(),
    showCorrectAnswers: v.boolean(),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_course", ["courseId"])
    .index("by_chapter", ["chapterId"]),

  questions: defineTable({
    quizId: v.id("quizzes"),
    
    // Position
    order: v.number(),
    
    // Question type
    type: v.union(
      v.literal("multiple_choice"),
      v.literal("multiple_select"),
      v.literal("true_false"),
      v.literal("scenario")
    ),
    
    // Content
    question: v.string(),
    imageUrl: v.optional(v.string()),
    
    // Options
    options: v.array(v.object({
      id: v.string(),
      text: v.string(),
    })),
    
    // Answer
    correctAnswers: v.array(v.string()), // option IDs
    explanation: v.string(),
    hint: v.optional(v.string()),
    
    // Scoring
    points: v.number(),
    
    // Timestamps
    createdAt: v.number(),
  })
    .index("by_quiz", ["quizId"])
    .index("by_quiz_order", ["quizId", "order"]),

  // ============================================
  // USER PROGRESS TABLES
  // ============================================

  userProgress: defineTable({
    userId: v.string(), // Clerk user ID
    courseId: v.id("courses"),
    
    // Status
    status: v.union(
      v.literal("not_started"),
      v.literal("in_progress"),
      v.literal("completed")
    ),
    
    // Chapter progress (reading)
    readChapterIds: v.array(v.id("chapters")),
    
    // Quiz progress (passing)
    passedQuizIds: v.array(v.id("quizzes")),
    
    // Time tracking
    totalTimeSpent: v.number(), // seconds
    lastAccessedAt: v.number(),
    
    // Completion (requires all quizzes + final exam passed)
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_course", ["userId", "courseId"])
    .index("by_user_status", ["userId", "status"]),

  quizAttempts: defineTable({
    userId: v.string(),
    quizId: v.id("quizzes"),
    courseId: v.id("courses"),
    
    // Results
    score: v.number(),
    maxScore: v.number(),
    percentage: v.number(),
    passed: v.boolean(),
    
    // Detailed answers
    answers: v.array(v.object({
      questionId: v.id("questions"),
      selectedAnswers: v.array(v.string()),
      isCorrect: v.boolean(),
      timeSpent: v.number(), // seconds
    })),
    
    // Timing
    attemptNumber: v.number(),
    startedAt: v.number(),
    completedAt: v.number(),
    totalTimeSpent: v.number(), // seconds
  })
    .index("by_user", ["userId"])
    .index("by_user_quiz", ["userId", "quizId"])
    .index("by_quiz", ["quizId"]),

  // ============================================
  // GAMIFICATION TABLES
  // ============================================

  badges: defineTable({
    // Identity
    slug: v.string(),
    
    // Display
    name: v.string(),
    description: v.string(),
    icon: v.string(), // emoji or icon name
    
    // Classification
    category: v.union(
      v.literal("learning"),
      v.literal("mastery"),
      v.literal("streak"),
      v.literal("exploration"),
      v.literal("special")
    ),
    rarity: v.union(
      v.literal("common"),
      v.literal("uncommon"),
      v.literal("rare"),
      v.literal("epic"),
      v.literal("legendary")
    ),
    
    // Unlock criteria (evaluated by code)
    criteriaType: v.string(), // e.g., "chapters_completed", "quiz_score"
    criteriaParams: v.any(), // type-specific parameters
    
    // Reward
    xpReward: v.number(),
    
    // Visibility
    isActive: v.boolean(),
    isSecret: v.boolean(), // hidden until earned
    
    // Timestamps
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_active", ["isActive"]),

  userBadges: defineTable({
    userId: v.string(),
    badgeId: v.id("badges"),
    
    // When earned
    earnedAt: v.number(),
    
    // Display preferences
    isPinned: v.boolean(),
    isNew: v.boolean(), // for notification dot
  })
    .index("by_user", ["userId"])
    .index("by_user_badge", ["userId", "badgeId"]),

  userStats: defineTable({
    userId: v.string(),
    
    // XP and Level
    totalXp: v.number(),
    level: v.number(),
    
    // Learning stats
    coursesStarted: v.number(),
    coursesCompleted: v.number(),
    chaptersRead: v.number(),
    quizzesAttempted: v.number(),
    quizzesPassed: v.number(),
    
    // Time stats
    totalLearningTime: v.number(), // seconds
    
    // Streak
    currentStreak: v.number(), // days
    longestStreak: v.number(),
    lastActiveDate: v.string(), // YYYY-MM-DD format
    
    // Performance
    averageQuizScore: v.number(),
    perfectQuizCount: v.number(),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // ============================================
  // ADMIN/CONFIG TABLES
  // ============================================

  categories: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    displayOrder: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_active_order", ["isActive", "displayOrder"]),
});
```

---

## API Design

### Convex Functions

#### Course Generation (Admin Actions)

```typescript
// convex/admin/courses/actions.ts

// Query knowledge sources
queryGeminiRAG(args: {
  query: string;
  topK?: number;
}) → Promise<{
  chunks: RAGChunk[];
  sources: string[];
}>

queryPerplexity(args: {
  query: string;
  searchRecency?: "month" | "week" | "day";
}) → Promise<{
  content: string;
  citations: string[];
}>

// Generation with dual knowledge sources
generateCourseOutline(args: {
  topic: string;
  chapterCount: number;
  targetAudience: string;
  category: string;
}) → Promise<{
  outline: CourseOutline;
  ragSources: string[];      // Books/literature used
  webCitations: string[];    // Perplexity citations
}>

generateChapterContent(args: {
  courseTitle: string;
  chapter: ChapterOutline;
  ragContext: string;        // Pre-fetched RAG context for this chapter
}) → Promise<{
  content: ChapterContent;
  ragSources: string[];
  webCitations: string[];
}>

generateQuizFromContent(args: {
  chapterTitle: string;
  chapterContent: string;
  keyTerms: KeyTerm[];
  learningObjectives: string[];
  questionCount: number;
}) → Promise<{
  questions: QuizQuestion[];
}>

generateFullCourse(args: {
  topic: string;
  chapterCount: number;
  targetAudience: string;
  category: string;
}) → Promise<{
  courseId: Id<"courses">;
  title: string;
  chapterCount: number;
  chapters: ChapterResult[];
  sources: {
    books: string[];         // Gemini RAG sources
    web: string[];           // Perplexity citations
  };
}>
```

#### Course Management (Admin Mutations)

```typescript
// convex/admin/courses/mutations.ts

createCourse(args: CourseInput) → Promise<Id<"courses">>
updateCourse(args: { id: Id<"courses">; updates: Partial<Course> }) → Promise<void>
publishCourse(args: { id: Id<"courses"> }) → Promise<void>
unpublishCourse(args: { id: Id<"courses"> }) → Promise<void>
deleteCourse(args: { id: Id<"courses"> }) → Promise<void>

createChapter(args: ChapterInput) → Promise<Id<"chapters">>
updateChapter(args: { id: Id<"chapters">; updates: Partial<Chapter> }) → Promise<void>
reorderChapters(args: { courseId: Id<"courses">; chapterIds: Id<"chapters">[] }) → Promise<void>
deleteChapter(args: { id: Id<"chapters"> }) → Promise<void>

createQuiz(args: QuizInput) → Promise<Id<"quizzes">>
updateQuiz(args: { id: Id<"quizzes">; updates: Partial<Quiz> }) → Promise<void>
deleteQuiz(args: { id: Id<"quizzes"> }) → Promise<void>

createQuestion(args: QuestionInput) → Promise<Id<"questions">>
updateQuestion(args: { id: Id<"questions">; updates: Partial<Question> }) → Promise<void>
deleteQuestion(args: { id: Id<"questions"> }) → Promise<void>
```

#### Course Queries (Public)

```typescript
// convex/courses/queries.ts

listPublishedCourses(args: {
  category?: string;
  search?: string;
  sortBy?: "newest" | "popular" | "recommended";
  limit?: number;
  cursor?: string;
}) → Promise<{
  courses: CourseWithProgress[];
  nextCursor?: string;
}>

getCourseBySlug(args: { slug: string }) → Promise<CourseDetail | null>

getCourseChapters(args: { courseId: Id<"courses"> }) → Promise<Chapter[]>

getChapter(args: { 
  courseId: Id<"courses">; 
  chapterOrder: number;
}) → Promise<ChapterWithNavigation | null>

getQuiz(args: { quizId: Id<"quizzes"> }) → Promise<QuizWithQuestions | null>

getChapterQuiz(args: { chapterId: Id<"chapters"> }) → Promise<QuizWithQuestions | null>

getFinalExam(args: { courseId: Id<"courses"> }) → Promise<QuizWithQuestions | null>
```

#### Progress Mutations (User)

```typescript
// convex/progress/mutations.ts

startCourse(args: { courseId: Id<"courses"> }) → Promise<Id<"userProgress">>

markChapterRead(args: { 
  courseId: Id<"courses">; 
  chapterId: Id<"chapters">;
  timeSpent: number;
}) → Promise<{
  xpEarned: number;
  newBadges: Badge[];
}>

submitQuizAttempt(args: {
  quizId: Id<"quizzes">;
  answers: QuizAnswer[];
  timeSpent: number;
}) → Promise<{
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  xpEarned: number;
  newBadges: Badge[];
  courseCompleted: boolean; // true if this was the last quiz needed
}>

updateLearningTime(args: {
  courseId: Id<"courses">;
  seconds: number;
}) → Promise<void>
```

#### Progress Queries (User)

```typescript
// convex/progress/queries.ts

getUserProgress(args: { courseId: Id<"courses"> }) → Promise<UserProgress | null>

getUserCourseList() → Promise<{
  inProgress: CourseWithProgress[];
  completed: CourseWithProgress[];
  notStarted: CourseWithProgress[];
}>

getUserStats() → Promise<UserStats>

getUserBadges() → Promise<{
  earned: BadgeWithDetails[];
  locked: BadgeWithDetails[];
}>

getQuizAttempts(args: { quizId: Id<"quizzes"> }) → Promise<QuizAttempt[]>

getCourseQuizStatus(args: { courseId: Id<"courses"> }) → Promise<{
  chapterQuizzes: { chapterId: Id<"chapters">; passed: boolean }[];
  finalExamPassed: boolean;
  canTakeFinalExam: boolean;
}>
```

#### Gamification (Internal)

```typescript
// convex/gamification/internal.ts

checkAndAwardBadges(args: {
  userId: string;
  trigger: BadgeTrigger;
}) → Promise<Badge[]>

awardXp(args: {
  userId: string;
  amount: number;
  reason: string;
}) → Promise<{ newTotal: number; leveledUp: boolean; newLevel?: number }>

updateStreak(args: { userId: string }) → Promise<{
  currentStreak: number;
  isNewRecord: boolean;
}>

recalculateLevel(args: { userId: string }) → Promise<number>
```

---

## UI Component Architecture

### Page Structure

```
/learn                          → CourseCatalogPage
/learn/[courseSlug]             → CourseOverviewPage
/learn/[courseSlug]/[chapter]   → ChapterPage
/learn/[courseSlug]/quiz        → FinalExamPage
/learn/progress                 → ProgressDashboardPage
/profile/badges                 → BadgeCollectionPage

/admin/learn                    → AdminCoursesListPage
/admin/learn/new                → AdminGenerateCoursePage
/admin/learn/[id]               → AdminEditCoursePage
/admin/learn/[id]/chapters/[chapterId] → AdminEditChapterPage
/admin/learn/analytics          → AdminAnalyticsPage
```

### Component Tree

```
components/
├── learn/
│   ├── catalog/
│   │   ├── CourseCatalog.tsx       # Main catalog grid
│   │   ├── CourseCard.tsx          # Individual course card
│   │   ├── CourseFilters.tsx       # Category/difficulty filters
│   │   ├── CourseSearch.tsx        # Search input
│   │   └── CourseSkeleton.tsx      # Loading state
│   │
│   ├── course/
│   │   ├── CourseHeader.tsx        # Title, description, metadata
│   │   ├── CourseOutline.tsx       # Chapter list with progress
│   │   ├── CourseSidebar.tsx       # Stats, progress, CTA
│   │   ├── LearningOutcomes.tsx    # What you'll learn
│   │   └── CourseProgress.tsx      # Progress bar component
│   │
│   ├── chapter/
│   │   ├── ChapterLayout.tsx       # Full chapter layout
│   │   ├── ChapterHeader.tsx       # Title, objectives
│   │   ├── ChapterContent.tsx      # Renders content blocks
│   │   ├── ChapterNav.tsx          # Prev/next navigation
│   │   ├── ChapterProgress.tsx     # Reading progress indicator
│   │   └── ContentBlockRenderer.tsx # Renders individual blocks
│   │
│   ├── content-blocks/
│   │   ├── TextBlock.tsx           # Paragraph text
│   │   ├── HeadingBlock.tsx        # Section headings
│   │   ├── CalloutBlock.tsx        # Info/warning/tip boxes
│   │   ├── KeyPointsBlock.tsx      # Bullet list of key points
│   │   ├── WineBridgeBlock.tsx     # Wine comparison card
│   │   ├── SakeExampleBlock.tsx    # Sake product card
│   │   ├── ProTipBlock.tsx         # Pro tip callout
│   │   ├── MisconceptionBlock.tsx  # Myth vs reality
│   │   ├── ExerciseBlock.tsx       # Practical exercise
│   │   └── KeyTermsList.tsx        # Glossary terms
│   │
│   ├── quiz/
│   │   ├── QuizPlayer.tsx          # Main quiz component
│   │   ├── QuizQuestion.tsx        # Single question display
│   │   ├── QuizOptions.tsx         # Answer options
│   │   ├── QuizExplanation.tsx     # Post-answer explanation
│   │   ├── QuizProgress.tsx        # Question progress bar
│   │   ├── QuizResults.tsx         # Final score display
│   │   └── QuizRetry.tsx           # Retry prompt
│   │
│   └── progress/
│       ├── ProgressDashboard.tsx   # Main progress page
│       ├── ProgressStats.tsx       # Overall stats cards
│       ├── CourseProgressList.tsx  # In-progress courses
│       ├── CompletedCourses.tsx    # Completed course list
│       ├── StreakDisplay.tsx       # Current streak widget
│       └── RecommendedCourses.tsx  # AI recommendations
│
├── gamification/
│   ├── XpBar.tsx                   # XP progress to next level
│   ├── LevelBadge.tsx              # Current level display
│   ├── BadgeGrid.tsx               # Grid of all badges
│   ├── BadgeCard.tsx               # Individual badge
│   ├── BadgeModal.tsx              # Badge detail popup
│   ├── BadgeUnlockToast.tsx        # Notification on unlock
│   ├── StreakCounter.tsx           # Flame streak display
│   └── XpGainAnimation.tsx         # +XP floating animation
│
├── admin/
│   ├── courses/
│   │   ├── CourseList.tsx          # Admin course table
│   │   ├── CourseForm.tsx          # Edit course form
│   │   ├── GenerateCourseForm.tsx  # AI generation form
│   │   ├── GenerationProgress.tsx  # Progress during generation
│   │   ├── ChapterEditor.tsx       # Rich chapter editor
│   │   ├── QuizEditor.tsx          # Quiz question editor
│   │   └── QuestionEditor.tsx      # Single question form
│   │
│   └── analytics/
│       ├── AnalyticsDashboard.tsx  # Main analytics view
│       ├── CoursePerformance.tsx   # Per-course stats
│       ├── UserEngagement.tsx      # User activity charts
│       └── QuizAnalytics.tsx       # Quiz performance data
│
└── shared/
    ├── ProgressRing.tsx            # Circular progress indicator
    ├── CategoryPill.tsx            # Category tag
    ├── TimeEstimate.tsx            # "15 min" display
    ├── EmptyState.tsx              # No content placeholder
    └── ConfettiTrigger.tsx         # Celebration effect
```

---

## UI Design Specifications

### Design System (Oboe-Inspired + Sakéverse)

#### Color Palette
```css
/* Primary - Sakura (Cherry Blossom) */
--sakura-50: #FFF5F7;
--sakura-100: #FFE4E9;
--sakura-200: #FFCCD5;
--sakura-300: #FFB3C1;
--sakura-400: #FF8FA3;
--sakura-500: #FF6B85;
--sakura-600: #E05570;

/* Secondary - Matcha (Green) */
--matcha-50: #F0FDF4;
--matcha-100: #DCFCE7;
--matcha-200: #BBF7D0;
--matcha-300: #86EFAC;
--matcha-400: #4ADE80;
--matcha-500: #22C55E;

/* Accent - Yuzu (Yellow) */
--yuzu-50: #FEFCE8;
--yuzu-100: #FEF9C3;
--yuzu-200: #FEF08A;
--yuzu-300: #FDE047;
--yuzu-400: #FACC15;
--yuzu-500: #EAB308;

/* Neutral - Ink */
--ink: #1A1A2E;
--ink-light: #4A4A5E;
--cream: #FDFBF7;
--cream-dark: #F5F3EF;

/* Semantic */
--success: var(--matcha-500);
--warning: var(--yuzu-500);
--error: #EF4444;
```

#### Typography
```css
/* Headings */
font-family: 'DM Serif Display', serif;

/* Body */
font-family: 'Inter', sans-serif;

/* Mono (code, terms) */
font-family: 'JetBrains Mono', monospace;

/* Scale */
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
--text-4xl: 2.25rem;
```

#### Spacing & Layout
```css
/* Consistent spacing scale */
--space-1: 0.25rem;
--space-2: 0.5rem;
--space-3: 0.75rem;
--space-4: 1rem;
--space-6: 1.5rem;
--space-8: 2rem;
--space-12: 3rem;
--space-16: 4rem;

/* Container widths */
--container-sm: 640px;   /* Chapter content */
--container-md: 768px;   /* Quiz */
--container-lg: 1024px;  /* Course overview */
--container-xl: 1280px;  /* Catalog grid */
```

#### Component Styles (RetroUI Neobrutalism)

```css
/* Card */
.card {
  background: var(--cream);
  border: 3px solid var(--ink);
  border-radius: 12px;
  box-shadow: 4px 4px 0 0 var(--ink);
  transition: all 0.2s;
}
.card:hover {
  box-shadow: 6px 6px 0 0 var(--ink);
  transform: translate(-2px, -2px);
}

/* Button Primary */
.btn-primary {
  background: var(--sakura-500);
  color: white;
  border: 2px solid var(--sakura-600);
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 700;
  box-shadow: 3px 3px 0 0 var(--ink);
  transition: all 0.2s;
}
.btn-primary:hover {
  box-shadow: 4px 4px 0 0 var(--ink);
  transform: translate(-1px, -1px);
}

/* Input */
.input {
  background: white;
  border: 2px solid var(--ink);
  border-radius: 8px;
  padding: 12px 16px;
}
.input:focus {
  outline: none;
  box-shadow: 0 0 0 3px var(--sakura-200);
}

/* Badge */
.badge {
  display: inline-flex;
  padding: 4px 12px;
  border-radius: 999px;
  border: 2px solid;
  font-size: var(--text-sm);
  font-weight: 600;
}
```

---

## Page Layouts

### /learn - Course Catalog (Oboe-Style)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER (existing Sakéverse nav)                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                                                                       │ │
│  │   🍶 Learn Sake                                                       │ │
│  │   Master the art of sake with guided courses                         │ │
│  │                                                                       │ │
│  │   ┌─────────────────────────────────────────────────────────────┐   │ │
│  │   │  🔍 Search courses...                                        │   │ │
│  │   └─────────────────────────────────────────────────────────────┘   │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  All  │  Fundamentals  │  Brewing  │  Tasting  │  Pairing  │  Regions│   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Continue Learning                                    View All →            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│  │  [Course Card]  │  │  [Course Card]  │  │  [Course Card]  │            │
│  │  ████████░░ 65% │  │  ██░░░░░░░░ 20% │  │  ██████░░░░ 50% │            │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘            │
│                                                                             │
│  Explore Courses                                                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│  │  [Cover Image]  │  │  [Cover Image]  │  │  [Cover Image]  │            │
│  │                 │  │                 │  │                 │            │
│  │  ┌───────────┐  │  │  ┌───────────┐  │  │  ┌───────────┐  │            │
│  │  │FUNDAMENTALS│  │  │  │  BREWING  │  │  │  │  TASTING  │  │            │
│  │  └───────────┘  │  │  └───────────┘  │  │  └───────────┘  │            │
│  │  Course Title   │  │  Course Title   │  │  Course Title   │            │
│  │  Short desc...  │  │  Short desc...  │  │  Short desc...  │            │
│  │  📖 6 chapters  │  │  📖 8 chapters  │  │  📖 5 chapters  │            │
│  │  ⏱️ 1.5 hours   │  │  ⏱️ 2 hours     │  │  ⏱️ 1 hour      │            │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘            │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│  │  [Course Card]  │  │  [Course Card]  │  │  [Course Card]  │            │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### /learn/[courseSlug] - Course Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Back to Courses                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────┐  ┌─────────────────┐  │
│  │                                                 │  │                 │  │
│  │  ┌──────────────┐                               │  │  YOUR PROGRESS  │  │
│  │  │ FUNDAMENTALS │                               │  │                 │  │
│  │  └──────────────┘                               │  │  ┌───────────┐  │  │
│  │                                                 │  │  │  ████░░░  │  │  │
│  │  Understanding Junmai:                          │  │  │    40%    │  │  │
│  │  The Pure Rice Experience                       │  │  └───────────┘  │  │
│  │                                                 │  │                 │  │
│  │  Discover the soul of sake through the         │  │  3/5 chapters   │  │
│  │  junmai classification and learn why pure      │  │  read           │  │
│  │  rice sake represents the essence of...        │  │                 │  │
│  │                                                 │  │  2/5 quizzes    │  │
│  │  📖 5 chapters  ⏱️ 1.5 hours  👥 234 enrolled   │  │  passed         │  │
│  │                                                 │  │                 │  │
│  └─────────────────────────────────────────────────┘  │  45 min spent   │  │
│                                                        │                 │  │
│  What You'll Learn                                     │  ┌───────────┐  │  │
│  ┌─────────────────────────────────────────────────┐  │  │ Continue  │  │  │
│  │  ✓ Understand the junmai classification        │  │  │  Course   │  │  │
│  │  ✓ Identify flavor profiles of pure rice sake  │  │  └───────────┘  │  │
│  │  ✓ Select the right junmai for any occasion    │  │                 │  │
│  │  ✓ Pair junmai with food confidently           │  │  ─────────────  │  │
│  └─────────────────────────────────────────────────┘  │                 │  │
│                                                        │  📊 Course Stats│  │
│  Course Outline                                        │  👥 234 enrolled│  │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📖  1. What is Junmai?                             15 min    ✓ Quiz│   │
│  │      Introduction to the pure rice classification                   │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  📖  2. The Rice Factor                             20 min    ✓ Quiz│   │
│  │      Understanding polishing ratios and rice types                  │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  📖  3. Flavor Profiles                             18 min    ○ Quiz│   │
│  │      Identifying the taste characteristics                          │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  📖  4. Temperature & Serving                       15 min    ○ Quiz│   │
│  │      How temperature affects the experience                         │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  📖  5. Food Pairing Mastery                        22 min    ○ Quiz│   │
│  │      Perfect pairings for junmai sake                               │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  🎓  Final Exam                                     15 min   🔒 Pass │   │
│  │      Test your junmai mastery (pass all quizzes first)       all    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### /learn/[courseSlug]/[chapter] - Chapter View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Understanding Junmai  │  Chapter 3 of 5  │  ████████░░ 60%                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                    ┌─────────────────────────────────────┐                  │
│                    │                                     │                  │
│                    │  Chapter 3                          │                  │
│                    │  Flavor Profiles                    │                  │
│                    │                                     │                  │
│                    │  Learning Objectives:               │                  │
│                    │  • Identify key flavor compounds    │                  │
│                    │  • Recognize umami in sake          │                  │
│                    │  • Compare junmai to ginjo styles   │                  │
│                    │                                     │                  │
│                    │  ─────────────────────────────────  │                  │
│                    │                                     │                  │
│                    │  When you first taste a junmai     │                  │
│                    │  sake, you might notice it has     │                  │
│                    │  a fuller, richer character than   │                  │
│                    │  its more polished cousins...      │                  │
│                    │                                     │                  │
│                    │  ┌─────────────────────────────┐   │                  │
│                    │  │ 🍷 Wine Bridge              │   │                  │
│                    │  │                             │   │                  │
│                    │  │ If you enjoy unoaked        │   │                  │
│                    │  │ Chardonnay, you'll likely   │   │                  │
│                    │  │ appreciate junmai's clean   │   │                  │
│                    │  │ rice-forward character.     │   │                  │
│                    │  └─────────────────────────────┘   │                  │
│                    │                                     │                  │
│                    │  ## Understanding Umami             │                  │
│                    │                                     │                  │
│                    │  The word "umami" comes from the   │                  │
│                    │  Japanese word for "delicious"...  │                  │
│                    │                                     │                  │
│                    │  ┌─────────────────────────────┐   │                  │
│                    │  │ 🍶 Sake Example             │   │                  │
│                    │  │                             │   │                  │
│                    │  │ Dewazakura Junmai           │   │                  │
│                    │  │ Dewazakura Brewery, Yamagata│   │                  │
│                    │  │                             │   │                  │
│                    │  │ A textbook example of       │   │                  │
│                    │  │ junmai umami character...   │   │                  │
│                    │  └─────────────────────────────┘   │                  │
│                    │                                     │                  │
│                    │  ┌─────────────────────────────┐   │                  │
│                    │  │ 📝 Key Terms                │   │                  │
│                    │  │                             │   │                  │
│                    │  │ Umami (旨味)                │   │                  │
│                    │  │ oo-MAH-mee                  │   │                  │
│                    │  │ The fifth taste, savory...  │   │                  │
│                    │  └─────────────────────────────┘   │                  │
│                    │                                     │                  │
│                    │  ─────────────────────────────────  │                  │
│                    │                                     │                  │
│                    │  ┌─────────────────────────────┐   │                  │
│                    │  │      Take Chapter Quiz      │   │                  │
│                    │  └─────────────────────────────┘   │                  │
│                    │                                     │                  │
│                    │  ← Previous        Next Chapter → │                  │
│                    │                                     │                  │
│                    └─────────────────────────────────────┘                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal**: Set up database schema and basic data flow

**Tasks**:
1. Define Convex schema for all tables
2. Create basic Convex mutations for courses, chapters, quizzes
3. Create basic Convex queries for fetching data
4. Set up admin route structure (/admin/learn/*)
5. Set up user route structure (/learn/*)
6. Create seed data for testing

**Deliverables**:
- Working Convex schema
- Basic CRUD operations
- Route scaffolding

### Phase 2: Admin Course Generation (Week 2)
**Goal**: Admin can generate courses using Perplexity

**Tasks**:
1. Build Perplexity API integration
2. Create course outline generation prompt
3. Create chapter content generation prompt
4. Create quiz generation prompt
5. Build generateFullCourse pipeline action
6. Build admin generate course UI
7. Add generation progress display
8. Add course preview functionality

**Deliverables**:
- Working AI course generation
- Admin UI for generation
- Draft courses in database

### Phase 3: Admin Course Management (Week 3)
**Goal**: Admin can review, edit, and publish courses

**Tasks**:
1. Build admin course list page
2. Build admin course edit form
3. Build chapter content editor
4. Build quiz/question editor
5. Implement publish/unpublish functionality
6. Add course reordering
7. Add delete with confirmation

**Deliverables**:
- Full admin CRUD interface
- Publishing workflow

### Phase 4: User Course Catalog (Week 4)
**Goal**: Users can browse and discover courses

**Tasks**:
1. Build course catalog page (Oboe-style grid)
2. Build course card component
3. Implement category filtering
4. Implement difficulty filtering
5. Implement search
6. Implement sorting (newest, popular)
7. Add loading states and skeletons
8. Build empty states

**Deliverables**:
- Beautiful course catalog
- Filtering and search
- Responsive design

### Phase 5: User Course Experience (Week 5)
**Goal**: Users can view course details and read chapters

**Tasks**:
1. Build course overview page
2. Build chapter list with progress
3. Build chapter reading view
4. Create all content block renderers
5. Implement chapter navigation
6. Track reading progress
7. Mark chapters as complete
8. Build progress sidebar

**Deliverables**:
- Course overview page
- Chapter reading experience
- Content block rendering

### Phase 6: Quiz System (Week 6)
**Goal**: Users can take quizzes and see results

**Tasks**:
1. Build QuizPlayer component
2. Build question display components
3. Implement answer selection
4. Implement answer checking
5. Build explanation display
6. Build quiz results page
7. Implement quiz attempts tracking
8. Build final exam flow

**Deliverables**:
- Interactive quiz system
- Results and explanations
- Attempt history

### Phase 7: Progress Tracking (Week 7)
**Goal**: Users can track their learning progress

**Tasks**:
1. Build progress dashboard page
2. Implement progress queries
3. Build "continue learning" section
4. Build completed courses section
5. Build stats cards (time, chapters, etc.)
6. Implement time tracking
7. Build streak tracking
8. Add streak display

**Deliverables**:
- Progress dashboard
- Stats tracking
- Streak system

### Phase 8: Gamification (Week 8)
**Goal**: Users earn XP and badges for learning

**Tasks**:
1. Define badge criteria
2. Seed badge definitions
3. Build badge award triggers
4. Implement XP system
5. Implement leveling
6. Build badge grid display
7. Build badge unlock notifications
8. Build XP bar component
9. Add confetti celebrations

**Deliverables**:
- Badge system
- XP and levels
- Celebrations

### Phase 9: Polish & Optimization (Week 9)
**Goal**: Refine UX and performance

**Tasks**:
1. Add page transitions
2. Add micro-interactions
3. Optimize database queries
4. Add proper error handling
5. Add loading states everywhere
6. Mobile responsiveness pass
7. Accessibility audit
8. Performance optimization

**Deliverables**:
- Polished experience
- Fast performance
- Accessible UI

---

## File Structure

```
app/
├── learn/
│   ├── page.tsx                      # Course catalog
│   ├── loading.tsx                   # Catalog loading state
│   ├── progress/
│   │   └── page.tsx                  # Progress dashboard
│   └── [courseSlug]/
│       ├── page.tsx                  # Course overview
│       ├── loading.tsx               # Course loading state
│       ├── quiz/
│       │   └── page.tsx              # Final exam
│       └── [chapterOrder]/
│           ├── page.tsx              # Chapter content
│           ├── loading.tsx           # Chapter loading state
│           └── quiz/
│               └── page.tsx          # Chapter quiz
│
├── admin/
│   └── learn/
│       ├── page.tsx                  # Admin course list
│       ├── new/
│       │   └── page.tsx              # Generate course
│       ├── analytics/
│       │   └── page.tsx              # Analytics dashboard
│       └── [courseId]/
│           ├── page.tsx              # Edit course
│           └── chapters/
│               └── [chapterId]/
│                   └── page.tsx      # Edit chapter
│
├── profile/
│   └── badges/
│       └── page.tsx                  # Badge collection

components/
├── learn/
│   ├── catalog/
│   │   ├── CourseCatalog.tsx
│   │   ├── CourseCard.tsx
│   │   ├── CourseFilters.tsx
│   │   ├── CourseSearch.tsx
│   │   └── CourseSkeleton.tsx
│   │
│   ├── course/
│   │   ├── CourseHeader.tsx
│   │   ├── CourseOutline.tsx
│   │   ├── CourseSidebar.tsx
│   │   ├── LearningOutcomes.tsx
│   │   └── CourseProgress.tsx
│   │
│   ├── chapter/
│   │   ├── ChapterLayout.tsx
│   │   ├── ChapterHeader.tsx
│   │   ├── ChapterContent.tsx
│   │   ├── ChapterNav.tsx
│   │   └── ContentBlockRenderer.tsx
│   │
│   ├── content-blocks/
│   │   ├── TextBlock.tsx
│   │   ├── HeadingBlock.tsx
│   │   ├── CalloutBlock.tsx
│   │   ├── KeyPointsBlock.tsx
│   │   ├── WineBridgeBlock.tsx
│   │   ├── SakeExampleBlock.tsx
│   │   ├── ProTipBlock.tsx
│   │   ├── MisconceptionBlock.tsx
│   │   ├── ExerciseBlock.tsx
│   │   └── KeyTermsList.tsx
│   │
│   ├── quiz/
│   │   ├── QuizPlayer.tsx
│   │   ├── QuizQuestion.tsx
│   │   ├── QuizOptions.tsx
│   │   ├── QuizExplanation.tsx
│   │   ├── QuizProgress.tsx
│   │   └── QuizResults.tsx
│   │
│   └── progress/
│       ├── ProgressDashboard.tsx
│       ├── ProgressStats.tsx
│       ├── CourseProgressList.tsx
│       └── StreakDisplay.tsx
│
├── gamification/
│   ├── XpBar.tsx
│   ├── LevelBadge.tsx
│   ├── BadgeGrid.tsx
│   ├── BadgeCard.tsx
│   ├── BadgeModal.tsx
│   ├── BadgeUnlockToast.tsx
│   └── StreakCounter.tsx
│
├── admin/
│   ├── CourseList.tsx
│   ├── CourseForm.tsx
│   ├── GenerateCourseForm.tsx
│   ├── GenerationProgress.tsx
│   ├── ChapterEditor.tsx
│   └── QuizEditor.tsx
│
└── shared/
    ├── ProgressRing.tsx
    ├── CategoryPill.tsx
    └── TimeEstimate.tsx

convex/
├── schema.ts
│
├── admin/
│   └── courses/
│       ├── actions.ts          # AI generation (Gemini RAG + Perplexity)
│       ├── mutations.ts        # CRUD operations
│       └── queries.ts          # Admin queries
│
├── courses/
│   ├── queries.ts              # Public course queries
│   └── mutations.ts            # Course enrollment
│
├── chapters/
│   ├── queries.ts              # Chapter queries
│   └── mutations.ts            # Chapter progress
│
├── quizzes/
│   ├── queries.ts              # Quiz queries
│   └── mutations.ts            # Quiz attempts
│
├── progress/
│   ├── queries.ts              # Progress queries
│   └── mutations.ts            # Progress tracking
│
├── gamification/
│   ├── badges.ts               # Badge definitions & logic
│   ├── xp.ts                   # XP calculations
│   ├── streaks.ts              # Streak tracking
│   └── queries.ts              # Gamification queries
│
└── _lib/
    ├── geminiRAG.ts            # Gemini File Search RAG client
    └── perplexity.ts           # Perplexity API client

lib/
├── prompts/
│   ├── courseOutline.ts        # Outline generation prompt
│   ├── chapterContent.ts       # Chapter content prompt
│   └── quizGeneration.ts       # Quiz generation prompt
│
├── utils/
│   ├── slug.ts                 # Slug generation
│   ├── time.ts                 # Time formatting
│   └── xp.ts                   # Level calculations
│
└── constants/
    ├── badges.ts               # Badge definitions
    ├── categories.ts           # Course categories
    └── levels.ts               # Level thresholds
```

---

## Environment Variables

```env
# Convex
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# AI Knowledge Sources
GOOGLE_AI_API_KEY=              # Gemini File Search RAG
PERPLEXITY_API_KEY=             # Current trends/web research

# Gemini File Search (RAG)
GEMINI_CORPUS_NAME=             # Your sake literature corpus name

# Optional: Analytics
NEXT_PUBLIC_POSTHOG_KEY=
```

---

## Success Metrics

### User Engagement
- Course enrollment rate
- Course completion rate
- Average time spent per session
- Return rate (daily/weekly active users)
- Quiz pass rate
- Quiz retry rate

### Content Quality
- Average quiz score per course
- Completion rate by chapter
- Drop-off points identification
- Time spent per chapter

### Gamification Effectiveness
- Badge unlock rate
- Average level achieved
- Streak maintenance rate
- XP earned per user

---

## Dependencies

### Required npm packages

```json
{
  "dependencies": {
    "convex": "^1.x",
    "@clerk/nextjs": "^5.x",
    "framer-motion": "^11.x",
    "canvas-confetti": "^1.x",
    "zustand": "^4.x",
    "date-fns": "^3.x"
  }
}
```

---

## Notes for Implementation

1. **Start with schema** - Get the database right first, everything builds on it
2. **AI generation is async** - Show progress to admin, don't block UI
3. **Content blocks are key** - The renderer needs to handle all block types gracefully
4. **Mobile first** - Many users will learn on mobile
5. **Offline consideration** - Consider caching chapter content
6. **Rate limiting** - Perplexity has rate limits, handle gracefully
7. **Error recovery** - If generation fails mid-course, allow retry
8. **Test with real content** - Generate actual sake courses early

---

## Design Decisions Made

1. **Chapters are open** - All chapters accessible in any order (not locked)
2. **Quizzes are required** - Must pass all chapter quizzes + final exam to complete course
3. **Unlimited quiz retries** - No limit on attempts
4. **No leaderboards** - Learning is personal, not competitive
5. **No difficulty levels** - All content accessible to everyone
6. **No course ratings** - Keep it simple for v1

## Questions to Resolve

1. Should admins be able to duplicate courses?
2. Do we want course versioning?
3. Should we show "recommended next course" after completion?
4. Do we want email notifications for streak reminders?

---

*This document should be used as the source of truth for implementing the Sakéverse Learning System. Update as decisions are made and requirements evolve.*
