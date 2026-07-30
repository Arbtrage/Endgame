# Testing

## Document Metadata

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Approved for Implementation |
| Last Updated | 2026-07-30 |

---

## Testing Strategy

Testing pyramid: many unit tests, fewer integration tests, minimal E2E tests covering critical paths.

```
         ╱ E2E (5–10 tests) ╲
        ╱ Integration (20–30) ╲
       ╱   Unit (100+)         ╲
```

---

## Testing Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| Unit | Vitest | Functions, hooks, utilities |
| Component | Vitest + React Testing Library | Component rendering, interactions |
| Integration | Vitest + MSW | API routes with mocked DB/AI |
| E2E | Playwright | Critical user flows |
| Type checking | TypeScript (`tsc --noEmit`) | Compile-time safety |
| Linting | ESLint | Code quality |
| API contract | Zod schemas | Request/response validation |

---

## Unit Tests

### What to Test

| Module | Test Focus |
|--------|-----------|
| `chess-game.ts` | Move validation, PGN generation, game state |
| `classification.ts` | Move classification thresholds |
| `accuracy.ts` | Accuracy and ACPL calculations |
| `key-moments.ts` | Key moment detection triggers |
| `clock.ts` | Timer logic, increment, timeout |
| `parser.ts` | Gemini response parsing |
| `game.service.ts` | Business logic (mocked repo) |
| `coaching.service.ts` | Context building, prompt assembly |
| Zod schemas | Valid/invalid input cases |

### Example Test Cases

```typescript
// classification.test.ts
describe('classifyMove', () => {
  it('classifies best move with large eval gain as brilliant', () => {
    expect(classifyMove(0, 160, 160, true, 0)).toBe('brilliant');
  });
  it('classifies cp loss > 100 as blunder', () => {
    expect(classifyMove(50, -60, 50, false, 110)).toBe('blunder');
  });
});

// chess-game.test.ts
describe('ChessGame', () => {
  it('rejects illegal moves', () => {
    const game = new ChessGame();
    expect(game.makeMove('e2', 'e5')).toBeNull(); // Can't move pawn 3 squares
  });
  it('detects checkmate', () => {
    const game = new ChessGame('rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3');
    expect(game.isCheckmate()).toBe(true);
  });
});
```

---

## Component Tests

### What to Test

| Component | Test Focus |
|-----------|-----------|
| `GameSetup` | Form submission, default values |
| `MoveList` | Renders moves, click navigation |
| `EvalBar` | Correct proportions for eval values |
| `CoachMessage` | Renders explanation text |
| `PersonalityCard` | Selection state |
| `SignInForm` | Validation errors, submit |

### Testing Pattern

```typescript
import { render, screen, fireEvent } from '@testing-library/react';

describe('GameSetup', () => {
  it('submits with default configuration', async () => {
    const onStart = vi.fn();
    render(<GameSetup mode="computer" onStart={onStart} />);
    fireEvent.click(screen.getByText('Start Game'));
    expect(onStart).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'computer',
      color: expect.any(String),
    }));
  });
});
```

---

## Integration Tests

### API Route Tests

Test route handlers with mocked services:

```typescript
describe('POST /api/games', () => {
  it('creates a game for authenticated user', async () => {
    const response = await POST(mockRequest({ mode: 'computer', color: 'white' }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data.mode).toBe('computer');
  });

  it('returns 401 for unauthenticated request', async () => {
    const response = await POST(mockUnauthenticatedRequest({ mode: 'computer' }));
    expect(response.status).toBe(401);
  });
});
```

### AI Provider Tests

Mock Gemini API responses:

```typescript
describe('GeminiProvider.generateMove', () => {
  it('returns validated move from Gemini response', async () => {
    mockGeminiResponse({ uci: 'e2e4', comment: 'Let the battle begin!' });
    const result = await provider.generateMove({ fen: STARTING_FEN, personality: 'aggressive' });
    expect(result.uci).toBe('e2e4');
  });

  it('retries on illegal move', async () => {
    mockGeminiResponse({ uci: 'z9z9' }); // illegal
    mockGeminiResponse({ uci: 'e2e4' }); // retry
    const result = await provider.generateMove({ fen: STARTING_FEN, personality: 'beginner' });
    expect(result.uci).toBe('e2e4');
  });
});
```

---

## E2E Tests (Playwright)

### Critical Paths

| Test | Flow |
|------|------|
| E2E-01 | Sign up → Dashboard → Start computer game → Play 3 moves → Resign |
| E2E-02 | Sign in → Start AI game → Play until checkmate |
| E2E-03 | Complete game → Analyze → View eval graph |
| E2E-04 | Sign in → Open training → Start lesson → Complete exercise |
| E2E-05 | Sign in → Coach chat → Send message → Receive response |
| E2E-06 | Demo page → Play without auth → See sign-up CTA |

### E2E Configuration

```typescript
// playwright.config.ts
{
  testDir: './e2e',
  baseURL: 'http://localhost:3000',
  webServer: { command: 'npm run dev', port: 3000 },
  use: { trace: 'on-first-retry' },
}
```

Note: E2E tests that require Gemini should use mocked API responses (MSW or route interception) to avoid API costs and flakiness.

---

## Test Organization

```
├── src/
│   ├── features/game/engine/__tests__/
│   │   ├── chess-game.test.ts
│   │   └── clock.test.ts
│   ├── shared/engine/__tests__/
│   │   ├── classification.test.ts
│   │   └── accuracy.test.ts
│   └── server/
│       ├── services/__tests__/
│       │   └── game.service.test.ts
│       └── ai/__tests__/
│           ├── parser.test.ts
│           └── gemini.provider.test.ts
├── e2e/
│   ├── auth.spec.ts
│   ├── game-computer.spec.ts
│   ├── game-ai.spec.ts
│   ├── analysis.spec.ts
│   └── training.spec.ts
└── vitest.config.ts
```

---

## CI Pipeline

```yaml
# .github/workflows/ci.yml (conceptual)
jobs:
  test:
    steps:
      - npm ci
      - npx tsc --noEmit
      - npm run lint
      - npm run test:unit        # Vitest
      - npm run test:e2e         # Playwright (on PR only)
      - npm run build            # Verify build succeeds
```

---

## Coverage Targets

| Category | Target |
|----------|--------|
| Engine logic (classification, accuracy) | > 90% |
| chess.js wrapper | > 85% |
| Service layer | > 80% |
| API route handlers | > 75% |
| Components | > 60% |
| Overall | > 70% |

---

## Mocking Strategy

| Dependency | Mock Approach |
|------------|--------------|
| Prisma / DB | Mock repository layer |
| Gemini API | Mock AI provider interface |
| Stockfish WASM | Mock engine wrapper (return preset evals/moves) |
| Better Auth | Mock session in test middleware |
| Fetch (client) | MSW handlers |

---

## Document References

- [20-error-handling.md](./20-error-handling.md)
- [27-coding-standards.md](./27-coding-standards.md)
- [28-git-strategy.md](./28-git-strategy.md)
