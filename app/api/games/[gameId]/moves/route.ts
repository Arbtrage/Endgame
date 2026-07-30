import { requireAuth } from "@/server/api/middleware";
import { apiSuccess, withErrorHandler } from "@/server/api/response";
import { recordMoveSchema } from "@/server/api/schemas/game.schema";
import { gameService } from "@/server/services/game.service";

type RouteContext = {
  params: Promise<{ gameId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const { gameId } = await context.params;
    const body = await request.json();
    const parsed = recordMoveSchema.parse(body);
    const move = await gameService.recordMove(session.user.id, gameId, parsed);
    return apiSuccess(move, 201);
  });
}
