export type GamePhase =
  | "setup"
  | "playing"
  | "opponent_thinking"
  | "promotion"
  | "game_over"
  | "reviewing";

export type BoardTheme = "classic" | "midnight" | "frost";

export type PlayerColor = "white" | "black";

export type GameResultReason =
  | "checkmate"
  | "stalemate"
  | "resignation"
  | "timeout"
  | "threefold_repetition"
  | "fifty_move_rule"
  | "insufficient_material"
  | "agreement"
  | "draw";

export type TimeControlPreset = "unlimited" | "blitz" | "rapid";

export type GameMove = {
  moveNumber: number;
  san: string;
  uci: string;
  fen: string;
  color: PlayerColor;
};

export type GameSummary = {
  id: string;
  mode: string;
  status: string;
  result: string | null;
  resultReason: string | null;
  playerColor: string;
  stockfishLevel: number | null;
  moveCount: number;
  createdAt: string;
  completedAt: string | null;
};

export type GameDetail = GameSummary & {
  pgn: string | null;
  finalFen: string | null;
  timeControlInitial: number | null;
  timeControlIncrement: number | null;
  moves: GameMove[];
};

export type CreateGameInput = {
  mode: "COMPUTER";
  color: PlayerColor | "random";
  stockfishLevel: number;
  timeControl?: {
    initial: number;
    increment: number;
  };
};

export const BOARD_THEMES: Record<
  BoardTheme,
  { label: string; dark: string; light: string }
> = {
  classic: { label: "Classic", dark: "#769656", light: "#eeeed2" },
  midnight: { label: "Midnight", dark: "#4a5568", light: "#a0aec0" },
  frost: { label: "Frost", dark: "#5b7c99", light: "#dce6f0" },
};

export const TIME_CONTROL_PRESETS: Record<
  TimeControlPreset,
  { label: string; initial: number | null; increment: number | null }
> = {
  unlimited: { label: "Unlimited", initial: null, increment: null },
  blitz: { label: "Blitz (3+2)", initial: 180, increment: 2 },
  rapid: { label: "Rapid (10+0)", initial: 600, increment: 0 },
};

export function resolvePlayerColor(color: PlayerColor | "random"): PlayerColor {
  if (color === "random") {
    return Math.random() < 0.5 ? "white" : "black";
  }
  return color;
}

export function colorToChessTurn(color: PlayerColor): "w" | "b" {
  return color === "white" ? "w" : "b";
}

export function chessTurnToColor(turn: "w" | "b"): PlayerColor {
  return turn === "w" ? "white" : "black";
}
