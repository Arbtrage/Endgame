import { requireAuth } from "@/server/api/middleware";
import { importPgnSchema } from "@/server/api/schemas/analysis.schema";
import { apiSuccess, withErrorHandler } from "@/server/api/response";
import { analysisService } from "@/server/services/analysis.service";

export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = importPgnSchema.parse(body);
    const result = await analysisService.importPgn(session.user.id, parsed.pgn);
    return apiSuccess(result);
  });
}
