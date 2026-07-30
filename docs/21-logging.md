# Logging

## Document Metadata

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Approved for Implementation |
| Last Updated | 2026-07-30 |

---

## Overview

Structured JSON logging on the server. Client-side telemetry via Vercel Analytics and custom events. No console.log in production code.

---

## Log Levels

| Level | Usage | Production |
|-------|-------|------------|
| `error` | Unhandled exceptions, AI failures, DB errors | Yes |
| `warn` | Rate limit hits, retry attempts, degraded service | Yes |
| `info` | Request completed, game created, auth events | Yes |
| `debug` | Prompt content, detailed flow | Development only |

---

## Server Logging

### Logger Interface

```typescript
// src/server/api/logger.ts
interface Logger {
  error(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  debug(message: string, context?: LogContext): void;
}

interface LogContext {
  userId?: string;
  requestId?: string;
  path?: string;
  method?: string;
  duration?: number;
  statusCode?: number;
  error?: { code: string; message: string };
  [key: string]: unknown;
}
```

### Output Format

```json
{
  "timestamp": "2026-07-30T12:00:00.000Z",
  "level": "info",
  "message": "Game created",
  "userId": "clx123",
  "requestId": "req_abc",
  "path": "/api/games",
  "method": "POST",
  "duration": 145,
  "context": {
    "gameId": "clx456",
    "mode": "computer"
  }
}
```

### What to Log

| Event | Level | Fields |
|-------|-------|--------|
| API request completed | info | path, method, status, duration, userId |
| API request failed | error | path, method, error, userId |
| Auth: sign in | info | userId, method (email/google) |
| Auth: sign out | info | userId |
| Game created | info | gameId, mode, userId |
| Game completed | info | gameId, result, moveCount |
| AI call started | debug | feature, model, tokenEstimate |
| AI call completed | info | feature, duration, tokens |
| AI call failed | error | feature, error, duration |
| Rate limit hit | warn | userId, endpoint, limit |
| Cron job started | info | job, timestamp |
| Cron job completed | info | job, duration, processed |

### What NOT to Log

- Passwords or tokens
- Gemini API keys
- Full prompt content (production)
- Full PGN in every log (use gameId reference)
- Email addresses (use userId)
- IP addresses (unless security event)

---

## Request ID

Every API request gets a unique ID for tracing:

```typescript
// middleware or route wrapper
const requestId = crypto.randomUUID();
// Include in all logs for that request
// Return in response header: X-Request-Id
```

---

## Client Telemetry

### Vercel Analytics

Enabled by default for:
- Page views
- Web Vitals (LCP, FID, CLS)
- Route performance

### Custom Events

```typescript
// src/shared/lib/telemetry.ts
function trackEvent(name: string, properties?: Record<string, unknown>): void {
  // Vercel Analytics custom events or console in dev
}

// Events to track:
trackEvent('game_started', { mode, stockfishLevel?, personality? });
trackEvent('game_completed', { mode, result, moveCount, duration });
trackEvent('analysis_completed', { gameId, moveCount, duration });
trackEvent('lesson_started', { lessonId, topic });
trackEvent('lesson_completed', { lessonId, score });
trackEvent('coach_explanation_viewed', { momentType });
trackEvent('stockfish_load_failure');
trackEvent('gemini_error', { feature, errorCode });
```

---

## AI Call Logging

Special logging for Gemini calls (cost and quality monitoring):

```typescript
{
  "level": "info",
  "message": "AI call completed",
  "context": {
    "provider": "gemini",
    "model": "gemini-2.0-flash",
    "feature": "explain_moment",
    "inputTokens": 450,
    "outputTokens": 120,
    "duration": 2340,
    "userId": "clx123",
    "success": true
  }
}
```

---

## Log Aggregation

| Environment | Destination |
|-------------|-------------|
| Development | Console (pretty-printed) |
| Production | Vercel Function Logs (stdout JSON) |
| Future | Datadog / Axiom / LogTail integration |

Vercel Function Logs are searchable in the Vercel dashboard. Structured JSON enables filtering by level, userId, path.

---

## Document References

- [20-error-handling.md](./20-error-handling.md)
- [26-monitoring.md](./26-monitoring.md)
- [23-security.md](./23-security.md)
