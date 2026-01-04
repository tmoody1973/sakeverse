import { action, internalAction } from "./_generated/server"
import { v } from "convex/values"

// Upload PDF files to Gemini File Search
export const uploadSakeBooks = internalAction({
  args: {},
  handler: async (ctx) => {
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY not found in environment")
    }

    const uploadedFiles = []
    
    // List of PDF files to upload (you'll need to add your actual PDF files)
    const pdfFiles = [
      "sake-handbook.pdf",
      "japanese-sake-guide.pdf", 
      "brewing-techniques.pdf",
      "regional-sake-styles.pdf"
      // Add your actual PDF filenames here
    ]

    for (const filename of pdfFiles) {
      try {
        // Read PDF file (you'll need to implement file reading)
        // For now, this is a placeholder - you'll need to read actual PDF files
        console.log(`Processing ${filename}...`)
        
        // Upload to Gemini Files API
        const uploadResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/files", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${geminiApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            file: {
              display_name: filename,
              mime_type: "application/pdf"
            }
          })
        })

        if (!uploadResponse.ok) {
          console.error(`Failed to upload ${filename}: ${uploadResponse.status}`)
          continue
        }

        const uploadResult = await uploadResponse.json()
        uploadedFiles.push({
          filename,
          fileId: uploadResult.file.name,
          displayName: uploadResult.file.display_name
        })
        
        console.log(`Successfully uploaded: ${filename}`)
        
      } catch (error) {
        console.error(`Error uploading ${filename}:`, error)
      }
    }

    return {
      message: `Uploaded ${uploadedFiles.length} PDF files to Gemini`,
      files: uploadedFiles
    }
  },
})

// Search sake knowledge from uploaded PDFs
export const searchSakeKnowledge = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, { query, limit = 3 }) => {
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY not found in environment")
    }

    try {
      // Search using Gemini File Search
      const searchResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${geminiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Based on the uploaded sake knowledge documents, please answer this question about sake: ${query}
              
              Please provide detailed, accurate information from the documents. If the information isn't available in the documents, please say so.
              
              Focus on:
              - Traditional brewing methods
              - Regional characteristics
              - Tasting notes and flavor profiles
              - Food pairing recommendations
              - Cultural and historical context
              - Technical brewing details`
            }]
          }],
          tools: [{
            file_search: {}
          }],
          generation_config: {
            temperature: 0.3,
            max_output_tokens: 1000
          }
        })
      })

      if (!searchResponse.ok) {
        throw new Error(`Gemini API error: ${searchResponse.status}`)
      }

      const searchResult = await searchResponse.json()
      
      // Extract the response text
      const responseText = searchResult.candidates?.[0]?.content?.parts?.[0]?.text || "No information found in the documents."
      
      return {
        query,
        answer: responseText,
        source: "Gemini File Search - Sake Knowledge Base",
        timestamp: Date.now()
      }
      
    } catch (error) {
      console.error("Gemini File Search error:", error)
      return {
        query,
        answer: "I'm sorry, I couldn't access the sake knowledge base at the moment. Please try again later.",
        source: "Error",
        timestamp: Date.now()
      }
    }
  },
})

// Get status of uploaded files
export const getSakeKnowledgeStatus = action({
  args: {},
  handler: async (ctx) => {
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY not found in environment")
    }

    try {
      // List uploaded files
      const listResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/files", {
        headers: {
          "Authorization": `Bearer ${geminiApiKey}`,
        }
      })

      if (!listResponse.ok) {
        throw new Error(`Failed to list files: ${listResponse.status}`)
      }

      const listResult = await listResponse.json()
      
      return {
        totalFiles: listResult.files?.length || 0,
        files: listResult.files?.map((file: any) => ({
          name: file.name,
          displayName: file.display_name,
          mimeType: file.mime_type,
          sizeBytes: file.size_bytes,
          createTime: file.create_time
        })) || []
      }
      
    } catch (error) {
      console.error("Error getting file status:", error)
      return {
        totalFiles: 0,
        files: [],
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }
  },
})
