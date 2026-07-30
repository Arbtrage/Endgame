import { beforeEach, describe, expect, it } from "vitest";
import {
  checkRateLimit,
  enforceAIRateLimit,
  resetRateLimits,
} from "@/server/api/rate-limit";

describe("rate-limit", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  it("allows requests under limit", () => {
    const result = checkRateLimit({
      key: "test:user",
      limit: 3,
      windowMs: 60_000,
    });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("blocks requests over limit", () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit({ key: "test:user", limit: 3, windowMs: 60_000 });
    }
    const blocked = checkRateLimit({
      key: "test:user",
      limit: 3,
      windowMs: 60_000,
    });
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("enforces AI rate limit per user", () => {
    const first = enforceAIRateLimit("user-1");
    expect(first.allowed).toBe(true);
  });
});
