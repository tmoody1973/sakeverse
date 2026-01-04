import { query } from "./_generated/server"

// Check specific product price
export const checkJuyondaiPrice = query({
  args: {},
  handler: async (ctx) => {
    const product = await ctx.db
      .query("tippsyProducts")
      .filter((q) => q.eq(q.field("productName"), "Juyondai \"Tokujo Omachi\""))
      .first()
    
    return product ? {
      productName: product.productName,
      price: product.price,
      url: product.url
    } : null
  },
})
