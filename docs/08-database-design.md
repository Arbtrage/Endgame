# Database Design

## Document Metadata

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Approved for Implementation |
| Last Updated | 2026-07-30 |

---

## Overview

PostgreSQL on Neon with Prisma ORM. Schema designed for the chess coaching domain with normalized core entities and JSON columns for flexible analytical data.

---

## Entity Relationship Diagram

```
┌──────────┐       ┌──────────┐       ┌──────────────┐
│   User   │──1:N──│   Game   │──1:1──│   Analysis   │
└──────────┘       └──────────┘       └──────────────┘
     │                  │
     │                  ├──1:N── Move
     │                  │
     │             ┌────┘
     │             │
     ├──1:N── ChatSession ──1:N── ChatMessage
     │
     ├──1:N── TrainingLesson ──1:N── Exercise
     │                            │
     ├──1:N── LessonProgress ────┘
     │
     ├──1:N── WeeklyReport
     │
     └──1:1── UserSettings
```

---

## Prisma Schema

```prisma
// schema.prisma — Full schema definition

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ============================================
// AUTH (Better Auth managed tables)
// ============================================

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Chess-specific fields
  skillEstimate Int?      // Approximate Elo (self-reported or computed)
  onboardingComplete Boolean @default(false)

  // Relations
  accounts      Account[]
  sessions      Session[]
  games         Game[]
  chatSessions  ChatSession[]
  lessons       TrainingLesson[]
  lessonProgress LessonProgress[]
  weeklyReports WeeklyReport[]
  settings      UserSettings?

  @@map("users")
}

model Account {
  id                    String  @id @default(cuid())
  userId                String
  accountId             String
  providerId            String
  accessToken           String?
  refreshToken          String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  idToken               String?
  password              String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("accounts")
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@map("verifications")
}

// ============================================
// GAME
// ============================================

enum GameMode {
  COMPUTER
  AI_OPPONENT
  COACH
}

enum GameStatus {
  IN_PROGRESS
  COMPLETED
  ABANDONED
}

enum GameResult {
  WHITE_WIN
  BLACK_WIN
  DRAW
  ABANDONED
}

model Game {
  id            String     @id @default(cuid())
  userId        String
  mode          GameMode
  status        GameStatus @default(IN_PROGRESS)
  result        GameResult?
  resultReason  String?    // checkmate, stalemate, resignation, timeout, agreement

  // Game configuration
  playerColor   String     // "white" | "black"
  stockfishLevel Int?      // 1-20 skill level
  aiPersonality  String?   // personality key for AI opponent
  timeControlInitial Int?  // seconds
  timeControlIncrement Int? // seconds

  // Game data
  pgn           String?    // Full PGN generated on completion
  finalFen      String?    // Final position FEN
  moveCount     Int        @default(0)

  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  completedAt   DateTime?

  user          User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  moves         Move[]
  analysis      Analysis?
  coachMoments  CoachMoment[]

  @@index([userId, createdAt(sort: Desc)])
  @@index([userId, status])
  @@index([userId, mode])
  @@map("games")
}

model Move {
  id        String   @id @default(cuid())
  gameId    String
  moveNumber Int     // Half-move number (1, 2, 3...)
  san       String   // Standard Algebraic Notation (e.g., "Nf3")
  uci       String   // UCI format (e.g., "g1f3")
  fen       String   // Position after this move
  color     String   // "white" | "black"
  createdAt DateTime @default(now())

  game Game @relation(fields: [gameId], references: [id], onDelete: Cascade)

  @@unique([gameId, moveNumber])
  @@index([gameId])
  @@map("moves")
}

// ============================================
// ANALYSIS
// ============================================

model Analysis {
  id            String   @id @default(cuid())
  gameId        String   @unique
  accuracy      Float    // Percentage 0-100
  acpl          Float    // Average centipawn loss
  totalMoves    Int
  blunderCount  Int      @default(0)
  mistakeCount  Int      @default(0)
  inaccuracyCount Int    @default(0)
  brilliantCount Int     @default(0)

  // Detailed per-move analysis (client-computed, stored as JSON)
  moveAnalysis  Json     // MoveAnalysis[]
  evalGraph     Json     // { moveNumber: number, eval: number }[]

  // AI-generated summary
  summary       String?  // Gemini narrative summary
  keyMoments    Json?    // KeyMoment[] identified during analysis

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  game Game @relation(fields: [gameId], references: [id], onDelete: Cascade)

  @@map("analyses")
}

// JSON type definitions (TypeScript, not DB):
//
// MoveAnalysis {
//   moveNumber: number
//   san: string
//   evalBefore: number      // centipawns
//   evalAfter: number
//   bestMove: string        // UCI
//   classification: 'brilliant' | 'great' | 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder'
//   cpLoss: number
// }
//
// KeyMoment {
//   moveNumber: number
//   type: 'blunder' | 'brilliant' | 'turning_point' | 'opening_exit' | 'endgame_entry'
//   evalSwing: number
//   explanation?: string    // Gemini explanation (lazy-loaded)
// }

// ============================================
// COACHING
// ============================================

model CoachMoment {
  id          String   @id @default(cuid())
  gameId      String
  moveNumber  Int
  momentType  String   // blunder, brilliant, opening_exit, endgame_entry, check
  evalBefore  Float
  evalAfter   Float
  explanation String   // Gemini-generated
  createdAt   DateTime @default(now())

  game Game @relation(fields: [gameId], references: [id], onDelete: Cascade)

  @@index([gameId])
  @@map("coach_moments")
}

model ChatSession {
  id        String   @id @default(cuid())
  userId    String
  context   Json?    // { gameId?, fen?, mode? }
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user     User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages ChatMessage[]

  @@index([userId, updatedAt(sort: Desc)])
  @@map("chat_sessions")
}

model ChatMessage {
  id        String   @id @default(cuid())
  sessionId String
  role      String   // "user" | "assistant"
  content   String
  metadata  Json?    // { fen?, moveRef?, tokens? }
  createdAt DateTime @default(now())

  session ChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@index([sessionId, createdAt])
  @@map("chat_messages")
}

// ============================================
// TRAINING
// ============================================

enum LessonStatus {
  GENERATING
  READY
  ARCHIVED
}

enum LessonTopic {
  TACTICS
  ENDGAME
  OPENING
  POSITIONAL
  CUSTOM
}

model TrainingLesson {
  id          String       @id @default(cuid())
  userId      String
  title       String
  description String
  topic       LessonTopic
  difficulty  Int          // 1-10
  status      LessonStatus @default(GENERATING)
  sourceWeakness String?   // Weakness tag that triggered generation
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  user       User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  exercises  Exercise[]
  progress   LessonProgress[]

  @@index([userId, status])
  @@map("training_lessons")
}

model Exercise {
  id          String @id @default(cuid())
  lessonId    String
  orderIndex  Int
  fen         String          // Starting position
  objective   String          // "Find the best move", "White to play and win"
  solutionUci String          // Correct move(s) in UCI
  hintLevels  Json            // string[] — progressive hints
  explanation String          // Why this is the solution
  createdAt   DateTime @default(now())

  lesson TrainingLesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@unique([lessonId, orderIndex])
  @@map("exercises")
}

model LessonProgress {
  id              String   @id @default(cuid())
  userId          String
  lessonId        String
  currentExercise Int      @default(0)
  completed       Boolean  @default(false)
  score           Float?   // Percentage correct
  exerciseResults Json?    // { exerciseIndex: boolean }[]
  startedAt       DateTime @default(now())
  completedAt     DateTime?

  user   User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson TrainingLesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@unique([userId, lessonId])
  @@map("lesson_progress")
}

// ============================================
// REPORTS
// ============================================

model WeeklyReport {
  id          String   @id @default(cuid())
  userId      String
  weekStart   DateTime // Monday of the report week
  weekEnd     DateTime
  gamesPlayed Int      @default(0)
  lessonsCompleted Int @default(0)
  avgAccuracy Float?
  weaknessTags Json    // string[] — top 3 weaknesses
  narrative   String   // Gemini-generated weekly narrative
  stats       Json     // Detailed stats blob
  createdAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, weekStart])
  @@index([userId, weekStart(sort: Desc)])
  @@map("weekly_reports")
}

// ============================================
// SETTINGS
// ============================================

model UserSettings {
  id                  String @id @default(cuid())
  userId              String @unique
  boardTheme          String @default("classic")
  pieceSet            String @default("standard")
  soundEnabled        Boolean @default(true)
  defaultStockfishLevel Int  @default(5)
  defaultAiPersonality String @default("intermediate")
  coachAutoExplain    Boolean @default(true)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_settings")
}
```

---

## Index Strategy

| Index | Purpose |
|-------|---------|
| `games(userId, createdAt DESC)` | Game history listing |
| `games(userId, status)` | Active games lookup |
| `moves(gameId)` | Move list for a game |
| `chat_sessions(userId, updatedAt DESC)` | Recent chat sessions |
| `chat_messages(sessionId, createdAt)` | Message history |
| `training_lessons(userId, status)` | Active lessons |
| `weekly_reports(userId, weekStart DESC)` | Report history |
| `lesson_progress(userId, lessonId) UNIQUE` | Prevent duplicate progress |

---

## JSON Column Schemas

JSON columns store client-computed or AI-generated structured data. TypeScript types enforce shape at application layer.

| Column | Table | Schema |
|--------|-------|--------|
| `moveAnalysis` | Analysis | `MoveAnalysis[]` |
| `evalGraph` | Analysis | `{ moveNumber: number, eval: number }[]` |
| `keyMoments` | Analysis | `KeyMoment[]` |
| `hintLevels` | Exercise | `string[]` (3 progressive hints) |
| `exerciseResults` | LessonProgress | `Record<number, boolean>` |
| `weaknessTags` | WeeklyReport | `string[]` |
| `stats` | WeeklyReport | `WeeklyStats` |
| `context` | ChatSession | `{ gameId?, fen?, mode? }` |
| `metadata` | ChatMessage | `{ fen?, moveRef?, tokens? }` |

---

## Migration Strategy

1. All schema changes via `prisma migrate dev` locally
2. Production deploys run `prisma migrate deploy` in Vercel build step
3. Migrations are forward-only (no down migrations in production)
4. Destructive migrations require manual review and backup

### Build Script Addition

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

---

## Data Retention & Cleanup

| Entity | Retention | Cleanup |
|--------|-----------|---------|
| Abandoned games | 30 days | Cron: delete games with status ABANDONED > 30 days |
| Chat messages | 90 days | Cron: delete messages older than 90 days |
| Chat sessions (empty) | 7 days | Cron: delete sessions with 0 messages > 7 days |
| Generating lessons (stuck) | 1 hour | Cron: mark as ARCHIVED if GENERATING > 1 hour |

---

## Seeding (Development Only)

```typescript
// prisma/seed.ts — Development seed data
// - 1 demo user
// - 3 sample games (one per mode)
// - 1 completed analysis
// - 1 training lesson with 3 exercises
// - Default user settings
```

---

## Assumptions

| ID | Assumption |
|----|------------|
| DA-1 | Better Auth manages its own auth tables (User, Account, Session, Verification) |
| DA-2 | PGN stored as TEXT (max ~10KB per game, well within limits) |
| DA-3 | JSON columns used for analysis data to avoid excessive normalization |
| DA-4 | No separate `weaknesses` table in v1; weakness tags computed and stored in reports |
| DA-5 | Neon database in same region as Vercel deployment (us-east) |

---

## Document References

- [07-backend-architecture.md](./07-backend-architecture.md)
- [09-api-design.md](./09-api-design.md)
- [10-authentication.md](./10-authentication.md)
