import { requireAuth } from "@/server/api/middleware";
import { apiSuccess, withErrorHandler } from "@/server/api/response";
import {
  createChatSessionSchema,
  listChatSessionsSchema,
} from "@/server/api/schemas/coach.schema";
import { coachingService } from "@/server/services/coaching.service";

export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const parsed = listChatSessionsSchema.parse(
      Object.fromEntries(searchParams),
    );
    const result = await coachingService.listChatSessions(
      session.user.id,
      parsed,
    );
    return Response.json({ data: result.data, meta: result.meta });
  });
}

export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const body = await request.json().catch(() => ({}));
    const parsed = createChatSessionSchema.parse(body);
    const result = await coachingService.createChatSession(
      session.user.id,
      parsed.context,
    );
    return apiSuccess(result, 201);
  });
}
