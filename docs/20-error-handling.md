# Error Handling

## Document Metadata

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Approved for Implementation |
| Last Updated | 2026-07-30 |

---

## Overview

Consistent error handling across client and server. Errors are typed, logged, and presented to users in a friendly, actionable way. Internal details are never exposed to users.

---

## Error Classification

| Category | Code Range | User Message Style |
|----------|-----------|-------------------|
| Validation | 400 | Specific field errors |
| Authentication | 401 | "Please sign in" |
| Authorization | 403 | "You don't have access" |
| Not Found | 404 | "Not found" |
| Rate Limit | 429 | "Slow down, try again in Xs" |
| AI Service | 503 | "Coach is unavailable" |
| Engine (client) | — | "Engine failed to load" |
| Network | — | "Connection lost" |
| Internal | 500 | "Something went wrong" |

---

## Server Error Handling

### ApiError Class

```typescript
// src/server/api/response.ts
class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
  }
}
```

### Route Handler Wrapper

```typescript
// Every route handler wrapped with error boundary
async function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof ApiError) {
        return apiResponse.error(error.code, error.message, error.statusCode, error.details);
      }
      if (error instanceof ZodError) {
        return apiResponse.error('VALIDATION_ERROR', 'Invalid input', 400, error.errors);
      }
      logger.error('Unhandled error', { error, path: request.url });
      return apiResponse.error('INTERNAL_ERROR', 'Something went wrong', 500);
    }
  };
}
```

### Service Layer Errors

Services throw typed `ApiError` instances:

```typescript
// Example patterns
throw new ApiError('NOT_FOUND', 'Game not found', 404);
throw new ApiError('FORBIDDEN', 'Not your game', 403);
throw new ApiError('AI_UNAVAILABLE', 'Coach is temporarily unavailable', 503);
throw new ApiError('VALIDATION_ERROR', 'Invalid move', 400, { move: uci });
```

---

## Client Error Handling

### Error Boundaries

| Boundary | Location | Fallback |
|----------|----------|----------|
| Root | `app/layout.tsx` | Full-page error with reload |
| App | `app/(app)/layout.tsx` | App error with dashboard link |
| Game | `features/game/components/GameErrorBoundary.tsx` | Game error with exit |
| 3D | `shared/three/ThreeErrorBoundary.tsx` | Hide 3D silently |
| Coach | `features/coaching/components/CoachErrorBoundary.tsx` | "Coach unavailable" |

### TanStack Query Error Handling

```typescript
// Global error handler in QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      throwOnError: false, // Handle in UI, not crash
    },
    mutations: {
      onError: (error) => {
        toast.error(getErrorMessage(error));
      },
    },
  },
});
```

### Toast Notifications

| Error Type | Toast Style | Duration |
|------------|-------------|----------|
| Validation | Warning (yellow) | 5s |
| Network | Error (red) + retry | Persistent |
| AI unavailable | Info (blue) | 5s |
| Rate limit | Warning | 5s |
| Success | Success (green) | 3s |

---

## Feature-Specific Error Handling

### Stockfish WASM Failure

```
1. Detect: Worker error or WASM load timeout (>10s)
2. Client: Show banner at top of game page
   "Chess engine failed to load. [Retry]"
3. Retry: Re-initialize worker (max 3 attempts)
4. Fallback: Disable Computer/Coach modes, suggest AI Opponent
5. Log: telemetry event 'stockfish_load_failure'
```

### Gemini API Failure

```
1. Detect: 503 response or timeout (>15s)
2. Retry: 1 automatic retry after 2s
3. Fallback per feature:
   - AI Opponent: "AI opponent unavailable. Try Computer mode?"
   - Coach explain: Show eval numbers only, skip narrative
   - Chat: "Coach is resting. Try again in a moment."
   - Lesson generation: Serve cached/template lesson
4. Log: telemetry event 'gemini_error' with error code
```

### Network Loss During Game

```
1. Detect: fetch failure during move sync
2. Client: Queue move in memory, show subtle "offline" indicator
3. On reconnect: Batch sync queued moves
4. If game completed offline: Queue completion, sync on reconnect
5. If reconnect fails for >5 min: Warn user data may be lost
```

### Invalid Move Attempt

```
1. chess.js rejects move
2. Board: piece snaps back (react-chessboard default)
3. No API call, no toast (silent rejection)
4. Optional: subtle shake animation on source square
```

---

## Error Response Schema

All API errors follow this structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      { "field": "mode", "message": "Must be one of: computer, ai_opponent, coach" }
    ]
  }
}
```

Client utility to extract user-friendly message:

```typescript
function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (isApiErrorResponse(error)) return error.error.message;
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'Connection lost. Check your internet and try again.';
  }
  return 'Something went wrong. Please try again.';
}
```

---

## Logging on Error

Every server error logged with:

```typescript
{
  level: 'error',
  code: 'AI_UNAVAILABLE',
  message: 'Gemini timeout after 15s',
  userId: 'clx...',
  path: '/api/coach/explain-moment',
  requestId: 'req_...',
  duration: 15234,
  // NO: API keys, passwords, full prompts, PII
}
```

See [21-logging.md](./21-logging.md).

---

## Document References

- [07-backend-architecture.md](./07-backend-architecture.md)
- [09-api-design.md](./09-api-design.md)
- [21-logging.md](./21-logging.md)
- [23-security.md](./23-security.md)
