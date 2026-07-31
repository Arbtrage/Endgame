import { Chess } from "chess.js";
import type { ChessEngine } from "./types";

function pickRandomUci(chess: Chess): string {
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) {
    throw new Error("No legal moves available");
  }
  const move = moves[Math.floor(Math.random() * moves.length)]!;
  return move.from + move.to + (move.promotion ?? "");
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockEngine implements ChessEngine {
  constructor(
    private minThinkMs = 1200,
    private maxThinkMs = 2200,
  ) {}

  async getMove(fen: string): Promise<string> {
    const delay =
      this.minThinkMs +
      Math.random() * (this.maxThinkMs - this.minThinkMs);
    await wait(delay);
    const chess = new Chess(fen);
    return pickRandomUci(chess);
  }
}
