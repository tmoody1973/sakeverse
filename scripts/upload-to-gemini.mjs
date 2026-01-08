#!/usr/bin/env node
/**
 * Upload brewery histories to Gemini File API for RAG
 * 
 * Prerequisites:
 * 1. Set GEMINI_API_KEY environment variable
 * 2. Run: node scripts/upload-to-gemini.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY environment variable not set')
  console.log('\nSet it with: export GEMINI_API_KEY=your-key-here')
  process.exit(1)
}

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'

async function uploadFile(filePath, displayName) {
  console.log(`\n📤 Uploading ${displayName}...`)
  
  const fileContent = fs.readFileSync(filePath)
  const mimeType = 'text/markdown'
  
  // Step 1: Start resumable upload
  const startResponse = await fetch(
    `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'X-Goog-Upload-Protocol': 'resumable',
        'X-Goog-Upload-Command': 'start',
        'X-Goog-Upload-Header-Content-Length': fileContent.length.toString(),
        'X-Goog-Upload-Header-Content-Type': mimeType,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: { displayName }
      }),
    }
  )

  if (!startResponse.ok) {
    const error = await startResponse.text()
    throw new Error(`Failed to start upload: ${error}`)
  }

  const uploadUrl = startResponse.headers.get('X-Goog-Upload-URL')
  if (!uploadUrl) {
    throw new Error('No upload URL returned')
  }

  // Step 2: Upload the file content
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Length': fileContent.length.toString(),
      'X-Goog-Upload-Offset': '0',
      'X-Goog-Upload-Command': 'upload, finalize',
    },
    body: fileContent,
  })

  if (!uploadResponse.ok) {
    const error = await uploadResponse.text()
    throw new Error(`Failed to upload file: ${error}`)
  }

  const result = await uploadResponse.json()
  console.log(`✅ Uploaded: ${result.file.name}`)
  console.log(`   URI: ${result.file.uri}`)
  console.log(`   State: ${result.file.state}`)
  
  return result.file
}

async function waitForProcessing(fileName) {
  console.log('\n⏳ Waiting for file processing...')
  
  while (true) {
    const response = await fetch(
      `${BASE_URL}/${fileName}?key=${GEMINI_API_KEY}`
    )
    
    if (!response.ok) {
      throw new Error(`Failed to check file status: ${response.status}`)
    }
    
    const file = await response.json()
    
    if (file.state === 'ACTIVE') {
      console.log('✅ File is ready!')
      return file
    } else if (file.state === 'FAILED') {
      throw new Error('File processing failed')
    }
    
    console.log(`   Status: ${file.state}...`)
    await new Promise(r => setTimeout(r, 2000))
  }
}

async function main() {
  console.log('🍶 Sakécosm Gemini RAG Setup')
  console.log('============================\n')
  
  const filesToUpload = [
    {
      path: path.join(__dirname, '../podcasts/brewery_histories_only.md'),
      displayName: 'sakecosm-brewery-histories'
    },
    {
      path: path.join(__dirname, '../research/wine_to_sake_guide.md'),
      displayName: 'sakecosm-wine-to-sake-guide'
    }
  ]
  
  const uploadedFiles = []
  
  for (const file of filesToUpload) {
    if (!fs.existsSync(file.path)) {
      console.error(`❌ File not found: ${file.path}`)
      continue
    }
    
    const stats = fs.statSync(file.path)
    console.log(`📄 File: ${path.basename(file.path)}`)
    console.log(`   Size: ${(stats.size / 1024).toFixed(1)} KB`)
    
    try {
      // Upload the file
      const uploadedFile = await uploadFile(file.path, file.displayName)
      
      // Wait for processing
      const readyFile = await waitForProcessing(uploadedFile.name)
      uploadedFiles.push(readyFile)
      
    } catch (error) {
      console.error(`\n❌ Error uploading ${file.displayName}:`, error.message)
    }
  }
  
  if (uploadedFiles.length === 0) {
    console.error('\n❌ No files uploaded successfully')
    process.exit(1)
  }
  
  console.log('\n============================')
  console.log('✅ Setup Complete!')
  console.log(`\n📋 Uploaded ${uploadedFiles.length} file(s):`)
  uploadedFiles.forEach((file, i) => {
    console.log(`\n${i + 1}. ${file.displayName}`)
    console.log(`   URI: ${file.uri}`)
  })
  console.log('\n3. Add to Convex env vars (comma-separated):')
  const uris = uploadedFiles.map(f => f.uri).join(',')
  console.log(`   npx convex env set GEMINI_FILE_URIS "${uris}"`)
}

main()
