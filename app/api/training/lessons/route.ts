import { requireAuth } from "@/server/api/middleware";
import { generateLessonSchema } from "@/server/api/schemas/analysis.schema";
import { apiSuccess, withErrorHandler } from "@/server/api/response";
import { trainingService } from "@/server/services/training.service";
import type { LessonTopic } from "@prisma/client";

export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get("topic") as LessonTopic | null;
    const lessons = await trainingService.listLessons(
      session.user.id,
      topic ?? undefined,
    );
    return apiSuccess(lessons);
  });
}

export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = generateLessonSchema.parse(body);
    const lesson = await trainingService.generateLesson(session.user.id, parsed);
    return apiSuccess(lesson);
  });
}
