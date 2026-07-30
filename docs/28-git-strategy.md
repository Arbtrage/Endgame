# Git Strategy

## Document Metadata

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Approved for Implementation |
| Last Updated | 2026-07-30 |

---

## Branch Strategy

### Trunk-Based Development

```
main (production)
  │
  ├── feat/phase-1-auth-dashboard
  ├── feat/phase-2-stockfish-game
  ├── feat/phase-3-gemini-coaching
  ├── feat/phase-4-analysis-training
  ├── feat/phase-5-polish-reports
  │
  ├── fix/board-move-validation
  └── chore/update-dependencies
```

| Branch Type | Pattern | Lifetime |
|-------------|---------|----------|
| Production | `main` | Permanent |
| Feature | `feat/{short-description}` | Days (merge and delete) |
| Bug fix | `fix/{short-description}` | Hours to days |
| Chore | `chore/{short-description}` | Hours |
| Phase | `feat/phase-{N}-{description}` | Weeks (phase duration) |

### Rules

1. `main` is always deployable
2. Feature branches merge to `main` via PR
3. No long-lived development branch
4. Branch names: lowercase, hyphen-separated
5. Delete branch after merge

---

## Commit Messages

### Format

```
type(scope): concise description

Optional body explaining WHY (not what).
```

### Types

| Type | Usage |
|------|-------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change without feature/fix |
| `chore` | Tooling, deps, config |
| `docs` | Documentation only |
| `test` | Test additions/fixes |
| `style` | Formatting, no logic change |
| `perf` | Performance improvement |

### Scope

Use feature name: `game`, `auth`, `coaching`, `analysis`, `training`, `dashboard`, `engine`, `ai`, `ui`, `db`.

### Examples

```
feat(auth): add Google OAuth sign in
feat(game): implement Stockfish opponent move logic
fix(analysis): correct ACPL calculation for black moves
refactor(coaching): extract prompt templates to separate files
chore(deps): upgrade Next.js to 16.2.12
docs: add phase 2 implementation plan
test(engine): add move classification unit tests
perf(engine): reduce Stockfish default depth on mobile
```

---

## Pull Request Process

### PR Requirements

- [ ] Descriptive title (follows commit format)
- [ ] Summary of changes (what and why)
- [ ] Link to relevant docs/issues
- [ ] Screenshots for UI changes
- [ ] Test plan checklist
- [ ] CI passes (type check, lint, tests, build)
- [ ] No secrets or env files committed
- [ ] Reviewed by at least 1 reviewer (or self-review for solo dev)

### PR Template

```markdown
## Summary
- Brief description of changes

## Test Plan
- [ ] Unit tests pass
- [ ] Manual testing steps
- [ ] E2E tests pass (if applicable)

## Screenshots
(if UI changes)

## Docs
- [ ] Architecture docs updated (if applicable)
```

### Merge Strategy

- **Squash merge** to `main` (clean history)
- PR title becomes squash commit message
- Delete branch after merge

---

## Release Strategy

### Continuous Deployment

Every merge to `main` triggers production deployment via Vercel.

### Phase Releases

Each implementation phase is a logical release:

| Phase | Tag | Description |
|-------|-----|-------------|
| Phase 1 | `v0.1.0` | Foundation |
| Phase 2 | `v0.2.0` | Core Chess |
| Phase 3 | `v0.3.0` | AI Coaching |
| Phase 4 | `v0.4.0` | Analysis & Training |
| Phase 5 | `v1.0.0` | Production Release |

Tags created manually after phase acceptance criteria met.

---

## Protected Branches

| Rule | `main` |
|------|--------|
| Require PR | Yes |
| Require CI pass | Yes |
| Require review | 1 approval |
| Force push | Disabled |
| Direct push | Disabled |

---

## .gitignore Essentials

```
# Dependencies
node_modules/

# Next.js
.next/
out/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/

# OS
.DS_Store

# Prisma
prisma/*.db

# Vercel
.vercel

# Test
coverage/
playwright-report/
test-results/
```

---

## Document References

- [25-deployment.md](./25-deployment.md)
- [27-coding-standards.md](./27-coding-standards.md)
- [29-contributing.md](./29-contributing.md)
