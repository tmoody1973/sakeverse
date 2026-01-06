---
description: Generate a new sake learning course using AI
argument-hint: [course-topic]
---

# Generate Learning Course

Generate a new AI-powered sake learning course for Sakécosm.

## Course Categories

| Category | Slug | Description |
|----------|------|-------------|
| Fundamentals | fundamentals | Sake basics, classifications, terminology |
| Brewing | brewing | Production methods, ingredients, techniques |
| Tasting | tasting | Flavor profiles, evaluation, sensory analysis |
| Pairing | pairing | Food pairing principles and recommendations |
| Regions | regions | Japanese sake regions and their styles |
| Wine Bridge | wine-bridge | Wine-to-sake translation for wine lovers |

## Generation Process

1. **Access Admin UI**
   - Navigate to `/admin/learn`
   - Only accessible to admin email (tarikjmoody@gmail.com)

2. **Configure Course**
   - Enter topic (e.g., "Understanding Junmai Classifications")
   - Select category from dropdown
   - Choose chapter count (3-6 recommended)

3. **Generation Pipeline**
   - Perplexity API generates course outline
   - Each chapter gets content blocks (text, callouts, wine bridges, key terms)
   - Quiz questions auto-generated from learning objectives

4. **Review and Edit**
   - Courses auto-publish for demo purposes
   - Edit via Convex dashboard if needed

## Content Block Types

Chapters use structured content blocks:
- `text` - Main paragraph content
- `heading` - Section headers
- `callout` - Tips, warnings, info boxes
- `wine_bridge` - Wine-to-sake comparisons
- `key_terms` - Glossary definitions

## Gamification Integration

Courses integrate with XP system:
- Chapter completion: +25 XP
- Quiz pass (first time): +50 XP
- Perfect quiz score: +100 XP

## Commands

```bash
# List existing courses
npx convex run learn/courses:listPublishedCourses

# Seed sample course (Sake Fundamentals)
npx convex run learn/seed:seedSampleCourse

# Seed categories
npx convex run learn/seed:seedCategories
```
