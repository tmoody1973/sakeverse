require('dotenv').config({ path: '.env.local' })
const { ConvexHttpClient } = require("convex/browser")

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL)

async function generateEmbeddings() {
  try {
    console.log("Starting embedding generation...")
    
    // Check current status
    const status = await client.query("embeddings:getEmbeddingStatus")
    console.log(`Current status: ${status.withEmbeddings}/${status.total} products have embeddings (${status.percentage}%)`)
    
    if (status.percentage === 100) {
      console.log("✅ All products already have embeddings!")
      return
    }
    
    // Generate embeddings (this is an internal mutation, so we need to call it differently)
    console.log("🔄 Generating embeddings for all products...")
    console.log("Note: This may take a few minutes as we call OpenAI API for each product...")
    
    // We'll need to call this via the Convex dashboard or CLI since it's an internal mutation
    console.log("⚠️  Please run this command in your terminal:")
    console.log("npx convex run embeddings:generateEmbeddings")
    
  } catch (error) {
    console.error("❌ Error:", error)
  }
}

generateEmbeddings()
