# Design Principles

## Document Metadata

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Approved for Implementation |
| Last Updated | 2026-07-30 |

---

## Core Principles

### 1. Content Over Chrome

The chess board and coaching content are the heroes. Navigation, borders, and decorative elements should recede. When in doubt, remove UI elements rather than add them.

**Application:**
- Game page: board occupies 60%+ of viewport
- Coach explanations: text-first, no unnecessary icons
- Dashboard: cards with data, not decorative illustrations

### 2. Progressive Disclosure

Show only what the user needs at their current moment. Advanced features reveal themselves as users grow.

**Application:**
- Beginner: Coach Mode prominently suggested, analysis stats simplified
- Advanced: Full eval graph, engine lines, detailed classifications
- Settings: Common options visible, advanced hidden behind "Advanced" section

### 3. Engine Truth, AI Narrative

Stockfish numbers are authoritative. Gemini provides the story. Never let AI override or contradict engine evaluation.

**Application:**
- Explanations always reference provided eval numbers
- If Gemini unavailable, show Stockfish data alone (never fake explanations)
- Move classifications come from Stockfish, not Gemini

### 4. Calm Intelligence

The product should feel smart without being overwhelming. AI presence is subtle — a coach beside you, not a chatbot shouting.

**Application:**
- Coach panel slides in gently, doesn't pop up intrusively
- AI thinking states use calm animations, not aggressive spinners
- Personality comments are brief, not walls of text

### 5. Immediate Feedback

Every user action gets instant visual response. Network latency is hidden behind optimistic updates and loading states.

**Application:**
- Moves appear on board immediately (before server sync)
- Chat messages appear instantly (optimistic)
- Button clicks have 150ms press animation
- Loading states appear after 200ms delay (avoid flash)

---

## UX Principles

### Reduce Cognitive Load

| Do | Don't |
|----|-------|
| Pre-select sensible defaults | Force configuration before every game |
| Show one coaching point at a time | Dump all analysis at once |
| Use familiar chess notation | Invent custom notation |
| Limit choices to 3–5 options | Present 20 equal-weight options |

### Encourage Flow State

- Game setup: 2 clicks to start (color + play)
- Between games: "Play Again" is the primary CTA
- Minimize modal interruptions during gameplay
- Coach explanations appear in side panel, never blocking the board

### Celebrate Progress (Duolingo-Inspired)

- Streak counter visible on dashboard
- Lesson completion animations (subtle confetti via particles)
- Weekly report highlights improvements, not just weaknesses
- "Brilliant move" moments get special visual treatment

### Respect the User's Time

- Analysis runs client-side (no waiting for server)
- AI responses target < 5 seconds
- Training exercises load instantly (positions pre-generated)
- No unskippable tutorials or onboarding videos

---

## Visual Principles

### Dark-First

Dark mode is the default and primary design target. Light mode is supported but secondary.

### Typography Hierarchy

One font family (Geist), three weights (400, 500, 700), clear size hierarchy. Monospace only for chess notation and engine data.

### Consistent Spacing

8px grid everywhere. No arbitrary pixel values. Use Tailwind spacing tokens exclusively.

### Restrained Color

- 60% neutral grays (backgrounds, text)
- 30% primary green (actions, positive states)
- 10% accent colors (coach purple, streak gold, error red)

### Motion with Purpose

Every animation communicates state change:
- Panel open → content available
- Piece move → position changed
- Eval bar shift → advantage changed
- Streak pulse → milestone reached

No animation exists purely for decoration (except landing page 3D).

---

## AI Interaction Principles

### 1. Context-Aware, Not Generic

Every AI response should reference the user's specific situation (position, history, skill level). Generic chess lectures are failure.

### 2. Skill-Calibrated Language

| Skill Level | Language Style |
|-------------|---------------|
| < 1000 | Plain English, define terms, use analogies |
| 1000–1500 | Standard chess terms, explain advanced concepts briefly |
| 1500–1800 | Assume tactical awareness, focus on plans |
| > 1800 | Full notation, deep strategic analysis |

### 3. Honest About Limitations

If Gemini cannot explain something well, say so. "This is a complex position — the engine shows equality but the plans are subtle" is better than a hallucinated explanation.

### 4. Personality Integrity

AI opponent personalities must be consistent throughout a game. A Trash Talk opponent doesn't suddenly become polite. A Tal-inspired opponent keeps sacrificing.

---

## Architecture Principles

### 1. Feature Isolation

Features should be deletable. Removing `features/training/` should not break `features/game/`.

### 2. Provider Swappability

Gemini → OpenAI should require changing one file (`gemini.provider.ts` → `openai.provider.ts`) and one env var.

### 3. Client-First Computation

If it can run on the client, it should. Server resources are for persistence and AI only.

### 4. Working State Per Phase

Every implementation phase produces a deployable, testable application. No "coming soon" placeholders in production.

---

## Anti-Patterns (Explicitly Avoid)

| Anti-Pattern | Why |
|--------------|-----|
| Modal-heavy UX | Interrupts flow, feels like 2010 web apps |
| Fake engine evaluations from AI | Destroys trust |
| Onboarding longer than 60 seconds | Drop-off risk |
| Loading spinners without context | "Loading..." → "Analyzing move 14 of 42..." |
| Chess.com-style cluttered board UI | Not our brand |
| 3D chess board | Gimmicky, hurts usability |
| Server-side Stockfish | Architecture violation |
| Exposed API keys | Security violation |
| Monolithic components/ folder | Unmaintainable |
| Boolean prop explosion | Use composition instead |

---

## Document References

- [01-product-vision.md](./01-product-vision.md)
- [15-ui-design-system.md](./15-ui-design-system.md)
- [03-user-personas.md](./03-user-personas.md)
