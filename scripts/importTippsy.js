require('dotenv').config({ path: '.env.local' })
const { ConvexHttpClient } = require("convex/browser")
const tippsyData = require("../tippsy_sake_products_complete.json")

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL)

async function importTippsyData() {
  try {
    console.log(`Importing ${tippsyData.products.length} Tippsy sake products...`)
    
    // Import in batches of 20 to avoid timeout
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
    
    console.log(`✅ Successfully imported ${imported} Tippsy sake products!`)
    
  } catch (error) {
    console.error("❌ Error importing Tippsy data:", error)
  }
}

// Run the import
importTippsyData()
