# Deployment

## Document Metadata

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Approved for Implementation |
| Last Updated | 2026-07-30 |

---

## Overview

The entire application deploys to Vercel with Neon PostgreSQL. No separate infrastructure required. Every implementation phase produces an independently deployable artifact.

---

## Environments

| Environment | Branch | URL | Purpose |
|-------------|--------|-----|---------|
| Production | `main` | `https://chess-coach.app` (TBD) | Live users |
| Preview | PR branches | `https://{branch}.vercel.app` | PR review |
| Development | local | `http://localhost:3000` | Local dev |

---

## Vercel Configuration

### Project Settings

| Setting | Value |
|---------|-------|
| Framework | Next.js |
| Node.js Version | 20.x |
| Build Command | `prisma generate && prisma migrate deploy && next build` |
| Output Directory | `.next` (default) |
| Install Command | `npm ci` |
| Root Directory | `/` |

### vercel.json

```json
{
  "crons": [
    {
      "path": "/api/cron/weekly-reports",
      "schedule": "0 6 * * 1"
    },
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 3 * * *"
    }
  ]
}
```

---

## Environment Variables

### Production (Vercel Dashboard)

| Variable | Required | Phase |
|----------|----------|-------|
| `DATABASE_URL` | Yes | Phase 1 |
| `DIRECT_URL` | Yes | Phase 1 |
| `BETTER_AUTH_SECRET` | Yes | Phase 1 |
| `BETTER_AUTH_URL` | Yes | Phase 1 |
| `NEXT_PUBLIC_APP_URL` | Yes | Phase 1 |
| `GOOGLE_CLIENT_ID` | Yes | Phase 1 |
| `GOOGLE_CLIENT_SECRET` | Yes | Phase 1 |
| `GEMINI_API_KEY` | Yes | Phase 3 |
| `CRON_SECRET` | Yes | Phase 5 |
| `UPSTASH_REDIS_REST_URL` | No | Phase 3 |
| `UPSTASH_REDIS_REST_TOKEN` | No | Phase 3 |

### Local Development (.env.local)

```bash
# .env.example (committed to repo)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
BETTER_AUTH_SECRET="dev-secret-min-32-chars-long-here"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GEMINI_API_KEY=""
CRON_SECRET="dev-cron-secret"
```

---

## Neon Database Setup

### Production

1. Create Neon project in `us-east-1` (same region as Vercel)
2. Enable connection pooling (PgBouncer)
3. Use pooled URL for `DATABASE_URL`
4. Use direct URL for `DIRECT_URL` (migrations only)
5. Enable autoscaling (min 0.25 CU, max 2 CU for v1)

### Preview Branches

Option A (recommended for v1): All previews share production database (read-only risk acceptable for previews).

Option B (future): Neon branch per preview deployment.

---

## Deployment Pipeline

```
Developer push/PR
       │
       ▼
GitHub Actions CI
  ├─ TypeScript check
  ├─ ESLint
  ├─ Unit tests (Vitest)
  ├─ Build verification
  └─ E2E tests (PR to main only)
       │
       ▼
Vercel Preview Deploy (automatic on PR)
       │
       ▼
PR Review + Approval
       │
       ▼
Merge to main
       │
       ▼
Vercel Production Deploy (automatic)
  ├─ prisma generate
  ├─ prisma migrate deploy
  ├─ next build
  └─ Deploy to CDN + Serverless
```

---

## Domain Configuration

1. Purchase domain (e.g., `chess-coach.app`)
2. Add domain in Vercel project settings
3. Configure DNS (Vercel nameservers or CNAME)
4. SSL automatic via Vercel
5. Update `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL`

---

## Stockfish WASM Deployment

WASM files served from `/public/engine/`:
- Static files, cached by Vercel CDN
- `Cache-Control: public, max-age=31536000, immutable`
- COOP/COEP headers configured in `next.config.ts`
- Total size: ~7MB (one-time download, cached)

---

## Rollback Strategy

| Scenario | Action |
|----------|--------|
| Bad deploy (runtime errors) | Vercel instant rollback to previous deployment |
| Bad migration | Forward-fix migration (no down migrations) |
| Gemini API issue | Disable AI features via env var flag (future) |
| Database issue | Neon point-in-time recovery |

---

## Phase Deployment Milestones

| Phase | Deployable State |
|-------|-----------------|
| Phase 1 | Landing + Auth + Dashboard shell |
| Phase 2 | + Play vs Computer (full game) |
| Phase 3 | + AI Opponent + Coach Mode |
| Phase 4 | + Analysis + Training |
| Phase 5 | + Progress, Reports, 3D, Polish |

Each phase is deployed to production immediately upon completion.

---

## Document References

- [05-system-architecture.md](./05-system-architecture.md)
- [08-database-design.md](./08-database-design.md)
- [26-monitoring.md](./26-monitoring.md)
- [28-git-strategy.md](./28-git-strategy.md)
