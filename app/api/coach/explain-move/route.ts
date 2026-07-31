import { requireAuth } from "@/server/api/middleware";
import { enforceAIRateLimit } from "@/server/api/rate-limit";
import { explainMoveSchema } from "@/server/api/schemas/analysis.schema";
import { apiError, apiSuccess, withErrorHandler } from "@/server/api/response";
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
    const parsed = explainMoveSchema.parse(body);
    const result = await coachingService.explainMove(session.user.id, parsed);
    return apiSuccess(result);
  });
}
