# Component Library

## Document Metadata

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Approved for Implementation |
| Last Updated | 2026-07-30 |

---

## Overview

Components are organized into three tiers: **UI primitives** (shadcn/ui), **shared composites** (cross-feature), and **feature components** (domain-specific). This document catalogs every component required for v1.

---

## Tier 1: UI Primitives (shadcn/ui)

Installed via `npx shadcn@latest add {component}`. Stored in `src/shared/ui/`.

| Component | Usage |
|-----------|-------|
| `Button` | All actions (primary, secondary, ghost, destructive) |
| `Input` | Text inputs (auth, search, chat) |
| `Label` | Form labels |
| `Card` | Dashboard cards, game setup, lesson cards |
| `Dialog` | Game over, promotion, confirmations |
| `Sheet` | Mobile side panels, coach chat |
| `DropdownMenu` | User menu, game options |
| `Select` | Time control, skill level, personality |
| `Slider` | Stockfish strength |
| `Tabs` | Analysis tabs, training topics |
| `Tooltip` | Icon buttons, move classifications |
| `Badge` | Mode labels, streak, difficulty |
| `Avatar` | User profile, AI opponent |
| `Skeleton` | Loading states |
| `ScrollArea` | Move list, chat history |
| `Separator` | Section dividers |
| `Toast` / `Sonner` | Notifications |
| `Progress` | Analysis progress, lesson progress |
| `Switch` | Settings toggles |
| `Textarea` | Chat input, PGN paste |
| `Popover` | Quick settings |
| `Command` | Command palette (future) |

---

## Tier 2: Shared Composites

Stored in `src/shared/components/`.

### Layout

| Component | Props | Description |
|-----------|-------|-------------|
| `AppShell` | `children` | Authenticated layout with sidebar |
| `MarketingShell` | `children` | Landing/marketing layout |
| `AuthShell` | `children` | Centered auth card layout |
| `PageHeader` | `title, description, actions?` | Consistent page header |
| `Sidebar` | — | Navigation sidebar |
| `MobileNav` | — | Bottom navigation (mobile) |
| `TopBar` | — | Mobile top bar |

### Feedback

| Component | Props | Description |
|-----------|-------|-------------|
| `EmptyState` | `icon, title, description, action?` | No data states |
| `ErrorState` | `title, message, retry?` | Error with retry |
| `LoadingSpinner` | `size?` | Generic spinner |
| `LoadingOverlay` | `message?` | Full-section loading |

### Data Display

| Component | Props | Description |
|-----------|-------|-------------|
| `StatCard` | `label, value, trend?, icon?` | Dashboard stat |
| `GameCard` | `game: GameSummary` | Game history item |
| `PersonalityCard` | `personality, selected, onSelect` | AI personality picker |
| `MoveClassificationBadge` | `classification` | Brilliant/Blunder/etc badge |
| `EvalBar` | `evaluation: number` | Horizontal eval bar |
| `StreakBadge` | `count: number` | Streak counter |

### 3D

| Component | Props | Description |
|-----------|-------|-------------|
| `ThreeCanvas` | `children, className?` | R3F canvas wrapper |
| `LandingScene` | — | Landing page 3D hero |
| `CoachAvatar` | `speaking?: boolean` | Animated 3D coach |
| `ParticleField` | `count?, color?` | Background particles |
| `PageTransition` | `children` | Route transition wrapper |

---

## Tier 3: Feature Components

### features/auth

| Component | Description |
|-----------|-------------|
| `SignInForm` | Email/password sign in |
| `SignUpForm` | Email/password registration |
| `OAuthButtons` | Google sign in button |
| `OnboardingWizard` | Post-signup skill/mode selection |

### features/game

| Component | Description |
|-----------|-------------|
| `GameBoard` | react-chessboard wrapper with themes |
| `GameSetup` | Mode, color, strength, time control form |
| `GameControls` | Resign, draw, flip, settings |
| `GameHeader` | Player names, clock, mode badge |
| `GameOverDialog` | Result, stats, CTAs |
| `MoveList` | Scrollable SAN move list with click navigation |
| `PromotionDialog` | Piece selection for pawn promotion |
| `OpponentThinking` | Animated thinking indicator |
| `GameClock` | Dual clock display |
| `PersonalitySelector` | Grid of personality cards |

### features/analysis

| Component | Description |
|-----------|-------------|
| `AnalysisBoard` | Board with eval arrows and highlights |
| `AnalysisProgress` | Analysis computation progress bar |
| `EvalGraph` | SVG evaluation chart |
| `MoveAnalysisList` | Moves with classification icons |
| `AnalysisSummary` | Accuracy, ACPL, blunder counts |
| `ExplainMovePanel` | Gemini explanation for selected move |
| `PGNImportDialog` | Upload/paste PGN |
| `GameSummaryPanel` | AI-generated game narrative |

### features/coaching

| Component | Description |
|-----------|-------------|
| `CoachPanel` | Side panel for in-game coaching |
| `CoachMessage` | Single coach explanation bubble |
| `CoachChat` | Full chat interface |
| `CoachChatInput` | Message input with send button |
| `CoachFab` | Floating action button to open chat |
| `KeyMomentCard` | Highlighted moment with explanation |

### features/training

| Component | Description |
|-----------|-------------|
| `TrainingHub` | Lesson recommendations and topic browser |
| `LessonCard` | Lesson preview card |
| `LessonView` | Active lesson with exercises |
| `PuzzleBoard` | Board for puzzle solving |
| `HintButton` | Progressive hint request |
| `ExerciseResult` | Correct/incorrect feedback |
| `LessonProgress` | Progress bar through exercises |
| `StudyPlanCard` | Weekly study plan display |
| `TopicFilter` | Filter lessons by topic |

### features/dashboard

| Component | Description |
|-----------|-------------|
| `DashboardHero` | Welcome + streak |
| `QuickActions` | Play, Analyze, Train, Coach cards |
| `RecentGames` | Last 5 games list |
| `ActiveLessons` | In-progress lessons |
| `WeeklyReportCard` | Latest report preview |
| `ProgressChart` | Accuracy trend chart |

### features/settings

| Component | Description |
|-----------|-------------|
| `ProfileForm` | Name, avatar edit |
| `BoardThemePicker` | Visual theme selection |
| `GameDefaultsForm` | Default strength, personality |
| `AccountSettings` | Password change, delete account |

### features/progress

| Component | Description |
|-----------|-------------|
| `ProgressOverview` | Stats summary |
| `AccuracyChart` | Line chart over time |
| `WeaknessTags` | Tag cloud of weaknesses |
| `WeeklyReport` | Full weekly report view |
| `GameHistoryTable` | Filterable game list |

---

## Component Composition Patterns

### Page Orchestrator Pattern

Pages are thin orchestrators that compose feature components:

```tsx
// app/(app)/play/computer/page.tsx (conceptual)
export default function ComputerSetupPage() {
  return (
    <PageHeader title="Play vs Computer" description="Challenge Stockfish" />
    <GameSetup mode="computer" />
  );
}
```

### Compound Component Pattern (Coach Panel)

```tsx
<CoachPanel>
  <CoachPanel.Header />
  <CoachPanel.Messages>
    {moments.map(m => <CoachMessage key={m.id} moment={m} />)}
  </CoachPanel.Messages>
  <CoachPanel.Input />
</CoachPanel>
```

### Render Props (Board)

```tsx
<ChessBoard
  renderSquare={(square) => <CustomSquare square={square} />}
  renderPiece={(piece) => <ThemedPiece piece={piece} />}
/>
```

---

## Component State Ownership

| State | Owner | Passed Via |
|-------|-------|------------|
| Game FEN, moves | gameStore (Zustand) | Hooks |
| Board theme | boardStore | Context or store |
| Analysis data | TanStack Query | Props |
| Chat messages | TanStack Query + optimistic | Props |
| UI modals | uiStore or local state | Props |
| Form inputs | React Hook Form | Internal |

---

## Storybook (Future)

Component documentation via Storybook is planned for Phase 5. Not required for v1 development.

---

## Component Checklist (v1)

Total: ~65 components

| Feature | Count | Phase |
|---------|-------|-------|
| UI Primitives | 20 | Phase 1 |
| Shared Composites | 15 | Phase 1–2 |
| Auth | 4 | Phase 1 |
| Game | 10 | Phase 2 |
| Analysis | 8 | Phase 4 |
| Coaching | 6 | Phase 3 |
| Training | 8 | Phase 4 |
| Dashboard | 6 | Phase 1–3 |
| Settings | 4 | Phase 2 |
| Progress | 5 | Phase 5 |

---

## Document References

- [15-ui-design-system.md](./15-ui-design-system.md)
- [06-frontend-architecture.md](./06-frontend-architecture.md)
- [19-folder-structure.md](./19-folder-structure.md)
