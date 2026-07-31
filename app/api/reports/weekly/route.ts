import { requireAuth } from "@/server/api/middleware";
import { apiSuccess, withErrorHandler } from "@/server/api/response";
import { reportService } from "@/server/services/report.service";

export async function GET() {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const report = await reportService.getLatestWeeklyReport(session.user.id);
    return apiSuccess(report);
  });
}

export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
      const result = await reportService.generateAllWeeklyReports();
      return apiSuccess(result);
    }

    const session = await requireAuth();
    const report = await reportService.generateWeeklyReport(session.user.id);
    return apiSuccess(report);
  });
}
