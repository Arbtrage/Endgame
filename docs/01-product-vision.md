# Product Vision

## Document Metadata

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Approved for Implementation |
| Last Updated | 2026-07-30 |
| Owner | Principal Architect |

---

## One-Line Vision

**The Cursor / Duolingo of Chess** — an AI-powered coaching platform that teaches chess intelligently while letting users play against diverse opponents, with a premium, modern experience that feels nothing like Chess.com.

---

## Problem Statement

Chess learning today is fragmented:

1. **Play platforms** (Chess.com, Lichess) optimize for competition, not teaching. Analysis exists but explanations are generic or absent.
2. **Training apps** (Chessable, Aimchess) focus on memorization or post-game stats, not conversational, adaptive coaching.
3. **Engine analysis** is accurate but inaccessible — centipawn loss numbers do not teach *why* a move was bad.
4. **AI chatbots** can explain concepts but cannot play, evaluate positions accurately, or track long-term progress.

There is no product that combines **world-class engine accuracy** with **personalized AI coaching** in a cohesive, premium experience.

---

## Solution

A dual-engine chess platform:

| Engine | Role | Runs Where |
|--------|------|------------|
| **Stockfish (WASM)** | Objective truth: best moves, blunders, accuracy, tactics | Client (browser) |
| **Gemini** | Subjective intelligence: coaching, explanations, AI opponents, lessons | Server (API) |

Stockfish tells users *what* happened. Gemini tells users *why it matters* and *what to do next*.

---

## Target Audience

| Segment | Need |
|---------|------|
| Beginners (800–1200) | Learn rules, principles, and avoid frustration |
| Intermediate (1200–1800) | Fix recurring mistakes, understand plans |
| Advanced (1800+) | Deep analysis, opening repertoire, endgame technique |
| Casual learners | Fun AI opponents, bite-sized lessons, visible progress |

---

## Core Value Propositions

1. **Explain, don't just evaluate** — Every blunder comes with a human-readable explanation tied to chess principles.
2. **Play how you want** — Stockfish for pure strength; Gemini personalities for human-like, fun, or stylistic opponents.
3. **Coach in the moment** — Coach Mode narrates important positions during live play.
4. **Learn from yourself** — Training Mode generates lessons from the user's actual weaknesses.
5. **Premium feel** — Minimal UI, smooth animations, 3D accents — closer to Linear/Cursor than a cluttered chess site.

---

## What We Are NOT Building

| Out of Scope (v1) | Rationale |
|-------------------|-----------|
| Chess.com clone (ratings ladder, tournaments, social feed) | Different product category |
| Multiplayer human-vs-human | Focus on coaching and AI opponents first |
| Mobile native apps | Web-first; responsive PWA acceptable |
| Backend Stockfish | Violates architecture rule; WASM on client only |
| Real-time voice coaching | Future consideration |
| FIDE-rated official play | Not a competitive platform |

---

## Product Pillars

### 1. Intelligence
Two specialized engines, each doing what it does best. No compromise on analytical accuracy; no compromise on coaching quality.

### 2. Personalization
Gemini adapts explanations to skill level, tracks weaknesses over time, and generates study plans.

### 3. Delight
Framer Motion transitions, React Three Fiber visual accents, thoughtful micro-interactions. The product should feel *crafted*.

### 4. Modularity
Every external dependency (Gemini, Stockfish, auth, database) sits behind an abstraction. Swap providers without rewriting features.

### 5. Deployability
Entire stack runs on Vercel + Neon. No custom infrastructure required for v1.

---

## Success Metrics (12-Month Targets)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Weekly Active Users | 10,000 | Analytics |
| Lesson completion rate | > 60% | Event tracking |
| Game completion rate | > 75% | Event tracking |
| Coach Mode session length | > 15 min avg | Session analytics |
| User-reported learning value | NPS > 40 | In-app survey |
| Analysis explanation helpfulness | > 4.0 / 5.0 | Thumbs up/down |
| P95 page load (dashboard) | < 2s | Vercel Analytics |
| Stockfish analysis latency (depth 18) | < 3s | Client telemetry |

---

## Competitive Positioning

```
                    High Coaching Quality
                            │
                            │
         [Our Product] ●  │
                            │
    Chessable ●             │        ● ChatGPT + Board
                            │
    ────────────────────────┼────────────────────────
    Low Play Quality        │              High Play Quality
                            │
         Lichess ●          │    ● Chess.com
                            │
                    Low Coaching Quality
```

We occupy the top-right quadrant: strong play infrastructure (Stockfish) plus strong coaching (Gemini).

---

## Brand & Experience Keywords

- **Minimal** — No visual clutter; content-first layouts
- **Intelligent** — AI presence is felt, not gimmicky
- **Premium** — Dark-first aesthetic, refined typography, subtle 3D
- **Encouraging** — Duolingo-like progress without infantilizing advanced players
- **Precise** — Engine-backed; never hallucinate evaluations

---

## Long-Term Vision (Beyond v1)

1. **Voice coach** — Spoken explanations during Coach Mode
2. **Opening repertoire builder** — AI-maintained repertoire from user's games
3. **Team / classroom mode** — Coaches manage student cohorts
4. **Offline PWA** — Stockfish works offline; sync when online
5. **Multi-provider AI** — OpenAI, Anthropic behind same abstraction
6. **Integrations** — Import PGN from Lichess/Chess.com

---

## Assumptions

| ID | Assumption | Impact if Wrong |
|----|------------|-----------------|
| A1 | Users accept client-side Stockfish (WASM) performance on modern browsers | May need native app or lighter engine |
| A2 | Gemini API latency (< 3s for move selection) is acceptable for AI opponent | May need move pre-computation or caching |
| A3 | Neon free/pro tier sufficient for early scale | May need connection pooling tuning earlier |
| A4 | Web-only is acceptable for target users | Mobile app becomes priority |
| A5 | English-only for v1 | i18n architecture needed sooner |
| A6 | Single-player focus is sufficient for MVP traction | Multiplayer moves up roadmap |

---

## Document References

- [02-product-requirements.md](./02-product-requirements.md)
- [05-system-architecture.md](./05-system-architecture.md)
- [30-roadmap.md](./30-roadmap.md)
