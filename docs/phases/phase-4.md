# Phase 4: Analysis & Training

## Document Metadata

| Field | Value |
|-------|-------|
| Phase | 4 of 5 |
| Version | v0.4.0 |
| Duration | ~2 weeks |
| Status | Ready for Implementation |
| Depends On | Phase 2 (Stockfish, game data), Phase 3 (Gemini, coaching) |

---

## Overview

Phase 4 delivers post-game analysis with Stockfish-powered statistics and Gemini-powered narratives, plus a training system that generates personalized lessons from user weaknesses. This phase completes the two core learning loops: "review your games" and "practice your weaknesses."

---

## Objectives

1. Build Analysis Mode: client-side Stockfish analysis of every move
2. Implement move classification, accuracy, and ACPL
3. Build evaluation graph visualization
4. Integrate Gemini for game summaries and move explanations
5. Build Training Mode with Gemini-generated lessons
6. Implement interactive puzzle exercises with Stockfish verification
7. Track lesson progress and generate recommendations from weaknesses

---

## Deliverables

| # | Deliverable | Verification |
|---|-------------|-------------|
| D1 | Full game analysis (Stockfish, every move) | Analysis completes for 40-move game |
| D2 | Move classification (7 levels) | Known positions classified correctly |
| D3 | Accuracy and ACPL displayed | Values match manual calculation |
| D4 | Evaluation graph (SVG) | Graph renders correctly for any game |
| D5 | Gemini game summary | Narrative summary after analysis |
| D6 | On-demand move explanation | Click move → Gemini explains |
| D7 | PGN import (upload + paste) | Imported games analyzable |
| D8 | Training lesson generation | Gemini creates 5-exercise lesson |
| D9 | Interactive puzzle solving | User moves verified by Stockfish |
| D10 | Progressive hints (3 levels) | Hints escalate from subtle to direct |
| D11 | Lesson progress tracking | Progress saved and resumable |
| D12 | Weakness-based recommendations | Recommendations reflect recent blunders |

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Analysis from game history | Select completed game → analyze | P0 |
| Client-side full analysis | Stockfish evaluates every position | P0 |
| Move classification | 7 levels (brilliant → blunder) | P0 |
| Accuracy percentage | % of good moves | P0 |
| ACPL | Average centipawn loss | P0 |
| Evaluation graph | SVG chart of eval over moves | P1 |
| Analysis board | Board with eval arrows at selected move | P0 |
| Move analysis list | All moves with classification icons | P0 |
| Gemini game summary | Post-analysis narrative | P0 |
| On-demand move explanation | Click → Gemini explains | P0 |
| PGN upload | File upload for analysis | P1 |
| PGN paste | Text input for analysis | P1 |
| Training hub | Recommendations + topic browser | P0 |
| Lesson generation | Gemini creates lesson from weakness | P0 |
| Puzzle exercises | Interactive board puzzles | P0 |
| Progressive hints | 3-level hint system | P0 |
| Exercise verification | Stockfish confirms correct move | P0 |
| Lesson progress | Track completion per lesson | P0 |
| Weakness detection | Aggregate blunders into tags | P1 |

---

## User Stories

| ID | Story | Acceptance |
|----|-------|------------|
| US-4.1 | As a user, I want to analyze my completed games so I can learn from mistakes | Select game → analysis runs → results displayed |
| US-4.2 | As a user, I want to see which moves were mistakes so I know what to fix | Move list shows classification icons |
| US-4.3 | As a user, I want an accuracy score so I can track improvement | Accuracy % and ACPL displayed |
| US-4.4 | As a user, I want an eval graph so I can see momentum shifts | SVG graph shows eval over time |
| US-4.5 | As a user, I want AI to summarize my game so I get the big picture | Gemini narrative after analysis |
| US-4.6 | As a user, I want to ask why a specific move was bad so I understand deeply | Click move → explanation panel |
| US-4.7 | As a user, I want to import PGN files so I can analyze external games | Upload/paste PGN → analysis |
| US-4.8 | As a user, I want personalized training so I improve my weaknesses | Training hub shows recommended lessons |
| US-4.9 | As a user, I want to solve puzzles so I practice tactics | Interactive puzzle board with verification |
| US-4.10 | As a user, I want hints when stuck so I don't give up | 3 progressive hints per exercise |
| US-4.11 | As a user, I want my lesson progress saved so I can continue later | Resume lesson from last exercise |

---

## UI Screens

| Screen | Route | State |
|--------|-------|-------|
| Analysis Hub | `/analyze` | Game history list + import options |
| Game Analysis | `/analyze/[gameId]` | Board + eval graph + move list + summary |
| Move Explanation | (panel on analysis page) | Gemini explanation for selected move |
| PGN Import Dialog | (modal on analysis hub) | Upload file or paste text |
| Training Hub | `/train` | Recommendations, topic filter, active lessons |
| Active Lesson | `/train/[lessonId]` | Intro → exercises → summary |
| Puzzle Board | (within lesson view) | Position + input + hint button |
| Exercise Result | (within lesson view) | Correct/incorrect feedback |
| Lesson Summary | (end of lesson) | Score, concepts, next lesson CTA |

---

## APIs

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/analysis/:gameId` | Yes | Save analysis results |
| GET | `/api/analysis/:gameId` | Yes | Get stored analysis |
| POST | `/api/analysis/import` | Yes | Import PGN for analysis |
| POST | `/api/coach/explain-move` | Yes | Explain specific move |
| POST | `/api/coach/game-summary` | Yes | Generate game summary |
| GET | `/api/training/recommendations` | Yes | Get lesson recommendations |
| POST | `/api/training/lessons` | Yes | Generate new lesson |
| GET | `/api/training/lessons/:lessonId` | Yes | Get lesson with exercises |
| POST | `/api/training/lessons/:lessonId/progress` | Yes | Update lesson progress |
| GET | `/api/training/study-plan` | Yes | Get active study plan |

---

## Database Changes

### Migration: Add Analysis & Training Tables

```sql
CREATE TABLE "analyses" (...);
CREATE TABLE "training_lessons" (...);
CREATE TABLE "exercises" (...);
CREATE TABLE "lesson_progress" (...);

-- Enums
CREATE TYPE "LessonStatus" AS ENUM ('GENERATING', 'READY', 'ARCHIVED');
CREATE TYPE "LessonTopic" AS ENUM ('TACTICS', 'ENDGAME', 'OPENING', 'POSITIONAL', 'CUSTOM');

-- Indexes
CREATE UNIQUE INDEX "analyses_gameId_key" ON "analyses"("gameId");
CREATE INDEX "training_lessons_userId_status_idx" ON "training_lessons"("userId", "status");
CREATE UNIQUE INDEX "lesson_progress_userId_lessonId_key" ON "lesson_progress"("userId", "lessonId");
```

---

## Components

### New Feature: `analysis`

| Component | Description |
|-----------|-------------|
| `AnalysisBoard` | Board with eval arrows and highlights |
| `AnalysisProgress` | Progress bar during computation |
| `EvalGraph` | SVG evaluation chart |
| `MoveAnalysisList` | Moves with classification badges |
| `AnalysisSummary` | Accuracy, ACPL, blunder counts |
| `ExplainMovePanel` | Gemini explanation side panel |
| `PGNImportDialog` | Upload/paste PGN |
| `GameSummaryPanel` | AI narrative overview |

### New Feature: `training`

| Component | Description |
|-----------|-------------|
| `TrainingHub` | Recommendations + topic browser |
| `LessonCard` | Lesson preview card |
| `LessonView` | Active lesson container |
| `PuzzleBoard` | Board for puzzle solving |
| `HintButton` | Progressive hint request |
| `ExerciseResult` | Correct/incorrect feedback |
| `LessonProgress` | Progress bar through exercises |
| `TopicFilter` | Filter by topic |

### Engine Modules (New)

| Module | Path |
|--------|------|
| `classification.ts` | `src/shared/engine/classification.ts` |
| `accuracy.ts` | `src/shared/engine/accuracy.ts` |
| `AnalysisEngine` | `src/features/analysis/engine/analysis-engine.ts` |

### Server Modules (New)

| Module | Path |
|--------|------|
| `AnalysisService` | `src/server/services/analysis.service.ts` |
| `TrainingService` | `src/server/services/training.service.ts` |
| `AnalysisRepository` | `src/server/repositories/analysis.repository.ts` |
| `LessonRepository` | `src/server/repositories/lesson.repository.ts` |
| Prompt: `explain-move.ts` | `src/server/ai/prompts/explain-move.ts` |
| Prompt: `game-summary.ts` | `src/server/ai/prompts/game-summary.ts` |
| Prompt: `lesson-generation.ts` | `src/server/ai/prompts/lesson-generation.ts` |
| Prompt: `hint-generation.ts` | `src/server/ai/prompts/hint-generation.ts` |

---

## Libraries

No new major dependencies. Uses existing Stockfish, Gemini, chess.js, and chart rendering (SVG manually or lightweight library).

Optional: `recharts` or `visx` for eval graph if SVG manual approach is too complex.

---

## Folder Changes

```
CREATE  src/features/analysis/
CREATE  src/features/training/
CREATE  src/shared/engine/classification.ts
CREATE  src/shared/engine/accuracy.ts
CREATE  src/server/services/analysis.service.ts
CREATE  src/server/services/training.service.ts
CREATE  src/server/repositories/analysis.repository.ts
CREATE  src/server/repositories/lesson.repository.ts
CREATE  src/server/ai/prompts/explain-move.ts
CREATE  src/server/ai/prompts/game-summary.ts
CREATE  src/server/ai/prompts/lesson-generation.ts
CREATE  src/server/ai/prompts/hint-generation.ts
CREATE  app/(app)/analyze/page.tsx
CREATE  app/(app)/analyze/[gameId]/page.tsx
CREATE  app/(app)/train/page.tsx
CREATE  app/(app)/train/[lessonId]/page.tsx
CREATE  app/api/analysis/
CREATE  app/api/training/
UPDATE  src/features/game/components/GameOverDialog.tsx (add Analyze CTA)
UPDATE  src/features/dashboard/ (add active lessons widget)
```

---

## Edge Cases

| Case | Handling |
|------|----------|
| Analysis of very long game (100+ moves) | Progress bar, allow cancel, depth 15 instead of 18 |
| Analysis interrupted (tab close) | Client-side only until save; must complete to persist |
| Imported PGN with invalid moves | Reject with error message |
| Imported PGN with unknown outcome | Default to analysis without result |
| Gemini lesson generation fails | Retry once → show "Try again later" |
| Generated puzzle has no valid solution | Server validates FEN + solution before saving |
| User submits wrong move in puzzle | Show incorrect feedback, allow retry |
| All 3 hints used | Show solution explanation |
| Lesson generation takes >30s | Show "Generating your lesson..." with spinner |
| No weaknesses detected (new user) | Recommend generic beginner lessons |
| Re-analyzing already analyzed game | Load cached analysis, skip re-computation |

---

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Full game analysis slow on mobile | Bad UX for long games | Lower depth on mobile, show progress |
| Gemini generates invalid puzzle FENs | Broken exercises | Validate FEN + solution server-side before saving |
| Analysis JSON blob too large | DB performance | Cap at 500 moves, compress if needed |
| Weakness detection inaccurate | Irrelevant training | Require minimum 5 games before weakness tags |
| Eval graph rendering performance | Jank on long games | SVG with simplified data points (>100 moves) |

---

## Testing Strategy

| Test | Type | Coverage |
|------|------|----------|
| classifyMove (all 7 levels) | Unit | Known positions |
| calculateAccuracy | Unit | Various move sets |
| calculateACPL | Unit | Various move sets |
| AnalysisEngine (full game) | Integration | Mock Stockfish responses |
| AnalysisService (save/get) | Integration | DB operations |
| TrainingService (generate lesson) | Integration | Mock Gemini |
| PGN import parsing | Unit | Valid/invalid PGN |
| PuzzleBoard (correct/incorrect) | Component | User interaction |
| HintButton (3 levels) | Component | Progressive hints |
| E2E: Complete game → analyze | E2E | Full analysis flow |
| E2E: Start lesson → complete exercise | E2E | Training flow |
| E2E: Import PGN → analyze | E2E | Import flow |

---

## Acceptance Criteria

- [ ] Completed games analyzable from history
- [ ] Analysis produces accurate move classifications
- [ ] Accuracy and ACPL displayed correctly
- [ ] Eval graph renders for games of any length
- [ ] Gemini game summary generated after analysis
- [ ] Individual move explanations on demand
- [ ] PGN import works (upload and paste)
- [ ] Training hub shows recommendations
- [ ] At least one lesson generatable and completable
- [ ] Puzzle exercises verified by Stockfish
- [ ] Progressive hints work (3 levels)
- [ ] Lesson progress saved and resumable
- [ ] Analysis results cached (no re-computation on revisit)
- [ ] All unit and integration tests pass

---

## Exit Criteria

1. Analysis Mode fully functional for completed and imported games
2. Training Mode generates and delivers lessons
3. All acceptance criteria met
4. Deployed to production

**Phase 4 is complete when users can analyze games with engine stats and AI narrative, and complete personalized training lessons.**

---

## Future Improvements (Deferred)

- Spaced repetition for failed puzzles
- Opening repertoire analysis
- Compare analysis with previous analysis of same game
- Batch PGN import
- Custom lesson creation by user
- Study plan scheduling (calendar integration)

---

## Document References

- [11-stockfish-architecture.md](../11-stockfish-architecture.md)
- [12-gemini-architecture.md](../12-gemini-architecture.md)
- [13-game-engine.md](../13-game-engine.md)
- [phase-3.md](./phase-3.md)
- [phase-5.md](./phase-5.md)
