import { requireAuth } from "@/server/api/middleware";
import { apiError, apiSuccess, withErrorHandler } from "@/server/api/response";
import { checkRateLimit } from "@/server/api/rate-limit";
import { sendGameMessageSchema } from "@/server/api/schemas/pvp.schema";
import { gameService } from "@/server/services/game.service";

type RouteContext = {
  params: Promise<{ gameId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const { gameId } = await context.params;
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit") ?? "100");
    const messages = await gameService.listMessages(
      session.user.id,
      gameId,
      Number.isFinite(limit) ? Math.min(limit, 200) : 100,
    );
    return apiSuccess(messages);
  });
}

export async function POST(request: Request, context: RouteContext) {
  return withErrorHandler(async () => {
    const session = await requireAuth();

    const rate = checkRateLimit({
      key: `pvp-chat:${session.user.id}`,
      limit: 30,
      windowMs: 60_000,
    });
    if (!rate.allowed) {
      return apiError("RATE_LIMITED", "Too many chat messages", 429);
    }

    const { gameId } = await context.params;
    const body = await request.json();
    const parsed = sendGameMessageSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("BAD_REQUEST", "Invalid message payload", 400);
    }

    const message = await gameService.sendMessage(
      session.user.id,
      gameId,
      parsed.data.content,
    );
    return apiSuccess(message);
  });
}
