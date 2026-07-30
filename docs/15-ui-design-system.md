# UI Design System

## Document Metadata

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Approved for Implementation |
| Last Updated | 2026-07-30 |

---

## Design Philosophy

The visual language draws from Linear, Cursor, and Vercel — dark-first, minimal, precise. Every pixel serves a purpose. Animations are subtle but present. The chess board is the hero element; everything else recedes.

**Keywords:** Dark, minimal, premium, precise, calm, intelligent.

---

## Color System

### Base Palette (Dark Mode — Default)

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `hsl(240 6% 6%)` | Page background |
| `--foreground` | `hsl(0 0% 95%)` | Primary text |
| `--card` | `hsl(240 5% 10%)` | Card surfaces |
| `--card-foreground` | `hsl(0 0% 95%)` | Card text |
| `--popover` | `hsl(240 5% 12%)` | Popover/dropdown bg |
| `--primary` | `hsl(142 70% 45%)` | Primary actions (green — chess association) |
| `--primary-foreground` | `hsl(0 0% 100%)` | Text on primary |
| `--secondary` | `hsl(240 4% 16%)` | Secondary surfaces |
| `--secondary-foreground` | `hsl(0 0% 85%)` | Secondary text |
| `--muted` | `hsl(240 4% 16%)` | Muted backgrounds |
| `--muted-foreground` | `hsl(240 4% 55%)` | Muted text |
| `--accent` | `hsl(240 4% 20%)` | Hover states |
| `--destructive` | `hsl(0 72% 51%)` | Errors, resign |
| `--border` | `hsl(240 4% 18%)` | Borders |
| `--ring` | `hsl(142 70% 45%)` | Focus rings |
| `--radius` | `0.5rem` | Base border radius |

### Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--eval-white-advantage` | `hsl(0 0% 90%)` | Eval bar white side |
| `--eval-black-advantage` | `hsl(240 4% 20%)` | Eval bar black side |
| `--eval-neutral` | `hsl(240 4% 40%)` | Equal position |
| `--move-brilliant` | `hsl(180 60% 50%)` | Brilliant move |
| `--move-best` | `hsl(142 60% 45%)` | Best move |
| `--move-good` | `hsl(142 40% 40%)` | Good move |
| `--move-inaccuracy` | `hsl(45 80% 50%)` | Inaccuracy |
| `--move-mistake` | `hsl(25 80% 50%)` | Mistake |
| `--move-blunder` | `hsl(0 72% 51%)` | Blunder |
| `--coach-accent` | `hsl(270 60% 60%)` | Coach panel accent |
| `--streak` | `hsl(45 90% 55%)` | Streak badge |

### Light Mode

Light mode supported but dark is default. Light tokens invert background/foreground with adjusted contrast ratios maintaining WCAG AA.

---

## Typography

### Font Stack

| Role | Font | Source |
|------|------|--------|
| Sans (UI) | Geist Sans | next/font (already configured) |
| Mono (moves, eval) | Geist Mono | next/font (already configured) |
| Display (landing) | Geist Sans | Bold weights |

### Scale

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `text-xs` | 12px | 400 | Timestamps, badges |
| `text-sm` | 14px | 400 | Secondary text, move list |
| `text-base` | 16px | 400 | Body text |
| `text-lg` | 18px | 500 | Section headers |
| `text-xl` | 20px | 600 | Page titles |
| `text-2xl` | 24px | 600 | Dashboard headings |
| `text-3xl` | 30px | 700 | Landing hero |
| `text-4xl` | 36px | 700 | Landing display |

### Line Heights
- Body: 1.6
- Headings: 1.2
- Move list (mono): 1.4

---

## Spacing

8px grid system:

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight inner padding |
| `space-2` | 8px | Default inner padding |
| `space-3` | 12px | Component padding |
| `space-4` | 16px | Section spacing |
| `space-6` | 24px | Card padding |
| `space-8` | 32px | Section gaps |
| `space-12` | 48px | Page sections |
| `space-16` | 64px | Major sections |

---

## Elevation & Shadows

| Level | Shadow | Usage |
|-------|--------|-------|
| 0 | none | Flat elements |
| 1 | `0 1px 3px rgba(0,0,0,0.3)` | Cards |
| 2 | `0 4px 12px rgba(0,0,0,0.4)` | Dropdowns, popovers |
| 3 | `0 8px 24px rgba(0,0,0,0.5)` | Modals, dialogs |
| Glow | `0 0 20px rgba(142,70%,45%,0.15)` | Primary button hover |

---

## Board Themes

### Theme: Classic (Default)

| Element | Light Square | Dark Square |
|---------|-------------|-------------|
| Board | `#EBECCC` | `#779556` |
| Highlight (last move) | `rgba(255,255,0,0.3)` | `rgba(255,255,0,0.3)` |
| Selected | `rgba(20,85,30,0.5)` | `rgba(20,85,30,0.5)` |
| Legal move dot | `rgba(20,85,30,0.4)` | `rgba(20,85,30,0.4)` |

### Theme: Midnight

| Element | Light Square | Dark Square |
|---------|-------------|-------------|
| Board | `#4a4a5e` | `#2d2d3f` |

### Theme: Frost

| Element | Light Square | Dark Square |
|---------|-------------|-------------|
| Board | `#dee3e6` | `#8ca2ad` |

---

## Component Tokens

All shadcn/ui components customized with the tokens above. Initialize with:

```bash
npx shadcn@latest init
# Style: new-york
# Base color: zinc
# CSS variables: yes
```

Then override CSS variables in `globals.css` with the palette defined above.

---

## Iconography

- **Library:** Lucide React (shadcn default)
- **Size:** 16px (inline), 20px (buttons), 24px (navigation)
- **Stroke:** 1.5px default

### Key Icons

| Concept | Icon |
|---------|------|
| Play | `Swords` |
| Analysis | `BarChart3` |
| Training | `GraduationCap` |
| Coach | `MessageCircle` |
| Settings | `Settings` |
| Streak | `Flame` |
| Brilliant | `Sparkles` |
| Blunder | `AlertTriangle` |

---

## Motion Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | 150ms | Hover, focus |
| `--duration-normal` | 250ms | Panel open/close |
| `--duration-slow` | 400ms | Page transitions |
| `--duration-celebration` | 800ms | Streak, game win |
| `--ease-default` | `[0.25, 0.1, 0.25, 1]` | Standard easing |
| `--ease-spring` | `[0.34, 1.56, 0.64, 1]` | Bouncy (celebrations) |

---

## Responsive Layout Grid

```
Desktop (≥1024px):
┌──────────────────────────────────────────┐
│ Sidebar (240px) │ Main Content (flex)    │
│                 │                        │
│  Navigation     │  ┌─────────┬────────┐  │
│  User menu      │  │  Board  │ Panel  │  │
│                 │  │         │        │  │
│                 │  └─────────┴────────┘  │
└──────────────────────────────────────────┘

Tablet (768–1023px):
┌──────────────────────────────────────────┐
│ Top bar (collapsed nav)                  │
│ ┌──────────────────────────────────────┐ │
│ │              Board                   │ │
│ └──────────────────────────────────────┘ │
│ ┌──────────────────────────────────────┐ │
│ │              Panel                   │ │
│ └──────────────────────────────────────┘ │
└──────────────────────────────────────────┘

Mobile (<768px):
┌─────────────────────┐
│ Top bar             │
│ ┌─────────────────┐ │
│ │     Board       │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ Panel (sheet)   │ │
│ └─────────────────┘ │
│ Bottom nav          │
└─────────────────────┘
```

---

## Accessibility Standards

- Minimum contrast ratio: 4.5:1 (text), 3:1 (large text, UI components)
- Focus visible on all interactive elements
- `prefers-reduced-motion`: disable animations, hide 3D
- `prefers-color-scheme`: respect system preference (default dark)
- Touch targets: minimum 44×44px on mobile

---

## Document References

- [16-component-library.md](./16-component-library.md)
- [17-design-principles.md](./17-design-principles.md)
- [06-frontend-architecture.md](./06-frontend-architecture.md)
