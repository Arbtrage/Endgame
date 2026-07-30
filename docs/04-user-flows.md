# User Flows

## Document Metadata

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Approved for Implementation |
| Last Updated | 2026-07-30 |

---

## Flow Index

| ID | Flow | Auth Required |
|----|------|---------------|
| UF-01 | Landing → Sign Up → Dashboard | Partial |
| UF-02 | Play vs Computer (Stockfish) | Yes |
| UF-03 | Play vs AI Opponent (Gemini) | Yes |
| UF-04 | Coach Mode | Yes |
| UF-05 | Analyze a Game | Yes |
| UF-06 | Training Mode | Yes |
| UF-07 | Coach Chat | Yes |
| UF-08 | View Progress & Weekly Report | Yes |
| UF-09 | Settings & Profile | Yes |
| UF-10 | Demo / Guest Experience | No |

---

## UF-01: Landing → Sign Up → Dashboard

### Entry Point
`/` (landing page)

### Steps

```
[Landing Page]
    │
    ├─ Click "Get Started" ──────────────────────┐
    ├─ Click "Try Demo" ────► [UF-10 Demo Flow]  │
    └─ Click "Sign In" ─────► [Sign In Page]     │
                                                  ▼
                                          [Sign Up Page]
                                                  │
                                          Submit credentials
                                          or Google OAuth
                                                  │
                                                  ▼
                                          [Onboarding (optional)]
                                          - Display name
                                          - Estimated skill level
                                          - Preferred mode
                                                  │
                                                  ▼
                                          [Dashboard]
```

### Dashboard Contents
- Welcome message with streak (if returning user)
- Quick action cards: Play, Analyze, Train, Coach
- Recent games list (last 5)
- Active lesson progress (if any)
- Weekly report card (if available)

### Edge Cases
- OAuth failure → show error, retry button
- Email already exists → redirect to sign in with message
- Skip onboarding → default skill level = "unknown" (Gemini adapts dynamically)

---

## UF-02: Play vs Computer (Stockfish)

### Entry Points
- Dashboard → "Play" → "vs Computer"
- Navigation → Play → Computer

### Steps

```
[Game Setup]
    │
    ├─ Select color (White / Black / Random)
    ├─ Select strength (slider: 800–3200 Elo)
    └─ Select time control (optional)
    │
    ▼
[Game Board View]
    │
    ├─ User makes move (click/drag)
    │   └─ chess.js validates → update board
    │
    ├─ Stockfish calculates response (client WASM)
    │   └─ Apply move after animation delay
    │
    ├─ Repeat until: checkmate / stalemate / draw / resign
    │
    ├─ Optional: Navigate move history
    ├─ Optional: Resign / Offer draw
    │
    ▼
[Game Over Modal]
    │
    ├─ Result display
    ├─ "Analyze Game" CTA → [UF-05]
    ├─ "Play Again" → [Game Setup]
    └─ "Back to Dashboard"
    │
    ▼
[Game saved to DB via API]
```

### State During Game
- Board position (FEN)
- Move history (SAN + UCI)
- Clock (if timed)
- Game status (in_progress / completed)

---

## UF-03: Play vs AI Opponent (Gemini)

### Entry Points
- Dashboard → "Play" → "vs AI Coach"
- Navigation → Play → AI Opponent

### Steps

```
[Game Setup]
    │
    ├─ Select color
    ├─ Select personality (grid of personality cards)
    │   └─ Each card: name, description, difficulty indicator
    └─ Select time control (optional)
    │
    ▼
[Game Board View]
    │
    ├─ User makes move
    │   └─ chess.js validates locally
    │
    ├─ POST /api/games/{id}/ai-move
    │   └─ Server: Gemini selects move → chess.js validates → return move
    │
    ├─ Optional: Open chat panel → POST /api/coach/chat (in-game context)
    │
    ├─ Repeat until game end
    │
    ▼
[Game Over Modal]
    │
    ├─ Personality-specific end message (Gemini generated)
    ├─ "Analyze Game" / "Play Again" / "Dashboard"
    │
    ▼
[Game saved with personality metadata]
```

### Loading States
- AI thinking indicator (animated, personality-themed)
- Timeout after 15s → retry with fallback move (Stockfish weak line)

---

## UF-04: Coach Mode

### Entry Points
- Dashboard → "Coach Mode"
- Navigation → Play → Coach Mode

### Steps

```
[Game Setup]
    │
    ├─ Select color
    ├─ Select Stockfish strength
    └─ Coach intro message (Gemini: "I'll guide you through this game")
    │
    ▼
[Split View: Board + Coach Panel]
    │
    ├─ User makes move
    ├─ Stockfish responds
    │
    ├─ Client: Stockfish evaluates position
    │   └─ If key moment detected:
    │       POST /api/coach/explain-moment
    │       └─ Coach panel shows explanation
    │
    ├─ User can type follow-up in coach panel
    │
    ├─ Repeat until game end
    │
    ▼
[Game Over + Coach Summary]
    │
    └─ Gemini generates post-game coaching summary
        POST /api/coach/game-summary
```

### Key Moment Triggers (Client-Side Detection)

| Trigger | Condition |
|---------|-----------|
| Blunder | Eval swing ≥ 200cp vs previous best |
| Brilliant | Move matches engine top move AND eval gain ≥ 150cp |
| Opening exit | Move number = 12 |
| Endgame entry | Both sides ≤ 1 queen + ≤ 3 minor/major pieces |
| Check | King in check |
| Material change | Capture or pawn promotion |

---

## UF-05: Analyze a Game

### Entry Points
- Dashboard → "Analyze"
- Game Over modal → "Analyze Game"
- Game history → select game → "Analyze"
- Navigation → Analyze

### Steps

```
[Analysis Source Selection]
    │
    ├─ Select from game history
    ├─ Upload PGN file
    └─ Paste PGN text
    │
    ▼
[Analysis View]
    │
    ├─ Client: Stockfish analyzes each position
    │   └─ Progress bar during analysis
    │
    ├─ Display:
    │   ├─ Evaluation graph
    │   ├─ Move list with classification icons
    │   ├─ Accuracy + ACPL
    │   └─ Board at selected move
    │
    ├─ Click critical move → highlight on board
    │
    ├─ "Explain" button on any move
    │   └─ POST /api/coach/explain-move
    │       └─ Side panel with Gemini explanation
    │
    ├─ "Full Summary" button
    │   └─ POST /api/coach/game-summary
    │       └─ Narrative overview of the game
    │
    ▼
[Analysis saved to DB]
```

---

## UF-06: Training Mode

### Entry Points
- Dashboard → "Train"
- Weekly report → "Start recommended lesson"
- Navigation → Train

### Steps

```
[Training Hub]
    │
    ├─ Active study plan (if exists)
    ├─ Recommended lessons (Gemini-generated from weaknesses)
    └─ Topic browser: Tactics, Endgame, Opening, Positional
    │
    ▼
[Lesson View]
    │
    ├─ Lesson intro (Gemini text + optional diagram position)
    │
    ├─ For each exercise:
    │   ├─ Show position on board
    │   ├─ User attempts move
    │   ├─ Client: Stockfish verifies correctness
    │   ├─ If wrong: Gemini hint (progressive: subtle → direct)
    │   └─ If correct: next exercise
    │
    ├─ Lesson complete → progress saved
    │
    ▼
[Lesson Summary]
    │
    ├─ Score, time, concepts covered
    └─ "Next lesson" or "Back to hub"
```

### Lesson Generation Flow (Background)

```
GET /api/training/recommendations
    │
    └─ Server aggregates user weaknesses from recent analyses
        └─ Gemini generates lesson plan
            └─ Stored as TrainingLesson record
```

---

## UF-07: Coach Chat

### Entry Points
- Floating coach button (authenticated pages)
- Coach panel in Coach Mode
- Analysis view sidebar

### Steps

```
[Chat Panel Opens]
    │
    ├─ Load recent chat history (GET /api/coach/chat/history)
    │
    ├─ User types message
    │   └─ POST /api/coach/chat
    │       Body: { message, context: { fen?, gameId?, mode? } }
    │
    ├─ Gemini responds with coaching answer
    │
    ├─ Optional: User asks about current position
    │   └─ Context includes FEN + recent moves
    │
    └─ Chat persisted per session
```

### Context Injection Rules

| Page Context | Auto-Included in Prompt |
|--------------|------------------------|
| In game | FEN, last 5 moves, game mode, personality |
| Analysis | FEN at selected move, eval, classification |
| Dashboard | Recent weaknesses, active lessons |
| General | User skill estimate, recent game results |

---

## UF-08: View Progress & Weekly Report

### Entry Points
- Dashboard → "Progress"
- Navigation → Progress

### Steps

```
[Progress Page]
    │
    ├─ Skill estimate chart (over time)
    ├─ Accuracy trend
    ├─ Weakness tags (from analysis aggregation)
    ├─ Games played this week
    ├─ Lessons completed
    │
    └─ Weekly Report section
        │
        ├─ If report exists: display
        └─ If not: "Report generates every Monday"
            └─ POST /api/reports/generate (cron or on-demand)
```

---

## UF-09: Settings & Profile

### Steps

```
[Settings Page]
    │
    ├─ Profile: name, avatar upload
    ├─ Board: theme, piece set
    ├─ Game defaults: Stockfish strength, AI personality
    ├─ Notifications (future)
    └─ Account: change password, delete account
```

---

## UF-10: Demo / Guest Experience

### Purpose
Allow unauthenticated users to experience the product before signing up.

### Steps

```
[Landing Page]
    │
    └─ Click "Try Demo"
        │
        ▼
[Demo Board]
    │
    ├─ Pre-loaded position or fresh game
    ├─ Play vs weak Stockfish (client-only, no save)
    ├─ One coach explanation demo (pre-cached or live Gemini with rate limit)
    │
    └─ CTA: "Sign up to save progress" → [UF-01]
```

### Limitations
- No game save
- No training mode
- Rate-limited AI explanations (1 per demo session)
- No chat history

---

## Navigation Map

```
/                     Landing
/auth/sign-in         Sign In
/auth/sign-up         Sign Up
/dashboard            Dashboard (auth)
/play/computer        Computer mode setup
/play/ai              AI opponent setup
/play/coach           Coach mode setup
/play/[gameId]        Active game
/analyze              Analysis hub
/analyze/[gameId]     Game analysis view
/train                Training hub
/train/[lessonId]     Active lesson
/progress             Progress & reports
/coach                Full-page coach chat
/settings             Settings
/demo                 Guest demo
```

---

## Error Flows (Cross-Cutting)

| Scenario | User Experience |
|----------|-----------------|
| Gemini timeout | "Coach is thinking..." → retry → fallback message |
| Stockfish WASM fail | Banner: "Engine unavailable" + reload button |
| Network loss during game | Local state preserved; sync on reconnect |
| Invalid move attempted | Board rejects; no API call |
| Session expired | Redirect to sign in; preserve intended URL |
| Rate limit hit | Toast: "Slow down! Try again in X seconds" |

---

## Document References

- [06-frontend-architecture.md](./06-frontend-architecture.md)
- [09-api-design.md](./09-api-design.md)
- [18-navigation.md](./18-navigation.md)
