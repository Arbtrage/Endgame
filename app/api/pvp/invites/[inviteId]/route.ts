import { requireAuth } from "@/server/api/middleware";
import { apiSuccess, withErrorHandler } from "@/server/api/response";
import { pvpInviteService } from "@/server/services/pvp-invite.service";

type RouteContext = {
  params: Promise<{ inviteId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const { inviteId } = await context.params;
    const invite = await pvpInviteService.getInvite(session.user.id, inviteId);
    return apiSuccess(invite);
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const { inviteId } = await context.params;
    const invite = await pvpInviteService.cancelInvite(session.user.id, inviteId);
    return apiSuccess(invite);
  });
}
