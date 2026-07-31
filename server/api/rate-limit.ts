type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

export type RateLimitConfig = {
  key: string;
  limit: number;
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function checkRateLimit(config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const entry = store.get(config.key);

  if (!entry || now >= entry.resetAt) {
    store.set(config.key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: config.limit - 1,
      retryAfterSeconds: 0,
    };
  }

  if (entry.count >= config.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  store.set(config.key, entry);

  return {
    allowed: true,
    remaining: config.limit - entry.count,
    retryAfterSeconds: 0,
  };
}

export function resetRateLimits(): void {
  store.clear();
}

export const AI_RATE_LIMITS = {
  global: { limit: 60, windowMs: 60_000 },
  chat: { limit: 20, windowMs: 60_000 },
  demo: { limit: 5, windowMs: 60_000 },
} as const;

export function enforceAIRateLimit(userId: string, type: "global" | "chat" = "global") {
  const config = AI_RATE_LIMITS[type];
  return checkRateLimit({
    key: `${type}:${userId}`,
    ...config,
  });
}

export function enforceDemoRateLimit(ip: string) {
  const config = AI_RATE_LIMITS.demo;
  return checkRateLimit({
    key: `demo:${ip}`,
    ...config,
  });
}
