import { requireAuth } from "@/server/api/middleware";
import { apiSuccess, withErrorHandler } from "@/server/api/response";
import { trainingService } from "@/server/services/training.service";

export async function GET() {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const recommendations = await trainingService.getRecommendations(
      session.user.id,
    );
    return apiSuccess(recommendations);
  });
}
