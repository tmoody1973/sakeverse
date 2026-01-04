require('dotenv').config({ path: '.env.local' })
const { ConvexHttpClient } = require("convex/browser")

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL)

async function checkJuyondai() {
  try {
    const result = await client.query("checkData:checkJuyondaiPrice")
    console.log("Juyondai price check:", JSON.stringify(result, null, 2))
  } catch (error) {
    console.error("Error:", error)
  }
}

checkJuyondai()
