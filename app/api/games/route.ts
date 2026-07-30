import { requireAuth } from "@/server/api/middleware";
import { apiSuccess, withErrorHandler } from "@/server/api/response";
import { createGameSchema, listGamesSchema } from "@/server/api/schemas/game.schema";
import { gameService } from "@/server/services/game.service";

export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const body = await request.json();
    const parsed = createGameSchema.parse(body);
    const game = await gameService.createGame(session.user.id, parsed);
    return apiSuccess(game, 201);
  });
}

export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const parsed = listGamesSchema.parse(Object.fromEntries(searchParams));
    const result = await gameService.listGames(session.user.id, parsed);
    return Response.json({ data: result.data, meta: result.meta });
  });
}
