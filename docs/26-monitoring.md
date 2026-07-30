# Monitoring

## Document Metadata

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Approved for Implementation |
| Last Updated | 2026-07-30 |

---

## Overview

Monitoring covers application health, performance, errors, and business metrics. Primary tools: Vercel Analytics (built-in) and structured server logs.

---

## Monitoring Stack

| Layer | Tool | Cost |
|-------|------|------|
| Web Vitals | Vercel Analytics | Included |
| Function logs | Vercel Dashboard | Included |
| Error tracking | Vercel Logs + custom alerts | Included |
| Uptime | Vercel (automatic) | Included |
| AI cost tracking | Custom telemetry | Included |
| Future: APM | Datadog / Axiom / Sentry | Paid |

---

## Health Check

### Endpoint

`GET /api/health`

```json
{
  "data": {
    "status": "ok",
    "timestamp": "2026-07-30T12:00:00Z",
    "version": "1.0.0",
    "checks": {
      "database": "ok",
      "ai": "ok"
    }
  }
}
```

### Health Check Logic

| Check | Method | Failure |
|-------|--------|---------|
| Database | `prisma.$queryRaw\`SELECT 1\`` | status: "degraded" |
| AI (optional) | Lightweight Gemini ping | status: "degraded" (AI features down) |

Vercel Cron or external uptime monitor pings `/api/health` every 5 minutes.

---

## Key Metrics

### Application Metrics

| Metric | Source | Alert Threshold |
|--------|--------|-----------------|
| Error rate (5xx) | Vercel Logs | > 1% over 5 min |
| API P95 latency | Vercel Logs | > 2s |
| Function timeout rate | Vercel Logs | > 0.5% |
| Database connection errors | Server logs | Any occurrence |

### Business Metrics

| Metric | Source | Tracked |
|--------|--------|---------|
| Daily active users | Custom event | Yes |
| Games played per day | Server log aggregation | Yes |
| Game completion rate | Custom event | Yes |
| Analysis runs per day | Server log | Yes |
| Lessons completed per day | Server log | Yes |
| Coach chat messages per day | Server log | Yes |
| Sign-ups per day | Auth event log | Yes |

### AI Metrics

| Metric | Source | Alert Threshold |
|--------|--------|-----------------|
| Gemini call success rate | Server logs | < 95% |
| Gemini P95 latency | Server logs | > 8s |
| Gemini daily token usage | Server logs | Budget threshold |
| Gemini daily cost estimate | Server logs | > $50/day |
| Illegal move rate (AI) | Server logs | > 5% |

### Client Metrics

| Metric | Source | Alert Threshold |
|--------|--------|-----------------|
| Stockfish load failure rate | Custom telemetry | > 2% |
| Stockfish load time P95 | Custom telemetry | > 5s |
| LCP | Vercel Analytics | > 2.5s |
| CLS | Vercel Analytics | > 0.1 |

---

## Alerting

### v1 Alerting (Manual)

- Daily review of Vercel Dashboard for error spikes
- Weekly review of AI cost logs
- GitHub issue created for sustained error rate increase

### Future Alerting

| Alert | Channel | Condition |
|-------|---------|-----------|
| High error rate | Slack / Email | 5xx > 1% for 5 min |
| AI budget exceeded | Email | Daily cost > threshold |
| Database connection failure | Slack | Any occurrence |
| Health check failure | Slack | 3 consecutive failures |
| Function timeout spike | Email | > 5 timeouts in 10 min |

---

## Dashboards

### Vercel Dashboard (Built-in)

- Deployment history
- Function invocations and duration
- Error logs with filtering
- Web Vitals trends
- Bandwidth usage

### Custom Dashboard (Future)

Business metrics dashboard showing:
- DAU/WAU/MAU trend
- Games by mode (pie chart)
- AI usage and cost
- User retention cohorts
- Feature adoption rates

---

## Incident Response

| Severity | Definition | Response Time | Action |
|----------|-----------|---------------|--------|
| P0 | App down, no one can play | 15 min | Rollback deploy, investigate |
| P1 | AI features down, game works | 1 hour | Check Gemini status, enable fallback |
| P2 | Performance degraded | 4 hours | Investigate logs, optimize |
| P3 | Non-critical bug | Next sprint | Create issue, fix in next phase |

---

## Document References

- [21-logging.md](./21-logging.md)
- [22-performance.md](./22-performance.md)
- [25-deployment.md](./25-deployment.md)
