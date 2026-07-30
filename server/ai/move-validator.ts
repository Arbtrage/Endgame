import { Chess } from "chess.js";

export type MoveValidationResult = {
  valid: boolean;
  san?: string;
  uci?: string;
};

export function getLegalMoves(fen: string, moves: string[]): string[] {
  const chess = new Chess(fen);
  for (const san of moves) {
    chess.move(san);
  }
  return chess.moves({ verbose: true }).map((m) => m.from + m.to + (m.promotion ?? ""));
}

export function validateUciMove(
  fen: string,
  moves: string[],
  uci: string,
): MoveValidationResult {
  const chess = new Chess(fen);
  for (const san of moves) {
    chess.move(san);
  }

  const from = uci.slice(0, 2);
  const to = uci.slice(2, 4);
  const promotion = uci.length > 4 ? uci[4] : undefined;

  try {
    const move = chess.move({ from, to, promotion });
    if (!move) {
      return { valid: false };
    }
    return {
      valid: true,
      san: move.san,
      uci: move.from + move.to + (move.promotion ?? ""),
    };
  } catch {
    return { valid: false };
  }
}

export function pickRandomLegalMove(fen: string, moves: string[]): string {
  const legal = getLegalMoves(fen, moves);
  if (legal.length === 0) {
    throw new Error("No legal moves available");
  }
  return legal[Math.floor(Math.random() * legal.length)];
}
