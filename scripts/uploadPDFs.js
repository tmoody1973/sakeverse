require('dotenv').config({ path: '.env.local' })
const fs = require('fs')
const path = require('path')

async function uploadPDFsToGemini() {
  const geminiApiKey = process.env.GEMINI_API_KEY
  if (!geminiApiKey || geminiApiKey === 'placeholder') {
    console.error("❌ GEMINI_API_KEY not found in .env.local")
    return
  }

  const pdfFolder = path.join(__dirname, '../pdf')
  
  if (!fs.existsSync(pdfFolder)) {
    console.error("❌ PDF folder not found. Please create a 'pdf' folder with your sake books.")
    return
  }

  const pdfFiles = fs.readdirSync(pdfFolder).filter(file => file.endsWith('.pdf'))
  
  if (pdfFiles.length === 0) {
    console.error("❌ No PDF files found in the pdf folder.")
    return
  }

  console.log(`📚 Found ${pdfFiles.length} PDF files to upload:`)
  pdfFiles.forEach(file => console.log(`  - ${file}`))
  console.log()

  const uploadedFiles = []

  for (const filename of pdfFiles) {
    try {
      console.log(`🔄 Uploading ${filename}...`)
      
      const filePath = path.join(pdfFolder, filename)
      const fileBuffer = fs.readFileSync(filePath)
      const fileSize = fileBuffer.length
      
      // Step 1: Initiate resumable upload
      const initResponse = await fetch(`https://generativelanguage.googleapis.com/upload/v1beta/files?key=${geminiApiKey}`, {
        method: "POST",
        headers: {
          "X-Goog-Upload-Protocol": "resumable",
          "X-Goog-Upload-Command": "start",
          "X-Goog-Upload-Header-Content-Length": fileSize.toString(),
          "X-Goog-Upload-Header-Content-Type": "application/pdf",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file: {
            display_name: filename
          }
        })
      })

      if (!initResponse.ok) {
        const errorText = await initResponse.text()
        console.error(`❌ Failed to initiate upload for ${filename}: ${initResponse.status} - ${errorText}`)
        continue
      }

      // Extract upload URL from headers
      const uploadUrl = initResponse.headers.get('x-goog-upload-url')
      if (!uploadUrl) {
        console.error(`❌ No upload URL received for ${filename}`)
        continue
      }

      // Step 2: Upload file content
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Length": fileSize.toString(),
          "X-Goog-Upload-Offset": "0",
          "X-Goog-Upload-Command": "upload, finalize",
        },
        body: fileBuffer
      })

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        console.error(`❌ Failed to upload file content for ${filename}: ${uploadResponse.status} - ${errorText}`)
        continue
      }

      const uploadResult = await uploadResponse.json()
      uploadedFiles.push({
        filename,
        fileUri: uploadResult.file.uri,
        displayName: uploadResult.file.displayName,
        mimeType: uploadResult.file.mimeType,
        state: uploadResult.file.state
      })
      
      console.log(`✅ Successfully uploaded: ${filename} (URI: ${uploadResult.file.uri})`)
      
    } catch (error) {
      console.error(`❌ Error uploading ${filename}:`, error.message)
    }
  }

  console.log(`\n🎉 Upload complete! ${uploadedFiles.length}/${pdfFiles.length} files uploaded successfully.`)
  
  if (uploadedFiles.length > 0) {
    console.log("\n📖 Uploaded files:")
    uploadedFiles.forEach(file => {
      console.log(`  ✅ ${file.filename} (URI: ${file.fileUri})`)
    })
    
    console.log("\n🤖 Yuki now has access to deep sake knowledge from these books!")
    console.log("Try asking questions like:")
    console.log("  - 'Tell me about traditional sake brewing methods'")
    console.log("  - 'What are the characteristics of Niigata sake?'")
    console.log("  - 'Explain the difference between Junmai and Ginjo'")
  }
}

uploadPDFsToGemini()
