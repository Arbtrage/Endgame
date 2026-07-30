# Folder Structure

## Document Metadata

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Approved for Implementation |
| Last Updated | 2026-07-30 |

---

## Overview

Feature-Driven Architecture with clean separation between features, shared modules, and infrastructure. The `app/` directory contains only routing and page orchestration; business logic lives in `src/`.

---

## Complete Directory Tree

```
chess/
├── app/                              # Next.js App Router (routing only)
│   ├── (marketing)/
│   │   ├── layout.tsx
│   │   └── page.tsx                  # Landing page
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── sign-in/page.tsx
│   │   └── sign-up/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx                # AppShell wrapper
│   │   ├── dashboard/page.tsx
│   │   ├── play/
│   │   │   ├── computer/page.tsx
│   │   │   ├── ai/page.tsx
│   │   │   ├── coach/page.tsx
│   │   │   └── [gameId]/page.tsx
│   │   ├── analyze/
│   │   │   ├── page.tsx
│   │   │   └── [gameId]/page.tsx
│   │   ├── train/
│   │   │   ├── page.tsx
│   │   │   └── [lessonId]/page.tsx
│   │   ├── progress/page.tsx
│   │   ├── coach/page.tsx
│   │   └── settings/page.tsx
│   ├── demo/page.tsx
│   ├── api/
│   │   ├── auth/[...all]/route.ts
│   │   ├── health/route.ts
│   │   ├── games/
│   │   │   ├── route.ts              # POST create, GET list
│   │   │   └── [gameId]/
│   │   │       ├── route.ts          # GET detail, DELETE
│   │   │       ├── moves/route.ts
│   │   │       ├── complete/route.ts
│   │   │       ├── resign/route.ts
│   │   │       └── ai-move/route.ts
│   │   ├── analysis/
│   │   │   ├── import/route.ts
│   │   │   └── [gameId]/route.ts
│   │   ├── coach/
│   │   │   ├── explain-moment/route.ts
│   │   │   ├── explain-move/route.ts
│   │   │   ├── game-summary/route.ts
│   │   │   ├── chat/route.ts
│   │   │   └── chat/history/route.ts
│   │   ├── training/
│   │   │   ├── recommendations/route.ts
│   │   │   ├── lessons/route.ts
│   │   │   ├── lessons/[lessonId]/route.ts
│   │   │   ├── lessons/[lessonId]/progress/route.ts
│   │   │   └── study-plan/route.ts
│   │   ├── user/
│   │   │   ├── profile/route.ts
│   │   │   ├── settings/route.ts
│   │   │   ├── progress/route.ts
│   │   │   └── account/route.ts
│   │   ├── reports/
│   │   │   └── weekly/
│   │   │       ├── route.ts
│   │   │       ├── generate/route.ts
│   │   │       └── [weekId]/route.ts
│   │   └── cron/
│   │       ├── weekly-reports/route.ts
│   │       └── cleanup/route.ts
│   ├── layout.tsx                    # Root layout
│   ├── globals.css
│   └── not-found.tsx
│
├── src/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── SignInForm.tsx
│   │   │   │   ├── SignUpForm.tsx
│   │   │   │   ├── OAuthButtons.tsx
│   │   │   │   └── OnboardingWizard.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   └── index.ts
│   │   ├── game/
│   │   │   ├── components/
│   │   │   ├── engine/
│   │   │   ├── hooks/
│   │   │   ├── stores/
│   │   │   ├── api/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   ├── analysis/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── api/
│   │   │   ├── engine/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   ├── coaching/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── api/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   ├── training/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── api/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── api/
│   │   │   └── index.ts
│   │   ├── settings/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── api/
│   │   │   └── index.ts
│   │   └── progress/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── api/
│   │       └── index.ts
│   │
│   ├── shared/
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── components/               # Cross-feature composites
│   │   │   ├── AppShell.tsx
│   │   │   ├── MarketingShell.tsx
│   │   │   ├── AuthShell.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── GameCard.tsx
│   │   │   ├── EvalBar.tsx
│   │   │   └── ...
│   │   ├── three/                    # React Three Fiber
│   │   │   ├── Canvas.tsx
│   │   │   ├── LandingScene.tsx
│   │   │   ├── CoachAvatar.tsx
│   │   │   ├── ParticleField.tsx
│   │   │   └── hooks/
│   │   ├── engine/                   # Stockfish WASM
│   │   │   ├── stockfish-engine.ts
│   │   │   ├── stockfish-worker.ts
│   │   │   ├── classification.ts
│   │   │   ├── accuracy.ts
│   │   │   ├── key-moments.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── api/
│   │   │   ├── query-client.ts
│   │   │   ├── fetcher.ts
│   │   │   └── query-keys.ts
│   │   ├── auth/
│   │   │   ├── auth.ts              # Better Auth server config
│   │   │   └── auth-client.ts       # Better Auth client
│   │   ├── db/
│   │   │   └── prisma.ts            # Prisma client singleton
│   │   ├── hooks/
│   │   │   ├── useMediaQuery.ts
│   │   │   └── useReducedMotion.ts
│   │   ├── lib/
│   │   │   └── utils.ts             # cn() helper etc.
│   │   └── types/
│   │       └── common.types.ts
│   │
│   └── server/
│       ├── api/
│       │   ├── middleware.ts         # requireAuth, rateLimit
│       │   ├── validation.ts
│       │   ├── response.ts
│       │   └── schemas/
│       ├── services/
│       │   ├── game.service.ts
│       │   ├── analysis.service.ts
│       │   ├── coaching.service.ts
│       │   ├── training.service.ts
│       │   ├── user.service.ts
│       │   └── report.service.ts
│       ├── repositories/
│       │   ├── game.repository.ts
│       │   ├── analysis.repository.ts
│       │   ├── chat.repository.ts
│       │   ├── lesson.repository.ts
│       │   └── user.repository.ts
│       ├── ai/
│       │   ├── provider.interface.ts
│       │   ├── gemini.provider.ts
│       │   ├── factory.ts
│       │   ├── parser.ts
│       │   ├── prompts/
│       │   └── types.ts
│       └── actions/
│           ├── game.actions.ts
│           ├── user.actions.ts
│           └── settings.actions.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── public/
│   ├── engine/                       # Stockfish WASM files
│   │   ├── stockfish.wasm
│   │   ├── stockfish.js
│   │   └── stockfish-worker.js
│   └── pieces/                       # Custom piece sets (SVG)
│       └── standard/
│
├── docs/                             # This documentation
│   ├── 01-product-vision.md
│   ├── ...
│   └── phases/
│       ├── phase-1.md
│       └── ...
│
├── middleware.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── components.json                   # shadcn/ui config
├── .env.local                        # Local env (gitignored)
├── .env.example                      # Template
└── package.json
```

---

## Import Aliases

```json
// tsconfig.json paths
{
  "@/*": ["./src/*"],
  "@/features/*": ["./src/features/*"],
  "@/shared/*": ["./src/shared/*"],
  "@/server/*": ["./src/server/*"]
}
```

### Import Rules

| From | Can Import |
|------|-----------|
| `app/` | `@/features/*`, `@/shared/*` |
| `features/*` | `@/shared/*`, own feature |
| `shared/*` | Other `shared/*` only |
| `server/*` | `@/shared/db`, `@/shared/auth`, own server modules |
| Features CANNOT import other features directly | Use shared/ or API |

---

## Feature Module Anatomy

Every feature follows this structure:

```
src/features/{name}/
├── components/       # UI components (feature-specific)
├── hooks/            # Custom React hooks
├── stores/           # Zustand stores (if needed)
├── api/              # TanStack Query hooks + fetchers
├── engine/           # Client-side logic (if needed)
├── types/            # TypeScript types/interfaces
├── utils/            # Feature utilities
└── index.ts          # Public barrel exports
```

### Barrel Export Pattern

```typescript
// src/features/game/index.ts
export { GameBoard } from './components/GameBoard';
export { GameSetup } from './components/GameSetup';
export { useGame } from './hooks/useGame';
export { useGames, useCreateGame } from './api/useGames';
export type { GameMode, GameConfig } from './types/game.types';
```

---

## File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase.tsx | `GameBoard.tsx` |
| Hooks | camelCase with use prefix | `useGame.ts` |
| Stores | kebab-case with -store suffix | `game-store.ts` |
| Types | kebab-case with .types suffix | `game.types.ts` |
| Services | kebab-case with .service suffix | `game.service.ts` |
| Repositories | kebab-case with .repository suffix | `game.repository.ts` |
| API routes | route.ts (Next.js convention) | `route.ts` |
| Schemas | kebab-case with .schema suffix | `game.schema.ts` |
| Prompts | kebab-case | `move-generation.ts` |
| Tests | *.test.ts or *.test.tsx | `GameBoard.test.tsx` |

---

## What Goes Where (Decision Guide)

| Question | Answer |
|----------|--------|
| Is it a page/route? | `app/` |
| Is it a UI component used by one feature? | `src/features/{feature}/components/` |
| Is it a UI component used by 2+ features? | `src/shared/components/` |
| Is it a shadcn/ui primitive? | `src/shared/ui/` |
| Is it business logic (server)? | `src/server/services/` |
| Is it database access? | `src/server/repositories/` |
| Is it an API route? | `app/api/` (thin, delegates to service) |
| Is it a React hook? | Feature `hooks/` or `src/shared/hooks/` |
| Is it a type/interface? | Feature `types/` or `src/shared/types/` |
| Is it a Zustand store? | Feature `stores/` |
| Is it a TanStack Query hook? | Feature `api/` |
| Is it Stockfish-related? | `src/shared/engine/` |
| Is it AI/Gemini-related (server)? | `src/server/ai/` |
| Is it 3D/R3F? | `src/shared/three/` |

---

## Document References

- [05-system-architecture.md](./05-system-architecture.md)
- [06-frontend-architecture.md](./06-frontend-architecture.md)
- [07-backend-architecture.md](./07-backend-architecture.md)
- [27-coding-standards.md](./27-coding-standards.md)
