import { requireAuth } from "@/server/api/middleware";
import { enforceAIRateLimit } from "@/server/api/rate-limit";
import { apiError, apiSuccess, withErrorHandler } from "@/server/api/response";
import { aiMoveSchema } from "@/server/api/schemas/coach.schema";
import { coachingService } from "@/server/services/coaching.service";

type RouteContext = {
  params: Promise<{ gameId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
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

    const { gameId } = await context.params;
    const body = await request.json();
    const parsed = aiMoveSchema.parse(body);
    const move = await coachingService.requestAiMove(
      session.user.id,
      gameId,
      parsed,
    );

    return apiSuccess(move);
  });
}
