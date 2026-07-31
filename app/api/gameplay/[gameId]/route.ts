import { requireAuth } from "@/server/api/middleware";
import { apiSuccess, withErrorHandler } from "@/server/api/response";
import { gameService } from "@/server/services/game.service";

type RouteContext = {
  params: Promise<{ gameId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  return withErrorHandler(async () => {
    await requireAuth();
    const { gameId } = await context.params;
    const game = await gameService.getGameForSpectator(gameId);
    return apiSuccess(game);
  });
}
