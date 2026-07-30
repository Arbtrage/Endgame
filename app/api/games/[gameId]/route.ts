import { requireAuth } from "@/server/api/middleware";
import { apiSuccess, withErrorHandler } from "@/server/api/response";
import { gameService } from "@/server/services/game.service";

type RouteContext = {
  params: Promise<{ gameId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const { gameId } = await context.params;
    const game = await gameService.getGame(session.user.id, gameId);
    return apiSuccess(game);
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const { gameId } = await context.params;
    const result = await gameService.deleteGame(session.user.id, gameId);
    return apiSuccess(result);
  });
}
