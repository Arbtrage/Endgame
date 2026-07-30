import { requireAuth } from "@/server/api/middleware";
import { enforceAIRateLimit } from "@/server/api/rate-limit";
import { apiError, apiSuccess, withErrorHandler } from "@/server/api/response";
import { explainMomentSchema } from "@/server/api/schemas/coach.schema";
import { coachingService } from "@/server/services/coaching.service";

export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const rateLimit = enforceAIRateLimit(session.user.id, "global");
    if (!rateLimit.allowed) {
      return apiError(
        "RATE_LIMITED",
        "Too many AI requests. Please try again later.",
        429,
        { retryAfter: rateLimit.retryAfterSeconds },
      );
    }

    const body = await request.json();
    const parsed = explainMomentSchema.parse(body);
    const result = await coachingService.explainMoment(
      session.user.id,
      parsed,
    );

    return apiSuccess(result);
  });
}
