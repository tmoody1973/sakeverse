import { mutation } from "../_generated/server"

export const seedCategories = mutation({
  handler: async (ctx) => {
    const categories = [
      { slug: "fundamentals", name: "Fundamentals", icon: "🌱", displayOrder: 1 },
      { slug: "brewing", name: "Brewing", icon: "🏭", displayOrder: 2 },
      { slug: "tasting", name: "Tasting", icon: "👅", displayOrder: 3 },
      { slug: "pairing", name: "Food Pairing", icon: "🍽️", displayOrder: 4 },
      { slug: "regions", name: "Regions", icon: "🗾", displayOrder: 5 },
      { slug: "wine-bridge", name: "Wine Bridge", icon: "🍷", displayOrder: 6 },
    ]
    
    for (const cat of categories) {
      const existing = await ctx.db
        .query("learnCategories")
        .withIndex("by_slug", (q) => q.eq("slug", cat.slug))
        .first()
      
      if (!existing) {
        await ctx.db.insert("learnCategories", {
          ...cat,
          isActive: true,
          createdAt: Date.now(),
        })
      }
    }
    
    return { success: true, message: "Categories seeded" }
  },
})

export const seedSampleCourse = mutation({
  handler: async (ctx) => {
    // Check if sample course exists
    const existing = await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", "sake-fundamentals"))
      .first()
    
    if (existing) return { success: false, message: "Course already exists" }
    
    // Create course
    const courseId = await ctx.db.insert("courses", {
      slug: "sake-fundamentals",
      title: "Sake Fundamentals",
      subtitle: "Your journey into Japanese sake starts here",
      description: "Learn the basics of sake - from rice to glass. This course covers sake types, brewing basics, tasting techniques, and how to choose the right sake for any occasion.",
      category: "fundamentals",
      tags: ["beginner", "basics", "introduction"],
      learningOutcomes: [
        "Understand the main sake classifications (Junmai, Ginjo, Daiginjo)",
        "Read and interpret sake labels",
        "Identify basic flavor profiles",
        "Choose appropriate serving temperatures",
        "Pair sake with food confidently"
      ],
      estimatedMinutes: 45,
      chapterCount: 3,
      generatedBy: "manual",
      status: "published",
      publishedAt: Date.now(),
      enrollmentCount: 0,
      completionCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    
    // Create chapters
    const chapter1Id = await ctx.db.insert("chapters", {
      courseId,
      order: 1,
      title: "What is Sake?",
      description: "Understanding the basics of Japan's national beverage",
      contentBlocks: [
        {
          id: "1",
          type: "text",
          content: "Sake (pronounced SAH-keh) is a Japanese alcoholic beverage made from fermented rice. Often called 'rice wine,' sake is actually brewed more like beer, using a unique parallel fermentation process that converts starch to sugar and sugar to alcohol simultaneously."
        },
        {
          id: "2",
          type: "heading",
          content: "The Four Essential Ingredients"
        },
        {
          id: "3",
          type: "text",
          content: "Every sake is made from just four ingredients: rice, water, koji mold, and yeast. The quality and characteristics of each ingredient profoundly affect the final product."
        },
        {
          id: "4",
          type: "callout",
          content: JSON.stringify({
            variant: "tip",
            text: "The rice used for sake is different from table rice - it has a starchy core called 'shinpaku' that's ideal for brewing."
          })
        },
        {
          id: "5",
          type: "key_terms",
          content: JSON.stringify([
            { term: "Nihonshu", pronunciation: "nee-HON-shoo", definition: "The Japanese word for sake, literally meaning 'Japanese alcohol'" },
            { term: "Koji", pronunciation: "KOH-jee", definition: "A mold (Aspergillus oryzae) that converts rice starch into fermentable sugars" },
            { term: "Shinpaku", pronunciation: "shin-PAH-koo", definition: "The starchy white core of sake rice, prized for brewing" }
          ])
        }
      ],
      learningObjectives: [
        "Define what sake is and how it differs from wine and beer",
        "Name the four essential ingredients in sake",
        "Understand the role of koji in sake brewing"
      ],
      keyTerms: [
        { term: "Nihonshu", pronunciation: "nee-HON-shoo", definition: "The Japanese word for sake" },
        { term: "Koji", pronunciation: "KOH-jee", definition: "Mold that converts starch to sugar" },
      ],
      estimatedMinutes: 15,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    
    const chapter2Id = await ctx.db.insert("chapters", {
      courseId,
      order: 2,
      title: "Sake Classifications",
      description: "Understanding Junmai, Ginjo, and Daiginjo",
      contentBlocks: [
        {
          id: "1",
          type: "text",
          content: "Sake is classified primarily by how much the rice has been polished (milled) before brewing. The more the outer layers are removed, the more refined and aromatic the sake tends to be."
        },
        {
          id: "2",
          type: "heading",
          content: "The Main Categories"
        },
        {
          id: "3",
          type: "text",
          content: "**Junmai** (純米) means 'pure rice' - these sakes are made with only rice, water, koji, and yeast. No added alcohol. They tend to be fuller-bodied with rich umami flavors."
        },
        {
          id: "4",
          type: "text",
          content: "**Ginjo** (吟醸) sakes have rice polished to at least 60% of its original size. They're known for fruity, floral aromas and lighter bodies."
        },
        {
          id: "5",
          type: "text",
          content: "**Daiginjo** (大吟醸) is the premium tier, with rice polished to at least 50%. These are the most aromatic and refined sakes."
        },
        {
          id: "6",
          type: "wine_bridge",
          content: JSON.stringify({
            wine: "Chardonnay",
            sake: "Junmai",
            reason: "Both offer rich, full-bodied experiences with subtle complexity. If you enjoy unoaked Chardonnay, you'll appreciate Junmai's clean rice character."
          })
        }
      ],
      learningObjectives: [
        "Explain the rice polishing ratio system",
        "Distinguish between Junmai, Ginjo, and Daiginjo",
        "Understand how polishing affects flavor"
      ],
      keyTerms: [
        { term: "Junmai", pronunciation: "JOON-my", definition: "Pure rice sake with no added alcohol" },
        { term: "Ginjo", pronunciation: "GEEN-joh", definition: "Premium sake with rice polished to 60%" },
        { term: "Daiginjo", pronunciation: "dai-GEEN-joh", definition: "Super premium sake with rice polished to 50%" },
      ],
      estimatedMinutes: 15,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    
    const chapter3Id = await ctx.db.insert("chapters", {
      courseId,
      order: 3,
      title: "Tasting & Serving",
      description: "How to taste sake and choose the right temperature",
      contentBlocks: [
        {
          id: "1",
          type: "text",
          content: "Unlike wine, sake can be enjoyed at a wide range of temperatures - from ice cold to piping hot. The serving temperature dramatically affects the flavor experience."
        },
        {
          id: "2",
          type: "heading",
          content: "Temperature Guide"
        },
        {
          id: "3",
          type: "callout",
          content: JSON.stringify({
            variant: "info",
            text: "General rule: Aromatic sakes (Ginjo, Daiginjo) are best chilled. Fuller-bodied sakes (Junmai) can be enjoyed warm or at room temperature."
          })
        },
        {
          id: "4",
          type: "text",
          content: "**Chilled (5-10°C)**: Best for Daiginjo and Ginjo. Preserves delicate aromas.\n\n**Room Temperature (15-20°C)**: Good for most Junmai. Allows flavors to open up.\n\n**Warm (40-45°C)**: Excellent for robust Junmai and Honjozo. Enhances umami."
        },
        {
          id: "5",
          type: "heading",
          content: "Tasting Steps"
        },
        {
          id: "6",
          type: "text",
          content: "1. **Look**: Observe the clarity and color\n2. **Smell**: Note the aromas before tasting\n3. **Sip**: Let it coat your palate\n4. **Savor**: Notice the finish and aftertaste"
        }
      ],
      learningObjectives: [
        "Choose appropriate serving temperatures for different sake types",
        "Apply the four-step tasting method",
        "Identify common sake aromas and flavors"
      ],
      keyTerms: [
        { term: "Reishu", pronunciation: "RAY-shoo", definition: "Chilled sake" },
        { term: "Atsukan", pronunciation: "AHT-soo-kahn", definition: "Hot sake" },
      ],
      estimatedMinutes: 15,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    
    // Create quizzes for each chapter
    const quiz1Id = await ctx.db.insert("quizzes", {
      courseId,
      chapterId: chapter1Id,
      type: "chapter_review",
      title: "Chapter 1 Quiz",
      passingScore: 70,
      createdAt: Date.now(),
    })
    
    await ctx.db.insert("questions", {
      quizId: quiz1Id,
      order: 1,
      type: "multiple_choice",
      question: "What is koji?",
      options: [
        { id: "a", text: "A type of rice" },
        { id: "b", text: "A mold that converts starch to sugar" },
        { id: "c", text: "A brewing vessel" },
        { id: "d", text: "A type of yeast" },
      ],
      correctAnswers: ["b"],
      explanation: "Koji (Aspergillus oryzae) is a mold that's essential to sake brewing. It produces enzymes that break down rice starch into fermentable sugars.",
      points: 10,
      createdAt: Date.now(),
    })
    
    await ctx.db.insert("questions", {
      quizId: quiz1Id,
      order: 2,
      type: "multiple_choice",
      question: "How many essential ingredients are in sake?",
      options: [
        { id: "a", text: "Two" },
        { id: "b", text: "Three" },
        { id: "c", text: "Four" },
        { id: "d", text: "Five" },
      ],
      correctAnswers: ["c"],
      explanation: "Sake is made from four essential ingredients: rice, water, koji mold, and yeast.",
      points: 10,
      createdAt: Date.now(),
    })
    
    const quiz2Id = await ctx.db.insert("quizzes", {
      courseId,
      chapterId: chapter2Id,
      type: "chapter_review",
      title: "Chapter 2 Quiz",
      passingScore: 70,
      createdAt: Date.now(),
    })
    
    await ctx.db.insert("questions", {
      quizId: quiz2Id,
      order: 1,
      type: "multiple_choice",
      question: "What does 'Junmai' mean?",
      options: [
        { id: "a", text: "Premium grade" },
        { id: "b", text: "Pure rice" },
        { id: "c", text: "Highly polished" },
        { id: "d", text: "Aged sake" },
      ],
      correctAnswers: ["b"],
      explanation: "Junmai (純米) literally means 'pure rice' - these sakes contain no added alcohol.",
      points: 10,
      createdAt: Date.now(),
    })
    
    await ctx.db.insert("questions", {
      quizId: quiz2Id,
      order: 2,
      type: "multiple_choice",
      question: "To what percentage must rice be polished for Daiginjo?",
      options: [
        { id: "a", text: "70% or less" },
        { id: "b", text: "60% or less" },
        { id: "c", text: "50% or less" },
        { id: "d", text: "40% or less" },
      ],
      correctAnswers: ["c"],
      explanation: "Daiginjo requires rice polished to at least 50% of its original size, meaning 50% or more has been milled away.",
      points: 10,
      createdAt: Date.now(),
    })
    
    const quiz3Id = await ctx.db.insert("quizzes", {
      courseId,
      chapterId: chapter3Id,
      type: "chapter_review",
      title: "Chapter 3 Quiz",
      passingScore: 70,
      createdAt: Date.now(),
    })
    
    await ctx.db.insert("questions", {
      quizId: quiz3Id,
      order: 1,
      type: "multiple_choice",
      question: "At what temperature should Daiginjo typically be served?",
      options: [
        { id: "a", text: "Hot (50°C+)" },
        { id: "b", text: "Warm (40-45°C)" },
        { id: "c", text: "Room temperature (15-20°C)" },
        { id: "d", text: "Chilled (5-10°C)" },
      ],
      correctAnswers: ["d"],
      explanation: "Daiginjo and other aromatic sakes are best served chilled to preserve their delicate aromas.",
      points: 10,
      createdAt: Date.now(),
    })
    
    // Create final exam
    const finalExamId = await ctx.db.insert("quizzes", {
      courseId,
      chapterId: undefined,
      type: "course_final",
      title: "Final Exam: Sake Fundamentals",
      passingScore: 80,
      createdAt: Date.now(),
    })
    
    await ctx.db.insert("questions", {
      quizId: finalExamId,
      order: 1,
      type: "multiple_choice",
      question: "Which sake type is known for being fuller-bodied with rich umami?",
      options: [
        { id: "a", text: "Daiginjo" },
        { id: "b", text: "Ginjo" },
        { id: "c", text: "Junmai" },
        { id: "d", text: "Sparkling" },
      ],
      correctAnswers: ["c"],
      explanation: "Junmai sakes, made with pure rice and no added alcohol, tend to be fuller-bodied with rich umami flavors.",
      points: 10,
      createdAt: Date.now(),
    })
    
    await ctx.db.insert("questions", {
      quizId: finalExamId,
      order: 2,
      type: "true_false",
      question: "Sake is technically a wine because it's made from rice.",
      options: [
        { id: "true", text: "True" },
        { id: "false", text: "False" },
      ],
      correctAnswers: ["false"],
      explanation: "While often called 'rice wine,' sake is actually brewed more like beer using a parallel fermentation process.",
      points: 10,
      createdAt: Date.now(),
    })
    
    await ctx.db.insert("questions", {
      quizId: finalExamId,
      order: 3,
      type: "multiple_choice",
      question: "What is the starchy core of sake rice called?",
      options: [
        { id: "a", text: "Koji" },
        { id: "b", text: "Shinpaku" },
        { id: "c", text: "Nihonshu" },
        { id: "d", text: "Moromi" },
      ],
      correctAnswers: ["b"],
      explanation: "Shinpaku is the white, starchy core of sake rice that's prized for brewing.",
      points: 10,
      createdAt: Date.now(),
    })
    
    return { success: true, courseId, message: "Sample course created" }
  },
})
