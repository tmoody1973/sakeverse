# Gemini RAG Setup - Wine-to-Sake Guide Integration

## Overview

The wine-to-sake guide has been integrated into Gemini File Search RAG alongside brewery histories. This provides detailed, scientific wine-to-sake translations for:
- The Bridge podcast episodes
- Voice agent (Kiki) wine matching queries  
- C1 chat wine-to-sake recommendations

## Files Uploaded to Gemini

1. **brewery_histories_only.md** - 68 brewery histories for general sake knowledge
2. **wine_to_sake_guide.md** - Comprehensive wine-to-sake translation guide with:
   - Scientific flavor correlations (esters, acids, umami)
   - Wine varietal to sake style mappings
   - Specific brand recommendations
   - 228 lines of detailed content

## Upload Instructions

### Step 1: Set API Key

```bash
export GEMINI_API_KEY=your-key-here
```

### Step 2: Run Upload Script

```bash
node scripts/upload-to-gemini.mjs
```

This will:
- Upload both markdown files to Gemini File API
- Wait for processing to complete
- Output file URIs for Convex configuration

### Step 3: Configure Convex

```bash
# Copy the comma-separated URIs from script output
npx convex env set GEMINI_FILE_URIS "uri1,uri2"
```

## Integration Points

### 1. Podcast Generation (`convex/podcastGeneration.ts`)

**The Bridge episodes** automatically use `focusArea: "wine_matching"` to query the wine-to-sake guide:

```typescript
const focusArea = topic.series === "the-bridge" ? "wine_matching" : "brewery_history"
const ragResult = await queryGeminiRAG(geminiApiKey, fileUris, query, focusArea)
```

### 2. Gemini RAG (`convex/geminiRAG.ts`)

Enhanced with focus areas:

```typescript
await ctx.runAction(api.geminiRAG.searchSakeKnowledge, {
  query: "What sake matches Pinot Noir?",
  focusArea: "wine_matching" // Uses wine-to-sake guide
})
```

### 3. Podcast RAG (`convex/podcastRAG.ts`)

Supports multiple files with focus-specific instructions:

```typescript
await ctx.runAction(api.podcastRAG.queryBreweryKnowledge, {
  query: "Chardonnay to sake",
  focusArea: "wine_matching"
})
```

## Focus Areas

| Focus Area | Primary File | Use Case |
|------------|-------------|----------|
| `wine_matching` | wine_to_sake_guide.md | Wine-to-sake translations, The Bridge podcast |
| `brewery_history` | brewery_histories_only.md | Brewery stories, Sake Stories podcast |
| `general` | Both files | Comprehensive sake knowledge |

## Benefits

✅ **Scientific Accuracy**: Molecular-level wine-to-sake correlations  
✅ **Specific Recommendations**: Brand names for each wine style  
✅ **Comprehensive Coverage**: Sparkling, whites, reds, fortified wines  
✅ **Context-Aware**: Focus areas ensure relevant knowledge retrieval  
✅ **Podcast Quality**: The Bridge episodes get accurate wine translations  

## Verification

Test the integration:

```bash
# In Convex dashboard, run:
api.geminiRAG.searchSakeKnowledge({
  query: "What sake is similar to Pinot Noir?",
  focusArea: "wine_matching"
})

# Should return detailed response citing wine-to-sake guide
```

## File Structure

```
research/
└── wine_to_sake_guide.md  # 228 lines, comprehensive guide

podcasts/
└── brewery_histories_only.md  # 68 brewery histories

scripts/
└── upload-to-gemini.mjs  # Upload script (updated for multiple files)

convex/
├── geminiRAG.ts  # Enhanced with focus areas
├── podcastRAG.ts  # Enhanced with focus areas
└── podcastGeneration.ts  # Auto-detects focus for The Bridge
```

## Troubleshooting

**Files not uploading?**
- Check GEMINI_API_KEY is set
- Verify file paths are correct
- Ensure files are valid markdown

**RAG not using files?**
- Verify GEMINI_FILE_URIS is set in Convex
- Check URIs are comma-separated with no spaces
- Confirm files show as "ACTIVE" in Gemini console

**Wrong knowledge returned?**
- Ensure correct `focusArea` is specified
- Check system instructions in query
- Verify file URIs match uploaded files

## Next Steps

1. ✅ Upload files to Gemini
2. ✅ Set GEMINI_FILE_URIS in Convex
3. ✅ Test wine-to-sake queries
4. ✅ Generate The Bridge episode to verify
5. ✅ Monitor RAG quality in production
