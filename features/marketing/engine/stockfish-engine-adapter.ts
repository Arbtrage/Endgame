import { getStockfishEngine } from "@/shared/engine/stockfish-engine";
import type { ChessEngine } from "./types";

/**
 * Future drop-in replacement for MockEngine on the landing page.
 * Feature-flag or env-gate before enabling — WASM adds bundle weight.
 */
export class StockfishEngineAdapter implements ChessEngine {
  constructor(private skillLevel = 3) {}

  async getMove(fen: string): Promise<string> {
    const engine = getStockfishEngine();
    await engine.ready();
    engine.setSkillLevel(this.skillLevel);
    const result = await engine.getBestMove(fen, [], {
      skillLevel: this.skillLevel,
      depth: 8,
      moveTime: 1200,
    });
    return result.uci;
  }
}
