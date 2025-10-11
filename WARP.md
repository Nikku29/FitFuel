# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development
```bash
# Start development server (runs on :8080)
npm run dev

# Build for production
npm run build

# Build for development (with development mode optimizations)
npm run build:dev

# Preview production build locally
npm run preview

# Lint code
npm run lint
```

### Testing
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npx vitest path/to/test.test.tsx

# Setup testing environment (if needed)
node scripts/setup-testing.js
```

### Firebase Operations
```bash
# Login to Firebase
firebase login

# Add Firebase project
firebase use --add

# Deploy Firestore and Storage rules
firebase deploy --only firestore:rules,storage:rules

# Deploy Firebase Functions
cd functions && npm run deploy

# Start Firebase emulators for local development
firebase emulators:start

# Deploy entire project
firebase deploy
```

### Functions Development (in functions/ directory)
```bash
# Build functions
npm run build

# Build and watch for changes
npm run build:watch

# Serve functions locally
npm run serve

# Deploy functions only
npm run deploy

# View function logs
npm run logs
```

## Architecture Overview

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Library**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **State Management**: React Context (UserContext) + TanStack Query
- **Routing**: React Router v6 with animated page transitions
- **Testing**: Vitest + Testing Library + jsdom
- **Performance**: Sentry monitoring, Web Vitals tracking
- **Build Tool**: Vite with SWC for fast compilation

### Core Architecture Patterns

#### Context-Based State Management
The application uses React Context for global state management:
- **UserContext** (`src/contexts/UserContext.tsx`): Manages user authentication, profile data, and preferences
- Firebase Auth integration with automatic session persistence
- Local storage synchronization for user preferences

#### Component Architecture
- **Route-level pages** in `src/pages/`: Each major route has its own page component
- **Feature-based components** in `src/components/`: Organized by feature (auth, assistant, monitoring, etc.)
- **Reusable UI components** in `src/components/ui/`: shadcn/ui components with custom styling
- **Layout components**: Navbar, Footer, and PageTransition for consistent UX

#### Firebase Integration
- **Authentication**: Email/password, Google OAuth, and anonymous sessions
- **Firestore**: User profiles, workout data, recipes, community content
- **Storage**: File uploads with automatic compression and optimization
- **Functions**: Backend logic in TypeScript (Node.js 18)
- **Security Rules**: Comprehensive rules for Firestore and Storage

#### Performance & Monitoring
- **Sentry Integration**: Error tracking and performance monitoring in production
- **Web Vitals Tracking**: CLS, FID, FCP, LCP, TTFB metrics (`src/utils/performance.ts`)
- **User Behavior Tracking**: Page views and interaction analytics
- **Image Optimization**: Lazy loading and compression utilities
- **Build Optimization**: Resource preloading and production optimizations

### Key Directories Structure
```
src/
├── components/          # Feature-based React components
│   ├── assistant/      # AI chat functionality
│   ├── auth/          # Authentication components
│   ├── monitoring/    # Performance dashboards
│   ├── navigation/    # Navbar, Footer
│   ├── production/    # Error boundaries, fallbacks
│   ├── profile/       # User profile management
│   └── ui/           # Reusable UI components (shadcn/ui)
├── contexts/          # React Context providers
├── hooks/            # Custom React hooks
├── pages/            # Route-level page components
├── types/            # TypeScript type definitions
├── utils/            # Utility functions and helpers
└── integrations/     # External service integrations
```

### Firebase Environment Setup
1. Copy `.env.template` to `.env.local`
2. Fill in Firebase configuration values (Firebase config + AI API keys)
3. Run `firebase login` and `firebase use --add`
4. Deploy security rules: `firebase deploy --only firestore:rules,storage:rules`
5. For local development with emulators: `firebase emulators:start`

### AI API Configuration
The application supports two AI providers:
- **OpenAI** (recommended): Set `VITE_OPENAI_API_KEY`
- **DeepSeek** (cost-effective): Set `VITE_DEEPSEEK_API_KEY`

AI features gracefully degrade when API keys are not provided.

### Development Workflow
1. The app runs on port 8080 by default
2. Firebase emulators can be used for local development (auth: 9099, firestore: 8080, storage: 9199)
3. Hot module replacement is enabled for fast development
4. TypeScript strict mode is enabled with path aliases (`@/` maps to `src/`)
5. Use conventional commits: `type(scope): description` (feat, fix, docs, style, refactor, test, chore)

### Deployment Commands
```bash
# Build for production deployment
npm run build

# Preview production build locally
npm run preview

# Deploy via automated GitHub Actions (push to main)
git push origin main

# Manual deployment scripts
./deploy.sh  # Production deployment script
```

### Testing Configuration
- **Vitest** for unit and integration testing
- **jsdom** environment for DOM testing
- **Testing Library** for component testing
- Test setup file at `src/test/setup.ts`
- Path aliases configured for tests
- AI features should be tested with both enabled and disabled states

### Production Features
- **Automated CI/CD**: GitHub Actions deploy to Netlify/Vercel on push
- **Error Monitoring**: Sentry integration for production error tracking
- **Performance Monitoring**: Web Vitals and Firebase Analytics
- **PWA Support**: Service worker, offline functionality, app manifest
- **Docker Support**: Containerized deployment with nginx
- **Security**: Comprehensive Firestore/Storage rules, CSRF/XSS protection
