import { requireAuth } from "@/server/api/middleware";
import { apiSuccess, withErrorHandler } from "@/server/api/response";
import { chatHistoryQuerySchema } from "@/server/api/schemas/coach.schema";
import { coachingService } from "@/server/services/coaching.service";

export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const parsed = chatHistoryQuerySchema.parse(
      Object.fromEntries(searchParams),
    );
    const history = await coachingService.getChatHistory(
      session.user.id,
      parsed.sessionId,
    );

    return apiSuccess(history);
  });
}
