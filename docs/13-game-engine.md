# Game Engine

## Document Metadata

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Approved for Implementation |
| Last Updated | 2026-07-30 |

---

## Overview

The game engine is the client-side module responsible for chess logic, board state management, and game lifecycle. It uses `chess.js` for move validation and game rules, `react-chessboard` for rendering, and coordinates with Stockfish (WASM) and the server (persistence, AI moves).

---

## Component Responsibilities

```
┌─────────────────────────────────────────────────────┐
│                   Game Engine                        │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │  chess.js   │  │  Board UI    │  │  Game     │  │
│  │  (rules)    │  │  (render)    │  │  Lifecycle│  │
│  └─────────────┘  └──────────────┘  └───────────┘  │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │  Stockfish  │  │  Server Sync │  │  Clock    │  │
│  │  (WASM)     │  │  (API)       │  │  (timer)  │  │
│  └─────────────┘  └──────────────┘  └───────────┘  │
└─────────────────────────────────────────────────────┘
```

| Component | Library/Module | Role |
|-----------|---------------|------|
| Move validation | chess.js | Legal moves, game state, PGN |
| Board rendering | react-chessboard | 2D interactive board |
| Engine | Stockfish WASM | Best move, evaluation |
| State | Zustand (gameStore) | Current game state |
| Persistence | API routes | Save moves, complete game |
| AI moves | API routes | Gemini move generation |

---

## Game Lifecycle

```
CREATED → IN_PROGRESS → COMPLETED
                │
                └──→ ABANDONED (24h timeout)
```

### State Machine

```typescript
type GamePhase =
  | 'setup'           // Configuration screen
  | 'playing'         // Active game
  | 'opponent_thinking' // Waiting for Stockfish/Gemini
  | 'promotion'       // Pawn promotion dialog
  | 'game_over'       // Result display
  | 'reviewing';      // Post-game move navigation

type GameResult =
  | 'white_win'
  | 'black_win'
  | 'draw'
  | 'abandoned';

type DrawReason =
  | 'stalemate'
  | 'threefold_repetition'
  | 'fifty_move_rule'
  | 'insufficient_material'
  | 'agreement';
```

### Lifecycle Events

| Event | Trigger | Actions |
|-------|---------|---------|
| `GAME_CREATED` | User completes setup | Create DB record, init board |
| `MOVE_PLAYED` | User or opponent moves | Validate, update state, sync |
| `PROMOTION_NEEDED` | Pawn reaches rank 8/1 | Show promotion dialog |
| `OPPONENT_TURN` | After user move (if opponent next) | Request Stockfish/Gemini move |
| `CHECK_DETECTED` | chess.js `inCheck()` | Highlight king, optional sound |
| `GAME_OVER` | Checkmate/stalemate/draw/resign | Set result, save PGN, show modal |
| `GAME_ABANDONED` | 24h inactivity | Cron marks abandoned |

---

## chess.js Integration

```typescript
// src/features/game/engine/chess-game.ts

import { Chess } from 'chess.js';

class ChessGame {
  private chess: Chess;

  constructor(fen?: string) {
    this.chess = new Chess(fen);
  }

  /** Get legal moves for a square (or all if no square) */
  getLegalMoves(square?: string): Move[] { ... }

  /** Attempt a move; returns null if illegal */
  makeMove(from: string, to: string, promotion?: string): Move | null { ... }

  /** Make move from UCI notation */
  makeMoveUci(uci: string): Move | null { ... }

  /** Current FEN */
  getFen(): string { ... }

  /** Full move history in SAN */
  getHistory(): string[] { ... }

  /** Full move history in UCI */
  getHistoryUci(): string[] { ... }

  /** Generate PGN string */
  getPgn(): string { ... }

  /** Game status checks */
  isCheck(): boolean { ... }
  isCheckmate(): boolean { ... }
  isStalemate(): boolean { ... }
  isDraw(): boolean { ... }
  isGameOver(): boolean { ... }

  /** Navigate history (for review mode) */
  goToMove(index: number): void { ... }

  /** Whose turn */
  turn(): 'w' | 'b' { ... }
}
```

---

## Board UI (react-chessboard)

### Configuration

```typescript
// Board props (conceptual)
interface BoardConfig {
  position: string;           // FEN
  orientation: 'white' | 'black';
  onPieceDrop: (source, target) => boolean;
  onSquareClick: (square) => void;
  customSquareStyles: Record<string, React.CSSProperties>;
  animationDuration: number;  // ms
  boardWidth: number;         // px, responsive
  showNotation: boolean;
  customPieces: PieceSet;     // Theme-dependent
  customBoardStyle: BoardTheme;
}
```

### Square Highlighting

| Highlight | Color | Trigger |
|-----------|-------|---------|
| Selected square | Blue overlay | Click to select |
| Legal move dots | Green dots | Selected piece |
| Last move | Yellow tint | After any move |
| Check | Red tint | King in check |
| Coach highlight | Purple tint | Coach referencing square |
| Analysis arrow | Green/red arrow | Best move / played move |

### Drag & Drop Flow

```
1. User drags piece from square A
2. onPieceDrop(A, B) called
3. chess.js validates move A→B
4. If legal:
   a. Apply move to chess.js
   b. Update Zustand store (fen, history)
   c. Animate piece on board
   d. Sync move to server (debounced)
   e. If opponent's turn → trigger opponent move
   f. Check game over conditions
5. If illegal:
   a. Snap piece back (return false)
```

---

## Opponent Move Logic

### Stockfish Opponent (Computer & Coach Mode)

```typescript
async function playStockfishMove(game: ChessGame, skillLevel: number) {
  gameStore.setPhase('opponent_thinking');
  
  const engine = await initStockfish();
  engine.setSkillLevel(skillLevel);
  
  const result = await engine.getBestMove(
    game.getFen(),
    game.getHistoryUci(),
    { depth: 15 }
  );
  
  const move = game.makeMoveUci(result.uci);
  if (!move) throw new Error('Stockfish returned illegal move');
  
  gameStore.applyMove(move);
  gameStore.setPhase('playing');
  
  await syncMoveToServer(move);
  checkGameOver();
}
```

### Gemini Opponent (AI Opponent Mode)

```typescript
async function playAIMove(game: ChessGame, gameId: string, personality: string) {
  gameStore.setPhase('opponent_thinking');
  
  const response = await fetch(`/api/games/${gameId}/ai-move`, {
    method: 'POST',
    body: JSON.stringify({
      fen: game.getFen(),
      moves: game.getHistoryUci(),
      personality,
    }),
  });
  
  const { data } = await response.json();
  const move = game.makeMoveUci(data.uci);
  if (!move) throw new Error('AI returned illegal move');
  
  gameStore.applyMove(move);
  
  if (data.comment) {
    gameStore.addOpponentComment(data.comment);
  }
  
  gameStore.setPhase('playing');
  await syncMoveToServer(move);
  checkGameOver();
}
```

---

## Clock Management

```typescript
// src/features/game/engine/clock.ts

interface GameClock {
  whiteTime: number;    // milliseconds remaining
  blackTime: number;
  increment: number;    // ms added per move
  activeColor: 'white' | 'black' | null;
  
  start(): void;
  stop(): void;
  switchTurn(): void;   // Stop current, start other, add increment
  getDisplayTime(color: 'white' | 'black'): string; // "10:30"
}

// Clock runs via requestAnimationFrame or setInterval(100ms)
// On timeout: game over, opponent wins on time
```

Time controls:

| Preset | Initial | Increment |
|--------|---------|-----------|
| Unlimited | ∞ | 0 |
| Bullet | 60s | 0 |
| Blitz | 180s | 2s |
| Rapid | 600s | 0 |
| Classical | 900s | 10s |

---

## Pawn Promotion

When a pawn reaches the last rank:

1. Move is held pending (not applied to chess.js yet)
2. Promotion dialog appears (Q, R, B, N choices)
3. User selects piece
4. Move applied with promotion piece
5. Normal flow continues

Default promotion: Queen (if user clicks target square without dialog, auto-queen after 0ms — dialog always shown).

---

## Game Modes Implementation

| Mode | User Opponent | Coach | Analysis | Save |
|------|--------------|-------|----------|------|
| Computer | Stockfish | — | — | Yes |
| AI Opponent | Gemini | — | — | Yes |
| Coach | Stockfish | Gemini (key moments) | — | Yes |
| Analysis | — | Gemini (on demand) | Stockfish | Yes |
| Training | — | Gemini (hints) | Stockfish (verify) | Progress only |

Each mode is a configuration of the same game engine with different overlays:

```typescript
interface GameModeConfig {
  mode: 'computer' | 'ai_opponent' | 'coach';
  opponent: 'stockfish' | 'gemini';
  stockfishLevel?: number;
  aiPersonality?: string;
  coachEnabled?: boolean;
  timeControl?: TimeControl;
}
```

---

## Server Sync Strategy

| Event | Sync Method | Timing |
|-------|-------------|--------|
| Game created | POST /api/games | Immediate |
| Move played | POST /api/games/:id/moves | Debounced 500ms |
| Game completed | POST /api/games/:id/complete | Immediate |
| Game resigned | POST /api/games/:id/resign | Immediate |

### Offline Resilience

- Moves stored in Zustand (memory) during game
- If network fails during move sync, queue moves locally
- On reconnect, batch sync queued moves
- Game completion requires network (must save result)

---

## PGN Generation

Generated client-side on game completion using chess.js:

```typescript
const pgn = chess.pgn({
  max_width: 5,
  newline_char: '\n',
});
```

PGN includes headers:

```
[Event "Chess Coach Game"]
[Site "chess-coach.app"]
[Date "2026.07.30"]
[White "{whiteName}"]
[Black "{blackName}"]
[Result "{result}"]
[Mode "{mode}"]
[Personality "{personality}"]
```

---

## File Structure

```
src/features/game/
├── components/
│   ├── GameBoard.tsx          # react-chessboard wrapper
│   ├── GameSetup.tsx          # Mode/color/strength selection
│   ├── GameControls.tsx       # Resign, draw, settings
│   ├── GameHeader.tsx         # Players, clock, mode badge
│   ├── GameOverDialog.tsx     # Result + CTAs
│   ├── MoveList.tsx           # Scrollable move history
│   ├── PromotionDialog.tsx    # Pawn promotion picker
│   ├── EvalBar.tsx            # Evaluation bar (coach/analysis)
│   └── OpponentThinking.tsx   # Loading indicator
├── engine/
│   ├── chess-game.ts          # chess.js wrapper
│   ├── clock.ts               # Timer logic
│   ├── game-lifecycle.ts      # State machine
│   └── pgn.ts                 # PGN generation
├── hooks/
│   ├── useGame.ts             # Main game hook
│   ├── useStockfishOpponent.ts
│   ├── useAIOpponent.ts
│   └── useGameClock.ts
├── stores/
│   └── game-store.ts          # Zustand store
├── types/
│   └── game.types.ts
└── index.ts
```

---

## Assumptions

| ID | Assumption |
|----|------------|
| GE-1 | chess.js v1.x (supports all standard rules including en passant, castling) |
| GE-2 | react-chessboard v4.x with TypeScript support |
| GE-3 | Single active game per tab (no multi-game tabs) |
| GE-4 | No takeback in v1 |
| GE-5 | Variants (Chess960, etc.) not supported in v1 |

---

## Document References

- [11-stockfish-architecture.md](./11-stockfish-architecture.md)
- [12-gemini-architecture.md](./12-gemini-architecture.md)
- [14-state-management.md](./14-state-management.md)
- [06-frontend-architecture.md](./06-frontend-architecture.md)
