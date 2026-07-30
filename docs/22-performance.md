# Performance

## Document Metadata

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Approved for Implementation |
| Last Updated | 2026-07-30 |

---

## Performance Budgets

### Page Load

| Page | FCP | LCP | TTI | Target |
|------|-----|-----|-----|--------|
| Landing | < 1.0s | < 1.5s | < 2.0s | Critical (first impression) |
| Dashboard | < 0.8s | < 1.2s | < 1.5s | High (daily use) |
| Game setup | < 0.5s | < 0.8s | < 1.0s | High |
| Game (board) | < 0.5s | < 1.0s | < 2.0s | Critical (after WASM load) |
| Analysis | < 0.8s | < 1.2s | < 1.5s | Medium |
| Training | < 0.5s | < 0.8s | < 1.0s | Medium |

### Runtime Performance

| Operation | Target | Max |
|-----------|--------|-----|
| Stockfish move (depth 15) | < 1.5s | 3s |
| Stockfish full game analysis (40 moves, depth 18) | < 45s | 90s |
| Gemini AI move | < 3s | 8s |
| Gemini explanation | < 4s | 10s |
| API read endpoints | < 200ms | 500ms |
| API write endpoints | < 300ms | 1s |
| Board move animation | < 200ms | 300ms |
| Page transition | < 300ms | 500ms |

---

## Optimization Strategies

### 1. Code Splitting

| Bundle | Strategy |
|--------|----------|
| Stockfish WASM (~7MB) | Dynamic import, load on first game |
| Three.js / R3F | Dynamic import, load on landing/dashboard |
| Feature modules | Automatic via Next.js App Router |
| shadcn/ui | Tree-shaken per component |

```typescript
// Lazy load patterns
const LandingScene = dynamic(() => import('@/shared/three/LandingScene'), { ssr: false });
const GameBoard = dynamic(() => import('@/features/game/components/GameBoard'), { ssr: false });
```

### 2. Server Components

Use RSC for static content to reduce client JS:
- Dashboard layout shell
- Game history list (data fetched server-side)
- Settings page structure
- Analysis metadata

### 3. Image & Asset Optimization

- `next/image` for all images (avatars, piece sets)
- SVG piece sets (scalable, small)
- WASM cached via `Cache-Control: public, max-age=31536000, immutable`
- Font subsetting via `next/font`

### 4. Database Performance

| Strategy | Implementation |
|----------|---------------|
| Connection pooling | Neon pooled connection string |
| Indexed queries | See [08-database-design.md](./08-database-design.md) |
| Pagination | All list endpoints paginated (max 100) |
| Select only needed fields | Prisma `select` clauses |
| Avoid N+1 | Prisma `include` with care |

### 5. Caching

| Layer | What | TTL |
|-------|------|-----|
| TanStack Query | API responses | 30s default |
| `unstable_cache` | User profile, recommendations | 5min / 24h |
| Browser cache | WASM, static assets | 1 year |
| CDN (Vercel) | Static pages, assets | Automatic |

### 6. Stockfish Optimization

- Single worker instance (no re-initialization)
- Debounce eval requests during rapid navigation
- Lower depth for live eval bar (10) vs analysis (18)
- Stop previous search before starting new one
- SharedArrayBuffer for threading (when available)

### 7. Gemini Optimization

- Structured prompts (minimize token waste)
- Context window management (trim old messages)
- Use Flash model for speed-critical calls
- Cache common opening explanations (future)
- Batch weekly reports via cron (off-peak)

---

## Monitoring Performance

| Metric | Tool | Alert Threshold |
|--------|------|-----------------|
| Web Vitals | Vercel Analytics | LCP > 2.5s |
| API response time | Vercel Function Logs | P95 > 1s |
| Stockfish load time | Custom telemetry | > 5s |
| Gemini latency | Custom telemetry | P95 > 8s |
| Error rate | Vercel Function Logs | > 1% |
| Bundle size | `@next/bundle-analyzer` | > 300KB first load |

---

## Performance Testing

| Test | Tool | Frequency |
|------|------|-----------|
| Lighthouse CI | GitHub Actions | Every PR |
| Bundle analysis | `@next/bundle-analyzer` | Weekly |
| API load test | k6 or autocannon | Pre-release |
| Stockfish benchmark | Custom script | On engine update |

### Lighthouse Targets

| Category | Score |
|----------|-------|
| Performance | > 90 |
| Accessibility | > 90 |
| Best Practices | > 95 |
| SEO | > 90 |

---

## Mobile Considerations

- Board scales to viewport width (max 500px)
- Touch targets ≥ 44px
- Reduce Stockfish depth by 3 on mobile (detect via viewport)
- Disable 3D scenes on mobile (detect via viewport or preference)
- Bottom sheet panels instead of sidebars

---

## Document References

- [11-stockfish-architecture.md](./11-stockfish-architecture.md)
- [06-frontend-architecture.md](./06-frontend-architecture.md)
- [26-monitoring.md](./26-monitoring.md)
