# API Design

## Document Metadata

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Approved for Implementation |
| Last Updated | 2026-07-30 |

---

## Overview

RESTful API implemented as Next.js Route Handlers under `app/api/`. All endpoints return JSON with a standardized envelope. Authentication required unless marked **Public**.

Base URL: `https://{domain}/api`

---

## Global Conventions

### Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes (POST/PATCH) | `application/json` |
| `Cookie` | Yes (auth routes) | Better Auth session cookie |

### Response Envelope

```typescript
// Success (2xx)
{
  "data": T,
  "meta"?: {
    "page": number,
    "pageSize": number,
    "total": number
  }
}

// Error (4xx/5xx)
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details"?: [{ "field": "email", "message": "Invalid email" }]
  }
}
```

### Pagination

Query parameters: `?page=1&pageSize=20` (defaults: page=1, pageSize=20, max=100)

---

## API Endpoints

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | Public | Health check |

**Response:**
```json
{ "data": { "status": "ok", "timestamp": "2026-07-30T12:00:00Z" } }
```

---

### Authentication

Handled by Better Auth at `/api/auth/[...all]`. See [10-authentication.md](./10-authentication.md).

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/sign-up/email` | Public | Email sign up |
| POST | `/api/auth/sign-in/email` | Public | Email sign in |
| POST | `/api/auth/sign-in/social` | Public | OAuth sign in |
| POST | `/api/auth/sign-out` | Yes | Sign out |
| GET | `/api/auth/session` | Optional | Get current session |

---

### Games

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/games` | Yes | Create new game |
| GET | `/api/games` | Yes | List user's games |
| GET | `/api/games/:gameId` | Yes | Get game with moves |
| POST | `/api/games/:gameId/moves` | Yes | Record a move |
| POST | `/api/games/:gameId/complete` | Yes | Complete game |
| POST | `/api/games/:gameId/resign` | Yes | Resign game |
| POST | `/api/games/:gameId/ai-move` | Yes | Request AI opponent move |
| DELETE | `/api/games/:gameId` | Yes | Delete game |

#### POST `/api/games`

**Request:**
```json
{
  "mode": "computer" | "ai_opponent" | "coach",
  "color": "white" | "black" | "random",
  "stockfishLevel": 5,
  "aiPersonality": "intermediate",
  "timeControl": { "initial": 600, "increment": 5 }
}
```

**Response:**
```json
{
  "data": {
    "id": "clx...",
    "mode": "computer",
    "status": "in_progress",
    "playerColor": "white",
    "stockfishLevel": 5,
    "createdAt": "2026-07-30T12:00:00Z"
  }
}
```

#### GET `/api/games`

**Query:** `?mode=computer&status=completed&page=1&pageSize=20`

**Response:**
```json
{
  "data": [
    {
      "id": "clx...",
      "mode": "computer",
      "status": "completed",
      "result": "white_win",
      "resultReason": "checkmate",
      "playerColor": "white",
      "moveCount": 42,
      "createdAt": "2026-07-30T12:00:00Z",
      "completedAt": "2026-07-30T12:25:00Z"
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "total": 45 }
}
```

#### GET `/api/games/:gameId`

**Response:**
```json
{
  "data": {
    "id": "clx...",
    "mode": "coach",
    "status": "completed",
    "result": "black_win",
    "playerColor": "white",
    "pgn": "1. e4 e5 2. Nf3...",
    "finalFen": "8/8/4k3/8/8/8/8/4K3 w - - 0 1",
    "moves": [
      { "moveNumber": 1, "san": "e4", "uci": "e2e4", "fen": "...", "color": "white" }
    ],
    "coachMoments": [
      { "moveNumber": 14, "momentType": "blunder", "explanation": "..." }
    ]
  }
}
```

#### POST `/api/games/:gameId/moves`

**Request:**
```json
{
  "san": "Nf3",
  "uci": "g1f3",
  "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/5N2/PPPP1PPP b KQkq - 0 1"
}
```

**Response:**
```json
{
  "data": {
    "moveNumber": 2,
    "san": "Nf3",
    "valid": true
  }
}
```

#### POST `/api/games/:gameId/ai-move`

**Request:**
```json
{
  "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/5N2/PPPP1PPP b KQkq - 0 1",
  "moves": ["e2e4", "g1f3"],
  "personality": "aggressive"
}
```

**Response:**
```json
{
  "data": {
    "san": "Nc6",
    "uci": "b8c6",
    "comment": "I'll take the center back soon enough..."
  }
}
```

#### POST `/api/games/:gameId/complete`

**Request:**
```json
{
  "result": "white_win",
  "resultReason": "checkmate",
  "pgn": "1. e4 e5 ...",
  "finalFen": "..."
}
```

---

### Analysis

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/analysis/:gameId` | Yes | Save analysis results |
| GET | `/api/analysis/:gameId` | Yes | Get analysis |
| POST | `/api/analysis/import` | Yes | Import PGN for analysis |

#### POST `/api/analysis/:gameId`

**Request:**
```json
{
  "accuracy": 78.5,
  "acpl": 45.2,
  "totalMoves": 42,
  "blunderCount": 2,
  "mistakeCount": 3,
  "inaccuracyCount": 5,
  "brilliantCount": 1,
  "moveAnalysis": [
    {
      "moveNumber": 1,
      "san": "e4",
      "evalBefore": 25,
      "evalAfter": 30,
      "bestMove": "e2e4",
      "classification": "best",
      "cpLoss": 0
    }
  ],
  "evalGraph": [
    { "moveNumber": 1, "eval": 30 }
  ]
}
```

#### POST `/api/analysis/import`

**Request:**
```json
{
  "pgn": "1. e4 e5 2. Nf3 Nc6 ...",
  "name": "Imported Game"
}
```

**Response:**
```json
{
  "data": {
    "gameId": "clx...",
    "moveCount": 42
  }
}
```

---

### Coaching

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/coach/explain-moment` | Yes | Explain key moment |
| POST | `/api/coach/explain-move` | Yes | Explain specific move |
| POST | `/api/coach/game-summary` | Yes | Generate game summary |
| POST | `/api/coach/chat` | Yes | Coach chat message |
| GET | `/api/coach/chat/history` | Yes | Get chat history |

#### POST `/api/coach/explain-moment`

**Request:**
```json
{
  "gameId": "clx...",
  "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
  "moves": ["e4", "e5", "Nf3", "Nc6", "Bc4", "Nf6"],
  "moveNumber": 6,
  "momentType": "blunder",
  "evalBefore": 50,
  "evalAfter": -180,
  "classification": "blunder",
  "bestMove": "d7d5"
}
```

**Response:**
```json
{
  "data": {
    "explanation": "Moving the knight to f6 allows White's bishop to capture on f7, forcing your king to move and losing castling rights. The engine suggests d5 instead, challenging the center immediately.",
    "concepts": ["king safety", "opening principles", "center control"],
    "suggestedFollowUp": "What should I do if my king is exposed early?"
  }
}
```

#### POST `/api/coach/chat`

**Request:**
```json
{
  "sessionId": "clx...",
  "message": "Why is the Sicilian Defense popular?",
  "context": {
    "fen": null,
    "gameId": null,
    "mode": "general"
  }
}
```

**Response:**
```json
{
  "data": {
    "sessionId": "clx...",
    "message": {
      "role": "assistant",
      "content": "The Sicilian Defense (1.e4 c5) is popular because..."
    }
  }
}
```

#### POST `/api/coach/game-summary`

**Request:**
```json
{
  "gameId": "clx...",
  "analysis": { /* MoveAnalysis summary */ }
}
```

**Response:**
```json
{
  "data": {
    "summary": "You played a strong opening but lost the advantage on move 18 when you missed a tactical shot. Your endgame technique was solid.",
    "strengths": ["opening play", "endgame technique"],
    "weaknesses": ["tactical awareness in middlegame"],
    "keyMoments": [14, 18, 32]
  }
}
```

---

### Training

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/training/recommendations` | Yes | Get lesson recommendations |
| POST | `/api/training/lessons` | Yes | Generate new lesson |
| GET | `/api/training/lessons/:lessonId` | Yes | Get lesson with exercises |
| POST | `/api/training/lessons/:lessonId/progress` | Yes | Update lesson progress |
| GET | `/api/training/study-plan` | Yes | Get active study plan |

#### GET `/api/training/recommendations`

**Response:**
```json
{
  "data": {
    "weaknesses": ["king safety", "endgame technique", "pin tactics"],
    "recommendedLessons": [
      {
        "id": "clx...",
        "title": "King Safety in the Middlegame",
        "topic": "positional",
        "difficulty": 4,
        "exerciseCount": 5
      }
    ]
  }
}
```

#### POST `/api/training/lessons`

**Request:**
```json
{
  "topic": "tactics",
  "weakness": "pin tactics",
  "difficulty": 5
}
```

**Response:**
```json
{
  "data": {
    "id": "clx...",
    "title": "Mastering Pin Tactics",
    "status": "ready",
    "exerciseCount": 5
  }
}
```

#### POST `/api/training/lessons/:lessonId/progress`

**Request:**
```json
{
  "currentExercise": 3,
  "exerciseResult": { "index": 2, "correct": true },
  "completed": false
}
```

---

### User & Settings

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/user/profile` | Yes | Get user profile |
| PATCH | `/api/user/profile` | Yes | Update profile |
| GET | `/api/user/settings` | Yes | Get settings |
| PATCH | `/api/user/settings` | Yes | Update settings |
| GET | `/api/user/progress` | Yes | Get progress stats |
| DELETE | `/api/user/account` | Yes | Delete account |

#### GET `/api/user/progress`

**Response:**
```json
{
  "data": {
    "skillEstimate": 1350,
    "gamesPlayed": 45,
    "avgAccuracy": 76.2,
    "lessonsCompleted": 12,
    "currentStreak": 5,
    "accuracyTrend": [
      { "date": "2026-07-24", "accuracy": 72.1 }
    ],
    "weaknessTags": ["king safety", "endgame technique"]
  }
}
```

---

### Reports

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/reports/weekly` | Yes | Get latest weekly report |
| GET | `/api/reports/weekly/:weekId` | Yes | Get specific week report |
| POST | `/api/reports/weekly/generate` | Yes | Trigger report generation |

---

### Cron (Internal)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/cron/weekly-reports` | CRON_SECRET | Generate weekly reports |
| POST | `/api/cron/cleanup` | CRON_SECRET | Data retention cleanup |

---

## Rate Limits

| Category | Limit | Header |
|----------|-------|--------|
| AI endpoints | 30/min per user | `X-RateLimit-Remaining` |
| Chat | 20/min per user | `X-RateLimit-Remaining` |
| Game mutations | 60/min per user | `X-RateLimit-Remaining` |
| Reads | 120/min per user | `X-RateLimit-Remaining` |

When exceeded: `429 Too Many Requests` with `Retry-After` header.

---

## Webhook Events (Future)

Not in v1. Reserved for future integrations (Lichess import, etc.).

---

## Document References

- [07-backend-architecture.md](./07-backend-architecture.md)
- [08-database-design.md](./08-database-design.md)
- [10-authentication.md](./10-authentication.md)
- [12-gemini-architecture.md](./12-gemini-architecture.md)
