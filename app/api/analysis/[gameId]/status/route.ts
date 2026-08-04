import { requireAuth } from "@/server/api/middleware";
import { apiSuccess, withErrorHandler } from "@/server/api/response";
import { analysisService } from "@/server/services/analysis.service";

type RouteContext = { params: Promise<{ gameId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const { gameId } = await context.params;
    const status = await analysisService.getAnalysisJobStatus(
      session.user.id,
      gameId,
    );
    return apiSuccess(status);
  });
}
