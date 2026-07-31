import { requireAuth } from "@/server/api/middleware";
import { apiSuccess, withErrorHandler } from "@/server/api/response";
import { pvpInviteService } from "@/server/services/pvp-invite.service";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const { token } = await context.params;
    const invite = await pvpInviteService.getInviteByToken(session.user.id, token);
    return apiSuccess(invite);
  });
}
