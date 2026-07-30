# Phase 1: Foundation

## Document Metadata

| Field | Value |
|-------|-------|
| Phase | 1 of 5 |
| Version | v0.1.0 |
| Duration | ~2 weeks |
| Status | Ready for Implementation |
| Depends On | Nothing (greenfield) |

---

## Overview

Phase 1 establishes the project foundation: repository structure, database, authentication, design system, landing page, and authenticated app shell. At the end of this phase, users can sign up, sign in, and see a dashboard — but cannot yet play chess.

This phase produces a deployable application with auth and navigation, validating the entire infrastructure stack before chess features are built.

---

## Objectives

1. Scaffold the project with Feature-Driven Architecture folder structure
2. Set up Neon PostgreSQL with Prisma ORM and run initial migration
3. Implement authentication with Better Auth (email + Google OAuth)
4. Initialize the design system (shadcn/ui, Tailwind, dark theme)
5. Build the landing page with 3D hero scene
6. Build the authenticated app shell (sidebar, navigation, layout)
7. Create the dashboard page (static content, no game data yet)
8. Deploy to Vercel with production database

---

## Deliverables

| # | Deliverable | Verification |
|---|-------------|-------------|
| D1 | Project folder structure per [19-folder-structure.md](../19-folder-structure.md) | Directory tree matches spec |
| D2 | Prisma schema with auth + user settings tables | Migration runs successfully |
| D3 | Better Auth: sign up, sign in, sign out, Google OAuth | Manual auth flow test |
| D4 | shadcn/ui initialized with custom dark theme | Visual inspection |
| D5 | Landing page with 3D hero | Page loads, 3D renders |
| D6 | App shell with sidebar navigation | All nav links route correctly |
| D7 | Dashboard page (welcome, empty states) | Authenticated user sees dashboard |
| D8 | Middleware protecting authenticated routes | Unauthenticated redirect works |
| D9 | Deployed to Vercel with Neon database | Production URL accessible |
| D10 | `.env.example` with all required variables | File committed to repo |

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Project scaffolding | Folder structure, configs, dependencies | P0 |
| Database setup | Neon + Prisma + initial migration | P0 |
| Email auth | Sign up, sign in, sign out | P0 |
| Google OAuth | One-click Google sign in | P0 |
| Design system | shadcn/ui, Tailwind tokens, dark theme | P0 |
| Landing page | Marketing page with 3D hero, CTA | P0 |
| App shell | Sidebar, top bar, responsive layout | P0 |
| Dashboard | Welcome message, empty state cards | P0 |
| Settings page | Profile form (name only), placeholder sections | P1 |
| Onboarding | Optional skill level selection post-signup | P1 |
| Health check API | GET /api/health | P0 |

---

## User Stories

| ID | Story | Acceptance |
|----|-------|------------|
| US-1.1 | As a visitor, I want to see an attractive landing page so I understand what the product offers | Landing page loads with 3D hero, feature highlights, CTA |
| US-1.2 | As a visitor, I want to sign up with email so I can create an account | Sign up form works, redirects to dashboard |
| US-1.3 | As a visitor, I want to sign in with Google so I can start quickly | Google OAuth flow completes, redirects to dashboard |
| US-1.4 | As a user, I want to sign in with email so I can access my account | Sign in form works, session persists on refresh |
| US-1.5 | As a user, I want to see a dashboard after signing in so I know I'm logged in | Dashboard shows welcome with user name |
| US-1.6 | As a user, I want to navigate between sections so I can explore the app | Sidebar links route to correct pages (empty states) |
| US-1.7 | As a user, I want to sign out so I can secure my account | Sign out clears session, redirects to landing |
| US-1.8 | As a user, I want to update my display name so my profile is personalized | Settings form saves name to database |

---

## UI Screens

| Screen | Route | State |
|--------|-------|-------|
| Landing Page | `/` | Public, 3D hero, feature cards, CTA buttons |
| Sign In | `/auth/sign-in` | Email form + Google button |
| Sign Up | `/auth/sign-up` | Email form + Google button |
| Onboarding | `/dashboard` (first visit) | Skill level selector modal |
| Dashboard | `/dashboard` | Welcome, empty state cards for Play/Analyze/Train |
| Settings | `/settings` | Profile name edit, placeholder sections |
| Play (empty) | `/play/computer` | "Coming in Phase 2" or disabled state |
| Analyze (empty) | `/analyze` | Empty state |
| Train (empty) | `/train` | Empty state |
| Progress (empty) | `/progress` | Empty state |
| 404 | `/not-found` | Custom not-found page |

---

## APIs

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | Public | Health check |
| POST | `/api/auth/sign-up/email` | Public | Better Auth |
| POST | `/api/auth/sign-in/email` | Public | Better Auth |
| POST | `/api/auth/sign-in/social` | Public | Better Auth |
| POST | `/api/auth/sign-out` | Yes | Better Auth |
| GET | `/api/auth/session` | Optional | Better Auth |
| GET | `/api/user/profile` | Yes | Get user profile |
| PATCH | `/api/user/profile` | Yes | Update display name |
| GET | `/api/user/settings` | Yes | Get user settings |
| PATCH | `/api/user/settings` | Yes | Update settings |

---

## Database Changes

### Initial Migration

Tables created:
- `users` (with chess-specific fields)
- `accounts` (Better Auth)
- `sessions` (Better Auth)
- `verifications` (Better Auth)
- `user_settings` (defaults)

No game, analysis, or training tables yet (Phase 2+).

### Seed Data

- 1 demo user (development only)
- Default settings for demo user

---

## Components

### shadcn/ui Primitives to Install

`button`, `input`, `label`, `card`, `dialog`, `dropdown-menu`, `avatar`, `separator`, `skeleton`, `toast`, `sonner`, `badge`

### Shared Components

| Component | Description |
|-----------|-------------|
| `AppShell` | Authenticated layout with sidebar |
| `MarketingShell` | Landing page layout |
| `AuthShell` | Centered auth card |
| `Sidebar` | Navigation sidebar |
| `MobileNav` | Bottom nav for mobile |
| `PageHeader` | Page title + description |
| `EmptyState` | Generic empty state |

### Feature Components

| Component | Feature |
|-----------|---------|
| `SignInForm` | auth |
| `SignUpForm` | auth |
| `OAuthButtons` | auth |
| `OnboardingWizard` | auth |
| `DashboardHero` | dashboard |
| `QuickActions` | dashboard |
| `ProfileForm` | settings |

### 3D Components

| Component | Description |
|-----------|-------------|
| `ThreeCanvas` | R3F canvas wrapper |
| `LandingScene` | Floating chess pieces + particles |

---

## Libraries

### New Dependencies

| Package | Purpose |
|---------|---------|
| `@prisma/client`, `prisma` | Database ORM |
| `better-auth` | Authentication |
| `@tanstack/react-query` | Server state management |
| `zustand` | Client state (uiStore) |
| `@react-three/fiber`, `@react-three/drei`, `three` | 3D landing page |
| `framer-motion` | Page transitions, animations |
| `zod` | Input validation |
| `lucide-react` | Icons |
| `class-variance-authority`, `clsx`, `tailwind-merge` | shadcn/ui utilities |
| `@radix-ui/*` | shadcn/ui primitives (via shadcn install) |

---

## Folder Changes

```
CREATE  src/features/auth/
CREATE  src/features/dashboard/
CREATE  src/features/settings/
CREATE  src/shared/ui/
CREATE  src/shared/components/
CREATE  src/shared/three/
CREATE  src/shared/api/
CREATE  src/shared/auth/
CREATE  src/shared/db/
CREATE  src/shared/hooks/
CREATE  src/shared/lib/
CREATE  src/server/api/
CREATE  src/server/services/
CREATE  src/server/repositories/
CREATE  prisma/
CREATE  app/(marketing)/
CREATE  app/(auth)/
CREATE  app/(app)/
CREATE  app/api/
CREATE  middleware.ts
UPDATE  app/globals.css (design tokens)
UPDATE  next.config.ts (headers)
UPDATE  tsconfig.json (path aliases)
CREATE  components.json (shadcn config)
CREATE  .env.example
```

---

## Edge Cases

| Case | Handling |
|------|----------|
| OAuth popup blocked | Show error message, suggest allowing popups |
| Email already registered | Redirect to sign in with message |
| Invalid email format | Client + server validation |
| Password too short | Min 8 chars, show validation error |
| Session expired mid-use | Redirect to sign in with callbackUrl |
| 3D fails to load | Hide 3D scene, show static hero image |
| Database connection failure | Health check returns degraded, show maintenance page |
| Mobile viewport | Responsive sidebar → bottom nav |

---

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Better Auth setup complexity | Delays auth by 1–2 days | Follow official Next.js guide exactly |
| shadcn/ui v4 + Tailwind v4 compatibility | UI setup issues | Pin versions, test early |
| Neon connection in serverless | Connection exhaustion | Use pooled connection string from day 1 |
| 3D landing page performance | Slow FCP on landing | Lazy load R3F, static fallback |

---

## Testing Strategy

| Test | Type | Coverage |
|------|------|----------|
| Auth service (sign up validation) | Unit | Email validation, password rules |
| User service (profile update) | Unit | Update name, get profile |
| Health check endpoint | Integration | Returns 200 |
| SignInForm renders and validates | Component | Form validation errors |
| SignUpForm renders and validates | Component | Form validation errors |
| Middleware redirects unauthenticated | Integration | 302 to sign-in |
| E2E: Sign up → Dashboard | E2E | Full auth flow |

---

## Acceptance Criteria

- [ ] User can sign up with email and password
- [ ] User can sign in with Google OAuth
- [ ] User can sign out
- [ ] Unauthenticated users redirected to sign in from protected routes
- [ ] Authenticated users see dashboard with their name
- [ ] Sidebar navigation routes to all pages (empty states OK)
- [ ] Landing page renders with 3D hero
- [ ] Dark theme applied consistently
- [ ] Settings page saves display name
- [ ] Health check endpoint returns 200
- [ ] Application deployed to Vercel
- [ ] Database migrations run in production
- [ ] No TypeScript errors, ESLint passes
- [ ] Lighthouse performance > 80 on landing page

---

## Exit Criteria

1. Production deployment accessible at Vercel URL
2. Auth flow works end-to-end (email + Google)
3. All navigation routes accessible (empty states acceptable)
4. CI pipeline running (type check, lint, build)
5. All acceptance criteria met
6. No P0 bugs open

**Phase 1 is complete when a user can sign up, sign in, and navigate the app shell — but cannot yet play chess.**

---

## Future Improvements (Deferred)

- Email verification
- Password reset flow
- Magic link auth
- Light mode
- Command palette
- Email notifications

---

## Document References

- [05-system-architecture.md](../05-system-architecture.md)
- [08-database-design.md](../08-database-design.md)
- [10-authentication.md](../10-authentication.md)
- [15-ui-design-system.md](../15-ui-design-system.md)
- [19-folder-structure.md](../19-folder-structure.md)
- [phase-2.md](./phase-2.md)
