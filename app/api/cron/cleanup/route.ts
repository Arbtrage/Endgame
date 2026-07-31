import { apiError, apiSuccess, withErrorHandler } from "@/server/api/response";
import { reportService } from "@/server/services/report.service";

export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return apiError("UNAUTHORIZED", "Invalid cron secret", 401);
    }
    const result = await reportService.cleanupStaleData();
    return apiSuccess(result);
  });
}
