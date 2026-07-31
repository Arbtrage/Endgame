import { enforceDemoRateLimit } from "@/server/api/rate-limit";
import { apiError, apiSuccess, withErrorHandler } from "@/server/api/response";
import { headers } from "next/headers";

export async function GET() {
  return withErrorHandler(async () => {
    const headerStore = await headers();
    const ip =
      headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headerStore.get("x-real-ip") ??
      "unknown";

    const rateLimit = enforceDemoRateLimit(ip);
    if (!rateLimit.allowed) {
      return apiError(
        "RATE_LIMITED",
        "Demo rate limit exceeded. Sign up for unlimited play.",
        429,
        { retryAfter: rateLimit.retryAfterSeconds },
      );
    }

    return apiSuccess({ allowed: true, remaining: rateLimit.remaining });
  });
}
