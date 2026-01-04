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
      
      // First, upload the file content
      const uploadResponse = await fetch("https://generativelanguage.googleapis.com/upload/v1beta/files", {
        method: "POST",
        headers: {
          "X-Goog-Upload-Protocol": "multipart",
          "Authorization": `Bearer ${geminiApiKey}`,
        },
        body: createMultipartBody(fileBuffer, filename)
      })

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        console.error(`❌ Failed to upload ${filename}: ${uploadResponse.status} - ${errorText}`)
        continue
      }

      const uploadResult = await uploadResponse.json()
      uploadedFiles.push({
        filename,
        fileId: uploadResult.file.name,
        displayName: uploadResult.file.display_name,
        sizeBytes: uploadResult.file.size_bytes
      })
      
      console.log(`✅ Successfully uploaded: ${filename} (${Math.round(uploadResult.file.size_bytes / 1024)}KB)`)
      
    } catch (error) {
      console.error(`❌ Error uploading ${filename}:`, error.message)
    }
  }

  console.log(`\n🎉 Upload complete! ${uploadedFiles.length}/${pdfFiles.length} files uploaded successfully.`)
  
  if (uploadedFiles.length > 0) {
    console.log("\n📖 Uploaded files:")
    uploadedFiles.forEach(file => {
      console.log(`  ✅ ${file.filename} (ID: ${file.fileId})`)
    })
    
    console.log("\n🤖 Yuki now has access to deep sake knowledge from these books!")
    console.log("Try asking questions like:")
    console.log("  - 'Tell me about traditional sake brewing methods'")
    console.log("  - 'What are the characteristics of Niigata sake?'")
    console.log("  - 'Explain the difference between Junmai and Ginjo'")
  }
}

function createMultipartBody(fileBuffer, filename) {
  const boundary = '----formdata-boundary-' + Math.random().toString(36)
  const delimiter = `\r\n--${boundary}\r\n`
  const closeDelimiter = `\r\n--${boundary}--`

  const metadata = {
    file: {
      display_name: filename
    }
  }

  let body = delimiter
  body += 'Content-Disposition: form-data; name="metadata"\r\n'
  body += 'Content-Type: application/json\r\n\r\n'
  body += JSON.stringify(metadata)
  body += delimiter
  body += `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n`
  body += 'Content-Type: application/pdf\r\n\r\n'

  return Buffer.concat([
    Buffer.from(body, 'utf8'),
    fileBuffer,
    Buffer.from(closeDelimiter, 'utf8')
  ])
}

uploadPDFsToGemini()
