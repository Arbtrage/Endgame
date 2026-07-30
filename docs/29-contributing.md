# Contributing

## Document Metadata

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Approved for Implementation |
| Last Updated | 2026-07-30 |

---

## Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20.x |
| npm | 10.x |
| Git | 2.x |
| PostgreSQL | Via Neon (no local DB required) |

### Setup

```bash
# Clone repository
git clone https://github.com/{org}/chess.git
cd chess

# Install dependencies
npm ci

# Copy environment template
cp .env.example .env.local
# Fill in values (see docs/25-deployment.md)

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed development data (optional)
npx prisma db seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Development Workflow

1. Read relevant architecture docs in `docs/`
2. Check current phase plan in `docs/phases/`
3. Create feature branch from `main`
4. Implement following coding standards ([27-coding-standards.md](./27-coding-standards.md))
5. Write tests for new logic
6. Run checks locally:
   ```bash
   npx tsc --noEmit
   npm run lint
   npm run test
   npm run build
   ```
7. Open PR with test plan
8. Address review feedback
9. Squash merge to `main`

---

## Architecture Compliance

Before implementing any feature, verify:

- [ ] Feature belongs to a defined module in [19-folder-structure.md](./19-folder-structure.md)
- [ ] Stockfish stays client-side ([11-stockfish-architecture.md](./11-stockfish-architecture.md))
- [ ] Gemini calls go through server AI provider ([12-gemini-architecture.md](./12-gemini-architecture.md))
- [ ] API follows schema in [09-api-design.md](./09-api-design.md)
- [ ] Database changes match [08-database-design.md](./08-database-design.md)
- [ ] UI follows [15-ui-design-system.md](./15-ui-design-system.md)
- [ ] Component listed in [16-component-library.md](./16-component-library.md)

---

## Key Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run test` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npx prisma studio` | Visual database browser |
| `npx prisma migrate dev` | Create/apply migration |
| `npx prisma db seed` | Seed development data |

---

## Adding a New Feature

1. Create feature directory: `src/features/{name}/`
2. Follow feature anatomy from [19-folder-structure.md](./19-folder-structure.md)
3. Add page route in `app/(app)/`
4. Add API routes in `app/api/`
5. Add service in `src/server/services/`
6. Add repository in `src/server/repositories/`
7. Update Prisma schema if needed
8. Add components to [16-component-library.md](./16-component-library.md)
9. Write tests
10. Update relevant architecture docs

---

## Adding a New AI Provider

1. Implement `AIProvider` interface in `src/server/ai/{provider}.provider.ts`
2. Add prompt compatibility tests
3. Update factory in `src/server/ai/factory.ts`
4. Add env var for API key
5. Update [12-gemini-architecture.md](./12-gemini-architecture.md) (or create new doc)
6. No changes to services, routes, or frontend

---

## Adding a shadcn/ui Component

```bash
npx shadcn@latest add {component-name}
```

Component installs to `src/shared/ui/`. Do not modify shadcn primitives directly; wrap in shared composites if customization needed.

---

## Documentation Updates

When your change affects architecture:

1. Update the relevant doc in `docs/`
2. Include doc updates in the same PR as code changes
3. Never create docs the user didn't ask for (only update existing blueprint docs)

---

## Questions & Decisions

- Check `docs/` first — most decisions are documented
- If a decision is not documented, add it to the relevant doc with an "Assumptions" section entry
- Do not make undocumented architectural decisions

---

## Document References

- [27-coding-standards.md](./27-coding-standards.md)
- [28-git-strategy.md](./28-git-strategy.md)
- [19-folder-structure.md](./19-folder-structure.md)
- [phases/phase-1.md](./phases/phase-1.md)
