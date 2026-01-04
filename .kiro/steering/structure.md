# Project Structure

## Directory Layout
```
sakéverse/
├── app/                          # Next.js App Router pages and layouts
│   ├── (auth)/                   # Authentication routes
│   ├── api/                      # API routes and webhooks
│   ├── dashboard/                # Main application dashboard
│   ├── map/                      # Interactive brewery map
│   ├── learning/                 # Badge system and certifications
│   └── voice/                    # Voice chat interface
├── components/                   # Reusable React components
│   ├── ui/                       # Base UI components (shadcn/ui)
│   ├── voice/                    # Voice interaction components
│   ├── map/                      # Map-related components
│   └── learning/                 # Learning system components
├── lib/                          # Utility functions and configurations
│   ├── convex.ts                 # Convex client configuration
│   ├── clerk.ts                  # Clerk authentication setup
│   ├── openai.ts                 # OpenAI Realtime API client
│   ├── thesys.ts                 # Thesys C1 integration
│   └── utils.ts                  # General utilities
├── convex/                       # Convex backend functions
│   ├── schema.ts                 # Database schema definitions
│   ├── users.ts                  # User management functions
│   ├── sake.ts                   # Sake catalog functions
│   ├── voice.ts                  # Voice interaction handlers
│   ├── podcasts.ts               # Podcast generation functions
│   ├── crons.ts                  # Scheduled data sync jobs
│   └── _generated/               # Auto-generated Convex files
├── public/                       # Static assets
│   ├── sake-images/              # Sake bottle images
│   ├── brewery-logos/            # Brewery logos and assets
│   └── audio/                    # Generated podcast files
├── types/                        # TypeScript type definitions
│   ├── sake.ts                   # Sake-related types
│   ├── voice.ts                  # Voice interaction types
│   └── user.ts                   # User profile types
├── hooks/                        # Custom React hooks
│   ├── useVoiceChat.ts           # Voice interaction hook
│   ├── useConvex.ts              # Convex data hooks
│   └── useAuth.ts                # Authentication hooks
└── .kiro/                        # Kiro CLI configuration
    ├── steering/                 # Project documentation
    └── prompts/                  # Custom development prompts
```

## File Naming Conventions
**Components**: PascalCase (e.g., `VoiceChat.tsx`, `SakeCard.tsx`)
**Pages**: kebab-case (e.g., `sake-discovery.tsx`, `brewery-map.tsx`)
**Utilities**: camelCase (e.g., `formatSakeName.ts`, `calculateTastingNotes.ts`)
**Types**: PascalCase interfaces (e.g., `SakeProfile`, `VoiceSession`)
**Hooks**: camelCase with "use" prefix (e.g., `useVoiceChat`, `useSakeRecommendations`)

## Module Organization
**Feature-Based Structure**: Each major feature (voice, map, learning) has its own component directory
**Shared Components**: Common UI elements in `/components/ui`
**Business Logic**: Custom hooks for complex state management
**API Layer**: Convex functions organized by domain (users, sake, voice, podcasts)
**Type Safety**: Centralized type definitions with domain-specific files

## Configuration Files
**Next.js**: `next.config.js` - App Router configuration, API routes, image optimization
**Convex**: `convex.json` - Backend configuration, environment variables
**TypeScript**: `tsconfig.json` - Strict mode, path aliases, Next.js integration
**Tailwind**: `tailwind.config.js` - Custom theme, component classes
**ESLint**: `.eslintrc.json` - Code quality rules, Next.js and React hooks
**Clerk**: Environment variables for authentication configuration
**OpenAI**: API keys and Realtime API configuration
**Mapbox**: GL configuration and style customization

## Documentation Structure
**README.md**: Project overview, setup instructions, architecture summary
**DEVLOG.md**: Development timeline, decisions, challenges, and learnings
**API Documentation**: Convex function documentation with JSDoc comments
**Component Documentation**: Storybook stories for UI components
**Voice API Documentation**: OpenAI Realtime API integration patterns

## Asset Organization
**Images**: Organized by type (sake bottles, brewery logos, UI assets)
**Audio**: Generated podcasts stored in Convex file storage
**Fonts**: Custom Japanese typography for sake names and descriptions
**Icons**: SVG icons for sake types, temperature recommendations, and UI elements
**Maps**: Mapbox style configurations and custom brewery markers

## Build Artifacts
**Next.js Build**: `.next/` directory with optimized production assets
**TypeScript Compilation**: Type checking and compilation artifacts
**Convex Deployment**: Backend functions deployed to Convex cloud
**Static Assets**: Optimized images and compressed audio files

## Environment-Specific Files
**Development**: Local Convex development server, hot reload, debug logging
**Staging**: Preview deployments with test data and limited API quotas
**Production**: Optimized builds, CDN assets, production API keys, monitoring
**Environment Variables**: Secure API key management for all third-party services
