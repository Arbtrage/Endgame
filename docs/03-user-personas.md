# User Personas

## Document Metadata

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Approved for Implementation |
| Last Updated | 2026-07-30 |

---

## Overview

Personas represent primary user archetypes. All product, UX, and AI prompt decisions should be traceable to at least one persona. Skill levels reference approximate chess.com/Lichess rapid ratings.

---

## Persona 1: Alex — The Curious Beginner

### Demographics
- **Age:** 24
- **Occupation:** Software developer
- **Chess experience:** Knows rules, ~900 rating, played casually as a child
- **Tech comfort:** High

### Goals
- Learn chess properly without feeling stupid
- Understand *why* moves are good or bad, not just that they are
- Play against opponents that match skill level
- See visible progress to stay motivated

### Frustrations
- Chess.com analysis shows numbers without explanation
- Gets crushed by engines set to "medium"
- YouTube videos are passive; wants interactive learning
- Overwhelmed by opening theory

### Behaviors
- Plays 2–3 games per week, 10–20 minutes each
- Uses Coach Mode primarily
- Reads every coach explanation carefully
- Likely to share progress if streak feature exists

### Feature Affinity

| Feature | Usage |
|---------|-------|
| Coach Mode | Primary |
| Training Mode | High |
| AI Opponent (Beginner/Human-like) | High |
| Analysis Mode | Medium |
| Computer (Stockfish low Elo) | Medium |

### AI Interaction Preferences
- Explanations in plain language, no jargon without definition
- Encouraging tone, celebrate small wins
- Short explanations (2–3 sentences) during play
- Gemini skill calibration: explain as if teaching a smart adult beginner

### Success Scenario
Alex completes a Coach Mode game, understands why they lost a piece on move 14, completes a generated tactics lesson, and returns the next day because the dashboard shows a 3-day streak.

---

## Persona 2: Priya — The Ambitious Improver

### Demographics
- **Age:** 32
- **Occupation:** Marketing manager
- **Chess experience:** ~1450 rating, plays daily on mobile chess apps
- **Tech comfort:** Medium

### Goals
- Break through 1500 rating plateau
- Identify and fix recurring mistakes (especially endgames)
- Build a structured study routine without hiring a coach
- Analyze games deeply but efficiently

### Frustrations
- Aimchess stats are useful but don't teach fixes
- Chessable requires too much memorization
- No time for 1-hour study sessions
- Generic advice doesn't address her specific blunders

### Behaviors
- Plays 1 game daily (~15 min)
- Reviews analysis after every game
- Completes 2–3 training puzzles per session
- Checks weekly report every Sunday

### Feature Affinity

| Feature | Usage |
|---------|-------|
| Analysis Mode | Primary |
| Training Mode | Primary |
| AI Opponent (Intermediate/Positional) | High |
| Coach Mode | Medium |
| Weekly Reports | High |

### AI Interaction Preferences
- Concise, principle-based explanations
- References specific moves from her games
- Study plans with time estimates ("15 min/day")
- Gemini skill calibration: club player level, assume knowledge of basic tactics

### Success Scenario
Priya's weekly report identifies weak king safety in the middlegame. Training Mode generates 5 targeted puzzles. After two weeks, her accuracy in that theme improves from 62% to 78%.

---

## Persona 3: Marcus — The Competitive Enthusiast

### Demographics
- **Age:** 19
- **Occupation:** University student
- **Chess experience:** ~1950 rating, active tournament player
- **Tech comfort:** High

### Goals
- Prepare for OTB tournaments
- Analyze games with engine precision AND strategic narrative
- Practice against stylistically specific opponents (Tal, Fischer personas)
- Refine opening repertoire

### Frustrations
- Lichess analysis is great but explanation-free
- ChatGPT hallucinates evaluations
- Wants depth, not dumbed-down coaching
- Existing apps feel childish or cluttered

### Behaviors
- Plays 3–5 games per day
- Imports PGN from tournament games
- Uses Analysis Mode extensively
- Experiments with AI personalities for fun

### Feature Affinity

| Feature | Usage |
|---------|-------|
| Analysis Mode | Primary |
| AI Opponent (Advanced/Tal/Fischer/Magnus) | High |
| Computer (Stockfish high Elo) | High |
| Training Mode | Medium |
| Coach Chat | Medium |

### AI Interaction Preferences
- Deep strategic explanations with variations
- Correct engine numbers always referenced
- Can handle chess notation fluently
- Gemini skill calibration: strong club/tournament player

### Success Scenario
Marcus imports a tournament PGN, gets a full analysis with blunder annotations, asks the coach chat "why is Nf3 better than Nd2 here?" and receives a principled explanation backed by Stockfish lines.

---

## Persona 4: Elena — The Casual Fun Player

### Demographics
- **Age:** 41
- **Occupation:** Teacher
- **Chess experience:** ~1100 rating, plays for fun with family
- **Tech comfort:** Medium-low

### Goals
- Have fun playing chess
- Learn a little without pressure
- Play against entertaining opponents
- Pretty, easy-to-use interface

### Frustrations
- Chess apps feel intimidating and competitive
- Doesn't want to study openings
- Gets bored playing the same computer opponent
- Ugly, cluttered interfaces

### Behaviors
- Plays 1–2 games per week
- Picks AI personalities based on mood (Funny, Trash Talk)
- Skips analysis mostly
- Attracted to visual design and animations

### Feature Affinity

| Feature | Usage |
|---------|-------|
| AI Opponent (Funny/Trash Talk/Human-like) | Primary |
| Coach Mode | Low |
| Training Mode | Low |
| Analysis Mode | Low |
| Landing page / 3D visuals | High (first impression) |

### AI Interaction Preferences
- Lighthearted, entertaining tone for fun personas
- Minimal unsolicited coaching
- Simple UI with clear next actions
- Gemini skill calibration: friendly, accessible

### Success Scenario
Elena discovers the app through a friend's link, plays a Trash Talk AI opponent, laughs at the banter, wins a game, and bookmarks the site.

---

## Persona 5: David — The Returning Player

### Demographics
- **Age:** 55
- **Occupation:** Retired engineer
- **Chess experience:** Played in college (~1600 peak), hasn't played in 20 years, currently ~1200
- **Tech comfort:** Medium

### Goals
- Relearn modern chess thinking
- Gradual ramp-up without embarrassment
- Structured path from rusty to competent
- Understand how chess has changed (computer prep, modern openings)

### Frustrations
- Feels rusty and makes basic mistakes
- Doesn't know what's changed in chess theory
- Wants patience, not condescension
- Long forms and complex onboarding

### Behaviors
- Plays 3–4 games per week
- Uses Training Mode and Coach Mode equally
- Reads weekly reports thoroughly
- Prefers longer time controls

### Feature Affinity

| Feature | Usage |
|---------|-------|
| Coach Mode | Primary |
| Training Mode | Primary |
| Analysis Mode | High |
| AI Opponent (Intermediate/Positional) | Medium |
| Weekly Reports | High |

### AI Interaction Preferences
- Respectful, patient tone
- Connects old principles to modern context
- Highlights rust-specific patterns (hang pieces, miss tactics)
- Gemini skill calibration: experienced but rusty adult

### Success Scenario
David completes onboarding, plays Coach Mode for two weeks, receives a weekly report showing improvement in tactical awareness, and feels confident enough to join a local club.

---

## Persona Priority Matrix

| Persona | v1 Priority | Rationale |
|---------|-------------|-----------|
| Alex (Beginner) | P0 | Core target; Coach Mode designed for this user |
| Priya (Improver) | P0 | Training + Analysis drive retention |
| Marcus (Enthusiast) | P1 | Analysis depth validates engine quality |
| Elena (Casual) | P1 | AI personalities drive word-of-mouth |
| David (Returning) | P2 | Overlaps with Alex/Priya; no unique features needed |

---

## Persona-Driven Design Decisions

| Decision | Driven By |
|----------|-----------|
| Coach explanations default to 2–3 sentences | Alex, Elena |
| Analysis shows both numbers and narrative | Priya, Marcus |
| AI personality selection prominent in game setup | Elena, Marcus |
| Weekly reports included in v1 | Priya, David |
| No ranked ladder / Elo system in v1 | Elena, Alex (reduce intimidation) |
| Dark-first UI | Marcus, Priya (premium feel) |
| Onboarding < 60 seconds | David, Elena |

---

## Anti-Personas (Not Target Users)

| Anti-Persona | Why Not |
|--------------|---------|
| Professional GM seeking prep tools | Need deeper databases, not coaching UX |
| Chess streamer/content creator | Need broadcast features |
| Youth chess coach managing 30 students | Need classroom admin (future) |
| Correspondence chess player | Need async multiplayer |

---

## Document References

- [02-product-requirements.md](./02-product-requirements.md)
- [04-user-flows.md](./04-user-flows.md)
- [12-gemini-architecture.md](./12-gemini-architecture.md) — persona-aware prompts
