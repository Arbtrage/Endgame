# Stockfish Architecture

## Document Metadata

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Approved for Implementation |
| Last Updated | 2026-08-05 |

---

## Overview

Stockfish runs on the client as a WebAssembly (WASM) module inside a dedicated Web Worker for interactive gameplay and manual analysis. **Background analysis jobs** are the one server-side exception: Trigger.dev workers run native Stockfish via UCI for post-game and backfill analysis only.

---

## Client vs worker

| Context | Engine | Used for |
|---------|--------|----------|
| Browser | `stockfish.wasm` via Web Worker | Play, coach, manual Fast/Standard re-analysis |
| Trigger.dev worker | Native Stockfish binary (`STOCKFISH_PATH`) | Post-game background analysis, backfill CLI |

The Next.js API layer stores analysis results but does not run Stockfish during normal request handling.

---

## Responsibilities (client)

| Capability | Used In |
|------------|---------|
| Best move calculation | Computer mode, Coach mode (opponent) |
| Position evaluation (centipawns) | Analysis mode, Coach mode (key moment detection) |
| Move classification | Analysis mode (blunder/mistake/inaccuracy) |
| Depth-based search | All modes |
| Multi-PV (top N moves) | Analysis mode, hint system |
| Skill level adjustment | Computer mode, Coach mode |

---

## WASM Distribution

### Package

Use `stockfish.wasm` npm package or load from `/public/engine/`:

```
public/engine/
├── stockfish.wasm          # WASM binary (~7MB)
├── stockfish.js            # WASM loader/stub
└── stockfish-worker.js     # Worker entry point
```

### Loading Strategy

1. WASM is NOT loaded on initial page load
2. Lazy-loaded when user enters any game mode or analysis
3. Cached by browser after first load
4. Loading indicator shown during initialization (~1-3s)

```typescript
// Conceptual loading flow
async function initStockfish(): Promise<StockfishEngine> {
  if (engineInstance) return engineInstance;
  
  const worker = new Worker('/engine/stockfish-worker.js');
  engineInstance = new StockfishEngine(worker);
  await engineInstance.ready(); // Wait for WASM init + uciok
  
  return engineInstance;
}
```

---

## Web Worker Architecture

```
┌─────────────────────────────────┐
│         Main Thread             │
│                                 │
│  StockfishEngine (singleton)    │
│  ├─ postMessage(cmd)            │
│  ├─ onMessage(handler)          │
│  └─ Promise-based API           │
│                                 │
│  Used by:                       │
│  ├─ gameStore (opponent moves)  │
│  ├─ analysisEngine (eval)       │
│  └─ coachDetector (key moments) │
└────────────┬────────────────────┘
             │ postMessage / onmessage
┌────────────▼────────────────────┐
│         Web Worker              │
│                                 │
│  stockfish-worker.js            │
│  ├─ Load WASM module            │
│  ├─ UCI command interface       │
│  ├─ Parse engine output         │
│  └─ postMessage results         │
└─────────────────────────────────┘
```

### Why Web Worker

- Stockfish search is CPU-intensive
- Running on main thread blocks UI (board animations, user input)
- Worker keeps UI responsive at any search depth

---

## UCI Protocol Interface

Stockfish communicates via UCI (Universal Chess Interface) text commands:

### Initialization Sequence

```
→ uci
← uciok
→ setoption name Threads value 1
→ setoption name Hash value 128
→ isready
← readyok
```

### Position + Search

```
→ position fen {fen} moves {move1} {move2} ...
→ go depth {depth}
← info depth 1 score cp 30 nodes 20 nps 10000
← info depth 2 score cp 28 nodes 100 nps 12000
...
← bestmove e2e4 ponder e7e5
```

### Skill Level (Computer Mode)

```
→ setoption name Skill Level value {0-20}
```

| Skill Level | Approximate Elo |
|-------------|-----------------|
| 0 | 800 |
| 5 | 1200 |
| 10 | 1600 |
| 15 | 2000 |
| 20 | 3200 |

---

## Engine Wrapper API

```typescript
// src/shared/engine/types.ts

interface StockfishEngine {
  /** Initialize WASM and wait for ready */
  ready(): Promise<void>;
  
  /** Get best move for position */
  getBestMove(fen: string, moves: string[], options: SearchOptions): Promise<EngineMove>;
  
  /** Evaluate position (returns centipawn score) */
  evaluate(fen: string, moves: string[], depth: number): Promise<Evaluation>;
  
  /** Get top N moves with evaluations */
  getTopMoves(fen: string, moves: string[], depth: number, multiPv: number): Promise<EngineMove[]>;
  
  /** Set skill level (0-20) */
  setSkillLevel(level: number): void;
  
  /** Stop current search */
  stop(): void;
  
  /** Terminate worker */
  destroy(): void;
}

interface SearchOptions {
  depth?: number;        // Default: 15
  moveTime?: number;     // Max time in ms (alternative to depth)
  skillLevel?: number;   // 0-20
}

interface EngineMove {
  uci: string;           // e.g., "e2e4"
  san?: string;          // Computed via chess.js
  eval: number;          // Centipawns from current player's perspective
  depth: number;
  nodes: number;
  pv?: string[];         // Principal variation
}

interface Evaluation {
  cp: number;            // Centipawns (+ = white advantage)
  mate?: number;         // Mate in N (if applicable)
  depth: number;
  bestMove: string;      // UCI
}
```

---

## Search Depth Configuration

| Context | Default Depth | Max Depth | Time Limit |
|---------|--------------|-----------|------------|
| Computer mode (move) | 15 | 20 | 3s |
| Analysis (full game) | 18 | 22 | 5s per position |
| Coach mode (key moment check) | 12 | 15 | 2s |
| Training (verify solution) | 15 | 18 | 2s |
| Eval bar (live) | 10 | 12 | 500ms |

---

## Move Classification Algorithm

Used in Analysis Mode. Runs entirely on client.

```typescript
// Conceptual classification logic
function classifyMove(
  evalBefore: number,    // Best move eval before user's move
  evalAfter: number,     // Eval after user's move
  bestMoveEval: number,  // Eval if best move was played
  isBestMove: boolean,
  cpLoss: number         // bestMoveEval - evalAfter
): MoveClassification {
  if (isBestMove && evalAfter - evalBefore >= 150) return 'brilliant';
  if (isBestMove) return 'best';
  if (cpLoss <= 10) return 'good';
  if (cpLoss <= 30) return 'inaccuracy';
  if (cpLoss <= 100) return 'mistake';
  return 'blunder';
}
```

### Classification Thresholds

| Classification | CP Loss Range |
|----------------|---------------|
| Brilliant | Best move AND eval gain ≥ 150cp |
| Best | Best move (cp loss ≤ 10) |
| Great | CP loss 11–20 |
| Good | CP loss 21–30 |
| Inaccuracy | CP loss 31–60 |
| Mistake | CP loss 61–100 |
| Blunder | CP loss > 100 |

---

## Accuracy & ACPL Calculation

```typescript
// Accuracy: percentage of "good" moves (cp loss ≤ 30)
function calculateAccuracy(moveAnalysis: MoveAnalysis[]): number {
  const userMoves = moveAnalysis.filter(m => m.isUserMove);
  const goodMoves = userMoves.filter(m => m.cpLoss <= 30);
  return (goodMoves.length / userMoves.length) * 100;
}

// ACPL: Average Centipawn Loss
function calculateACPL(moveAnalysis: MoveAnalysis[]): number {
  const userMoves = moveAnalysis.filter(m => m.isUserMove);
  const totalLoss = userMoves.reduce((sum, m) => sum + m.cpLoss, 0);
  return totalLoss / userMoves.length;
}
```

---

## Key Moment Detection (Coach Mode)

Client-side detection using Stockfish evaluations:

```typescript
interface KeyMomentTrigger {
  type: 'blunder' | 'brilliant' | 'opening_exit' | 'endgame_entry' | 'check' | 'material_change';
  condition: (ctx: EvalContext) => boolean;
}

const triggers: KeyMomentTrigger[] = [
  {
    type: 'blunder',
    condition: (ctx) => Math.abs(ctx.evalSwing) >= 200,
  },
  {
    type: 'brilliant',
    condition: (ctx) => ctx.isBestMove && ctx.evalGain >= 150,
  },
  {
    type: 'opening_exit',
    condition: (ctx) => ctx.moveNumber === 12,
  },
  {
    type: 'endgame_entry',
    condition: (ctx) => ctx.totalPieces <= 6 && ctx.prevTotalPieces > 6,
  },
  {
    type: 'check',
    condition: (ctx) => ctx.isCheck,
  },
  {
    type: 'material_change',
    condition: (ctx) => ctx.capturedPiece !== null,
  },
];
```

When triggered → POST `/api/coach/explain-moment` with eval data.

---

## SharedArrayBuffer Requirements

Stockfish WASM performs best with `SharedArrayBuffer`, which requires specific HTTP headers:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

### Next.js Configuration

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
    ];
  },
};
```

### Fallback

If SharedArrayBuffer is unavailable (older browsers, missing headers):
- Stockfish still works but ~30% slower
- Reduce default search depth by 3
- Log warning to telemetry

---

## Error Handling

| Error | Handling |
|-------|----------|
| WASM load failure | Show banner: "Chess engine failed to load" + retry button |
| Worker crash | Auto-recreate worker, retry last command once |
| Search timeout | Return best result so far (partial depth) |
| Invalid FEN | Reject with error; don't send to engine |
| Memory pressure | Reduce Hash to 64MB, depth by 3 |

---

## Performance Budget

| Metric | Target |
|--------|--------|
| WASM initial load | < 3s (first visit) |
| WASM cached load | < 500ms |
| Move at depth 15 | < 2s |
| Full game analysis (40 moves, depth 18) | < 60s |
| Memory usage | < 256MB |

---

## File Structure

```
src/shared/engine/
├── stockfish-engine.ts      # Main wrapper class
├── stockfish-worker.ts      # Worker creation and management
├── types.ts                 # Engine types
├── classification.ts        # Move classification logic
├── accuracy.ts              # Accuracy/ACPL calculations
├── key-moments.ts           # Coach mode moment detection
├── constants.ts             # Depth configs, thresholds
└── index.ts                 # Public exports

public/engine/
├── stockfish.wasm
├── stockfish.js
└── stockfish-worker.js
```

---

## Assumptions

| ID | Assumption |
|----|------------|
| SF-1 | Stockfish 16+ WASM build (NNUE enabled) |
| SF-2 | Single worker instance shared across features |
| SF-3 | 1 thread, 128MB hash (sufficient for browser) |
| SF-4 | COOP/COEP headers configured on Vercel |
| SF-5 | Users have modern browsers with WASM support |

---

## Document References

- [05-system-architecture.md](./05-system-architecture.md)
- [13-game-engine.md](./13-game-engine.md)
- [22-performance.md](./22-performance.md)
