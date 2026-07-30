# Phase 2: Core Chess

## Document Metadata

| Field | Value |
|-------|-------|
| Phase | 2 of 5 |
| Version | v0.2.0 |
| Duration | ~2 weeks |
| Status | Ready for Implementation |
| Depends On | Phase 1 (auth, shell, database) |

---

## Overview

Phase 2 delivers the core chess experience: a fully functional game against Stockfish running locally in WASM. Users can configure game settings, play a complete game, and view their game history. This phase validates the dual-engine architecture by implementing the Stockfish client-side engine with zero server-side chess computation.

---

## Objectives

1. Integrate Stockfish WASM in a Web Worker
2. Build the chess board UI with react-chessboard and chess.js
3. Implement Computer mode (full game lifecycle)
4. Persist games to the database (create, moves, complete)
5. Display game history on dashboard
6. Implement board themes and game settings
7. Build game controls (resign, move navigation, flip board)

---

## Deliverables

| # | Deliverable | Verification |
|---|-------------|-------------|
| D1 | Stockfish WASM loaded in Web Worker | Engine responds to `go depth 15` |
| D2 | Chess board with drag-and-drop | Legal/illegal moves handled correctly |
| D3 | Computer mode: full game from setup to game over | Play 10+ move game against Stockfish |
| D4 | Game persistence: create, record moves, complete | Game appears in database and history |
| D5 | Game history on dashboard | Recent games list with results |
| D6 | Game setup page (color, strength, time control) | Configuration saved to game record |
| D7 | Move list with navigation | Click move to navigate history |
| D8 | Game over dialog with result and CTAs | Checkmate/resign/stalemate handled |
| D9 | Board theme selection in settings | Theme persists across sessions |
| D10 | PGN generation on game completion | Valid PGN stored in database |

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Stockfish WASM worker | Client-side engine in Web Worker | P0 |
| Chess board UI | react-chessboard with themes | P0 |
| Move validation | chess.js legal move checking | P0 |
| Computer mode setup | Color, strength slider, time control | P0 |
| Full game flow | Setup → play → game over → save | P0 |
| Stockfish opponent | AI moves at configured strength | P0 |
| Game persistence | API for create/move/complete | P0 |
| Game history | Dashboard recent games + history page | P0 |
| Move list | SAN notation, click to navigate | P0 |
| Game controls | Resign, flip board | P1 |
| Time controls | Optional clock (unlimited, blitz, rapid) | P1 |
| Pawn promotion | Dialog for piece selection | P0 |
| Board themes | 3 themes (Classic, Midnight, Frost) | P1 |
| Game over dialog | Result, play again, analyze CTA | P0 |
| Demo board | Guest can play without auth (no save) | P1 |

---

## User Stories

| ID | Story | Acceptance |
|----|-------|------------|
| US-2.1 | As a user, I want to choose my color and Stockfish strength so I can play at my level | Game setup form with color picker and strength slider |
| US-2.2 | As a user, I want to make moves by dragging pieces so the game feels natural | Drag-and-drop works, illegal moves rejected |
| US-2.3 | As a user, I want Stockfish to respond to my moves so I have an opponent | Stockfish move within 3s at default depth |
| US-2.4 | As a user, I want to see the game result so I know who won | Game over dialog shows checkmate/resign/stalemate/draw |
| US-2.5 | As a user, I want my games saved so I can review them later | Completed game in database with PGN |
| US-2.6 | As a user, I want to see my recent games on the dashboard so I can track activity | Dashboard shows last 5 games with results |
| US-2.7 | As a user, I want to navigate move history so I can review the game | Move list click navigates board to that position |
| US-2.8 | As a user, I want to resign when I'm losing so I can start a new game | Resign button triggers game over |
| US-2.9 | As a user, I want to choose a board theme so the board looks good to me | 3 themes selectable in settings, persisted |
| US-2.10 | As a visitor, I want to try a demo game so I can experience the product before signing up | Demo page with client-only game (no save) |

---

## UI Screens

| Screen | Route | State |
|--------|-------|-------|
| Computer Setup | `/play/computer` | Color, strength slider, time control, start button |
| Active Game | `/play/[gameId]` | Board, move list, controls, clock (if timed) |
| Game Over Dialog | (modal on game page) | Result, move count, Play Again / Dashboard |
| Game History | `/dashboard` (section) | Recent games list with mode, result, date |
| Demo Board | `/demo` | Board + weak Stockfish, sign-up CTA |
| Settings (updated) | `/settings` | Board theme picker, default strength |

---

## APIs

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/games` | Yes | Create new game |
| GET | `/api/games` | Yes | List user's games (paginated) |
| GET | `/api/games/:gameId` | Yes | Get game with moves |
| POST | `/api/games/:gameId/moves` | Yes | Record a move |
| POST | `/api/games/:gameId/complete` | Yes | Complete game with result + PGN |
| POST | `/api/games/:gameId/resign` | Yes | Resign game |
| DELETE | `/api/games/:gameId` | Yes | Delete game |
| PATCH | `/api/user/settings` | Yes | Update board theme, default strength |

---

## Database Changes

### Migration: Add Game Tables

```sql
-- New enums
CREATE TYPE "GameMode" AS ENUM ('COMPUTER', 'AI_OPPONENT', 'COACH');
CREATE TYPE "GameStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');
CREATE TYPE "GameResult" AS ENUM ('WHITE_WIN', 'BLACK_WIN', 'DRAW', 'ABANDONED');

-- New tables
CREATE TABLE "games" (...);
CREATE TABLE "moves" (...);

-- Indexes
CREATE INDEX "games_userId_createdAt_idx" ON "games"("userId", "createdAt" DESC);
CREATE INDEX "games_userId_status_idx" ON "games"("userId", "status");
CREATE INDEX "moves_gameId_idx" ON "moves"("gameId");
```

### Seed Data Update

- 2 sample completed games for demo user

---

## Components

### New Feature: `game`

| Component | Description |
|-----------|-------------|
| `GameBoard` | react-chessboard wrapper with themes, highlights |
| `GameSetup` | Configuration form (color, strength, time) |
| `GameControls` | Resign, flip, settings gear |
| `GameHeader` | Player names, mode badge, clock |
| `GameOverDialog` | Result display with CTAs |
| `MoveList` | Scrollable SAN list with navigation |
| `PromotionDialog` | Piece selection for pawn promotion |
| `OpponentThinking` | Loading indicator during Stockfish search |
| `GameClock` | Dual clock display |
| `GameCard` | Game history item (shared) |

### Engine Modules

| Module | Path |
|--------|------|
| `ChessGame` | `src/features/game/engine/chess-game.ts` |
| `GameClock` | `src/features/game/engine/clock.ts` |
| `GameLifecycle` | `src/features/game/engine/game-lifecycle.ts` |
| `PGN Generator` | `src/features/game/engine/pgn.ts` |
| `StockfishEngine` | `src/shared/engine/stockfish-engine.ts` |
| `StockfishWorker` | `src/shared/engine/stockfish-worker.ts` |

### Stores

| Store | Purpose |
|-------|---------|
| `gameStore` | Active game state (fen, moves, phase) |
| `boardStore` | Board appearance (theme, orientation) |

---

## Libraries

### New Dependencies

| Package | Purpose |
|---------|---------|
| `chess.js` | Move validation, game rules, PGN |
| `react-chessboard` | Interactive 2D board UI |
| `stockfish.wasm` or manual WASM | Stockfish engine binary |

### Static Assets

```
public/engine/
├── stockfish.wasm
├── stockfish.js
└── stockfish-worker.js
```

---

## Folder Changes

```
CREATE  src/features/game/
CREATE  src/shared/engine/
CREATE  public/engine/
CREATE  app/(app)/play/computer/page.tsx
CREATE  app/(app)/play/[gameId]/page.tsx
CREATE  app/demo/page.tsx
CREATE  app/api/games/
UPDATE  src/features/dashboard/ (add RecentGames)
UPDATE  src/features/settings/ (add BoardThemePicker)
UPDATE  next.config.ts (COOP/COEP headers)
```

---

## Edge Cases

| Case | Handling |
|------|----------|
| Stockfish WASM fails to load | Banner with retry button, disable computer mode |
| Stockfish returns illegal move | Log error, retry search (should never happen) |
| User closes tab mid-game | Game stays IN_PROGRESS; recoverable on return |
| Pawn promotion declined | Auto-promote to queen if dialog dismissed |
| Stalemate | Detect via chess.js, show draw dialog |
| Threefold repetition | Detect via chess.js, offer draw |
| Fifty-move rule | Detect via chess.js, offer draw |
| Insufficient material | Detect via chess.js, auto-draw |
| Time runs out | Opponent wins on time |
| Network loss during move sync | Queue locally, sync on reconnect |
| Very long game (200+ moves) | Works but analysis will be slow (future concern) |
| Browser without WASM | Show unsupported browser message |

---

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Stockfish WASM load time (>5s) | Poor first game experience | Lazy load with progress indicator, cache aggressively |
| SharedArrayBuffer headers break other resources | COEP blocks external assets | Audit all external resources, add crossorigin attrs |
| react-chessboard customization limits | Board theming constrained | Evaluate early, fork if needed |
| chess.js edge cases (castling, en passant) | Illegal state | Comprehensive unit tests for special moves |

---

## Testing Strategy

| Test | Type | Coverage |
|------|------|----------|
| ChessGame: legal/illegal moves | Unit | All piece types, special moves |
| ChessGame: checkmate/stalemate/draw detection | Unit | Known positions |
| ChessGame: PGN generation | Unit | Standard games |
| GameClock: countdown, increment, timeout | Unit | Timer logic |
| GameService: create, move, complete | Integration | Full lifecycle |
| Move API: validation, ownership | Integration | Auth + validation |
| GameBoard: renders position, handles drop | Component | Mock chess.js |
| GameSetup: form submission | Component | Default and custom configs |
| E2E: Setup → play 5 moves → resign | E2E | Full computer game |
| E2E: Demo page without auth | E2E | Guest experience |
| Stockfish worker: responds to position | Integration | Engine communication |

---

## Acceptance Criteria

- [ ] User can configure and start a game against Stockfish
- [ ] Stockfish responds to moves within 3 seconds (depth 15)
- [ ] Illegal moves are rejected (piece snaps back)
- [ ] Pawn promotion dialog appears and works
- [ ] Game ends correctly on checkmate, stalemate, resignation
- [ ] Completed game saved to database with PGN
- [ ] Game appears in dashboard recent games
- [ ] Move list navigates board to selected position
- [ ] Board theme persists across sessions
- [ ] Demo page works without authentication
- [ ] Stockfish loads lazily (not on initial page load)
- [ ] Game playable on desktop and mobile (responsive board)
- [ ] All unit and integration tests pass

---

## Exit Criteria

1. Full game playable against Stockfish at any strength level
2. Games persist and appear in history
3. No server-side chess computation (verified)
4. Stockfish WASM cached after first load
5. All acceptance criteria met
6. Deployed to production

**Phase 2 is complete when a user can play a full game of chess against Stockfish with game persistence.**

---

## Future Improvements (Deferred to Later Phases)

- Offer draw (requires Stockfish evaluation heuristic)
- Takeback / undo move
- Game export (PGN download)
- Spectator mode
- Chess960 / variants

---

## Document References

- [11-stockfish-architecture.md](../11-stockfish-architecture.md)
- [13-game-engine.md](../13-game-engine.md)
- [14-state-management.md](../14-state-management.md)
- [phase-1.md](./phase-1.md)
- [phase-3.md](./phase-3.md)
