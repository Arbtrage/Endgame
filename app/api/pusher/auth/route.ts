import { requireAuth } from "@/server/api/middleware";
import { apiError, withErrorHandler } from "@/server/api/response";
import { parseGameChannelName } from "@/server/realtime/pusher";
import { gameService } from "@/server/services/game.service";
import { getPusherServer } from "@/server/realtime/pusher";

export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const session = await requireAuth();
    const pusher = getPusherServer();
    if (!pusher) {
      return apiError("SERVICE_UNAVAILABLE", "Realtime not configured", 503);
    }

    const formData = await request.formData();
    const socketId = formData.get("socket_id");
    const channelName = formData.get("channel_name");

    if (typeof socketId !== "string" || typeof channelName !== "string") {
      return apiError("BAD_REQUEST", "Invalid Pusher auth payload", 400);
    }

    const gameId = parseGameChannelName(channelName);
    if (!gameId) {
      return apiError("FORBIDDEN", "Invalid channel", 403);
    }

    const allowed = await gameService.canAccessPusherChannel(
      session.user.id,
      gameId,
    );
    if (!allowed) {
      return apiError("FORBIDDEN", "Not a game participant", 403);
    }

    const auth = pusher.authorizeChannel(socketId, channelName);
    return Response.json(auth);
  });
}
