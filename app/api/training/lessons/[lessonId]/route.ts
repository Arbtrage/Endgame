import { requireAuth } from "@/server/api/middleware";
import { apiSuccess, withErrorHandler } from "@/server/api/response";
import { trainingService } from "@/server/services/training.service";

type RouteContext = { params: Promise<{ lessonId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const { lessonId } = await context.params;
    const lesson = await trainingService.getLesson(session.user.id, lessonId);
    return apiSuccess(lesson);
  });
}
