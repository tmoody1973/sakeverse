# Custom Prompts & Agents Strategy for Sakéverse

## 🎯 **Custom Prompts for Development Workflow**

### **RAG & Knowledge Management**
```yaml
@plan-rag:
  purpose: "Plan RAG system implementation with multiple knowledge sources"
  usage: "Plan integration of Gemini File Search + Perplexity API + Tippsy database"
  
@implement-rag:
  purpose: "Implement RAG components following architectural guidelines"
  usage: "Build Gemini PDF search, Perplexity web search, unified knowledge layer"
  
@test-rag:
  purpose: "Test RAG system with various query types and validate responses"
  usage: "Verify knowledge retrieval, response quality, source attribution"
  
@optimize-rag:
  purpose: "Optimize RAG performance and relevance scoring"
  usage: "Improve search accuracy, response time, knowledge fusion"
```

### **Voice Agent Development**
```yaml
@plan-voice-agent:
  purpose: "Plan voice agent architecture with OpenAI Realtime API"
  usage: "Design Yuki personality, conversation flows, error handling"
  
@implement-voice:
  purpose: "Build voice agent components with proper WebRTC integration"
  usage: "Create voice hooks, chat components, audio processing"
  
@test-voice-agent:
  purpose: "Test voice agent functionality and conversation quality"
  usage: "Validate voice recognition, response generation, user experience"
  
@enhance-personality:
  purpose: "Refine Yuki's sake sommelier personality and expertise"
  usage: "Improve conversation flow, sake knowledge, recommendation logic"
```

### **Database & Vector Search**
```yaml
@plan-vector-search:
  purpose: "Plan semantic search implementation with Convex vector index"
  usage: "Design embedding strategy, search algorithms, filtering logic"
  
@implement-embeddings:
  purpose: "Generate and manage OpenAI embeddings for sake products"
  usage: "Create embedding pipeline, vector index, search functions"
  
@test-semantic-search:
  purpose: "Validate semantic search accuracy and performance"
  usage: "Test natural language queries, relevance scoring, response time"
  
@optimize-search:
  purpose: "Improve search relevance and performance"
  usage: "Tune embedding parameters, optimize queries, enhance filtering"
```

### **Code Quality & Architecture**
```yaml
@review-voice-code:
  purpose: "Review voice agent code for quality and best practices"
  usage: "Check TypeScript types, error handling, component structure"
  
@review-rag-code:
  purpose: "Review RAG implementation for performance and maintainability"
  usage: "Validate API integrations, caching, error recovery"
  
@review-database-code:
  purpose: "Review database schema and query optimization"
  usage: "Check Convex functions, indexing, data consistency"
  
@security-review:
  purpose: "Review security aspects of API integrations and data handling"
  usage: "Validate API key management, input sanitization, access controls"
```

### **Documentation & Process**
```yaml
@update-devlog:
  purpose: "Update development log with progress and learnings"
  usage: "Document Kiro usage, technical decisions, challenges overcome"
  
@update-steering:
  purpose: "Update steering documents with new insights and decisions"
  usage: "Refine product vision, technical architecture, project structure"
  
@write-readme:
  purpose: "Create comprehensive README for hackathon submission"
  usage: "Document setup, features, architecture, Kiro workflow"
  
@prepare-demo:
  purpose: "Prepare demo materials and presentation content"
  usage: "Create demo script, video outline, key feature highlights"
```

---

## 🤖 **Custom Agents Strategy**

### **Specialized Development Agents**

#### **Voice Agent Specialist**
```yaml
name: "voice-specialist"
purpose: "Expert in voice agent development and OpenAI Realtime API"
tools: ["read", "write", "shell"]
resources: 
  - "file://convex/voice.ts"
  - "file://hooks/useVoiceChat.ts"
  - "file://components/voice/**"
prompt: |
  You are a voice agent development specialist focused on creating 
  conversational AI experiences. You excel at OpenAI Realtime API 
  integration, WebRTC audio processing, and natural conversation flows.
```

#### **RAG System Architect**
```yaml
name: "rag-architect"
purpose: "Expert in RAG systems, embeddings, and knowledge management"
tools: ["read", "write", "shell"]
resources:
  - "file://convex/embeddings.ts"
  - "file://convex/geminiRAG.ts"
  - "file://convex/perplexityAPI.ts"
prompt: |
  You are a RAG system architect specializing in multi-source knowledge 
  integration. You excel at embedding strategies, vector search, and 
  combining structured data with unstructured knowledge sources.
```

#### **Database Optimization Expert**
```yaml
name: "db-optimizer"
purpose: "Expert in Convex database design and query optimization"
tools: ["read", "write"]
resources:
  - "file://convex/schema.ts"
  - "file://convex/importTippsy.ts"
  - "file://convex/**/*.ts"
prompt: |
  You are a database optimization expert focused on Convex serverless 
  databases. You excel at schema design, indexing strategies, and 
  real-time query performance optimization.
```

#### **UI/UX Specialist**
```yaml
name: "ui-specialist"
purpose: "Expert in RetroUI design system and voice-first interfaces"
tools: ["read", "write"]
resources:
  - "file://components/**"
  - "file://app/globals.css"
  - "file://tailwind.config.js"
prompt: |
  You are a UI/UX specialist focused on voice-first interfaces and 
  RetroUI design systems. You excel at creating intuitive voice 
  interactions and beautiful, accessible user interfaces.
```

---

## 🔌 **MCP Integration Strategy**

### **External Service Integrations**

#### **Sake Knowledge MCP Server**
```yaml
purpose: "Connect to external sake databases and APIs"
capabilities:
  - "Sake brewery information lookup"
  - "Regional sake characteristics"
  - "Seasonal sake availability"
  - "Sake event and tasting information"
```

#### **E-commerce Integration MCP**
```yaml
purpose: "Connect to multiple sake retailers beyond Tippsy"
capabilities:
  - "Price comparison across retailers"
  - "Inventory availability checking"
  - "Shipping and delivery information"
  - "Customer review aggregation"
```

#### **Social Media MCP Server**
```yaml
purpose: "Connect to sake community and social platforms"
capabilities:
  - "Sake trending topics"
  - "Community recommendations"
  - "Brewery social media updates"
  - "Sake influencer content"
```

#### **Translation & Localization MCP**
```yaml
purpose: "Handle Japanese sake terminology and cultural context"
capabilities:
  - "Japanese sake name pronunciation"
  - "Cultural context explanation"
  - "Regional dialect understanding"
  - "Traditional ceremony information"
```

---

## 🎨 **Innovative Workflow Patterns**

### **Multi-Agent Collaboration**
```yaml
workflow: "Feature Development Pipeline"
agents:
  - voice-specialist: "Designs conversation flows"
  - rag-architect: "Implements knowledge retrieval"
  - db-optimizer: "Optimizes data queries"
  - ui-specialist: "Creates interface components"
coordination: "Each agent contributes expertise to unified feature"
```

### **Knowledge-Driven Development**
```yaml
workflow: "RAG-Enhanced Coding"
process:
  1. "Query sake knowledge base for domain expertise"
  2. "Generate code with cultural and technical accuracy"
  3. "Validate against traditional sake practices"
  4. "Optimize for user education and discovery"
```

### **Voice-First Design Process**
```yaml
workflow: "Conversation-Driven UI"
process:
  1. "Design voice interactions first"
  2. "Create supporting visual elements"
  3. "Ensure accessibility for voice-only users"
  4. "Test with actual voice conversations"
```

---

## 📊 **Success Metrics for Custom Prompts**

### **Development Efficiency**
- Time saved using custom prompts vs manual coding
- Consistency of code quality across components
- Reduction in debugging time through specialized agents

### **Knowledge Integration**
- Accuracy of sake information in responses
- Successful fusion of multiple knowledge sources
- User satisfaction with educational content

### **Voice Agent Quality**
- Natural conversation flow metrics
- Response relevance and accuracy
- User engagement and retention

### **Innovation Demonstration**
- Unique use cases for Kiro CLI features
- Creative agent collaboration patterns
- Novel MCP integration approaches

---

## 🏆 **Hackathon Differentiation Strategy**

### **What Makes Our Kiro Usage Unique**
1. **Domain-Specific Agents**: Sake expertise embedded in agent design
2. **Multi-Layer RAG**: Innovative knowledge source combination
3. **Voice-First Workflow**: Conversation-driven development process
4. **Cultural Integration**: Japanese sake culture in technical implementation
5. **Real-World Impact**: Solving actual sake discovery problems

### **Documentation Strategy**
- Screenshot every custom prompt creation and usage
- Record agent collaboration sessions
- Document MCP integration process
- Show before/after comparisons of Kiro-enhanced development

This strategy positions us to score maximum points on Kiro CLI usage while building a genuinely innovative sake discovery platform!
