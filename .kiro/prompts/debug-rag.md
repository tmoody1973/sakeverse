---
description: Debug and test the multi-layer RAG system for Sakécosm
---

# Test RAG System

Test and debug the Sakécosm multi-layer RAG system.

## RAG Layers

1. **Vector Search** (Tippsy Products)
   - 104 products with OpenAI embeddings
   - Test: `npx convex run embeddings:searchSimilar '{"query": "fruity sake under $50", "limit": 3}'`

2. **Wine-to-Sake RAG** (13 chunks)
   - Maps wine preferences to sake recommendations
   - Test: `npx convex run wineToSake:searchWineToSake '{"query": "I like Pinot Noir", "limit": 2}'`

3. **Food Pairing RAG** (9 chunks)
   - Food pairing recommendations
   - Test: `npx convex run foodPairing:searchFoodPairing '{"query": "sushi pairing", "limit": 2}'`

4. **Gemini File Search** (5 PDFs + brewery histories)
   - Deep sake knowledge from books
   - Test: `npx convex run geminiRAG:searchSakeKnowledge '{"query": "how is sake brewed"}'`

5. **Perplexity API** (live web)
   - Current trends and news
   - Test: `npx convex run perplexityAPI:searchCurrent '{"query": "sake trends 2026"}'`

## Query Routing Logic

The voice agent routes queries based on keywords:

| Query Type | Keywords | RAG Layer |
|------------|----------|-----------|
| Wine preference | wine, pinot, chardonnay, cabernet | Wine-to-Sake |
| Food pairing | pair, food, dish, meal | Food Pairing |
| Knowledge | how, what, why, explain, brewing | Gemini PDFs |
| Current info | latest, news, recent, trending | Perplexity |
| Product search | recommend, suggest, buy, price | Vector Search |

## Debugging Steps

1. Check environment variables are set:
   ```bash
   npx convex env list
   ```

2. Verify embeddings exist:
   ```bash
   npx convex run embeddings:countWithEmbeddings
   ```

3. Test individual RAG layers with queries above

4. Check voice agent logs in browser console for routing decisions
