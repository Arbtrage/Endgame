# Backend Architecture

## Document Metadata

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Approved for Implementation |
| Last Updated | 2026-07-30 |

---

## Overview

The backend is embedded within the Next.js application using Route Handlers (`app/api/`) and Server Actions. There is no separate backend service. All server logic runs as Vercel serverless functions.

**Critical rule:** The backend NEVER runs Stockfish or any chess engine computation.

---

## Server Architecture Layers

```
┌─────────────────────────────────────────┐
│          Route Handlers / Actions       │  ← HTTP boundary, validation, auth
├─────────────────────────────────────────┤
│              Service Layer              │  ← Business logic orchestration
├─────────────────────────────────────────┤
│            Repository Layer             │  ← Database access via Prisma
├─────────────────────────────────────────┤
│          Infrastructure Layer           │  ← AI provider, email, external APIs
└─────────────────────────────────────────┘
```

---

## Directory Structure

```
src/server/
├── api/                    # Route handler utilities
│   ├── middleware.ts       # Auth check, rate limit, error wrapper
│   ├── validation.ts       # Zod schemas for request bodies
│   └── response.ts         # Standardized response helpers
├── services/
│   ├── game.service.ts
│   ├── analysis.service.ts
│   ├── coaching.service.ts
│   ├── training.service.ts
│   ├── user.service.ts
│   └── report.service.ts
├── repositories/
│   ├── game.repository.ts
│   ├── analysis.repository.ts
│   ├── chat.repository.ts
│   ├── lesson.repository.ts
│   └── user.repository.ts
├── ai/
│   ├── provider.interface.ts
│   ├── gemini.provider.ts
│   ├── prompts/            # Prompt templates by feature
│   └── parser.ts           # Parse structured Gemini responses
└── actions/                # Server Actions (mutations)
    ├── game.actions.ts
    ├── user.actions.ts
    └── settings.actions.ts
```

---

## Route Handler Pattern

Every API route follows this structure:

```typescript
// Pattern (not implementation code)
export async function POST(request: Request) {
  // 1. Authenticate
  const session = await requireAuth(request);
  
  // 2. Validate input
  const body = await validateBody(request, schema);
  
  // 3. Authorize (resource ownership)
  await authorize(session.userId, body.gameId);
  
  // 4. Execute business logic
  const result = await gameService.makeMove(body);
  
  // 5. Return standardized response
  return apiResponse.success(result);
}
```

### Standard Response Envelope

```typescript
// Success
{ data: T, meta?: { page?, total? } }

// Error
{ error: { code: string, message: string, details?: unknown } }
```

### Error Codes

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `UNAUTHORIZED` | 401 | No valid session |
| `FORBIDDEN` | 403 | Not resource owner |
| `NOT_FOUND` | 404 | Resource missing |
| `VALIDATION_ERROR` | 400 | Invalid input |
| `RATE_LIMITED` | 429 | Too many requests |
| `AI_UNAVAILABLE` | 503 | Gemini timeout/error |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Service Layer

Services orchestrate business logic and coordinate between repositories and AI provider.

### GameService

| Method | Description |
|--------|-------------|
| `createGame(userId, config)` | Create game record, return gameId |
| `recordMove(gameId, move)` | Append move to game |
| `completeGame(gameId, result)` | Set status, result, final PGN |
| `getGame(gameId)` | Fetch game with moves |
| `listGames(userId, filters)` | Paginated game history |
| `requestAIMove(gameId, fen, personality)` | Gemini move generation + validation |

### CoachingService

| Method | Description |
|--------|-------------|
| `explainMoment(params)` | Generate explanation for key moment |
| `explainMove(params)` | Explain specific move in analysis |
| `generateGameSummary(gameId)` | Post-game narrative |
| `chat(userId, message, context)` | Coach chat with context injection |
| `getChatHistory(userId, sessionId)` | Retrieve chat messages |

### TrainingService

| Method | Description |
|--------|-------------|
| `getRecommendations(userId)` | Weakness-based lesson suggestions |
| `generateLesson(userId, topic)` | Create lesson via Gemini |
| `getLesson(lessonId)` | Fetch lesson with exercises |
| `recordProgress(userId, lessonId, exerciseIndex, result)` | Save exercise result |
| `getStudyPlan(userId)` | Active study plan |

### AnalysisService

| Method | Description |
|--------|-------------|
| `saveAnalysis(gameId, analysisData)` | Store client-computed analysis |
| `getAnalysis(gameId)` | Retrieve stored analysis |
| `importPGN(userId, pgn)` | Parse and create game from PGN |

### ReportService

| Method | Description |
|--------|-------------|
| `generateWeeklyReport(userId)` | Aggregate stats + Gemini narrative |
| `getReport(userId, weekId)` | Fetch existing report |

---

## AI Provider Integration

All Gemini calls go through the AI provider abstraction:

```
Route Handler → Service → AIProvider → GeminiProvider → Google API
```

The service layer never imports Gemini SDK directly. See [12-gemini-architecture.md](./12-gemini-architecture.md).

### Move Validation for AI Opponent

When Gemini returns a move:

1. Parse move from structured response
2. Validate with chess.js on server (server maintains game state copy)
3. If illegal: retry once with error feedback to Gemini
4. If still illegal: fallback to random legal move (logged as error)
5. Return validated move to client

---

## Server Actions

Used for simple mutations where Route Handlers are overkill:

| Action | Purpose |
|--------|---------|
| `updateProfile` | Update display name, avatar |
| `updateSettings` | Board theme, defaults |
| `deleteAccount` | GDPR account deletion |
| `resignGame` | Resign active game |

Server Actions use the same service layer as Route Handlers.

---

## Authentication Middleware

```typescript
// Applied to all /api/* routes except public ones
const publicRoutes = [
  '/api/auth/*',       // Better Auth handles its own
  '/api/health',       // Health check
];

// requireAuth() extracts session from Better Auth
// Returns { userId, email, name } or throws 401
```

---

## Rate Limiting

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| AI endpoints (coach, move, lesson) | 30 req | 1 min |
| AI chat | 20 req | 1 min |
| Game mutations | 60 req | 1 min |
| Read endpoints | 120 req | 1 min |
| Unauthenticated (demo) | 5 req | 1 min |

Implementation: Vercel KV or in-memory sliding window (see [23-security.md](./23-security.md)).

---

## Background Jobs

Vercel does not support long-running workers. Background tasks use:

| Task | Trigger | Implementation |
|------|---------|----------------|
| Weekly report generation | Vercel Cron (Monday 6am UTC) | `/api/cron/weekly-reports` |
| Lesson recommendation refresh | On-demand + cache (24h TTL) | Generated on first request of day |
| Stale game cleanup | Vercel Cron (daily) | Mark abandoned games (>24h inactive) |

### Cron Route Protection

```typescript
// Cron routes verify CRON_SECRET header from Vercel
if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
  return new Response('Unauthorized', { status: 401 });
}
```

---

## Caching Strategy

| Data | Cache | TTL | Invalidation |
|------|-------|-----|--------------|
| User profile | `unstable_cache` | 5 min | On update |
| Game list | TanStack Query (client) | 30 sec | On new game |
| Analysis results | DB (permanent) + client cache | ∞ | Never (immutable) |
| Training recommendations | `unstable_cache` | 24 hours | On lesson complete |
| Weekly report | DB (permanent) | ∞ | Weekly regeneration |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon pooled connection string |
| `DIRECT_URL` | Yes | Neon direct connection (migrations) |
| `BETTER_AUTH_SECRET` | Yes | Auth encryption secret |
| `BETTER_AUTH_URL` | Yes | App URL for auth callbacks |
| `GOOGLE_CLIENT_ID` | Yes | OAuth |
| `GOOGLE_CLIENT_SECRET` | Yes | OAuth |
| `GEMINI_API_KEY` | Yes | Google AI API key |
| `CRON_SECRET` | Yes | Cron route protection |
| `UPSTASH_REDIS_REST_URL` | No | Rate limiting (if using Upstash) |
| `UPSTASH_REDIS_REST_TOKEN` | No | Rate limiting |

---

## Request Validation

All request bodies validated with Zod schemas colocated with route handlers:

```
src/server/api/schemas/
├── game.schema.ts
├── coaching.schema.ts
├── training.schema.ts
└── user.schema.ts
```

Example schema concepts:

```typescript
// createGameSchema
{
  mode: enum ['computer', 'ai_opponent', 'coach'],
  color: enum ['white', 'black', 'random'],
  stockfishLevel?: number,     // 1-20
  aiPersonality?: string,
  timeControl?: { initial: number, increment: number }
}
```

---

## Database Connection Management

```typescript
// Prisma client singleton (prevents connection exhaustion in serverless)
// src/shared/db/prisma.ts

// Use pooled DATABASE_URL for queries
// Use DIRECT_URL for migrations only
// Connection limit: configured in Neon dashboard (default 100 pooled)
```

---

## Assumptions

| ID | Assumption |
|----|------------|
| BA-1 | Vercel Pro plan (30s function timeout, cron jobs) |
| BA-2 | Single serverless region (iad1 / Washington DC) |
| BA-3 | No file upload storage needed beyond avatar (Vercel Blob or base64 in DB) |
| BA-4 | chess.js runs on server for move validation only, not analysis |
| BA-5 | Max PGN size: 10KB ( ~500 half-moves, sufficient for any game) |

---

## Document References

- [05-system-architecture.md](./05-system-architecture.md)
- [08-database-design.md](./08-database-design.md)
- [09-api-design.md](./09-api-design.md)
- [10-authentication.md](./10-authentication.md)
- [12-gemini-architecture.md](./12-gemini-architecture.md)
