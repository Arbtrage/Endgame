import { requireAuth } from "@/server/api/middleware";
import { apiSuccess, withErrorHandler } from "@/server/api/response";
import { completeGameSchema } from "@/server/api/schemas/game.schema";
import { gameService } from "@/server/services/game.service";

type RouteContext = {
  params: Promise<{ gameId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const { gameId } = await context.params;
    const body = await request.json();
    const parsed = completeGameSchema.parse(body);
    const game = await gameService.completeGame(session.user.id, gameId, parsed);
    return apiSuccess(game);
  });
}
