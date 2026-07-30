# Navigation

## Document Metadata

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Approved for Implementation |
| Last Updated | 2026-07-30 |

---

## Route Map

### Public Routes

| Route | Page | Layout |
|-------|------|--------|
| `/` | Landing page | MarketingShell |
| `/demo` | Guest demo board | MarketingShell |
| `/auth/sign-in` | Sign in | AuthShell |
| `/auth/sign-up` | Sign up | AuthShell |

### Authenticated Routes

| Route | Page | Layout |
|-------|------|--------|
| `/dashboard` | Dashboard home | AppShell |
| `/play/computer` | Computer mode setup | AppShell |
| `/play/ai` | AI opponent setup | AppShell |
| `/play/coach` | Coach mode setup | AppShell |
| `/play/[gameId]` | Active game | AppShell (minimal) |
| `/analyze` | Analysis hub | AppShell |
| `/analyze/[gameId]` | Game analysis | AppShell |
| `/train` | Training hub | AppShell |
| `/train/[lessonId]` | Active lesson | AppShell |
| `/progress` | Progress & reports | AppShell |
| `/coach` | Full-page coach chat | AppShell |
| `/settings` | User settings | AppShell |

### API Routes

See [09-api-design.md](./09-api-design.md).

---

## Navigation Structure

### Sidebar (Desktop ≥1024px)

```
┌─────────────────────────┐
│  ♟ Logo                  │
│                          │
│  ▶ Play               ▾  │  ← Expandable
│    ├ vs Computer         │
│    ├ vs AI Coach         │
│    └ Coach Mode          │
│                          │
│  📊 Analyze              │
│  🎓 Train                │
│  📈 Progress             │
│                          │
│  ─────────────────────── │
│                          │
│  💬 Coach Chat           │
│  ⚙ Settings              │
│                          │
│  ─────────────────────── │
│  👤 User Name            │
│     Sign Out             │
└─────────────────────────┘
```

Sidebar width: 240px collapsed to 64px (icons only).

### Mobile Bottom Nav (<768px)

```
┌──────┬──────┬──────┬──────┬──────┐
│ Home │ Play │Analyze│Train │ More │
└──────┴──────┴──────┴──────┴──────┘
```

"More" opens sheet with: Progress, Coach Chat, Settings, Sign Out.

### Game Page Nav (Minimal)

During active gameplay, sidebar collapses to icons. Top bar shows:
- Back arrow → Dashboard (with confirmation if game in progress)
- Mode badge (e.g., "Coach Mode")
- Game controls (resign, settings)

---

## Navigation Items

| Label | Icon (Lucide) | Route | Badge |
|-------|---------------|-------|-------|
| Dashboard | `LayoutDashboard` | `/dashboard` | — |
| vs Computer | `Monitor` | `/play/computer` | — |
| vs AI Coach | `Bot` | `/play/ai` | — |
| Coach Mode | `GraduationCap` | `/play/coach` | — |
| Analyze | `BarChart3` | `/analyze` | — |
| Train | `Dumbbell` | `/train` | Active lesson count |
| Progress | `TrendingUp` | `/progress` | — |
| Coach Chat | `MessageCircle` | `/coach` | — |
| Settings | `Settings` | `/settings` | — |

---

## Breadcrumbs

Used on nested pages only:

| Page | Breadcrumb |
|------|------------|
| `/play/computer` | Dashboard > Play > vs Computer |
| `/play/[gameId]` | Dashboard > Play > Game |
| `/analyze/[gameId]` | Dashboard > Analyze > Game Analysis |
| `/train/[lessonId]` | Dashboard > Train > Lesson |

Implementation: `PageHeader` component accepts `breadcrumbs` prop.

---

## Route Groups (Next.js App Router)

```
app/
├── (marketing)/          # Public, no auth
│   ├── layout.tsx
│   └── page.tsx          # /
├── (auth)/               # Auth pages
│   ├── layout.tsx
│   ├── sign-in/page.tsx
│   └── sign-up/page.tsx
├── (app)/                # Authenticated
│   ├── layout.tsx        # AppShell
│   ├── dashboard/page.tsx
│   ├── play/
│   │   ├── computer/page.tsx
│   │   ├── ai/page.tsx
│   │   ├── coach/page.tsx
│   │   └── [gameId]/page.tsx
│   ├── analyze/
│   │   ├── page.tsx
│   │   └── [gameId]/page.tsx
│   ├── train/
│   │   ├── page.tsx
│   │   └── [lessonId]/page.tsx
│   ├── progress/page.tsx
│   ├── coach/page.tsx
│   └── settings/page.tsx
├── demo/page.tsx
└── api/...
```

---

## Redirect Rules

| Condition | Redirect |
|-----------|----------|
| Unauthenticated → protected route | `/auth/sign-in?callbackUrl={path}` |
| Authenticated → `/auth/*` | `/dashboard` |
| Authenticated → `/` | `/dashboard` (optional; or show landing) |
| Game not found | `/dashboard` with toast |
| Completed game → `/play/[id]` | `/analyze/[id]` suggestion |

---

## Deep Linking

| URL | Behavior |
|-----|----------|
| `/analyze/[gameId]` | Direct link to game analysis |
| `/train/[lessonId]` | Direct link to lesson |
| `/play/[gameId]` | Resume in-progress game (if exists) |

---

## Command Palette (Future — Phase 5+)

Not in v1. Reserved keyboard shortcut: `Cmd+K`.

Planned actions:
- New game (computer/AI/coach)
- Go to page
- Analyze recent game
- Open coach chat

---

## Document References

- [04-user-flows.md](./04-user-flows.md)
- [06-frontend-architecture.md](./06-frontend-architecture.md)
- [10-authentication.md](./10-authentication.md)
