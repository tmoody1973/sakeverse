---
description: Generate a new AI podcast episode for Sakécosm
argument-hint: [topic-description]
---

# Generate Podcast Episode

Generate a new AI podcast episode for the Sakécosm podcast network.

## Available Shows

| Show | Series ID | Focus |
|------|-----------|-------|
| Sake Stories | sake_stories | Brewery histories, regional tales |
| Pairing Lab | pairing_lab | Food pairing deep dives |
| The Bridge | the_bridge | Wine-to-sake translations |
| Brewing Secrets | brewing_secrets | Technical brewing science |

## Process

1. **Select or Create Topic**
   - Check existing topics: `npx convex run podcastTopics:listByStatus '{"status": "ready"}'`
   - Or describe a new topic for the specified show

2. **Generate Episode**
   - Use admin UI at `/admin/podcasts/generate`
   - Or trigger via Convex: `npx convex run podcastGeneration:generateEpisode '{"topicId": "..."}'`

3. **Generate Audio** (separate step due to Convex limitations)
   - After script is ready, trigger TTS: `npx convex run podcastTTS:generateAudio '{"episodeId": "..."}'`

4. **Review and Publish**
   - Preview at `/admin/podcasts/episodes/[id]`
   - Publish when ready

## Episode Format

Episodes follow "This American Life" style with two hosts:
- **TOJI** (杜氏 - master brewer): The storyteller and guide
- **KOJI** (麹 - the catalyst): The curious everyman who asks great questions

Target length: 3-5 minutes (~450-750 words)

## Technical Notes

- Scripts are generated via Gemini 2.5 Flash
- Research uses Gemini RAG (brewery histories) + Perplexity (current info)
- Audio uses Gemini TTS with Kore (TOJI) and Puck (KOJI) voices
- Output format: WAV (switched from MP3 due to lamejs Node.js 22 issues)
