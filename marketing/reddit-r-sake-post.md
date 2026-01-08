# Reddit r/sake Post - Sakécosm Launch

**Title**: I built an AI sake sommelier that translates wine preferences into sake recommendations (and I'd love your feedback)

---

**Post Body**:

Hey r/sake,

I'm Tarik, a Certified Sake Professional, and I've been thinking about this problem for years:

**80M+ Americans drink wine regularly. Most are terrified of sake menus.**

Wine is accessible—you can walk into any restaurant, say "I like Pinot Noir," and the sommelier knows exactly what to recommend. But sake? The vocabulary doesn't translate. "Junmai" doesn't mean anything to someone who speaks Chardonnay. "Yamahai" sounds like a martial art, not a brewing method.

And the education that exists? It's fragmented, academic, and honestly... not engaging. You either take a $200 certification course or you're left Googling "what is daiginjo" on your phone at dinner.

**There's no bridge between curiosity and confident purchase.**

So I built one.

**Meet Kiki** (利き酒 - "sake tasting"), an AI sommelier that speaks both wine and sake. You can literally say "I love Pinot Noir" and she'll recommend aged junmai with earthy notes. Or ask "What sake pairs with Korean BBQ?" and get instant, researched answers.

But here's what makes it different from just another chatbot:

**1. Voice-first conversations**  
Talk to Kiki like you're at a sake bar. She responds in under 200ms with natural conversation. No typing, no menus—just ask.

**2. Real sake knowledge**  
I fed her 5 sake books, 68 brewery histories, and connected her to live web search. She's not making stuff up—she's pulling from actual sake literature and current trends.

**3. AI-generated podcasts**  
Four shows (Sake Stories, Pairing Lab, The Bridge, Brewing Secrets) with two AI hosts—TOJI (the guide) and KOJI (the curious one). Think "This American Life" but for sake. 3-5 minute episodes you can listen to while commuting.

**4. Interactive Japan map**  
Click any prefecture, learn about regional styles, see local breweries. AI-generated descriptions for all 47 prefectures.

**5. Gamified learning**  
Take courses, pass quizzes, earn XP and badges. I wanted to make sake education feel like a game, not homework.

**Why I'm sharing this here:**

I built this in 27 hours using AI tools (Kiro CLI, specifically) for a hackathon. It's rough around the edges, but it works. And I think it could actually help people discover sake without feeling intimidated.

**What I need from you:**

- Try it: [sakecosm.com](https://sakecosm.com)
- Break it (seriously, find the bugs)
- Tell me if the recommendations make sense
- Let me know what's missing

I'm not trying to replace sake educators or sommeliers—I'm trying to give people a patient, judgment-free way to explore sake at their own pace. The kind of tool I wish existed when I was starting out.

**A few technical notes for the curious:**
- Voice: OpenAI Realtime API
- Dynamic UI: Thesys C1 (generates React components on the fly)
- Knowledge: Gemini File Search + Perplexity API
- Backend: Convex (realtime database)
- Product data: 104 sake from Tippsy (with permission)

**Full transparency:**  
This is a hackathon project, not a commercial product (yet). I'm a solo developer who loves sake and wanted to see if AI could make it more accessible. If this resonates with the community, I'll keep building. If not, I learned a ton and had fun doing it.

What do you think? Too gimmicky? Actually useful? Missing something obvious?

Thanks for reading,  
Tarik

P.S. - If you're a sake professional and want to collaborate on making the knowledge base better, DM me. I'd love to work with more experts to improve the recommendations.

---

**Suggested Flair**: Discussion or Resource (depending on subreddit rules)

**Best Time to Post**: 
- Tuesday-Thursday, 9-11 AM EST (when r/sake is most active)
- Avoid weekends (lower engagement)

**Engagement Strategy**:
- Respond to every comment within first 2 hours
- Be humble and open to criticism
- Share specific examples when asked
- Acknowledge limitations honestly
- Offer to incorporate feedback

**Follow-up Comments to Prepare**:

**If someone asks "Why AI?"**:
"Great question. I teach sake classes in person, and I can only reach ~20 people at a time. AI lets me scale that patient, conversational teaching style to anyone, anytime. It's not replacing human expertise—it's making it more accessible."

**If someone questions accuracy**:
"100% valid concern. That's exactly why I'm sharing here—I need sake professionals to pressure-test the recommendations. If you find something wrong, please tell me. The knowledge base is only as good as the sources I feed it."

**If someone asks about monetization**:
"Right now, it's free and I'm not sure about monetization. If I do charge, it would be for premium features (more courses, advanced pairing tools), but the core sommelier experience would stay free. I want this to lower barriers, not create new ones."

**If someone loves it**:
"Thank you! If you have specific sake you think should be in the database, or topics you'd like to see covered in courses/podcasts, let me know. I'm building this for the community."
