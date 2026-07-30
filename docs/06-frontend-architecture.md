# Frontend Architecture

## Document Metadata

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Approved for Implementation |
| Last Updated | 2026-07-30 |

---

## Overview

The frontend is a Next.js App Router application using React Server Components (RSC) where beneficial and Client Components for interactive features (board, animations, 3D). The architecture prioritizes performance, modularity, and a premium user experience.

---

## Rendering Strategy

| Page/Feature | Rendering | Rationale |
|--------------|-----------|-----------|
| Landing page | SSR + Client (3D) | SEO, fast FCP, 3D hero |
| Dashboard | RSC shell + Client widgets | Auth-gated data, interactive cards |
| Game board | Client only | Heavy interactivity, WASM worker |
| Analysis view | RSC metadata + Client board/graph | Mixed static/dynamic |
| Training lessons | Client | Interactive puzzles |
| Settings | RSC + Client forms | Simple CRUD |
| Auth pages | Client | Form interactivity |

### RSC vs Client Decision Tree

```
Does it use useState, useEffect, event handlers, or browser APIs?
  YES → "use client"
  NO  → Can it fetch data on server?
          YES → Server Component
          NO  → Server Component (static)
```

---

## Application Shell

```
app/
├── layout.tsx              # Root: fonts, providers, analytics
├── (marketing)/
│   ├── layout.tsx          # Marketing shell (no auth sidebar)
│   └── page.tsx            # Landing
├── (auth)/
│   ├── layout.tsx          # Centered auth layout
│   ├── sign-in/page.tsx
│   └── sign-up/page.tsx
├── (app)/
│   ├── layout.tsx          # Authenticated shell: sidebar, coach FAB
│   ├── dashboard/page.tsx
│   ├── play/...
│   ├── analyze/...
│   ├── train/...
│   ├── progress/page.tsx
│   └── settings/page.tsx
└── demo/page.tsx           # Guest demo (minimal shell)
```

### Provider Tree (Client)

```tsx
// Conceptual provider nesting in root client wrapper
<QueryClientProvider>
  <ThemeProvider>
    <AuthProvider>
      <TooltipProvider>
        {children}
        <CoachFab />          {/* Global coach chat trigger */}
        <Toaster />
      </TooltipProvider>
    </AuthProvider>
  </ThemeProvider>
</QueryClientProvider>
```

---

## Feature Module Structure

Each feature follows this internal structure:

```
src/features/{feature}/
├── components/          # Feature-specific UI
├── hooks/               # Feature-specific hooks
├── stores/              # Zustand stores (if needed)
├── api/                 # TanStack Query hooks + fetchers
├── types/               # TypeScript types
├── utils/               # Feature utilities
└── index.ts             # Public API barrel export
```

### Feature List

| Feature | Key Components | State |
|---------|---------------|-------|
| `game` | GameBoard, MoveList, GameControls, GameSetup | Zustand (gameStore) |
| `analysis` | EvalGraph, MoveClassification, AnalysisBoard | TanStack Query + local |
| `coaching` | CoachPanel, CoachChat, CoachMessage | TanStack Query |
| `training` | LessonView, PuzzleBoard, TrainingHub | TanStack Query + local |
| `dashboard` | StatsCards, RecentGames, StreakBadge | TanStack Query |
| `auth` | SignInForm, SignUpForm, OAuthButtons | Better Auth client |
| `settings` | ProfileForm, BoardThemePicker | TanStack Query |

---

## Component Architecture

### Component Categories

```
shared/ui/           → shadcn/ui primitives (Button, Dialog, etc.)
shared/components/   → Cross-feature composites (PageHeader, EmptyState)
features/*/components → Feature-specific components
app/**/page.tsx      → Page orchestrators (compose features)
```

### Component Design Rules

1. **Single responsibility** — One component, one job
2. **Props over context** — Unless deeply nested tree (>3 levels)
3. **Composition over configuration** — Prefer children over boolean prop matrices
4. **No data fetching in leaf components** — Fetch at page or feature hook level
5. **Colocate styles** — Tailwind classes in component file; no separate CSS modules

### Key Component Hierarchy (Game Page)

```
GamePage
├── GameHeader (mode, players, clock)
├── GameLayout
│   ├── BoardSection
│   │   ├── ChessBoard (react-chessboard wrapper)
│   │   ├── BoardControls (flip, resize)
│   │   └── MoveIndicator (last move highlight)
│   ├── SidePanel (variant: coach | chat | analysis)
│   │   ├── CoachPanel
│   │   ├── MoveList
│   │   └── EvalBar
│   └── GameControls (resign, draw, settings)
└── GameOverDialog
```

---

## 3D Integration (React Three Fiber)

### Where 3D Is Used

| Location | 3D Element | Purpose |
|----------|-----------|---------|
| Landing page hero | Floating chess pieces, particles | Brand impression |
| Dashboard header | Subtle particle field | Ambiance |
| AI Coach avatar | Animated 3D piece/avatar | Coach presence |
| Page transitions | Particle burst/wipe | Delight |
| Loading states | Rotating piece | Visual feedback |

### Where 3D Is NOT Used

- **Chess board during gameplay** — Always 2D (react-chessboard)
- **Analysis board** — 2D
- **Training puzzles** — 2D
- **Settings** — No 3D

### 3D Architecture

```
src/shared/three/
├── Canvas.tsx           # R3F canvas wrapper with defaults
├── LandingScene.tsx     # Landing page 3D scene
├── CoachAvatar.tsx      # AI coach 3D avatar
├── ParticleField.tsx    # Reusable particle system
├── TransitionEffect.tsx # Page transition overlay
└── hooks/
    └── useReducedMotion.ts  # Respect prefers-reduced-motion
```

### Performance Rules for 3D
- Lazy load all 3D scenes (`dynamic(() => import(...), { ssr: false })`)
- Disable 3D when `prefers-reduced-motion: reduce`
- Max 1 active R3F canvas per page
- Use `frameloop="demand"` when scene is static

---

## Animation Strategy (Framer Motion)

| Animation | Location | Trigger |
|-----------|----------|---------|
| Page transitions | Layout wrapper | Route change |
| Card hover | Dashboard cards | Mouse enter |
| Coach message appear | Coach panel | New message |
| Move sound + subtle shift | Board | Move played |
| Eval bar transition | Analysis | Eval change |
| Modal enter/exit | Dialogs | Open/close |
| Streak celebration | Dashboard | Streak milestone |

### Animation Principles
- Duration: 200–400ms for UI, 600–800ms for celebrations
- Easing: `[0.25, 0.1, 0.25, 1]` default
- Always respect `prefers-reduced-motion`
- Never animate layout-critical properties (width/height of board)

---

## Data Fetching Patterns

### Server State (TanStack Query)

```typescript
// Pattern: Feature API hooks
// src/features/game/api/useGame.ts

// Query keys follow convention:
// ['game', gameId]
// ['games', { status, mode, page }]
// ['analysis', gameId]
// ['training', 'lessons']
// ['training', 'lesson', lessonId]
// ['coach', 'chat', sessionId]
// ['user', 'profile']
// ['user', 'progress']
// ['reports', 'weekly', weekId]
```

### Client State (Zustand)

Used only for high-frequency, local state:

| Store | State |
|-------|-------|
| `gameStore` | fen, moves[], status, selectedSquare, pendingPromotion |
| `boardStore` | orientation, theme, lastMove, highlightSquares |
| `uiStore` | sidebarOpen, coachPanelOpen, activeModal |

### Optimistic Updates

| Action | Optimistic | Rollback |
|--------|-----------|----------|
| Make move | Update board immediately | Revert on validation failure |
| Send chat message | Show in chat immediately | Remove on API error |
| Complete lesson exercise | Mark done in UI | Revert on save failure |

---

## Routing & Layout

See [18-navigation.md](./18-navigation.md) for full route map.

### Middleware

```typescript
// middleware.ts protects (app) routes
const protectedRoutes = ['/dashboard', '/play', '/analyze', '/train', '/progress', '/settings', '/coach'];
// Redirect unauthenticated → /auth/sign-in?callbackUrl=...
// Redirect authenticated from /auth/* → /dashboard
```

---

## WASM Worker Integration

Stockfish runs in a dedicated Web Worker, not on the main thread:

```
Main Thread                          Worker Thread
     │                                     │
     ├─ postMessage({ cmd: 'evaluate', fen }) ──►│ Stockfish WASM
     │                                     │     ├─ setPosition(fen)
     │◄── onmessage({ eval, bestMove }) ───│     └─ go depth 18
     │                                     │
     ├─ Update eval bar / make move        │
```

Worker managed by `src/shared/engine/stockfish-worker.ts` singleton.

---

## Error Boundaries

| Boundary | Scope | Fallback |
|----------|-------|----------|
| Root error boundary | Entire app | "Something went wrong" + reload |
| Game error boundary | Game feature | "Game error" + return to dashboard |
| 3D error boundary | R3F scenes | Silently hide 3D, show 2D fallback |
| Coach error boundary | Coach panel | "Coach unavailable" + retry |

---

## Accessibility

- Board squares: `role="grid"`, squares `role="gridcell"`
- Moves announced via `aria-live="polite"` region
- All interactive elements keyboard-accessible
- Focus trap in modals
- Color not sole indicator (icons + text for move classification)
- Minimum touch target: 44×44px on mobile

---

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| `sm` | 640px | Single column, stacked board |
| `md` | 768px | Board + side panel stacked |
| `lg` | 1024px | Board left, panel right |
| `xl` | 1280px | Full layout with sidebar nav |
| `2xl` | 1536px | Max-width container centered |

Mobile: Board fills width, panels become bottom sheets.

---

## Build & Bundle Strategy

| Concern | Strategy |
|---------|----------|
| Stockfish WASM (~7MB) | Lazy load on first game; cache in service worker (future) |
| Three.js | Dynamic import; separate chunk |
| shadcn/ui | Tree-shaken per component |
| Font | next/font, subset latin |
| Images | next/image, WebP |

### Target Bundle Sizes

| Route | First Load JS (target) |
|-------|----------------------|
| Landing | < 200KB (without 3D) |
| Dashboard | < 150KB |
| Game | < 250KB (without WASM) |
| WASM (lazy) | ~7MB (cached after first load) |

---

## Assumptions

| ID | Assumption |
|----|------------|
| FA-1 | react-chessboard v4+ with custom square rendering |
| FA-2 | Tailwind CSS v4 (project already configured) |
| FA-3 | shadcn/ui initialized with "new-york" style, zinc base |
| FA-4 | Dark mode default; light mode supported |
| FA-5 | No SSR for board components (WASM, interactivity) |

---

## Document References

- [05-system-architecture.md](./05-system-architecture.md)
- [13-game-engine.md](./13-game-engine.md)
- [14-state-management.md](./14-state-management.md)
- [15-ui-design-system.md](./15-ui-design-system.md)
- [16-component-library.md](./16-component-library.md)
