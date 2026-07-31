import type { Game } from "@prisma/client";

type GameWithParticipants = Pick<
  Game,
  "userId" | "mode" | "whiteUserId" | "blackUserId"
>;

export function isGameParticipant(
  game: GameWithParticipants,
  userId: string,
): boolean {
  if (game.mode === "PVP") {
    return game.whiteUserId === userId || game.blackUserId === userId;
  }
  return game.userId === userId;
}

export function getParticipantColor(
  game: GameWithParticipants,
  userId: string,
): "white" | "black" | null {
  if (game.whiteUserId === userId) return "white";
  if (game.blackUserId === userId) return "black";
  if (game.mode !== "PVP" && game.userId === userId) {
    return game.userId === userId ? null : null;
  }
  return null;
}

export function assertGameParticipant(
  game: GameWithParticipants,
  userId: string,
): void {
  if (!isGameParticipant(game, userId)) {
    throw new Error("NOT_PARTICIPANT");
  }
}

export function resolvePvpColors(
  inviterId: string,
  inviteeId: string,
  inviterColor: "white" | "black" | "random",
): { whiteUserId: string; blackUserId: string; inviterColor: "white" | "black" } {
  if (inviterColor === "random") {
    const inviterPlaysWhite = Math.random() < 0.5;
    return inviterPlaysWhite
      ? { whiteUserId: inviterId, blackUserId: inviteeId, inviterColor: "white" }
      : { whiteUserId: inviteeId, blackUserId: inviterId, inviterColor: "black" };
  }

  if (inviterColor === "white") {
    return { whiteUserId: inviterId, blackUserId: inviteeId, inviterColor: "white" };
  }

  return { whiteUserId: inviteeId, blackUserId: inviterId, inviterColor: "black" };
}
