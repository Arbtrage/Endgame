# Phase 3: AI Coaching

## Document Metadata

| Field | Value |
|-------|-------|
| Phase | 3 of 5 |
| Version | v0.3.0 |
| Duration | ~2 weeks |
| Status | Ready for Implementation |
| Depends On | Phase 2 (game engine, Stockfish, board UI) |

---

## Overview

Phase 3 integrates Gemini as the AI intelligence layer. Users can play against AI opponents with distinct personalities, receive coaching explanations during Coach Mode, and chat with the AI coach globally. This phase implements the AI provider abstraction and all Gemini-powered features except analysis summaries and training lessons (Phase 4).

---

## Objectives

1. Implement AI provider abstraction with Gemini provider
2. Build AI Opponent mode with 11 personalities
3. Build Coach Mode (Stockfish opponent + Gemini explanations)
4. Implement key moment detection (client-side, Stockfish-powered)
5. Build coach panel UI for in-game explanations
6. Implement global coach chat (FAB + full page)
7. Add rate limiting for AI endpoints
8. Server-side move validation for AI opponent

---

## Deliverables

| # | Deliverable | Verification |
|---|-------------|-------------|
| D1 | AI provider interface + Gemini implementation | Provider passes unit tests |
| D2 | AI Opponent mode with personality selection | Play full game against each personality |
| D3 | AI move validation pipeline | Illegal moves caught and retried |
| D4 | Coach Mode with key moment explanations | Explanations appear during game |
| D5 | Key moment detection (6 trigger types) | Triggers fire correctly in test games |
| D6 | Coach panel UI (side panel, non-blocking) | Panel shows/hides without blocking board |
| D7 | Global coach chat (FAB + /coach page) | Chat sends/receives messages |
| D8 | Chat history persistence | Messages saved and loaded |
| D9 | Rate limiting on AI endpoints | 429 returned after limit exceeded |
| D10 | Graceful degradation when Gemini unavailable | Stockfish modes still work |

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| AI provider abstraction | Interface + Gemini impl + factory | P0 |
| Prompt templates | Move, explain, chat prompts | P0 |
| AI Opponent setup | Personality grid selection | P0 |
| AI Opponent game | Gemini moves with personality | P0 |
| Move validation pipeline | Server chess.js validation + retry | P0 |
| Coach Mode setup | Color + Stockfish strength | P0 |
| Key moment detection | 6 trigger types via Stockfish eval | P0 |
| Coach explanations | Gemini explains key moments | P0 |
| Coach panel | Side panel with explanation stream | P0 |
| Coach chat (global) | FAB on all pages + /coach route | P1 |
| Chat context injection | FEN, game state, user skill | P1 |
| Chat history | Persisted per session | P1 |
| Personality comments | In-character move comments | P2 |
| Rate limiting | Per-user limits on AI endpoints | P0 |
| AI error handling | Retry, fallback, graceful degradation | P0 |

---

## User Stories

| ID | Story | Acceptance |
|----|-------|------------|
| US-3.1 | As a user, I want to choose an AI personality so I can play against different styles | Personality grid with 11 options |
| US-3.2 | As a user, I want the AI to play legal moves so the game is valid | All AI moves validated server-side |
| US-3.3 | As a user, I want the AI to play in character so it feels unique | Aggressive AI favors attacks, Tal sacrifices |
| US-3.4 | As a user, I want coaching during my game so I learn as I play | Coach Mode explains blunders and key moments |
| US-3.5 | As a user, I want explanations in plain language so I understand | Coach panel shows 2-3 sentence explanations |
| US-3.6 | As a user, I want to ask the coach follow-up questions so I can dig deeper | Chat input in coach panel |
| US-3.7 | As a user, I want to chat with the coach anytime so I can ask chess questions | FAB opens chat from any page |
| US-3.8 | As a user, I want my chat history saved so I can continue conversations | Messages persist across sessions |
| US-3.9 | As a user, I want the app to work even if AI is down so I can still play chess | Computer mode works when Gemini unavailable |

---

## UI Screens

| Screen | Route | State |
|--------|-------|-------|
| AI Opponent Setup | `/play/ai` | Personality grid, color, time control |
| AI Game | `/play/[gameId]` | Board + optional opponent comment bubble |
| Coach Mode Setup | `/play/coach` | Color, strength, coach intro message |
| Coach Game | `/play/[gameId]` | Board + coach panel (split view) |
| Coach Chat (full) | `/coach` | Full-page chat with history |
| Coach FAB | (overlay on all app pages) | Floating button → chat sheet |

---

## APIs

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/games/:gameId/ai-move` | Yes | Request AI opponent move |
| POST | `/api/coach/explain-moment` | Yes | Explain key moment during game |
| POST | `/api/coach/chat` | Yes | Send coach chat message |
| GET | `/api/coach/chat/history` | Yes | Get chat history for session |
| POST | `/api/games` | Yes | Updated to support `ai_opponent` and `coach` modes |

---

## Database Changes

### Migration: Add Coaching Tables

```sql
CREATE TABLE "coach_moments" (...);
CREATE TABLE "chat_sessions" (...);
CREATE TABLE "chat_messages" (...);

CREATE INDEX "coach_moments_gameId_idx" ON "coach_moments"("gameId");
CREATE INDEX "chat_sessions_userId_updatedAt_idx" ON "chat_sessions"("userId", "updatedAt" DESC);
CREATE INDEX "chat_messages_sessionId_createdAt_idx" ON "chat_messages"("sessionId", "createdAt");
```

No changes to existing game/move tables (mode enum already supports AI_OPPONENT and COACH).

---

## Components

### New Feature: `coaching`

| Component | Description |
|-----------|-------------|
| `CoachPanel` | Side panel for in-game coaching |
| `CoachMessage` | Single explanation bubble |
| `CoachChat` | Full chat interface |
| `CoachChatInput` | Message input with send |
| `CoachFab` | Floating action button |
| `KeyMomentCard` | Highlighted moment card |
| `PersonalitySelector` | Grid of personality cards |
| `PersonalityCard` | Individual personality option |

### Updated Feature: `game`

| Component | Description |
|-----------|-------------|
| `GameSetup` | Updated for AI and Coach modes |
| `OpponentThinking` | Updated with personality-themed animation |
| `OpponentComment` | AI personality comment bubble |

### Server Modules

| Module | Path |
|--------|------|
| `AIProvider interface` | `src/server/ai/provider.interface.ts` |
| `GeminiProvider` | `src/server/ai/gemini.provider.ts` |
| `Provider factory` | `src/server/ai/factory.ts` |
| `Response parser` | `src/server/ai/parser.ts` |
| `Prompt templates` | `src/server/ai/prompts/` |
| `Personality configs` | `src/server/ai/prompts/personalities.ts` |
| `CoachingService` | `src/server/services/coaching.service.ts` |
| `ChatRepository` | `src/server/repositories/chat.repository.ts` |
| `Key moment detection` | `src/shared/engine/key-moments.ts` |

---

## Libraries

### New Dependencies

| Package | Purpose |
|---------|---------|
| `@google/generative-ai` | Gemini SDK |
| `@upstash/ratelimit`, `@upstash/redis` | Rate limiting (optional, can use in-memory) |

### Environment Variables (New)

| Variable | Required |
|----------|----------|
| `GEMINI_API_KEY` | Yes |
| `UPSTASH_REDIS_REST_URL` | No |
| `UPSTASH_REDIS_REST_TOKEN` | No |

---

## Folder Changes

```
CREATE  src/features/coaching/
CREATE  src/server/ai/
CREATE  src/server/services/coaching.service.ts
CREATE  src/server/repositories/chat.repository.ts
CREATE  src/shared/engine/key-moments.ts
CREATE  app/(app)/play/ai/page.tsx
CREATE  app/(app)/play/coach/page.tsx
CREATE  app/(app)/coach/page.tsx
CREATE  app/api/games/[gameId]/ai-move/route.ts
CREATE  app/api/coach/
UPDATE  src/features/game/ (AI opponent hook, coach mode config)
UPDATE  src/features/game/components/GameSetup.tsx
UPDATE  app/(app)/layout.tsx (add CoachFab)
```

---

## Edge Cases

| Case | Handling |
|------|----------|
| Gemini returns illegal move | Retry once with legal moves list → random fallback |
| Gemini timeout (>15s) | Retry once → show "AI is thinking..." → fallback message |
| Gemini returns invalid JSON | Retry with "respond in valid JSON" instruction |
| Key moment during rapid moves | Debounce: max 1 explanation per 3 moves |
| Coach panel open during opponent turn | Panel stays open, new explanation appended |
| Chat message while in game | Context includes current FEN + moves |
| Rate limit exceeded | Toast: "Slow down! Try again in X seconds" |
| Gemini content filter triggered | Generic safe response |
| Personality comment + move delay | Comment displayed after move animation |
| User spams coach chat | Rate limit: 20 messages/min |
| Very long game in coach mode | Limit to 10 coach moments per game |

---

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Gemini latency (3–8s per move) | AI games feel slow | Show personality-themed thinking animation, set expectations |
| Gemini cost per game (~$0.02) | Budget overrun at scale | Rate limiting, cost monitoring from day 1 |
| AI move quality varies | Some personalities too strong/weak | Tune mistake rates, test each personality |
| Prompt injection via chat | Unexpected AI behavior | System prompt hardening, input sanitization |
| Key moment false positives | Too many coach interruptions | Tune thresholds, max moments per game |

---

## Testing Strategy

| Test | Type | Coverage |
|------|------|----------|
| GeminiProvider.generateMove | Unit (mocked) | Valid response, illegal move retry |
| GeminiProvider.explainPosition | Unit (mocked) | Structured explanation response |
| GeminiProvider.chat | Unit (mocked) | Context injection, history |
| Response parser | Unit | JSON extraction, markdown fence stripping |
| Move validation pipeline | Integration | Legal/illegal move handling |
| Key moment detection | Unit | All 6 trigger types |
| Personality configs | Unit | All 11 personalities defined |
| Rate limiter | Integration | 429 after limit |
| CoachPanel renders messages | Component | Message list, input |
| E2E: AI game (mocked Gemini) | E2E | Full game with mocked API |
| E2E: Coach mode (mocked Gemini) | E2E | Explanations appear at key moments |
| E2E: Coach chat | E2E | Send message, receive response |

Note: E2E tests mock Gemini API to avoid cost and flakiness. Integration tests use mocked provider.

---

## Acceptance Criteria

- [ ] All 11 AI personalities selectable and playable
- [ ] AI opponent makes only legal moves
- [ ] Coach Mode detects and explains key moments
- [ ] Coach panel displays without blocking gameplay
- [ ] Global coach chat works from any page
- [ ] Chat history persists across sessions
- [ ] Rate limiting active on all AI endpoints
- [ ] Computer mode works when Gemini is unavailable
- [ ] AI responses reference engine evaluations (not hallucinated)
- [ ] Personality style consistent throughout game
- [ ] All prompt templates tested with mock responses
- [ ] No Gemini API key in client bundle

---

## Exit Criteria

1. AI Opponent and Coach Mode fully playable
2. Coach chat functional globally
3. Rate limiting enforced
4. Graceful degradation verified
5. All acceptance criteria met
6. Deployed to production with GEMINI_API_KEY configured

**Phase 3 is complete when users can play against AI personalities and receive coaching during games.**

---

## Future Improvements (Deferred)

- In-game AI opponent chat (personality banter)
- Voice coach (text-to-speech for explanations)
- Coach explanation caching for common positions
- Custom personality creation
- Multi-language coach responses

---

## Document References

- [12-gemini-architecture.md](../12-gemini-architecture.md)
- [11-stockfish-architecture.md](../11-stockfish-architecture.md)
- [09-api-design.md](../09-api-design.md)
- [phase-2.md](./phase-2.md)
- [phase-4.md](./phase-4.md)
