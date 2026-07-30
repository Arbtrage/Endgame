# Coding Standards

## Document Metadata

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Approved for Implementation |
| Last Updated | 2026-07-30 |

---

## Language & Framework

- **TypeScript** strict mode enabled
- **Next.js** App Router conventions
- **React** functional components only (no class components)
- **Tailwind CSS** for all styling (no CSS modules, no styled-components)

---

## TypeScript Standards

### Strict Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Type Rules

| Rule | Example |
|------|---------|
| No `any` | Use `unknown` and narrow |
| Explicit return types on exported functions | `function createGame(): Promise<Game>` |
| Use `interface` for object shapes | `interface GameConfig { ... }` |
| Use `type` for unions/intersections | `type GameMode = 'computer' \| 'ai_opponent'` |
| Prefer `const` assertions for literals | `const MODES = ['computer', 'ai_opponent'] as const` |
| Use Zod for runtime validation | `const schema = z.object({ ... })` |
| Infer types from Zod | `type CreateGameInput = z.infer<typeof createGameSchema>` |

---

## React Standards

### Components

```typescript
// ✅ Correct pattern
interface GameBoardProps {
  gameId: string;
  onMove: (move: GameMove) => void;
}

export function GameBoard({ gameId, onMove }: GameBoardProps) {
  // ...
}
```

| Rule | Detail |
|------|--------|
| Named exports | `export function Component` (not default export) |
| Props interface | Named `{Component}Props` |
| "use client" | Only when necessary (state, effects, events) |
| No inline styles | Use Tailwind classes |
| Event handlers | Prefix with `handle` or `on` |
| Conditional rendering | Early return over nested ternaries |

### Hooks

| Rule | Detail |
|------|--------|
| Custom hooks | Prefix with `use` |
| One hook per file | `useGame.ts`, not bundled |
| Dependencies | Exhaustive deps array (ESLint enforced) |
| No hooks in conditionals | Standard rules of hooks |

---

## File & Naming Conventions

See [19-folder-structure.md](./19-folder-structure.md) for full structure.

| Item | Convention |
|------|-----------|
| Files | kebab-case for non-components, PascalCase for components |
| Variables | camelCase |
| Constants | UPPER_SNAKE_CASE |
| Types/Interfaces | PascalCase |
| Enum values | UPPER_SNAKE_CASE |
| CSS variables | kebab-case with `--` prefix |
| API routes | kebab-case directories |

---

## Import Order

```typescript
// 1. React/Next.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. External libraries
import { useQuery } from '@tanstack/react-query';
import { Chess } from 'chess.js';

// 3. Internal absolute imports
import { Button } from '@/shared/ui/button';
import { useGame } from '@/features/game';

// 4. Relative imports
import { GameControls } from './GameControls';

// 5. Types (if not inline)
import type { GameConfig } from '../types/game.types';
```

---

## Error Handling Standards

- Server: throw `ApiError` with code, message, status
- Client: catch in TanStack Query `onError` or error boundaries
- Never swallow errors silently
- Always log errors with context (see [21-logging.md](./21-logging.md))
- User-facing messages: friendly, actionable, no stack traces

---

## Comment Standards

| Do Comment | Don't Comment |
|-----------|--------------|
| Non-obvious business logic | What the code obviously does |
| Workarounds with ticket reference | Removed/commented-out code |
| Complex algorithms (classification thresholds) | Every function |
| API contract deviations | Change history |

```typescript
// ✅ Good: explains WHY
// Stockfish returns eval from side-to-move perspective;
// we normalize to white's perspective for consistent display.
const normalizedEval = chess.turn() === 'b' ? -eval : eval;

// ❌ Bad: explains WHAT (obvious from code)
// Increment the move counter
moveCount++;
```

---

## Git Commit Standards

See [28-git-strategy.md](./28-git-strategy.md).

---

## Linting & Formatting

| Tool | Configuration |
|------|--------------|
| ESLint | `eslint-config-next` + strict TypeScript rules |
| Prettier | Not required (ESLint handles formatting via Next.js) |
| TypeScript | `tsc --noEmit` in CI |

### ESLint Rules (Additional)

```json
{
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "prefer-const": "error"
  }
}
```

---

## Code Review Checklist

- [ ] Types are explicit, no `any`
- [ ] Error handling present
- [ ] No secrets in code
- [ ] Follows feature folder structure
- [ ] No direct feature-to-feature imports
- [ ] Server/client boundary respected ("use client" only when needed)
- [ ] API inputs validated with Zod
- [ ] Resource ownership checked on API routes
- [ ] Loading and error states handled in UI
- [ ] Accessible (keyboard, screen reader, contrast)

---

## Document References

- [19-folder-structure.md](./19-folder-structure.md)
- [24-testing.md](./24-testing.md)
- [28-git-strategy.md](./28-git-strategy.md)
