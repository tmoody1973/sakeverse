import { query } from "./_generated/server";
import { v } from "convex/values";

export const getDiscoverProducts = query({
  args: {
    category: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    region: v.optional(v.string()),
    sort: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let products = await ctx.db.query("tippsyProducts").collect();

    // Filter by search query
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      products = products.filter(p => 
        p.productName.toLowerCase().includes(searchLower) ||
        p.brand.toLowerCase().includes(searchLower) ||
        p.category.toLowerCase().includes(searchLower) ||
        p.prefecture.toLowerCase().includes(searchLower) ||
        p.region.toLowerCase().includes(searchLower) ||
        (p.description && p.description.toLowerCase().includes(searchLower))
      );
    }

    // Filter by category
    if (args.category && args.category !== "All") {
      products = products.filter(p => 
        p.category.toLowerCase().includes(args.category!.toLowerCase())
      );
    }

    // Filter by price range
    if (args.minPrice !== undefined) {
      products = products.filter(p => p.price >= args.minPrice!);
    }
    if (args.maxPrice !== undefined) {
      products = products.filter(p => p.price <= args.maxPrice!);
    }

    // Filter by region
    if (args.region && args.region !== "All") {
      products = products.filter(p => 
        p.prefecture.toLowerCase().includes(args.region!.toLowerCase()) ||
        p.region.toLowerCase().includes(args.region!.toLowerCase())
      );
    }

    // Sort
    switch (args.sort) {
      case "price-asc":
        products.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        products.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        products.sort((a, b) => b.averageRating - a.averageRating);
        break;
      default:
        // Default: recommended (by rating)
        products.sort((a, b) => b.averageRating - a.averageRating);
    }

    const total = products.length;
    const limit = args.limit || 12;
    const offset = args.offset || 0;

    // Map to include name field for compatibility
    const mappedProducts = products.slice(offset, offset + limit).map(p => ({
      ...p,
      name: p.productName,
      image: p.images?.[0] || "",
    }));

    return {
      products: mappedProducts,
      total,
      hasMore: offset + limit < total,
    };
  },
});

export const getCategories = query({
  handler: async (ctx) => {
    const products = await ctx.db.query("tippsyProducts").collect();
    const categories = [...new Set(products.map(p => p.category))];
    return ["All", ...categories.sort()];
  },
});

export const getRegions = query({
  handler: async (ctx) => {
    const products = await ctx.db.query("tippsyProducts").collect();
    const regions = [...new Set(products.map(p => p.prefecture).filter(Boolean))];
    return ["All", ...regions.sort()];
  },
});
