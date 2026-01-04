import { mutation } from "./_generated/server"

// Clear all Tippsy products to re-import with correct prices
export const clearTippsyProducts = mutation({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("tippsyProducts").collect()
    
    for (const product of products) {
      await ctx.db.delete(product._id)
    }
    
    return { deleted: products.length }
  },
})
