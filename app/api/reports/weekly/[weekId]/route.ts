import { requireAuth } from "@/server/api/middleware";
import { apiSuccess, withErrorHandler } from "@/server/api/response";
import { reportService } from "@/server/services/report.service";

type RouteContext = { params: Promise<{ weekId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const { weekId } = await context.params;
    const report = await reportService.getWeeklyReport(session.user.id, weekId);
    return apiSuccess(report);
  });
}
