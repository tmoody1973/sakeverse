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
  
  const breweryHistoriesPath = path.join(__dirname, '../podcasts/brewery_histories_only.md')
  
  if (!fs.existsSync(breweryHistoriesPath)) {
    console.error(`❌ File not found: ${breweryHistoriesPath}`)
    process.exit(1)
  }
  
  const stats = fs.statSync(breweryHistoriesPath)
  console.log(`📄 File: brewery_histories_only.md`)
  console.log(`   Size: ${(stats.size / 1024).toFixed(1)} KB`)
  
  try {
    // Upload the file
    const uploadedFile = await uploadFile(
      breweryHistoriesPath,
      'sakecosm-brewery-histories'
    )
    
    // Wait for processing
    const readyFile = await waitForProcessing(uploadedFile.name)
    
    console.log('\n============================')
    console.log('✅ Setup Complete!')
    console.log('\n📋 Next Steps:')
    console.log('1. The file is now available for Gemini queries')
    console.log('2. Use this file URI in your prompts:')
    console.log(`   ${readyFile.uri}`)
    console.log('\n3. Add to Convex env vars:')
    console.log(`   npx convex env set GEMINI_FILE_URI "${readyFile.uri}"`)
    
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

main()
