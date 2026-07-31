import { requireAuth } from "@/server/api/middleware";
import { saveAnalysisSchema } from "@/server/api/schemas/analysis.schema";
import { apiSuccess, withErrorHandler } from "@/server/api/response";
import { analysisService } from "@/server/services/analysis.service";

type RouteContext = { params: Promise<{ gameId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const { gameId } = await context.params;
    const analysis = await analysisService.getAnalysis(session.user.id, gameId);
    return apiSuccess(analysis);
  });
}

export async function POST(request: Request, context: RouteContext) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const { gameId } = await context.params;
    const body = await request.json();
    const parsed = saveAnalysisSchema.parse(body);
    const analysis = await analysisService.saveAnalysis(
      session.user.id,
      gameId,
      parsed,
    );
    return apiSuccess(analysis);
  });
}
