# Authentication

## Document Metadata

| Field | Value |
|-------|-------|
| Version | 1.0.0 |
| Status | Approved for Implementation |
| Last Updated | 2026-07-30 |

---

## Overview

Authentication is handled by [Better Auth](https://www.better-auth.com/), a modern TypeScript authentication library designed for Next.js. It manages sessions, OAuth, and user records with minimal configuration.

---

## Auth Methods (v1)

| Method | Priority | Notes |
|--------|----------|-------|
| Email + Password | P0 | Primary sign-up method |
| Google OAuth | P0 | One-click sign in |
| Magic Link | P2 | Future consideration |
| GitHub OAuth | P2 | Future consideration |

---

## Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Client      │────►│  Better Auth     │────►│  Neon DB     │
│  (Sign In UI)│     │  /api/auth/*     │     │  (users,     │
└──────────────┘     └──────────────────┘     │   sessions,  │
                              │                │   accounts)  │
                              ▼                └──────────────┘
                     ┌──────────────────┐
                     │  Middleware       │
                     │  (session check)  │
                     └──────────────────┘
```

---

## Better Auth Configuration

```typescript
// src/shared/auth/auth.ts (conceptual)

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/shared/db/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,      // Refresh session daily
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,             // 5 min cookie cache
    },
  },
  user: {
    additionalFields: {
      skillEstimate: { type: "number", required: false },
      onboardingComplete: { type: "boolean", required: false, defaultValue: false },
    },
  },
});
```

### Route Handler Mount

```typescript
// app/api/auth/[...all]/route.ts
import { auth } from "@/shared/auth/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

---

## Client Integration

```typescript
// src/shared/auth/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

// Usage in components:
// authClient.signIn.email({ email, password })
// authClient.signUp.email({ email, password, name })
// authClient.signIn.social({ provider: "google" })
// authClient.signOut()
// authClient.useSession()
```

---

## Middleware

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedRoutes = [
  "/dashboard",
  "/play",
  "/analyze",
  "/train",
  "/progress",
  "/settings",
  "/coach",
];

const authRoutes = ["/auth/sign-in", "/auth/sign-up"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  const isProtected = protectedRoutes.some(r => pathname.startsWith(r));
  const isAuthRoute = authRoutes.some(r => pathname.startsWith(r));

  if (isProtected && !sessionCookie) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/play/:path*",
    "/analyze/:path*",
    "/train/:path*",
    "/progress/:path*",
    "/settings/:path*",
    "/coach/:path*",
    "/auth/:path*",
  ],
};
```

---

## Server-Side Session Access

```typescript
// src/server/api/middleware.ts
import { auth } from "@/shared/auth/auth";
import { headers } from "next/headers";

export async function requireAuth() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new ApiError("UNAUTHORIZED", "Authentication required", 401);
  }

  return session;
}
```

---

## User Lifecycle

### Sign Up Flow

```
1. User submits email + password (+ name)
2. Better Auth creates User + Account records
3. UserSettings created with defaults (via DB trigger or service call)
4. Session created, cookie set
5. Redirect to /dashboard (or /onboarding if first time)
```

### Sign In Flow

```
1. User submits credentials or clicks Google OAuth
2. Better Auth validates / OAuth callback
3. Session created/refreshed, cookie set
4. Redirect to callbackUrl or /dashboard
```

### Sign Out Flow

```
1. authClient.signOut()
2. Session deleted from DB
3. Cookie cleared
4. Redirect to /
```

### Account Deletion

```
1. User confirms deletion in settings
2. DELETE /api/user/account
3. Cascade delete: games, analyses, chat, lessons, reports, settings
4. Better Auth user + accounts + sessions deleted
5. Redirect to /
```

---

## Onboarding

After first sign-up, optional onboarding collects:

| Field | Required | Storage |
|-------|----------|---------|
| Display name | Yes | `User.name` |
| Skill level | No | `User.skillEstimate` (800/1200/1600/2000+) |
| Preferred mode | No | Used for dashboard customization only |

Onboarding completion sets `User.onboardingComplete = true`.

Users can skip onboarding; defaults apply.

---

## Security Measures

| Measure | Implementation |
|---------|---------------|
| Password hashing | Better Auth (bcrypt) |
| Session tokens | Cryptographically random, stored in DB |
| CSRF protection | Better Auth built-in |
| Cookie flags | HttpOnly, Secure (prod), SameSite=Lax |
| OAuth state parameter | Better Auth built-in |
| Brute force protection | Rate limit sign-in: 5 attempts/min per IP |
| Session fixation | New session on sign-in |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `BETTER_AUTH_SECRET` | 32+ char random string for encryption |
| `BETTER_AUTH_URL` | Full app URL (https://domain.com) |
| `NEXT_PUBLIC_APP_URL` | Same URL, accessible on client |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

---

## Protected vs Public Routes

| Route Pattern | Access |
|---------------|--------|
| `/` | Public |
| `/demo` | Public |
| `/auth/*` | Public (redirect if authenticated) |
| `/api/auth/*` | Public (Better Auth) |
| `/api/health` | Public |
| `/dashboard/*` | Authenticated |
| `/play/*` | Authenticated |
| `/analyze/*` | Authenticated |
| `/train/*` | Authenticated |
| `/progress/*` | Authenticated |
| `/settings/*` | Authenticated |
| `/coach/*` | Authenticated |
| `/api/games/*` | Authenticated |
| `/api/coach/*` | Authenticated |
| `/api/training/*` | Authenticated |
| `/api/analysis/*` | Authenticated |
| `/api/user/*` | Authenticated |
| `/api/reports/*` | Authenticated |
| `/api/cron/*` | CRON_SECRET header |

---

## Assumptions

| ID | Assumption |
|----|------------|
| AA-1 | Better Auth v1.x with Prisma adapter |
| AA-2 | No email verification required for v1 (reduces friction) |
| AA-3 | Single session per user (no multi-device session management UI) |
| AA-4 | Google OAuth configured in Google Cloud Console |
| AA-5 | No role-based access control in v1 (all users equal) |

---

## Document References

- [07-backend-architecture.md](./07-backend-architecture.md)
- [08-database-design.md](./08-database-design.md)
- [09-api-design.md](./09-api-design.md)
- [23-security.md](./23-security.md)
