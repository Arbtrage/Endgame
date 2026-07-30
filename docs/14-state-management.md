# State Management

## Document Metadata

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Approved for Implementation |
| Last Updated | 2026-07-30 |

---

## Overview

State management uses a dual approach: **Zustand** for high-frequency client state (game board, UI) and **TanStack Query** for server state (API data, caching, synchronization).

---

## State Categories

| Category | Tool | Examples |
|----------|------|----------|
| Game state | Zustand | FEN, moves, phase, clock |
| UI state | Zustand | Sidebar, modals, panel visibility |
| Server data | TanStack Query | Games, analysis, lessons, chat |
| Auth state | Better Auth | Session, user |
| URL state | Next.js searchParams | Filters, selected move |
| Form state | React Hook Form | Settings, auth forms |

---

## Zustand Stores

### gameStore

Primary store for active gameplay.

```typescript
// src/features/game/stores/game-store.ts

interface GameState {
  // Identity
  gameId: string | null;
  mode: GameMode | null;
  config: GameModeConfig | null;

  // Board state
  fen: string;
  moves: GameMove[];
  orientation: 'white' | 'black';
  playerColor: 'white' | 'black';

  // Interaction
  selectedSquare: string | null;
  legalMoves: string[];
  lastMove: { from: string; to: string } | null;
  highlightSquares: Record<string, string>; // square → color

  // Phase
  phase: GamePhase;
  result: GameResult | null;
  resultReason: string | null;

  // Opponent
  opponentComment: string | null;

  // Clock
  whiteTime: number;
  blackTime: number;
  clockRunning: boolean;

  // Promotion
  pendingPromotion: { from: string; to: string } | null;

  // Actions
  initGame: (config: GameModeConfig) => void;
  applyMove: (move: GameMove) => void;
  selectSquare: (square: string | null) => void;
  setPhase: (phase: GamePhase) => void;
  setGameOver: (result: GameResult, reason: string) => void;
  setPendingPromotion: (move: { from: string; to: string } | null) => void;
  addOpponentComment: (comment: string) => void;
  navigateToMove: (index: number) => void;
  reset: () => void;
}
```

### boardStore

Board appearance settings (shared across game, analysis, training).

```typescript
interface BoardState {
  theme: BoardTheme;
  pieceSet: PieceSet;
  showNotation: boolean;
  animationDuration: number;
  boardWidth: number;

  setTheme: (theme: BoardTheme) => void;
  setPieceSet: (set: PieceSet) => void;
  setBoardWidth: (width: number) => void;
}
```

### uiStore

Global UI state.

```typescript
interface UIState {
  sidebarOpen: boolean;
  coachPanelOpen: boolean;
  coachFabExpanded: boolean;
  activeModal: string | null;

  toggleSidebar: () => void;
  setCoachPanelOpen: (open: boolean) => void;
  setActiveModal: (modal: string | null) => void;
}
```

---

## TanStack Query

### Query Client Configuration

```typescript
// src/shared/api/query-client.ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,       // 30s before refetch
      gcTime: 5 * 60_000,      // 5 min garbage collection
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

### Query Key Convention

```typescript
// Hierarchical keys for precise invalidation
const queryKeys = {
  games: {
    all: ['games'] as const,
    list: (filters: GameFilters) => ['games', 'list', filters] as const,
    detail: (gameId: string) => ['games', 'detail', gameId] as const,
  },
  analysis: {
    detail: (gameId: string) => ['analysis', gameId] as const,
  },
  training: {
    recommendations: ['training', 'recommendations'] as const,
    lessons: {
      detail: (lessonId: string) => ['training', 'lessons', lessonId] as const,
    },
    progress: (lessonId: string) => ['training', 'progress', lessonId] as const,
  },
  coach: {
    chatHistory: (sessionId: string) => ['coach', 'chat', sessionId] as const,
  },
  user: {
    profile: ['user', 'profile'] as const,
    settings: ['user', 'settings'] as const,
    progress: ['user', 'progress'] as const,
  },
  reports: {
    weekly: (weekId?: string) => ['reports', 'weekly', weekId] as const,
  },
};
```

### Feature Query Hooks

```typescript
// Example patterns (not implementation code)

// src/features/game/api/useGames.ts
function useGames(filters: GameFilters) {
  return useQuery({
    queryKey: queryKeys.games.list(filters),
    queryFn: () => fetchGames(filters),
  });
}

// src/features/game/api/useCreateGame.ts
function useCreateGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGame,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.games.all });
    },
  });
}

// src/features/analysis/api/useAnalysis.ts
function useAnalysis(gameId: string) {
  return useQuery({
    queryKey: queryKeys.analysis.detail(gameId),
    queryFn: () => fetchAnalysis(gameId),
    enabled: !!gameId,
  });
}
```

---

## State Flow Diagrams

### Game Move Flow

```
User drag/drop
    │
    ▼
gameStore.selectSquare / applyMove     ← Zustand (instant UI)
    │
    ├── chess.js validation
    │
    ├── Stockfish/Gemini opponent trigger
    │
    └── POST /api/games/:id/moves      ← TanStack Mutation (async sync)
            │
            └── onSuccess: invalidate game query
```

### Analysis Flow

```
User opens analysis
    │
    ▼
useAnalysis(gameId)                    ← TanStack Query (check cache)
    │
    ├── Cache hit → display immediately
    │
    └── Cache miss → Stockfish analyzes client-side
            │
            └── POST /api/analysis/:gameId  ← Save results
                    │
                    └── Gemini summary (on demand)
```

### Coach Chat Flow

```
User sends message
    │
    ▼
Optimistic update in local chat state   ← Component state
    │
    └── POST /api/coach/chat             ← TanStack Mutation
            │
            ├── onSuccess: append AI response
            └── onError: rollback optimistic message
```

---

## Optimistic Updates

| Action | Optimistic Behavior | Rollback Trigger |
|--------|--------------------|--------------------|
| Play move | Board updates immediately | Illegal move (local) or API 4xx |
| Send chat message | Message appears in chat | API error |
| Complete exercise | Mark exercise done | API error |
| Update settings | UI reflects change | API error + toast |

### Pattern

```typescript
function useSendChatMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: sendChatMessage,
    onMutate: async (newMessage) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.coach.chatHistory(sessionId) });
      const previous = queryClient.getQueryData(queryKeys.coach.chatHistory(sessionId));
      queryClient.setQueryData(queryKeys.coach.chatHistory(sessionId), (old) => ({
        ...old,
        messages: [...old.messages, { role: 'user', content: newMessage.message }],
      }));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(queryKeys.coach.chatHistory(sessionId), context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.coach.chatHistory(sessionId) });
    },
  });
}
```

---

## State Persistence

| State | Persisted? | Method |
|-------|-----------|--------|
| Game in progress | Memory only | Lost on refresh (recoverable from server if synced) |
| Board theme/settings | Yes | DB via settings API + localStorage cache |
| Auth session | Yes | Better Auth cookie |
| TanStack Query cache | Memory only | Refetched on mount |
| Chat history | Yes | DB via API |

### LocalStorage Usage (Minimal)

```typescript
// Only for non-critical UI preferences
localStorage:
  - 'board-theme' (fallback before settings load)
  - 'sidebar-collapsed' (UI preference)
```

---

## Store Boundaries

| Rule | Rationale |
|------|-----------|
| Game store reset on game exit | Prevent stale state |
| No server data in Zustand | TanStack Query handles server state |
| No game state in TanStack Query during play | Too frequent updates; Zustand is better |
| Single gameStore instance | One active game per tab |
| Board settings shared via boardStore | Consistent across game/analysis/training |

---

## DevTools

- **Zustand**: `devtools` middleware in development
- **TanStack Query**: `@tanstack/react-query-devtools` in development
- Both disabled in production

---

## Assumptions

| ID | Assumption |
|----|------------|
| SM-1 | Zustand v5.x |
| SM-2 | TanStack Query v5.x |
| SM-3 | No Redux, no Jotai, no Context for state |
| SM-4 | React Hook Form for forms only (not global state) |
| SM-5 | URL state via `useSearchParams` for shareable analysis links (future) |

---

## Document References

- [06-frontend-architecture.md](./06-frontend-architecture.md)
- [13-game-engine.md](./13-game-engine.md)
- [09-api-design.md](./09-api-design.md)
