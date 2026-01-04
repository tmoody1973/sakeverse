# Feature: Next.js App Foundation with Convex Backend

The following plan should be complete, but its important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils types and models. Import from the right files etc.

## Feature Description

Establish the foundational architecture for Sakéverse - an AI-powered sake discovery platform featuring a Next.js 16 App Router frontend with Convex serverless backend. This foundation includes the complete project structure, design system implementation, core authentication, database schema, and essential UI components following the RetroUI neobrutalism design with cherry blossom theme.

## User Story

As a developer building Sakéverse
I want to establish a solid Next.js + Convex foundation with design system
So that I can rapidly build features like voice chat, sake discovery, and learning systems on a scalable architecture

## Problem Statement

Currently, the project exists only as a template with steering documents and interface specifications. We need to transform this into a working Next.js application with Convex backend, implementing the complete design system, authentication, database schema, and core components that will support all planned features (voice agent, sake catalog, podcasts, interactive map, learning system).

## Solution Statement

Create a comprehensive Next.js 16 App Router application with Convex backend that implements the complete RetroUI neobrutalism design system with cherry blossom theme. The foundation will include authentication via Clerk, database schema for all entities, core UI components, responsive layouts, and the essential infrastructure needed for voice interactions, dynamic UI generation, and real-time features.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: High
**Primary Systems Affected**: Frontend (Next.js), Backend (Convex), Authentication (Clerk), Design System (Tailwind)
**Dependencies**: Next.js 16, Convex, Clerk, Tailwind CSS, TypeScript

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `.kiro/steering/product.md` - Complete product vision and feature requirements
- `.kiro/steering/tech.md` - Technical architecture and technology stack details
- `.kiro/steering/structure.md` - Detailed project structure and file organization
- `research/SAKEVERSE-INTERFACE-SPEC.md` - Complete interface specification with layouts, components, and design system
- `research/sakeverse-design-guide.docx.md` - Design philosophy and RetroUI implementation guidelines

### New Files to Create

**Core Configuration:**
- `package.json` - Project dependencies and scripts
- `next.config.js` - Next.js configuration with App Router
- `tailwind.config.ts` - Complete design system configuration
- `tsconfig.json` - TypeScript configuration
- `convex.json` - Convex backend configuration
- `.env.local` - Environment variables template

**Convex Backend:**
- `convex/schema.ts` - Complete database schema for all entities
- `convex/users.ts` - User management functions
- `convex/sake.ts` - Sake catalog functions
- `convex/auth.ts` - Authentication configuration
- `convex/_generated/` - Auto-generated Convex files

**Next.js App Structure:**
- `app/layout.tsx` - Root layout with providers
- `app/page.tsx` - Home dashboard
- `app/globals.css` - Global styles and design system
- `app/(auth)/` - Authentication routes
- `app/api/` - API routes and webhooks

**Core Components:**
- `components/ui/` - Base UI components (Button, Card, Badge, Input, etc.)
- `components/layout/` - Layout components (Header, BottomNav, Sidebar)
- `lib/` - Utilities, hooks, and configurations

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [Next.js 16 App Router Documentation](https://nextjs.org/docs/app)
  - Specific section: App Router fundamentals and layouts
  - Why: Required for proper App Router implementation
- [Convex Documentation](https://docs.convex.dev/quickstart)
  - Specific section: Schema definition and functions
  - Why: Essential for backend setup and real-time features
- [Clerk Next.js Integration](https://clerk.com/docs/quickstarts/nextjs)
  - Specific section: App Router setup and middleware
  - Why: Required for authentication implementation
- [Tailwind CSS Configuration](https://tailwindcss.com/docs/configuration)
  - Specific section: Custom theme and design tokens
  - Why: Needed for complete design system implementation

### Patterns to Follow

**Next.js App Router Patterns:**
- Use Server Components by default, Client Components only when needed
- Implement proper loading.tsx and error.tsx files
- Use route groups for organization: `(auth)`, `(main)`
- Implement proper metadata and SEO

**Convex Patterns:**
- Define comprehensive schema with relationships
- Use mutations for data changes, queries for reads
- Implement proper error handling and validation
- Use actions for external API calls

**Design System Patterns:**
- Implement RetroUI neobrutalism with cherry blossom theme
- Use CSS custom properties for consistent theming
- Follow responsive design patterns from interface spec
- Implement proper accessibility (WCAG AA compliance)

**TypeScript Patterns:**
- Strict mode enabled with comprehensive type safety
- Interface-first design for component props
- Proper type definitions for all entities
- Use Convex-generated types

---

## IMPLEMENTATION PLAN

### Phase 1: Project Foundation

Set up the basic Next.js project structure with all necessary dependencies and configurations.

**Tasks:**
- Initialize Next.js 16 project with TypeScript and App Router
- Configure Tailwind CSS with complete design system
- Set up Convex backend with schema definitions
- Configure Clerk authentication
- Establish project structure and core utilities

### Phase 2: Design System Implementation

Implement the complete RetroUI neobrutalism design system with cherry blossom theme.

**Tasks:**
- Create Tailwind configuration with all design tokens
- Implement base UI components (Button, Card, Badge, Input)
- Create layout components (Header, BottomNav, Sidebar)
- Implement responsive grid system and breakpoints
- Add animations and interaction states

### Phase 3: Core Application Structure

Build the foundational app structure with authentication and basic routing.

**Tasks:**
- Implement root layout with providers
- Create authentication flow and protected routes
- Build home dashboard layout
- Implement basic navigation and routing
- Set up error boundaries and loading states

### Phase 4: Database and Backend Integration

Complete the Convex backend setup with full schema and basic functions.

**Tasks:**
- Define complete database schema for all entities
- Implement user management functions
- Create basic sake catalog functions
- Set up real-time subscriptions
- Implement proper error handling and validation

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

### CREATE package.json

- **IMPLEMENT**: Complete package.json with all required dependencies
- **PATTERN**: Next.js 16 + Convex + Clerk + Tailwind standard setup
- **IMPORTS**: Next.js 16, Convex, Clerk, Tailwind CSS, TypeScript, React 19
- **GOTCHA**: Ensure React 19 compatibility with all packages
- **VALIDATE**: `npm install && npm run build`

### CREATE next.config.js

- **IMPLEMENT**: Next.js configuration with App Router and optimizations
- **PATTERN**: Standard App Router configuration with image optimization
- **IMPORTS**: None required
- **GOTCHA**: Configure for Convex and Clerk integration
- **VALIDATE**: `npm run build`

### CREATE tailwind.config.ts

- **IMPLEMENT**: Complete design system configuration with cherry blossom theme
- **PATTERN**: Custom theme with RetroUI neobrutalism tokens from interface spec
- **IMPORTS**: Tailwind CSS types
- **GOTCHA**: Include all custom colors, fonts, shadows, and spacing from design guide
- **VALIDATE**: `npx tailwindcss -i ./app/globals.css -o ./dist/output.css`

### CREATE tsconfig.json

- **IMPLEMENT**: TypeScript configuration with strict mode and path aliases
- **PATTERN**: Next.js + Convex TypeScript setup
- **IMPORTS**: None required
- **GOTCHA**: Configure paths for components and lib directories
- **VALIDATE**: `npx tsc --noEmit`

### CREATE convex.json

- **IMPLEMENT**: Convex configuration for backend functions
- **PATTERN**: Standard Convex setup with authentication
- **IMPORTS**: None required
- **GOTCHA**: Configure for production deployment
- **VALIDATE**: `npx convex dev --once`

### CREATE .env.local

- **IMPLEMENT**: Environment variables template with all required keys
- **PATTERN**: Next.js + Convex + Clerk environment setup
- **IMPORTS**: None required
- **GOTCHA**: Include placeholders for all API keys and secrets
- **VALIDATE**: Manual verification of all required variables

### CREATE convex/schema.ts

- **IMPLEMENT**: Complete database schema for all Sakéverse entities
- **PATTERN**: Convex schema definition with relationships
- **IMPORTS**: Convex schema types
- **GOTCHA**: Define all entities: users, sake, breweries, regions, courses, badges, podcasts, voice_sessions
- **VALIDATE**: `npx convex dev --once`

### CREATE convex/auth.ts

- **IMPLEMENT**: Clerk authentication configuration for Convex
- **PATTERN**: Clerk + Convex integration pattern
- **IMPORTS**: Convex auth, Clerk types
- **GOTCHA**: Proper JWT validation and user sync
- **VALIDATE**: `npx convex dev --once`

### CREATE convex/users.ts

- **IMPLEMENT**: User management functions (create, update, get profile)
- **PATTERN**: Convex mutation and query functions
- **IMPORTS**: Convex functions, schema types
- **GOTCHA**: Handle user creation from Clerk webhooks
- **VALIDATE**: `npx convex dev --once`

### CREATE convex/sake.ts

- **IMPLEMENT**: Basic sake catalog functions (list, get, search)
- **PATTERN**: Convex query functions with filtering
- **IMPORTS**: Convex functions, schema types
- **GOTCHA**: Implement proper search and filtering logic
- **VALIDATE**: `npx convex dev --once`

### CREATE app/globals.css

- **IMPLEMENT**: Global styles with design system CSS custom properties
- **PATTERN**: Tailwind base styles + custom RetroUI components
- **IMPORTS**: Tailwind CSS directives
- **GOTCHA**: Include all custom shadows, animations, and component styles
- **VALIDATE**: `npm run build`

### CREATE lib/convex.ts

- **IMPLEMENT**: Convex client configuration and hooks
- **PATTERN**: Convex React integration
- **IMPORTS**: Convex React, Next.js
- **GOTCHA**: Proper client-side configuration with authentication
- **VALIDATE**: `npm run build`

### CREATE lib/clerk.ts

- **IMPLEMENT**: Clerk configuration and utilities
- **PATTERN**: Clerk Next.js App Router setup
- **IMPORTS**: Clerk Next.js
- **GOTCHA**: Proper middleware and route protection
- **VALIDATE**: `npm run build`

### CREATE lib/utils.ts

- **IMPLEMENT**: Utility functions for common operations
- **PATTERN**: Standard utility patterns (cn, formatters, validators)
- **IMPORTS**: clsx, tailwind-merge
- **GOTCHA**: Include sake-specific utilities (temperature conversion, etc.)
- **VALIDATE**: `npm run build`

### CREATE components/ui/Button.tsx

- **IMPLEMENT**: Button component with all variants from design system
- **PATTERN**: Compound component with variants (primary, secondary, ghost, icon)
- **IMPORTS**: React, clsx, forwardRef
- **GOTCHA**: Implement RetroUI neobrutalism styling with proper shadows and hover states
- **VALIDATE**: `npm run build`

### CREATE components/ui/Card.tsx

- **IMPLEMENT**: Card component with RetroUI styling
- **PATTERN**: Flexible card component with header, content, footer slots
- **IMPORTS**: React, clsx
- **GOTCHA**: Implement proper shadow and border styling from design system
- **VALIDATE**: `npm run build`

### CREATE components/ui/Badge.tsx

- **IMPLEMENT**: Badge component for labels and status indicators
- **PATTERN**: Small component with color variants
- **IMPORTS**: React, clsx
- **GOTCHA**: Include sake-specific variants (type, level, status)
- **VALIDATE**: `npm run build`

### CREATE components/ui/Input.tsx

- **IMPLEMENT**: Input component with RetroUI styling
- **PATTERN**: Controlled input with proper focus states
- **IMPORTS**: React, forwardRef
- **GOTCHA**: Implement proper border and shadow styling
- **VALIDATE**: `npm run build`

### CREATE components/layout/Header.tsx

- **IMPLEMENT**: Main header component with navigation and user menu
- **PATTERN**: Responsive header with mobile/desktop variants
- **IMPORTS**: Next.js Link, Clerk components, UI components
- **GOTCHA**: Implement proper responsive behavior and authentication states
- **VALIDATE**: `npm run build`

### CREATE components/layout/BottomNav.tsx

- **IMPLEMENT**: Mobile bottom navigation component
- **PATTERN**: Fixed bottom navigation with active states
- **IMPORTS**: Next.js Link, UI components
- **GOTCHA**: Show only on mobile, hide on desktop
- **VALIDATE**: `npm run build`

### CREATE components/layout/Sidebar.tsx

- **IMPLEMENT**: Desktop sidebar component
- **PATTERN**: Collapsible sidebar with navigation items
- **IMPORTS**: Next.js Link, UI components
- **GOTCHA**: Show only on desktop, proper responsive behavior
- **VALIDATE**: `npm run build`

### CREATE app/layout.tsx

- **IMPLEMENT**: Root layout with all providers and global components
- **PATTERN**: Next.js App Router root layout
- **IMPORTS**: Convex provider, Clerk provider, layout components
- **GOTCHA**: Proper provider nesting and metadata configuration
- **VALIDATE**: `npm run dev`

### CREATE app/page.tsx

- **IMPLEMENT**: Home dashboard page with basic layout
- **PATTERN**: Server Component with responsive grid layout
- **IMPORTS**: Layout components, UI components
- **GOTCHA**: Implement responsive grid from interface specification
- **VALIDATE**: `npm run dev`

### CREATE app/(auth)/sign-in/[[...sign-in]]/page.tsx

- **IMPLEMENT**: Clerk sign-in page
- **PATTERN**: Clerk authentication pages
- **IMPORTS**: Clerk components
- **GOTCHA**: Proper route structure for Clerk catch-all routes
- **VALIDATE**: `npm run dev`

### CREATE app/(auth)/sign-up/[[...sign-up]]/page.tsx

- **IMPLEMENT**: Clerk sign-up page
- **PATTERN**: Clerk authentication pages
- **IMPORTS**: Clerk components
- **GOTCHA**: Proper route structure for Clerk catch-all routes
- **VALIDATE**: `npm run dev`

### CREATE middleware.ts

- **IMPLEMENT**: Clerk middleware for route protection
- **PATTERN**: Clerk Next.js middleware
- **IMPORTS**: Clerk Next.js
- **GOTCHA**: Proper route matching and protection rules
- **VALIDATE**: `npm run dev`

### CREATE app/api/webhooks/clerk/route.ts

- **IMPLEMENT**: Clerk webhook handler for user sync
- **PATTERN**: Next.js API route with webhook verification
- **IMPORTS**: Clerk webhook, Convex client
- **GOTCHA**: Proper webhook verification and user creation in Convex
- **VALIDATE**: `npm run dev`

### UPDATE .gitignore

- **IMPLEMENT**: Add all necessary ignore patterns
- **PATTERN**: Next.js + Convex + Node.js gitignore
- **IMPORTS**: None required
- **GOTCHA**: Include .env.local, .convex, node_modules, .next
- **VALIDATE**: `git status`

---

## TESTING STRATEGY

### Unit Tests

Design unit tests for all UI components using Jest and React Testing Library:
- Button component variants and interactions
- Card component rendering and props
- Badge component variants
- Input component controlled behavior
- Layout components responsive behavior

### Integration Tests

Test the complete authentication and data flow:
- User sign-up and sign-in flow
- Convex database operations
- Real-time data subscriptions
- API route functionality

### Visual Testing

Verify design system implementation:
- Component variants match design specifications
- Responsive behavior across breakpoints
- RetroUI styling (shadows, borders, colors)
- Accessibility compliance (contrast, focus states)

### Edge Cases

Test error scenarios and edge cases:
- Network failures and offline behavior
- Authentication errors and redirects
- Invalid data handling
- Loading states and error boundaries

---

## VALIDATION COMMANDS

Execute every command to ensure zero regressions and 100% feature correctness.

### Level 1: Syntax & Style

```bash
# TypeScript compilation
npx tsc --noEmit

# ESLint checking
npx eslint . --ext .ts,.tsx

# Prettier formatting
npx prettier --check .
```

### Level 2: Build Validation

```bash
# Next.js build
npm run build

# Convex deployment check
npx convex dev --once

# Tailwind CSS compilation
npx tailwindcss -i ./app/globals.css -o ./dist/output.css
```

### Level 3: Development Server

```bash
# Start development server
npm run dev

# Verify all routes load without errors
curl http://localhost:3000
curl http://localhost:3000/sign-in
curl http://localhost:3000/sign-up
```

### Level 4: Manual Validation

- Navigate to http://localhost:3000 and verify home page loads
- Test authentication flow (sign up, sign in, sign out)
- Verify responsive design on mobile and desktop
- Test all UI components render correctly
- Verify design system colors and styling match specifications

### Level 5: Additional Validation

```bash
# Bundle analysis
npm run build && npx @next/bundle-analyzer

# Accessibility testing
npx @axe-core/cli http://localhost:3000

# Performance testing
npx lighthouse http://localhost:3000 --view
```

---

## ACCEPTANCE CRITERIA

- [ ] Complete Next.js 16 App Router application with TypeScript
- [ ] Convex backend with full schema and authentication
- [ ] Clerk authentication fully integrated and working
- [ ] Complete RetroUI design system implemented in Tailwind
- [ ] All base UI components (Button, Card, Badge, Input) working
- [ ] Responsive layout components (Header, BottomNav, Sidebar)
- [ ] Home dashboard page with proper layout
- [ ] Authentication flow (sign-in, sign-up) working
- [ ] Real-time data connection between frontend and Convex
- [ ] All validation commands pass with zero errors
- [ ] Design matches interface specifications exactly
- [ ] Responsive design works on mobile and desktop
- [ ] Accessibility compliance (WCAG AA)
- [ ] Performance meets requirements (Lighthouse score >90)

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in dependency order
- [ ] Each task validation passed immediately
- [ ] All validation commands executed successfully
- [ ] Full development server runs without errors
- [ ] Authentication flow tested and working
- [ ] Design system implementation verified
- [ ] Responsive behavior tested on multiple screen sizes
- [ ] All components render correctly
- [ ] No TypeScript errors or warnings
- [ ] No console errors in browser
- [ ] Code follows established patterns and conventions
- [ ] Documentation updated for setup instructions

---

## NOTES

**Design System Priority**: The RetroUI neobrutalism with cherry blossom theme is critical to the project's identity. Ensure all shadows, borders, colors, and typography match the specifications exactly.

**Performance Considerations**: This foundation will support real-time voice interactions and dynamic UI generation, so optimize for performance from the start.

**Scalability**: The architecture must support the planned features (voice agent, sake catalog, podcasts, interactive map, learning system) without major refactoring.

**Authentication Flow**: Proper user sync between Clerk and Convex is essential for all future features that depend on user data.

**Mobile-First**: Given the voice-first nature of the app, ensure excellent mobile experience from the foundation.
