import { requireAuth } from "@/server/api/middleware";
import { apiSuccess, withErrorHandler } from "@/server/api/response";
import { trainingService } from "@/server/services/training.service";

export async function GET() {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const plan = await trainingService.getStudyPlan(session.user.id);
    return apiSuccess(plan);
  });
}
