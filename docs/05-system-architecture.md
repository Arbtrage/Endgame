# System Architecture

## Document Metadata

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Approved for Implementation |
| Last Updated | 2026-07-30 |

---

## Architecture Overview

The system follows a **dual-engine, client-heavy** architecture deployed entirely on Vercel with Neon PostgreSQL. Analytical computation (Stockfish) runs in the browser; intelligence and persistence run on the server.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                            │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │   Next.js    │  │  Stockfish   │  │   chess.js + Board UI    │  │
│  │   React UI   │  │  WASM Worker │  │   (react-chessboard)     │  │
│  └──────┬───────┘  └──────────────┘  └──────────────────────────┘  │
│         │                                                           │
│         │  HTTPS (API calls, Server Actions)                        │
└─────────┼───────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    VERCEL (Serverless)                              │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Route        │  │ Server       │  │  Better Auth             │  │
│  │ Handlers     │  │ Actions      │  │  (session management)    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────────────┘  │
│         │                 │                                         │
│         ▼                 ▼                                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Service Layer                              │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐  │  │
│  │  │ AI Provider│  │ Game       │  │ User / Progress        │  │  │
│  │  │ Abstraction│  │ Service    │  │ Service                │  │  │
│  │  └─────┬──────┘  └────────────┘  └────────────────────────┘  │  │
│  └────────┼─────────────────────────────────────────────────────┘  │
│           │                                                         │
└───────────┼─────────────────────────────────────────────────────────┘
            │
            ├──────────────────┐
            ▼                  ▼
   ┌────────────────┐  ┌────────────────┐
   │  Gemini API    │  │ Neon PostgreSQL│
   │  (Google AI)   │  │  (via Prisma)  │
   └────────────────┘  └────────────────┘
```

---

## Core Architectural Principles

### 1. Dual Engine Separation

| Concern | Owner | Location |
|---------|-------|----------|
| Move legality | chess.js | Client + Server |
| Best move / evaluation | Stockfish | Client only |
| Explanations / coaching | Gemini | Server only |
| AI opponent moves | Gemini (+ validation) | Server |
| Data persistence | Prisma | Server |

**Rule:** The backend NEVER invokes Stockfish. If a server-side evaluation is ever needed (e.g., validating Gemini's move quality), use cached client-submitted evaluations, not live engine computation.

### 2. Feature-Driven Modularity

Code is organized by feature domain, not technical layer:

```
src/features/
├── auth/
├── game/
├── analysis/
├── coaching/
├── training/
├── dashboard/
└── settings/
```

Each feature owns its components, hooks, stores, types, and server logic.

### 3. Provider Abstraction

External services are accessed through interfaces:

```typescript
// Conceptual — not implementation code
interface AIProvider {
  generateMove(params: MoveGenerationParams): Promise<Move>;
  explainPosition(params: ExplainParams): Promise<Explanation>;
  generateLesson(params: LessonParams): Promise<Lesson>;
  chat(params: ChatParams): Promise<ChatResponse>;
}
```

Implementations: `GeminiProvider` (v1). Future: `OpenAIProvider`.

### 4. Client-First Game State

During active gameplay:
- Board state lives in client Zustand store
- Moves validated locally via chess.js
- Stockfish runs in Web Worker
- Server syncs on move (debounced) and on game completion

### 5. Server-Authoritative Persistence

- All database writes go through server
- Client never holds database credentials
- Optimistic UI updates with server reconciliation

---

## Layer Architecture

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│  (React Components, Pages, Layouts)     │
├─────────────────────────────────────────┤
│           Application Layer             │
│  (Hooks, Stores, TanStack Query)        │
├─────────────────────────────────────────┤
│             Domain Layer                │
│  (Business Logic, Game Rules, Types)    │
├─────────────────────────────────────────┤
│           Infrastructure Layer          │
│  (API Clients, AI Provider, DB, Auth)   │
└─────────────────────────────────────────┘
```

### Dependency Rule
Dependencies point inward. Presentation depends on Application; Application depends on Domain; Infrastructure implements Domain interfaces.

---

## Deployment Topology

```
                    ┌──────────────┐
                    │   Vercel CDN  │
                    │  (Static/SSR) │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ Serverless│ │ Serverless│ │ Edge     │
        │ Functions │ │ Functions │ │ Middleware│
        │ (API)     │ │ (Actions)│ │ (Auth)   │
        └─────┬────┘ └─────┬────┘ └──────────┘
              │            │
              └──────┬─────┘
                     ▼
              ┌──────────────┐
              │ Neon Postgres │
              │ (Pooled)      │
              └──────────────┘

External:
  - Gemini API (Google)
  - Google OAuth (via Better Auth)
```

### Vercel Configuration Notes
- **Serverless function timeout:** 30s max (Pro plan) — sufficient for Gemini calls
- **Edge middleware:** Auth session validation on protected routes
- **Static assets:** Stockfish WASM files in `/public/engine/`
- **Environment variables:** All secrets in Vercel project settings

---

## Data Flow Diagrams

### Game Move Flow (Computer Mode)

```
User click → chess.js.validate() → Zustand update → Board re-render
                                          │
                                          ▼
                              Stockfish Worker.postMessage(fen)
                                          │
                                          ▼
                              Worker.onmessage(bestmove)
                                          │
                                          ▼
                              chess.js.apply() → Zustand update
                                          │
                                          ▼
                              Debounced POST /api/games/{id}/moves
```

### AI Coach Explanation Flow

```
Key moment detected (client Stockfish eval)
        │
        ▼
POST /api/coach/explain-moment
  Body: { fen, moves[], evalBefore, evalAfter, classification, userLevel }
        │
        ▼
Server: AIProvider.explainPosition()
        │
        ▼
Gemini API call (structured prompt)
        │
        ▼
Response: { explanation, concepts[], suggestedFollowUp? }
        │
        ▼
Client: Display in coach panel
        │
        ▼
Optional: POST /api/coach/chat (follow-up)
```

---

## Module Boundaries

| Module | Responsibility | Depends On |
|--------|---------------|------------|
| `features/game` | Board UI, move logic, game lifecycle | chess.js, stockfish client, Zustand |
| `features/analysis` | Eval graph, move classification display | stockfish client, game data |
| `features/coaching` | Coach panel, chat, explanations | AI provider (via API) |
| `features/training` | Lessons, puzzles, progress | AI provider, stockfish client |
| `features/auth` | Sign in/up, session | Better Auth |
| `features/dashboard` | Home, stats, reports | All feature APIs |
| `shared/engine` | Stockfish worker wrapper | WASM |
| `shared/ai` | AI provider interface + Gemini impl | Gemini SDK |
| `shared/db` | Prisma client, repositories | Neon |
| `shared/ui` | Design system components | shadcn/ui |

---

## Cross-Cutting Concerns

| Concern | Implementation | Document |
|---------|---------------|----------|
| Authentication | Better Auth + middleware | [10-authentication.md](./10-authentication.md) |
| Error handling | Error boundaries + API error schema | [20-error-handling.md](./20-error-handling.md) |
| Logging | Structured JSON logs (server) | [21-logging.md](./21-logging.md) |
| Rate limiting | Upstash Redis or in-memory (Vercel) | [23-security.md](./23-security.md) |
| Caching | TanStack Query (client), unstable_cache (server) | [22-performance.md](./22-performance.md) |
| Telemetry | Vercel Analytics + custom events | [26-monitoring.md](./26-monitoring.md) |

---

## Scalability Considerations

### Current (v1) — Single Region
- Vercel serverless auto-scales
- Neon connection pooling (PgBouncer mode)
- Client-side Stockfish eliminates server compute bottleneck

### Future Scaling Triggers

| Trigger | Action |
|---------|--------|
| > 100 Gemini req/s | Request queuing, response caching for common positions |
| > 10K concurrent DB connections | Neon autoscaling, read replicas |
| Global latency complaints | Vercel Edge for static; multi-region Neon |
| Stockfish too slow on mobile | Lighter WASM build, lower default depth |

---

## Technology Decisions & Rationale

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| Next.js App Router | SSR, API routes, Vercel-native | Remix, SvelteKit |
| Stockfish WASM (client) | Zero server compute, instant analysis | Server-side Stockfish (rejected) |
| Gemini | Strong reasoning, structured output, cost | OpenAI, Claude (abstracted for future) |
| Neon PostgreSQL | Serverless Postgres, Vercel integration | Supabase, PlanetScale |
| Prisma | Type-safe ORM, migration tooling | Drizzle |
| Better Auth | Modern, Next.js-native, extensible | NextAuth, Clerk |
| Zustand | Lightweight, no boilerplate for game state | Redux, Jotai |
| TanStack Query | Server state caching, invalidation | SWR |
| Feature-driven folders | Scalable, team-friendly | Layer-based (rejected) |

---

## Assumptions

| ID | Assumption |
|----|------------|
| SA-1 | Next.js 15+ App Router (project scaffolded with Next.js 16) |
| SA-2 | Vercel Pro plan for 30s function timeout |
| SA-3 | Single Neon project with pooled connection string |
| SA-4 | Gemini 2.0 Flash as primary model (fast, cost-effective) |
| SA-5 | No WebSocket requirement (polling/debounce for game sync) |
| SA-6 | English-only UI and AI responses for v1 |

---

## Document References

- [06-frontend-architecture.md](./06-frontend-architecture.md)
- [07-backend-architecture.md](./07-backend-architecture.md)
- [11-stockfish-architecture.md](./11-stockfish-architecture.md)
- [12-gemini-architecture.md](./12-gemini-architecture.md)
- [19-folder-structure.md](./19-folder-structure.md)
