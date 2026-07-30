# Phase 5: Polish & Launch

## Document Metadata

| Field | Value |
|-------|-------|
| Phase | 5 of 5 |
| Version | v1.0.0 |
| Duration | ~2 weeks |
| Status | Ready for Implementation |
| Depends On | Phases 1–4 (all features complete) |

---

## Overview

Phase 5 transforms the feature-complete application into a production-ready v1 product. Focus areas: progress tracking, weekly AI reports, 3D visual polish, performance optimization, demo mode, comprehensive testing, security hardening, and production launch.

---

## Objectives

1. Build progress page with accuracy trends and weakness tags
2. Implement weekly AI-generated reports (Vercel Cron)
3. Add 3D visual polish (coach avatar, page transitions, particles)
4. Build guest demo mode
5. Performance optimization (bundle size, lazy loading, caching)
6. Comprehensive E2E test suite
7. Security audit and hardening
8. Production launch with monitoring

---

## Deliverables

| # | Deliverable | Verification |
|---|-------------|-------------|
| D1 | Progress page with stats and trends | Accuracy chart, weakness tags visible |
| D2 | Weekly report generation (cron) | Report generated every Monday |
| D3 | Weekly report UI | Narrative + stats displayed |
| D4 | 3D coach avatar (animated) | Avatar visible in coach panel |
| D5 | Page transition animations | Smooth transitions between routes |
| D6 | Dashboard 3D particle field | Subtle particles on dashboard header |
| D7 | Guest demo mode | Unauthenticated play on /demo |
| D8 | Performance: Lighthouse > 90 | All core pages pass |
| D9 | E2E test suite (6 critical paths) | All E2E tests pass in CI |
| D10 | Security headers and audit | No P0/P1 vulnerabilities |
| D11 | Data cleanup cron jobs | Stale data cleaned daily |
| D12 | Production deployment with monitoring | Live at production URL |

---

## Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Progress page | Stats, accuracy trend, weakness tags | P0 |
| Accuracy trend chart | Line chart over time | P1 |
| Weakness tag aggregation | Top 3 weaknesses from analyses | P1 |
| Weekly report generation | Cron job + Gemini narrative | P1 |
| Weekly report UI | Report card on dashboard + full page | P1 |
| 3D coach avatar | Animated R3F avatar in coach panel | P1 |
| Page transitions | Framer Motion route transitions | P1 |
| Dashboard particles | Subtle 3D particle field | P2 |
| Demo mode | Guest play without auth | P1 |
| Performance optimization | Bundle splitting, caching, lazy loading | P0 |
| E2E test suite | 6 critical path tests | P0 |
| Security audit | Headers, dependency audit, key exposure check | P0 |
| Data cleanup cron | Abandoned games, old chat messages | P1 |
| Streak tracking | Daily activity streak on dashboard | P1 |
| Game history page | Full filterable game list | P1 |
| Account deletion | GDPR-compliant hard delete | P1 |
| Error pages | Custom 404, 500 pages | P1 |
| Loading states | Skeleton screens for all data pages | P1 |

---

## User Stories

| ID | Story | Acceptance |
|----|-------|------------|
| US-5.1 | As a user, I want to see my progress over time so I know I'm improving | Accuracy trend chart on progress page |
| US-5.2 | As a user, I want to know my weaknesses so I know what to study | Weakness tags displayed |
| US-5.3 | As a user, I want a weekly report so I get a summary of my week | Report generated every Monday |
| US-5.4 | As a user, I want the app to feel premium so I enjoy using it | 3D accents, smooth animations |
| US-5.5 | As a visitor, I want to try the app without signing up so I can evaluate it | Demo mode on /demo |
| US-5.6 | As a user, I want fast page loads so the app feels responsive | Lighthouse > 90 |
| US-5.7 | As a user, I want to see my streak so I stay motivated | Streak badge on dashboard |
| US-5.8 | As a user, I want to delete my account so I control my data | Account deletion in settings |
| US-5.9 | As a user, I want to browse all my games so I can find specific ones | Filterable game history |

---

## UI Screens

| Screen | Route | State |
|--------|-------|-------|
| Progress | `/progress` | Stats, chart, weakness tags, weekly reports |
| Weekly Report | `/progress` (section) | Full report with narrative |
| Demo | `/demo` | Board + weak Stockfish + sign-up CTA |
| Game History | `/progress` (section) or `/dashboard` | Full game list with filters |
| 404 | `/not-found` | Custom not found page |
| Loading | (skeleton states) | Skeleton screens on all data pages |

---

## APIs

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/user/progress` | Yes | Progress stats and trends |
| GET | `/api/reports/weekly` | Yes | Latest weekly report |
| GET | `/api/reports/weekly/:weekId` | Yes | Specific week report |
| POST | `/api/reports/weekly/generate` | Yes | Trigger report generation |
| DELETE | `/api/user/account` | Yes | Delete account and all data |
| POST | `/api/cron/weekly-reports` | CRON_SECRET | Batch generate reports |
| POST | `/api/cron/cleanup` | CRON_SECRET | Data retention cleanup |

---

## Database Changes

### Migration: Add Reports Table

```sql
CREATE TABLE "weekly_reports" (...);
CREATE UNIQUE INDEX "weekly_reports_userId_weekStart_key" ON "weekly_reports"("userId", "weekStart");
CREATE INDEX "weekly_reports_userId_weekStart_idx" ON "weekly_reports"("userId", "weekStart" DESC);
```

No other schema changes. Progress stats computed from existing game/analysis data.

---

## Components

### New Feature: `progress`

| Component | Description |
|-----------|-------------|
| `ProgressOverview` | Stats summary cards |
| `AccuracyChart` | Line chart over time |
| `WeaknessTags` | Tag display |
| `WeeklyReport` | Full report view |
| `WeeklyReportCard` | Dashboard preview card |
| `GameHistoryTable` | Filterable game list |

### Updated Shared Components

| Component | Description |
|-----------|-------------|
| `CoachAvatar` | 3D animated avatar (R3F) |
| `ParticleField` | Dashboard particle background |
| `PageTransition` | Route transition wrapper |
| `StreakBadge` | Streak counter |

### Updated Dashboard

| Component | Description |
|-----------|-------------|
| `DashboardHero` | Add streak badge |
| `WeeklyReportCard` | Latest report preview |
| `RecentGames` | Link to full history |

---

## Libraries

### New Dependencies

| Package | Purpose |
|---------|----------|
| `@playwright/test` | E2E testing (devDependency) |
| `vitest` | Unit testing (devDependency) |
| `@testing-library/react` | Component testing (devDependency) |
| `recharts` or manual SVG | Accuracy trend chart (if not built manually) |

### Environment Variables (New)

| Variable | Required |
|----------|----------|
| `CRON_SECRET` | Yes |

---

## Folder Changes

```
CREATE  src/features/progress/
CREATE  src/server/services/report.service.ts
CREATE  app/(app)/progress/page.tsx
CREATE  app/api/reports/
CREATE  app/api/cron/
CREATE  e2e/
CREATE  vitest.config.ts
CREATE  playwright.config.ts
UPDATE  src/shared/three/ (CoachAvatar, ParticleField, PageTransition)
UPDATE  src/features/dashboard/ (streak, weekly report card)
UPDATE  src/features/settings/ (account deletion)
UPDATE  app/demo/page.tsx (full demo experience)
UPDATE  vercel.json (cron jobs)
UPDATE  .github/workflows/ci.yml (add test steps)
```

---

## Edge Cases

| Case | Handling |
|------|----------|
| New user with no games (progress page) | Empty state: "Play your first game to see progress" |
| Weekly report with 0 games | Report says "No games this week. Ready to play?" |
| Cron job failure | Retry next Monday, log error |
| Demo rate limit exceeded | "Sign up for unlimited access" |
| Account deletion confirmation | Double confirm dialog, type "DELETE" |
| 3D fails on low-end device | Silently disable, no error shown |
| prefers-reduced-motion | Disable all animations and 3D |
| Very long game history (1000+ games) | Paginate, max 100 per page |
| Accuracy chart with < 3 data points | Show dots instead of line |

---

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Cron job timeout (many users) | Reports not generated | Batch processing, paginate user list |
| 3D performance on mobile | Jank, battery drain | Disable 3D on mobile, respect reduced motion |
| E2E test flakiness | CI failures | Mock external APIs, retry strategy |
| Bundle size increase from 3D | Slower initial load | Lazy load all 3D, separate chunks |
| Launch day traffic spike | Rate limits hit | Monitor, scale Neon, Vercel auto-scales |

---

## Testing Strategy

| Test | Type | Coverage |
|------|------|----------|
| ReportService (generate report) | Unit | Stats aggregation, Gemini narrative |
| Progress stats calculation | Unit | Accuracy trend, weakness tags |
| Account deletion cascade | Integration | All user data deleted |
| Cron route auth | Integration | CRON_SECRET required |
| Cleanup cron | Integration | Stale data removed |
| E2E-01: Sign up → play → dashboard | E2E | Full new user flow |
| E2E-02: Computer game → analyze | E2E | Game + analysis flow |
| E2E-03: AI opponent game | E2E | Mocked Gemini |
| E2E-04: Training lesson | E2E | Mocked Gemini |
| E2E-05: Coach chat | E2E | Mocked Gemini |
| E2E-06: Demo without auth | E2E | Guest flow |
| Lighthouse CI | Performance | All pages > 90 |
| npm audit | Security | No high/critical vulnerabilities |
| Bundle analysis | Performance | First load < 300KB (excl WASM) |

---

## Acceptance Criteria

- [ ] Progress page shows accuracy trend and weakness tags
- [ ] Weekly report generated and displayed
- [ ] 3D coach avatar animates in coach panel
- [ ] Page transitions smooth (< 400ms)
- [ ] Demo mode playable without auth
- [ ] Lighthouse performance > 90 on landing, dashboard, game
- [ ] All 6 E2E tests pass in CI
- [ ] No Gemini API key in client bundle
- [ ] Security headers configured (CSP, COOP, COEP)
- [ ] Account deletion removes all user data
- [ ] Cron jobs running (weekly reports, cleanup)
- [ ] Streak tracking works correctly
- [ ] All P0 requirements from PRD met
- [ ] No P0/P1 bugs open

---

## Exit Criteria

1. All five game modes functional in production
2. All P0 product requirements met
3. E2E test suite passing
4. Lighthouse scores > 90
5. Security audit clean
6. Monitoring active
7. Production URL live
8. Tag `v1.0.0` created

**Phase 5 is complete when the product is production-ready and launched as v1.0.0.**

---

## Future Improvements (Post-v1)

- Light mode polish
- Command palette (Cmd+K)
- Opening repertoire builder
- Voice coach (TTS)
- Lichess/Chess.com import via URL
- Multi-provider AI (OpenAI)
- Mobile PWA
- Premium subscription tier
- Multi-language (i18n)
- Human vs human multiplayer

---

## Document References

- [01-product-vision.md](../01-product-vision.md)
- [02-product-requirements.md](../02-product-requirements.md)
- [22-performance.md](../22-performance.md)
- [23-security.md](../23-security.md)
- [24-testing.md](../24-testing.md)
- [25-deployment.md](../25-deployment.md)
- [26-monitoring.md](../26-monitoring.md)
- [30-roadmap.md](../30-roadmap.md)
- [phase-4.md](./phase-4.md)
