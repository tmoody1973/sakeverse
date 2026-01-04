# Technical Architecture

## Technology Stack
**Frontend**: Next.js 16 (App Router), TypeScript, React, Tailwind CSS
**Backend**: Convex (realtime database, serverless functions, file storage, cron jobs)
**Authentication**: Clerk (authentication, webhooks)
**Voice Agent**: OpenAI Realtime API (WebRTC) with function tools
**Dynamic UI**: Thesys C1 for AI-generated React components
**RAG System**: Gemini File Search, Perplexity API, Firecrawl
**Podcast Generation**: Gemini 2.5 Pro + Gemini TTS (multi-speaker audio)
**Mapping**: Mapbox GL with prefecture-based brewery data
**Data Pipeline**: Firecrawl Agent → Convex Actions → scheduled cron jobs

## Architecture Overview
**Serverless-First Architecture** with real-time capabilities:
- **Frontend Layer**: Next.js App Router with TypeScript and Tailwind for responsive UI
- **Real-time Backend**: Convex handles database, serverless functions, and real-time subscriptions
- **Voice Processing**: OpenAI Realtime API with WebRTC for low-latency voice interactions
- **Dynamic UI**: Thesys C1 generates React components during voice conversations
- **Knowledge Layer**: Multi-source RAG system combining static documents, live news, and scraped data
- **Content Generation**: AI-powered podcast creation with multi-speaker synthesis
- **Data Synchronization**: Automated cron jobs for maintaining fresh sake catalog data

## Development Environment
**Required Tools**:
- Node.js 18+ with npm/yarn
- TypeScript 5.0+
- Convex CLI for backend development
- Mapbox account and API keys
- OpenAI API access (Realtime API)
- Thesys C1 integration
- Clerk authentication setup

**Development Setup**:
- Local Convex development server
- Hot reload for Next.js frontend
- TypeScript strict mode enabled
- ESLint and Prettier for code formatting

## Code Standards
**TypeScript Standards**:
- Strict mode enabled with comprehensive type safety
- Interface-first design for component props and API responses
- Consistent naming: PascalCase for components, camelCase for functions
- Comprehensive JSDoc comments for complex functions

**React Patterns**:
- Functional components with hooks
- Custom hooks for business logic separation
- Server Components where appropriate (Next.js App Router)
- Consistent error boundary implementation

**File Organization**:
- Feature-based folder structure
- Shared components in `/components`
- Utilities in `/lib`
- Convex functions in `/convex`

## Testing Strategy
**Frontend Testing**:
- Jest + React Testing Library for component testing
- Playwright for end-to-end testing
- Storybook for component documentation and visual testing

**Backend Testing**:
- Convex testing utilities for serverless functions
- Integration tests for RAG pipeline
- Voice API integration testing

**Performance Testing**:
- Voice latency monitoring
- Real-time database performance
- Dynamic UI generation speed

## Deployment Process
**Frontend Deployment**:
- Vercel deployment with Next.js optimization
- Automatic deployments from main branch
- Preview deployments for pull requests

**Backend Deployment**:
- Convex automatic deployments
- Environment-specific configurations
- Cron job scheduling for data pipeline

**CI/CD Pipeline**:
- GitHub Actions for automated testing
- TypeScript compilation checks
- Automated dependency updates

## Performance Requirements
**Voice Interactions**: <200ms latency for real-time conversations
**UI Generation**: Dynamic components render within 1-2 seconds
**Database Queries**: Real-time updates with <100ms response time
**Map Rendering**: Smooth 60fps interactions with brewery data
**Podcast Generation**: Background processing with progress indicators

## Security Considerations
**Authentication**: Clerk-managed user sessions with JWT tokens
**API Security**: Rate limiting on voice and RAG endpoints
**Data Privacy**: User taste profiles encrypted at rest
**Content Security**: Sanitized dynamic UI generation
**Third-party APIs**: Secure key management and rotation
**Real-time Security**: WebRTC connection validation and monitoring
