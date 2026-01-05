import { action } from "../_generated/server"
import { v } from "convex/values"
import { api } from "../_generated/api"

// Helper to retry Gemini calls with delay on rate limit
async function fetchWithRetry(apiKey: string, prompt: string, maxTokens: number, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: maxTokens }
        })
      }
    )
    
    if (response.ok) return response
    if (response.status === 429 && i < retries - 1) {
      // Wait 5 seconds before retry
      await new Promise(r => setTimeout(r, 5000))
      continue
    }
    throw new Error(`Gemini error: ${response.status}`)
  }
  throw new Error("Max retries exceeded")
}

// Generate course outline using Perplexity + Gemini
export const generateCourseOutline = action({
  args: {
    topic: v.string(),
    chapterCount: v.number(),
    category: v.string(),
  },
  handler: async (ctx, { topic, chapterCount, category }) => {
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) throw new Error("GEMINI_API_KEY not found")

    // Get current context from Perplexity
    let currentContext = ""
    try {
      const perplexityResult = await ctx.runAction(api.perplexityAPI.searchWebContent, {
        query: `${topic} sake education trends 2024 2025`,
        focus: "reviews"
      })
      currentContext = perplexityResult.answer
    } catch (e) {
      console.log("Perplexity unavailable, using Gemini only")
    }

    const prompt = `You are a sake education expert creating a course outline.

Topic: ${topic}
Category: ${category}
Number of chapters: ${chapterCount}

${currentContext ? `Current trends and context:\n${currentContext}\n` : ""}

Create a structured course outline in JSON format:
{
  "title": "Course title",
  "subtitle": "Brief tagline",
  "description": "2-3 sentence course description",
  "learningOutcomes": ["outcome1", "outcome2", "outcome3", "outcome4", "outcome5"],
  "chapters": [
    {
      "order": 1,
      "title": "Chapter title",
      "description": "Brief chapter description",
      "learningObjectives": ["obj1", "obj2", "obj3"],
      "keyTopics": ["topic1", "topic2", "topic3"]
    }
  ]
}

Make it educational, engaging, and appropriate for sake beginners to intermediate learners.
Include wine bridge comparisons where relevant.
Return ONLY valid JSON, no markdown.`

    const response = await fetchWithRetry(geminiApiKey, prompt, 2000)
    
    const result = await response.json()
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || ""
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("Failed to parse course outline")
    
    return JSON.parse(jsonMatch[0])
  },
})

// Generate chapter content
export const generateChapterContent = action({
  args: {
    courseTitle: v.string(),
    chapterTitle: v.string(),
    chapterDescription: v.string(),
    learningObjectives: v.array(v.string()),
    keyTopics: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) throw new Error("GEMINI_API_KEY not found")

    const prompt = `You are a sake education expert writing chapter content.

Course: ${args.courseTitle}
Chapter: ${args.chapterTitle}
Description: ${args.chapterDescription}
Learning Objectives: ${args.learningObjectives.join(", ")}
Key Topics: ${args.keyTopics.join(", ")}

Create chapter content as JSON array of content blocks:
[
  { "id": "1", "type": "text", "content": "Introduction paragraph..." },
  { "id": "2", "type": "heading", "content": "Section Title" },
  { "id": "3", "type": "text", "content": "Section content..." },
  { "id": "4", "type": "callout", "content": "{\\"variant\\": \\"tip\\", \\"text\\": \\"Pro tip here...\\"}" },
  { "id": "5", "type": "wine_bridge", "content": "{\\"wine\\": \\"Pinot Noir\\", \\"sake\\": \\"Aged Junmai\\", \\"reason\\": \\"Both share...\\"}" },
  { "id": "6", "type": "key_terms", "content": "[{\\"term\\": \\"Koji\\", \\"pronunciation\\": \\"KOH-jee\\", \\"definition\\": \\"...\\"}, ...]" }
]

Block types available:
- text: Regular paragraph
- heading: Section heading
- callout: Tip/info/warning box (variant: tip, info, warning)
- wine_bridge: Wine comparison
- key_terms: Array of terms with definitions

Write 800-1200 words of educational content. Include 2-3 key terms.
Return ONLY valid JSON array, no markdown.`

    const response = await fetchWithRetry(geminiApiKey, prompt, 3000)
    
    const result = await response.json()
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || ""
    
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error("Failed to parse chapter content")
    
    return JSON.parse(jsonMatch[0])
  },
})

// Generate quiz questions
export const generateQuizQuestions = action({
  args: {
    chapterTitle: v.string(),
    learningObjectives: v.array(v.string()),
    questionCount: v.number(),
  },
  handler: async (ctx, args) => {
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) throw new Error("GEMINI_API_KEY not found")

    const prompt = `Create ${args.questionCount} quiz questions for a sake education chapter.

Chapter: ${args.chapterTitle}
Learning Objectives: ${args.learningObjectives.join(", ")}

Return JSON array:
[
  {
    "order": 1,
    "type": "multiple_choice",
    "question": "Question text?",
    "options": [
      { "id": "a", "text": "Option A" },
      { "id": "b", "text": "Option B" },
      { "id": "c", "text": "Option C" },
      { "id": "d", "text": "Option D" }
    ],
    "correctAnswers": ["b"],
    "explanation": "Explanation of correct answer...",
    "points": 10
  }
]

Mix question types: multiple_choice and true_false.
Make questions test understanding, not just memorization.
Return ONLY valid JSON array.`

    const response = await fetchWithRetry(geminiApiKey, prompt, 2000)
    
    const result = await response.json()
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || ""
    
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error("Failed to parse quiz questions")
    
    return JSON.parse(jsonMatch[0])
  },
})

// Full course generation pipeline
export const generateFullCourse = action({
  args: {
    topic: v.string(),
    chapterCount: v.number(),
    category: v.string(),
  },
  handler: async (ctx, { topic, chapterCount, category }): Promise<{ courseId: string; title: string; slug: string }> => {
    // Step 1: Generate outline
    const outline = await ctx.runAction(api.learn.generation.generateCourseOutline, {
      topic, chapterCount, category
    }) as {
      title: string
      subtitle: string
      description: string
      learningOutcomes: string[]
      chapters: Array<{
        order: number
        title: string
        description: string
        learningObjectives: string[]
        keyTopics: string[]
      }>
    }

    // Step 2: Create course in DB
    const slug = outline.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50)
    const courseId = await ctx.runMutation(api.learn.courses.createCourse, {
      title: outline.title,
      slug,
      description: outline.description,
      category,
      estimatedMinutes: chapterCount * 15,
      learningOutcomes: outline.learningOutcomes,
      generatedBy: "ai",
      aiPrompt: topic,
    })

    // Step 3: Generate each chapter
    for (const ch of outline.chapters) {
      // Generate content
      const contentBlocks = await ctx.runAction(api.learn.generation.generateChapterContent, {
        courseTitle: outline.title,
        chapterTitle: ch.title,
        chapterDescription: ch.description,
        learningObjectives: ch.learningObjectives,
        keyTopics: ch.keyTopics,
      }) as Array<{ id: string; type: string; content: unknown }>

      // Extract key terms from content blocks
      const keyTermsBlock = contentBlocks.find((b) => b.type === "key_terms")
      let keyTerms: Array<{ term: string; pronunciation?: string; definition: string }> = []
      if (keyTermsBlock) {
        try {
          keyTerms = typeof keyTermsBlock.content === "string" 
            ? JSON.parse(keyTermsBlock.content) 
            : keyTermsBlock.content as typeof keyTerms
        } catch { /* ignore */ }
      }

      // Create chapter
      const chapterId = await ctx.runMutation(api.learn.courses.createChapter, {
        courseId,
        order: ch.order,
        title: ch.title,
        description: ch.description,
        contentBlocks,
        learningObjectives: ch.learningObjectives,
        keyTerms,
        estimatedMinutes: 15,
      })

      // Generate quiz
      const questions = await ctx.runAction(api.learn.generation.generateQuizQuestions, {
        chapterTitle: ch.title,
        learningObjectives: ch.learningObjectives,
        questionCount: 3,
      }) as Array<{
        order: number
        type: "multiple_choice" | "true_false"
        question: string
        options: Array<{ id: string; text: string }>
        correctAnswers: string[]
        explanation: string
        points?: number
      }>

      // Create quiz
      const quizId = await ctx.runMutation(api.learn.quizzes.createQuiz, {
        courseId,
        chapterId,
        type: "chapter_review",
        title: `${ch.title} Quiz`,
        passingScore: 70,
      })

      // Create questions
      for (const q of questions) {
        await ctx.runMutation(api.learn.quizzes.createQuestion, {
          quizId,
          order: q.order,
          type: q.type,
          question: q.question,
          options: q.options,
          correctAnswers: q.correctAnswers,
          explanation: q.explanation,
          points: q.points || 10,
        })
      }
    }

    // Step 4: Update chapter count
    await ctx.runMutation(api.learn.courses.updateChapterCount, { courseId })

    return { courseId: courseId as unknown as string, title: outline.title, slug }
  },
})
