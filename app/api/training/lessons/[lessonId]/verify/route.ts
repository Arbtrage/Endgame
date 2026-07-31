import { requireAuth } from "@/server/api/middleware";
import { verifyExerciseSchema } from "@/server/api/schemas/analysis.schema";
import { apiSuccess, withErrorHandler } from "@/server/api/response";
import { trainingService } from "@/server/services/training.service";

type RouteContext = { params: Promise<{ lessonId: string }> };

export async function POST(request: Request, context: RouteContext) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const { lessonId } = await context.params;
    const body = await request.json();
    const parsed = verifyExerciseSchema.parse(body);
    const result = await trainingService.verifyExercise(
      session.user.id,
      lessonId,
      parsed.exerciseIndex,
      parsed.uci,
    );
    return apiSuccess(result);
  });
}
