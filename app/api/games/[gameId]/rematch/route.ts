import { requireAuth } from "@/server/api/middleware";
import { apiError, apiSuccess, withErrorHandler } from "@/server/api/response";
import { checkRateLimit } from "@/server/api/rate-limit";
import { pvpInviteService } from "@/server/services/pvp-invite.service";

type RouteContext = {
  params: Promise<{ gameId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  return withErrorHandler(async () => {
    const session = await requireAuth();

    const rate = checkRateLimit({
      key: `pvp-rematch:${session.user.id}`,
      limit: 10,
      windowMs: 60_000,
    });
    if (!rate.allowed) {
      return apiError("RATE_LIMITED", "Too many rematch requests", 429);
    }

    const { gameId } = await context.params;
    const invite = await pvpInviteService.createRematchInvite(
      session.user.id,
      gameId,
    );
    return apiSuccess(invite);
  });
}
