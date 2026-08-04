import type { Game, GameMode, GameResult, User } from "@prisma/client";

type GameWithUsers = Game & {
  whiteUser?: Pick<User, "id" | "name" | "email"> | null;
  blackUser?: Pick<User, "id" | "name" | "email"> | null;
  user?: Pick<User, "id" | "name" | "email"> | null;
};

export function getGameParticipants(
  game: Pick<Game, "mode" | "userId" | "playerColor" | "whiteUserId" | "blackUserId">,
): Array<{ userId: string; playerColor: "white" | "black" }> {
  if (game.mode === "PVP") {
    const participants: Array<{ userId: string; playerColor: "white" | "black" }> = [];
    if (game.whiteUserId) {
      participants.push({ userId: game.whiteUserId, playerColor: "white" });
    }
    if (game.blackUserId) {
      participants.push({ userId: game.blackUserId, playerColor: "black" });
    }
    return participants;
  }

  return [
    {
      userId: game.userId,
      playerColor: game.playerColor as "white" | "black",
    },
  ];
}

const MODE_LABELS: Record<GameMode, string> = {
  COMPUTER: "Computer",
  AI_OPPONENT: "AI Opponent",
  COACH: "Coach",
  PVP: "PvP",
};

export function formatGameMode(mode: GameMode): string {
  return MODE_LABELS[mode];
}

export function formatGameResult(
  result: GameResult | null | undefined,
  playerColor: "white" | "black",
): string {
  if (!result || result === "ABANDONED") return "Game over";
  if (result === "DRAW") return "Draw";

  const playerWon =
    (result === "WHITE_WIN" && playerColor === "white") ||
    (result === "BLACK_WIN" && playerColor === "black");

  return playerWon ? "Win" : "Loss";
}

export function resolveOpponentName(
  game: GameWithUsers,
  userId: string,
): string {
  if (game.mode === "PVP") {
    if (game.whiteUserId === userId) {
      return game.blackUser?.name ?? game.blackUser?.email ?? "Opponent";
    }
    if (game.blackUserId === userId) {
      return game.whiteUser?.name ?? game.whiteUser?.email ?? "Opponent";
    }
    return "Opponent";
  }

  if (game.mode === "COMPUTER") {
    return `Stockfish level ${game.stockfishLevel ?? "?"}`;
  }

  if (game.mode === "AI_OPPONENT" || game.mode === "COACH") {
    return game.aiPersonality ?? "AI coach";
  }

  return "Opponent";
}
