import { requireAuth } from "@/server/api/middleware";
import { apiError, apiSuccess, withErrorHandler } from "@/server/api/response";
import { checkRateLimit } from "@/server/api/rate-limit";
import { createPvpInviteSchema } from "@/server/api/schemas/pvp.schema";
import { pvpInviteService } from "@/server/services/pvp-invite.service";

export async function GET() {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const invites = await pvpInviteService.listInvites(session.user.id);
    return apiSuccess(invites);
  });
}

export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const session = await requireAuth();

    const rate = checkRateLimit({
      key: `pvp-invite:${session.user.id}`,
      limit: 10,
      windowMs: 60_000,
    });
    if (!rate.allowed) {
      return apiError("RATE_LIMITED", "Too many invite requests", 429);
    }

    const body = await request.json();
    const parsed = createPvpInviteSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("BAD_REQUEST", "Invalid invite payload", 400);
    }

    const invite = await pvpInviteService.createInvite(session.user.id, {
      inviteeId: parsed.data.inviteeId,
      inviterColor: parsed.data.inviterColor,
      timeControl: parsed.data.timeControl,
    });

    return apiSuccess(invite);
  });
}
