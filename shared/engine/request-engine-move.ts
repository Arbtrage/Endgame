import { getStockfishEngine } from "./stockfish-engine";
import { gameplaySearchOptions } from "./gameplay-search";
import type { EngineMove } from "./types";

export async function requestEngineBestMove(
  fen: string,
  moves: string[],
  skillLevel: number,
  options: { retries?: number; fast?: boolean } = {},
): Promise<EngineMove> {
  const engine = getStockfishEngine();
  await engine.ready();
  engine.setSkillLevel(skillLevel);

  const maxAttempts = (options.retries ?? 1) + 1;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await engine.getBestMove(
        fen,
        moves,
        gameplaySearchOptions(skillLevel, attempt > 0 || options.fast),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      const retryable =
        message.includes("timed out") ||
        message.includes("Search stopped") ||
        message.includes("no move");

      if (!retryable || attempt === maxAttempts - 1) {
        throw error;
      }
    }
  }

  throw new Error("Engine failed to return a move");
}
