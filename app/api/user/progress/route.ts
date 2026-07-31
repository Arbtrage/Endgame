import { requireAuth } from "@/server/api/middleware";
import { apiSuccess, withErrorHandler } from "@/server/api/response";
import { reportService } from "@/server/services/report.service";

export async function GET() {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const progress = await reportService.getProgress(session.user.id);
    return apiSuccess(progress);
  });
}
