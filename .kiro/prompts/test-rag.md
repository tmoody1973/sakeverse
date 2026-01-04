# Test RAG System

Test the RAG system with various query types to validate knowledge retrieval and response quality.

## Test Categories

Run these test queries through Kiki (via /kiki chat) and evaluate responses:

### 1. Wine-to-Sake Translation
```
"I love Pinot Noir, what sake should I try?"
"I'm a Chardonnay drinker, recommend sake for me"
"What sake is similar to Champagne?"
```
**Expected**: Wine-to-sake mapping with specific sake recommendations, reasoning, and temperature suggestions.

### 2. Food Pairing
```
"What sake pairs with fried chicken?"
"Best sake for spicy Thai curry"
"Recommend sake for my cheese board"
"What should I drink with sushi?"
```
**Expected**: Pairing goal, recommended sake styles, specific examples, and product links.

### 3. Educational/Knowledge
```
"How is sake made?"
"What's the difference between Junmai and Daiginjo?"
"Tell me about Niigata sake"
"Explain the rice polishing ratio"
```
**Expected**: Detailed educational content (3-4 paragraphs) from Gemini knowledge base.

### 4. Temperature Guide
```
"What temperature should I serve Daiginjo?"
"How do I warm sake properly?"
"What are the Japanese temperature names?"
```
**Expected**: Temperature scale with Japanese names, specific recommendations for sake type.

### 5. Product Search
```
"Recommend a sake under $50 for beginners"
"Show me premium Daiginjo options"
"What's a good Yamahai sake?"
```
**Expected**: Product cards with images, prices, Tippsy links, and "Save to Library" option.

### 6. Library Functions
```
"Save Dassai 23 to my library"
"Show my saved sake"
"What's in my library?"
```
**Expected**: Confirmation of save action, display of saved items.

## Validation Checklist

For each response, verify:

- [ ] **Relevance**: Answer addresses the actual question
- [ ] **Accuracy**: Information is correct (cross-check with source docs)
- [ ] **Completeness**: Includes all expected elements (products, temps, etc.)
- [ ] **UI Generation**: Dynamic UI components render properly (cards, tables)
- [ ] **Actions Work**: Buttons (View on Tippsy, Save to Library) function correctly
- [ ] **Follow-ups**: Response includes suggested follow-up questions

## RAG Source Verification

Check which knowledge source was used:

| Query Type | Expected Source |
|------------|-----------------|
| Wine preferences | Wine-to-Sake RAG chunks |
| Food pairing | Food Pairing RAG chunks |
| Educational | Gemini API |
| Products | Tippsy product catalog |
| Temperature | Built-in temperature tool |

## Common Issues to Watch For

1. **Truncated responses** - Check streaming is working
2. **Missing images** - Verify CDN URLs are valid
3. **Wrong tool called** - Check query routing logic
4. **Empty results** - Verify Convex data exists
5. **Action failures** - Check sessionId is set

## Running Tests

1. Open `/kiki` in browser
2. Run each test query
3. Document response quality (1-5 scale)
4. Note any issues or improvements needed
5. Verify UI components render correctly

## Test Results Template

```markdown
### Test: [Query]
- **Response Quality**: X/5
- **Source Used**: [wine-rag/food-rag/gemini/products/temp]
- **UI Rendered**: [cards/table/text]
- **Actions Working**: Yes/No
- **Issues**: [None / Description]
```
