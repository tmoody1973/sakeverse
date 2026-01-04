require('dotenv').config({ path: '.env.local' })
const { ConvexHttpClient } = require("convex/browser")

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL)

async function reimportWithCorrectPrices() {
  try {
    // Clear existing data
    console.log("Clearing existing data...")
    const cleared = await client.mutation("clearData:clearTippsyProducts")
    console.log(`Cleared ${cleared.deleted} products`)
    
    // Re-import with fixed prices
    const tippsyData = require("../tippsy_sake_products_complete.json")
    console.log(`Re-importing ${tippsyData.products.length} products with correct prices...`)
    
    const batchSize = 20
    let imported = 0
    
    for (let i = 0; i < tippsyData.products.length; i += batchSize) {
      const batch = tippsyData.products.slice(i, i + batchSize)
      
      const result = await client.mutation("importTippsy:importTippsyProducts", {
        products: batch
      })
      
      imported += result.imported
      console.log(`Imported batch ${Math.floor(i/batchSize) + 1}: ${result.imported} products`)
    }
    
    console.log(`✅ Successfully re-imported ${imported} products with correct prices!`)
    
  } catch (error) {
    console.error("❌ Error:", error)
  }
}

reimportWithCorrectPrices()
