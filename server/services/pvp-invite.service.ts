import { ApiError } from "@/server/api/response";
import { sendGameInviteEmail } from "@/server/email/send-game-invite";
import { pvpInviteRepository } from "@/server/repositories/pvp-invite.repository";
import { userRepository } from "@/server/repositories/user.repository";
import { gameRepository } from "@/server/repositories/game.repository";
import { resolvePvpColors } from "@/server/services/game-participant";
import { triggerOpponentJoined, triggerRematchOffered } from "@/server/realtime/pusher";

const INVITE_TTL_MS = 24 * 60 * 60 * 1000;

function formatTimeControlLabel(
  initial: number | null,
  increment: number | null,
): string {
  if (initial === null) return "Unlimited";
  const incrementLabel = increment ? `+${increment}` : "";
  const minutes = Math.round(initial / 60);
  return `${minutes}${incrementLabel} min`;
}

function mapInvite(
  invite: NonNullable<Awaited<ReturnType<typeof pvpInviteRepository.findById>>>,
) {
  return {
    id: invite.id,
    token: invite.token,
    status: invite.status,
    inviterColor: invite.inviterColor,
    timeControlInitial: invite.timeControlInitial,
    timeControlIncrement: invite.timeControlIncrement,
    gameId: invite.game?.id ?? invite.gameId,
    expiresAt: invite.expiresAt.toISOString(),
    createdAt: invite.createdAt.toISOString(),
    respondedAt: invite.respondedAt?.toISOString() ?? null,
    inviter: invite.inviter,
    invitee: invite.invitee,
  };
}

export const pvpInviteService = {
  async createInvite(
    inviterId: string,
    input: {
      inviteeId: string;
      inviterColor: "white" | "black" | "random";
      timeControl?: { initial: number; increment: number };
    },
  ) {
    if (inviterId === input.inviteeId) {
      throw new ApiError("BAD_REQUEST", "You cannot invite yourself", 400);
    }

    const invitee = await userRepository.findById(input.inviteeId);
    if (!invitee) {
      throw new ApiError("NOT_FOUND", "User not found", 404);
    }

    const existing = await pvpInviteRepository.findPendingBetween(
      inviterId,
      input.inviteeId,
    );
    if (existing) {
      throw new ApiError(
        "CONFLICT",
        "A pending invite already exists with this player",
        409,
      );
    }

    const inviter = await userRepository.findById(inviterId);
    if (!inviter) {
      throw new ApiError("NOT_FOUND", "Inviter not found", 404);
    }

    const expiresAt = new Date(Date.now() + INVITE_TTL_MS);
    const invite = await pvpInviteRepository.create({
      inviterId,
      inviteeId: input.inviteeId,
      inviterColor: input.inviterColor,
      timeControlInitial: input.timeControl?.initial ?? null,
      timeControlIncrement: input.timeControl?.increment ?? null,
      expiresAt,
    });

    const timeControlLabel = formatTimeControlLabel(
      invite.timeControlInitial,
      invite.timeControlIncrement,
    );

    await sendGameInviteEmail({
      toEmail: invitee.email,
      inviterName: inviter.name ?? inviter.email,
      inviteeName: invitee.name ?? invitee.email,
      token: invite.token,
      timeControlLabel,
      expiresAt,
    });

    return mapInvite(invite);
  },

  async listInvites(userId: string) {
    await pvpInviteRepository.expireStale();
    const invites = await pvpInviteRepository.listPendingForUser(userId);
    const incoming = invites
      .filter((i) => i.inviteeId === userId)
      .map(mapInvite);
    const outgoing = invites
      .filter((i) => i.inviterId === userId)
      .map(mapInvite);
    return { incoming, outgoing };
  },

  async getInvite(userId: string, inviteId: string) {
    await pvpInviteRepository.expireStale();
    const invite = await pvpInviteRepository.findById(inviteId);
    if (!invite) {
      throw new ApiError("NOT_FOUND", "Invite not found", 404);
    }
    if (invite.inviterId !== userId && invite.inviteeId !== userId) {
      throw new ApiError("NOT_FOUND", "Invite not found", 404);
    }
    return mapInvite(invite);
  },

  async getInviteByToken(userId: string, token: string) {
    await pvpInviteRepository.expireStale();
    const invite = await pvpInviteRepository.findByToken(token);
    if (!invite) {
      throw new ApiError("NOT_FOUND", "Invite not found", 404);
    }
    if (invite.inviterId !== userId && invite.inviteeId !== userId) {
      throw new ApiError("FORBIDDEN", "This invite is not for you", 403);
    }
    return mapInvite(invite);
  },

  async acceptInvite(userId: string, inviteId: string) {
    await pvpInviteRepository.expireStale();
    const invite = await pvpInviteRepository.findById(inviteId);
    if (!invite) {
      throw new ApiError("NOT_FOUND", "Invite not found", 404);
    }
    if (invite.inviteeId !== userId) {
      throw new ApiError("FORBIDDEN", "Only the invitee can accept", 403);
    }
    if (invite.status !== "PENDING") {
      throw new ApiError("CONFLICT", `Invite is ${invite.status.toLowerCase()}`, 409);
    }
    if (invite.expiresAt <= new Date()) {
      await pvpInviteRepository.updateStatus(invite.id, "EXPIRED");
      throw new ApiError("CONFLICT", "Invite has expired", 409);
    }

    const colors = resolvePvpColors(
      invite.inviterId,
      invite.inviteeId,
      invite.inviterColor as "white" | "black" | "random",
    );

    const game = await gameRepository.createPvp({
      userId: invite.inviterId,
      playerColor: colors.inviterColor,
      whiteUserId: colors.whiteUserId,
      blackUserId: colors.blackUserId,
      timeControlInitial: invite.timeControlInitial,
      timeControlIncrement: invite.timeControlIncrement,
    });

    const updated = await pvpInviteRepository.updateStatus(invite.id, "ACCEPTED", {
      gameId: game.id,
    });

    await triggerOpponentJoined(game.id, {
      userId: invite.invitee.id,
      name: invite.invitee.name,
      gameId: game.id,
    });

    return {
      invite: mapInvite(updated),
      game: {
        id: game.id,
        mode: game.mode,
        status: game.status,
        playerColor: colors.inviterColor,
        whiteUserId: game.whiteUserId,
        blackUserId: game.blackUserId,
        timeControlInitial: game.timeControlInitial,
        timeControlIncrement: game.timeControlIncrement,
      },
    };
  },

  async declineInvite(userId: string, inviteId: string) {
    await pvpInviteRepository.expireStale();
    const invite = await pvpInviteRepository.findById(inviteId);
    if (!invite) {
      throw new ApiError("NOT_FOUND", "Invite not found", 404);
    }
    if (invite.inviteeId !== userId) {
      throw new ApiError("FORBIDDEN", "Only the invitee can decline", 403);
    }
    if (invite.status !== "PENDING") {
      throw new ApiError("CONFLICT", `Invite is ${invite.status.toLowerCase()}`, 409);
    }

    const updated = await pvpInviteRepository.updateStatus(invite.id, "DECLINED");
    return mapInvite(updated);
  },

  async cancelInvite(userId: string, inviteId: string) {
    await pvpInviteRepository.expireStale();
    const invite = await pvpInviteRepository.findById(inviteId);
    if (!invite) {
      throw new ApiError("NOT_FOUND", "Invite not found", 404);
    }
    if (invite.inviterId !== userId) {
      throw new ApiError("FORBIDDEN", "Only the inviter can cancel", 403);
    }
    if (invite.status !== "PENDING") {
      throw new ApiError("CONFLICT", `Invite is ${invite.status.toLowerCase()}`, 409);
    }

    const updated = await pvpInviteRepository.updateStatus(invite.id, "CANCELLED");
    return mapInvite(updated);
  },

  async createRematchInvite(userId: string, gameId: string) {
    const game = await gameRepository.findById(gameId);
    if (!game || game.mode !== "PVP") {
      throw new ApiError("NOT_FOUND", "Game not found", 404);
    }
    if (game.status !== "COMPLETED") {
      throw new ApiError("CONFLICT", "Rematch is only available after the game ends", 409);
    }
    if (game.whiteUserId !== userId && game.blackUserId !== userId) {
      throw new ApiError("FORBIDDEN", "Only participants can request a rematch", 403);
    }

    const opponentId =
      game.whiteUserId === userId ? game.blackUserId : game.whiteUserId;
    if (!opponentId) {
      throw new ApiError("CONFLICT", "Opponent not found", 409);
    }

    const existing = await pvpInviteRepository.findPendingBetween(userId, opponentId);
    if (existing) {
      return mapInvite(existing);
    }

    const inviterColor =
      game.whiteUserId === userId ? "black" : "white";

    const inviter = await userRepository.findById(userId);
    if (!inviter) {
      throw new ApiError("NOT_FOUND", "User not found", 404);
    }

    const expiresAt = new Date(Date.now() + INVITE_TTL_MS);
    const invite = await pvpInviteRepository.create({
      inviterId: userId,
      inviteeId: opponentId,
      inviterColor,
      timeControlInitial: game.timeControlInitial,
      timeControlIncrement: game.timeControlIncrement,
      expiresAt,
    });

    await triggerRematchOffered(gameId, {
      inviteId: invite.id,
      offeredByUserId: userId,
      offeredByName: inviter.name ?? inviter.email,
    });

    return mapInvite(invite);
  },
};
