# Roadmap

## Document Metadata

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Approved for Implementation |
| Last Updated | 2026-07-30 |

---

## Implementation Phases

The project is divided into five implementation phases. Each phase produces a working, deployable application.

| Phase | Name | Version | Duration (Est.) | Document |
|-------|------|---------|-----------------|----------|
| 1 | Foundation | v0.1.0 | 2 weeks | [phase-1.md](./phases/phase-1.md) |
| 2 | Core Chess | v0.2.0 | 2 weeks | [phase-2.md](./phases/phase-2.md) |
| 3 | AI Coaching | v0.3.0 | 2 weeks | [phase-3.md](./phases/phase-3.md) |
| 4 | Analysis & Training | v0.4.0 | 2 weeks | [phase-4.md](./phases/phase-4.md) |
| 5 | Polish & Launch | v1.0.0 | 2 weeks | [phase-5.md](./phases/phase-5.md) |

**Total estimated duration:** 10 weeks

---

## Phase Summary

### Phase 1: Foundation (v0.1.0)

**Goal:** Project infrastructure, auth, design system, landing page, dashboard shell.

- Project scaffolding and folder structure
- Database (Neon + Prisma + Better Auth)
- Design system (shadcn/ui, Tailwind, dark theme)
- Landing page with 3D hero
- Auth flow (email + Google)
- Dashboard shell with navigation
- App shell (sidebar, layout)

**Exit state:** User can sign up, sign in, see dashboard. No game functionality yet.

---

### Phase 2: Core Chess (v0.2.0)

**Goal:** Play chess against Stockfish. Full game lifecycle.

- Stockfish WASM integration (Web Worker)
- Chess board (react-chessboard + chess.js)
- Computer mode (full game flow)
- Game persistence (create, moves, complete)
- Game history on dashboard
- Settings (board theme, default strength)
- Move list, game controls, game over dialog

**Exit state:** User can play a full game against Stockfish at any strength. Games saved and viewable in history.

---

### Phase 3: AI Coaching (v0.3.0)

**Goal:** Gemini integration, AI opponent, coach mode.

- AI provider abstraction + Gemini implementation
- AI opponent mode (all personalities)
- Coach mode (Stockfish opponent + Gemini explanations)
- Coach panel and key moment detection
- Coach chat (global FAB)
- Rate limiting on AI endpoints

**Exit state:** User can play against AI personalities and receive coaching during games. Coach chat available globally.

---

### Phase 4: Analysis & Training (v0.4.0)

**Goal:** Post-game analysis and personalized training.

- Analysis mode (Stockfish client analysis + Gemini explanations)
- Evaluation graph and move classification
- PGN import
- Training mode (Gemini-generated lessons)
- Puzzle exercises with hints
- Lesson progress tracking

**Exit state:** User can analyze games with engine stats and AI narrative. User can complete personalized training lessons.

---

### Phase 5: Polish & Launch (v1.0.0)

**Goal:** Production-ready with progress tracking, reports, 3D polish, and launch.

- Progress page (accuracy trends, weakness tags)
- Weekly AI-generated reports (cron)
- 3D visual polish (coach avatar, transitions, particles)
- Demo/guest mode
- Performance optimization
- E2E test suite
- Security audit
- Production deployment and monitoring

**Exit state:** Full v1 product deployed to production. All P0 requirements met.

---

## Post-v1 Roadmap

### v1.1 (Month 3–4)

| Feature | Priority |
|---------|----------|
| Light mode polish | P2 |
| Opening repertoire builder | P2 |
| Spaced repetition for failed puzzles | P2 |
| Game sharing (public analysis link) | P2 |
| Command palette (Cmd+K) | P3 |

### v1.2 (Month 5–6)

| Feature | Priority |
|---------|----------|
| Voice coach (text-to-speech) | P2 |
| Lichess/Chess.com PGN import via URL | P2 |
| Multi-provider AI (OpenAI option) | P2 |
| Mobile PWA with offline Stockfish | P3 |
| Sound effects and haptic feedback | P3 |

### v2.0 (Month 7–12)

| Feature | Priority |
|---------|----------|
| Human vs human multiplayer | P1 |
| Classroom/coach mode (teacher manages students) | P2 |
| Tournament mode | P3 |
| Native mobile apps (React Native) | P3 |
| Multi-language support (i18n) | P2 |
| Premium subscription tier | P2 |

---

## Feature Priority Matrix

| Feature | Phase | Priority | Persona |
|---------|-------|----------|---------|
| Auth (email + Google) | 1 | P0 | All |
| Landing page | 1 | P0 | Elena |
| Dashboard | 1 | P0 | All |
| Play vs Stockfish | 2 | P0 | Alex, Marcus |
| Game persistence | 2 | P0 | All |
| AI opponent | 3 | P0 | Elena, Marcus |
| Coach mode | 3 | P0 | Alex, David |
| Coach chat | 3 | P1 | Priya |
| Analysis mode | 4 | P0 | Priya, Marcus |
| Training mode | 4 | P0 | Alex, Priya |
| PGN import | 4 | P1 | Marcus |
| Progress tracking | 5 | P1 | Priya |
| Weekly reports | 5 | P1 | David, Priya |
| 3D polish | 5 | P1 | Elena |
| Demo mode | 5 | P1 | Elena |
| Time controls | 2 | P1 | David |
| Board themes | 2 | P1 | Elena |
| Eval graph | 4 | P1 | Marcus |
| Study plans | 4 | P1 | Priya |

---

## Risk Register

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Gemini latency too high for AI opponent | High | Medium | Pre-move caching, fallback to Stockfish with personality overlay |
| Stockfish WASM too slow on mobile | Medium | Medium | Reduce depth, lighter WASM build |
| Gemini cost exceeds budget | Medium | Low | Rate limiting, Flash model, cost alerts |
| Better Auth breaking changes | Low | Low | Pin version, abstract auth layer |
| Neon connection limits at scale | Medium | Low | Connection pooling, autoscaling |
| Scope creep across phases | High | High | Strict phase exit criteria, no cross-phase dependencies |

---

## Success Criteria (v1 Launch)

- [ ] All 5 game modes functional
- [ ] All P0 requirements from [02-product-requirements.md](./02-product-requirements.md) met
- [ ] Deployed to production on Vercel
- [ ] E2E test suite passing
- [ ] Lighthouse performance score > 90
- [ ] No P0/P1 security vulnerabilities
- [ ] Auth flow complete (email + Google)
- [ ] At least 3 AI personalities playable
- [ ] Analysis produces accurate Stockfish stats
- [ ] At least 1 training lesson completable
- [ ] Dashboard shows user progress

---

## Document References

- [01-product-vision.md](./01-product-vision.md)
- [02-product-requirements.md](./02-product-requirements.md)
- [phases/phase-1.md](./phases/phase-1.md) through [phases/phase-5.md](./phases/phase-5.md)
