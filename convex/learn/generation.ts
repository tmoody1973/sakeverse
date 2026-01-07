import { action } from "../_generated/server"
import { v } from "convex/values"
import { api } from "../_generated/api"

// Helper to call Perplexity API
async function callPerplexity(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [
        { role: "system", content: "You are a sake education expert. Return ONLY valid JSON, no markdown or explanation." },
        { role: "user", content: prompt }
      ],
      max_tokens: 4000,
      temperature: 0.7
    })
  })
  
  if (!response.ok) throw new Error(`Perplexity error: ${response.status}`)
  const result = await response.json()
  return result.choices?.[0]?.message?.content || ""
}

// Generate Stardew Valley style course cover image using Gemini
// Returns the raw base64 data and mimeType
async function generateCourseImage(apiKey: string, courseTitle: string, category: string): Promise<{ data: string; mimeType: string } | undefined> {
  try {
    const { GoogleGenAI } = await import("@google/genai")
    
    const ai = new GoogleGenAI({ apiKey })
    
    console.log("Generating image for:", courseTitle)
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      config: {
        responseModalities: ["IMAGE", "TEXT"],
      },
      contents: [{
        role: "user",
        parts: [{
          text: `Create a cozy Stardew Valley pixel art style illustration for a sake education course titled "${courseTitle}". 
Category: ${category}

Style requirements:
- Pixel art aesthetic like Stardew Valley
- Warm, inviting colors (soft pinks, warm browns, gentle greens)
- Cozy Japanese sake brewery or tasting scene
- Include sake bottles, cups, or brewing elements
- Soft lighting, peaceful atmosphere
- 16-bit retro game aesthetic
- No text in the image`
        }]
      }]
    })

    const parts = response.candidates?.[0]?.content?.parts
    if (parts) {
      for (const part of parts) {
        if (part.inlineData?.data) {
          const mimeType = part.inlineData.mimeType || "image/png"
          console.log("Got image, mimeType:", mimeType, "data length:", part.inlineData.data.length)
          return { data: part.inlineData.data, mimeType }
        }
      }
    }
    console.log("No image found in response")
    return undefined
  } catch (error) {
    console.error("Image generation failed:", error)
    return undefined
  }
}

// Generate course outline using Perplexity
export const generateCourseOutline = action({
  args: {
    topic: v.string(),
    chapterCount: v.number(),
    category: v.string(),
  },
  handler: async (ctx, { topic, chapterCount, category }) => {
    const apiKey = process.env.PERPLEXITY_API_KEY
    if (!apiKey) throw new Error("PERPLEXITY_API_KEY not found")

    const prompt = `Create a sake education course outline about: ${topic}
Category: ${category}
Number of chapters: ${chapterCount}

Return JSON:
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

Make it educational and engaging for sake beginners. Include wine comparisons where relevant.`

    const text = await callPerplexity(apiKey, prompt)
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
    const apiKey = process.env.PERPLEXITY_API_KEY
    if (!apiKey) throw new Error("PERPLEXITY_API_KEY not found")

    const prompt = `Write chapter content for a sake education course.

Course: ${args.courseTitle}
Chapter: ${args.chapterTitle}
Description: ${args.chapterDescription}
Learning Objectives: ${args.learningObjectives.join(", ")}
Key Topics: ${args.keyTopics.join(", ")}

Return JSON array of content blocks:
[
  { "id": "1", "type": "text", "content": "Introduction paragraph..." },
  { "id": "2", "type": "heading", "content": "Section Title" },
  { "id": "3", "type": "text", "content": "Section content..." },
  { "id": "4", "type": "callout", "content": "{\\"variant\\": \\"tip\\", \\"text\\": \\"Pro tip...\\"}" },
  { "id": "5", "type": "wine_bridge", "content": "{\\"wine\\": \\"Pinot Noir\\", \\"sake\\": \\"Aged Junmai\\", \\"reason\\": \\"Both share...\\"}" },
  { "id": "6", "type": "key_terms", "content": "[{\\"term\\": \\"Koji\\", \\"pronunciation\\": \\"KOH-jee\\", \\"definition\\": \\"...\\"}, ...]" }
]

Write 600-800 words. Include 2-3 key terms.`

    const text = await callPerplexity(apiKey, prompt)
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
    const apiKey = process.env.PERPLEXITY_API_KEY
    if (!apiKey) throw new Error("PERPLEXITY_API_KEY not found")

    const prompt = `Create ${args.questionCount} quiz questions about sake.

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

Mix multiple_choice and true_false types. Test understanding, not memorization.`

    const text = await callPerplexity(apiKey, prompt)
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
    const geminiKey = process.env.GEMINI_API_KEY

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

    // Step 2: Generate cover image (Stardew Valley style) and store in file storage
    let coverImage: string | undefined
    if (geminiKey) {
      const imageResult = await generateCourseImage(geminiKey, outline.title, category)
      if (imageResult) {
        // Convert base64 to Uint8Array
        const binaryString = atob(imageResult.data)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        
        // Store in Convex file storage
        const blob = new Blob([bytes], { type: imageResult.mimeType })
        const storageId = await ctx.storage.store(blob)
        const url = await ctx.storage.getUrl(storageId)
        coverImage = url || undefined
      }
    }

    // Step 3: Create course in DB
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
      coverImage,
    })

    // Step 4: Generate each chapter
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

    // Step 5: Update chapter count
    await ctx.runMutation(api.learn.courses.updateChapterCount, { courseId })

    return { courseId: courseId as unknown as string, title: outline.title, slug }
  },
})


// Backfill cover images for existing courses
export const backfillCourseImages = action({
  handler: async (ctx) => {
    const geminiKey = process.env.GEMINI_API_KEY
    if (!geminiKey) throw new Error("GEMINI_API_KEY not found")

    // Get all courses without cover images
    const courses = await ctx.runQuery(api.learn.courses.listPublishedCourses, {})
    const coursesWithoutImages = courses.filter((c: { coverImage?: string }) => !c.coverImage)

    const results: Array<{ title: string; success: boolean }> = []

    for (const course of coursesWithoutImages) {
      try {
        const imageResult = await generateCourseImage(geminiKey, course.title, course.category)
        if (imageResult) {
          // Convert base64 to Uint8Array
          const binaryString = atob(imageResult.data)
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }
          
          // Store in Convex file storage
          const blob = new Blob([bytes], { type: imageResult.mimeType })
          const storageId = await ctx.storage.store(blob)
          const url = await ctx.storage.getUrl(storageId)
          
          if (url) {
            await ctx.runMutation(api.learn.courses.updateCoverImage, {
              courseId: course._id,
              coverImage: url,
            })
            results.push({ title: course.title, success: true })
          } else {
            results.push({ title: course.title, success: false })
          }
        } else {
          results.push({ title: course.title, success: false })
        }
      } catch (error) {
        console.error("Error for", course.title, error)
        results.push({ title: course.title, success: false })
      }
    }

    return results
  },
})
