import type { GamePhase, GameResultReason, PlayerColor } from "@/features/game/types";

export type GameLifecycleState = {
  phase: GamePhase;
  result: "WHITE_WIN" | "BLACK_WIN" | "DRAW" | "ABANDONED" | null;
  resultReason: GameResultReason | null;
};

export function createInitialLifecycleState(): GameLifecycleState {
  return {
    phase: "playing",
    result: null,
    resultReason: null,
  };
}

export function resolveGameResult(
  playerColor: PlayerColor,
  reason: GameResultReason,
  winner?: PlayerColor,
): GameLifecycleState {
  if (reason === "resignation") {
    const winnerColor = winner ?? (playerColor === "white" ? "black" : "white");
    return {
      phase: "game_over",
      result: winnerColor === "white" ? "WHITE_WIN" : "BLACK_WIN",
      resultReason: reason,
    };
  }

  if (reason === "timeout") {
    const winnerColor = winner ?? (playerColor === "white" ? "black" : "white");
    return {
      phase: "game_over",
      result: winnerColor === "white" ? "WHITE_WIN" : "BLACK_WIN",
      resultReason: reason,
    };
  }

  if (reason === "checkmate") {
    const winnerColor = winner ?? (playerColor === "white" ? "black" : "white");
    return {
      phase: "game_over",
      result: winnerColor === "white" ? "WHITE_WIN" : "BLACK_WIN",
      resultReason: reason,
    };
  }

  return {
    phase: "game_over",
    result: "DRAW",
    resultReason: reason,
  };
}

export function getResultLabel(
  result: GameLifecycleState["result"],
  playerColor: PlayerColor,
): string {
  if (!result) return "In progress";
  if (result === "DRAW") return "Draw";
  if (result === "ABANDONED") return "Abandoned";

  const playerWon =
    (result === "WHITE_WIN" && playerColor === "white") ||
    (result === "BLACK_WIN" && playerColor === "black");

  return playerWon ? "Win" : "Loss";
}

export function formatResultReason(reason: GameResultReason | null): string {
  if (!reason) return "";
  return reason.replace(/_/g, " ");
}
