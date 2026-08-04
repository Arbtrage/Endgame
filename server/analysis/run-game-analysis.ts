import { analyzeGameMoves } from "@/shared/analysis/analyze-game-moves";
import type { AnalysisMode } from "@/shared/analysis/profiles";
import { analysisRepository } from "@/server/repositories/analysis.repository";
import { gameRepository } from "@/server/repositories/game.repository";
import { getStockfishProcessEngine } from "@/server/engine/stockfish-process-engine";
import type { Prisma } from "@prisma/client";

export type RunGameAnalysisResult = {
  gameId: string;
  userId: string;
  accuracy: number;
  acpl: number;
  totalMoves: number;
  blunderCount: number;
  mistakeCount: number;
  inaccuracyCount: number;
  brilliantCount: number;
  analysisMode: AnalysisMode;
  analysisDepth: number;
  skipped: boolean;
};

export async function runGameAnalysis(input: {
  gameId: string;
  userId: string;
  playerColor: "white" | "black";
  analysisMode?: AnalysisMode;
}): Promise<RunGameAnalysisResult> {
  const existing = await analysisRepository.findByGameAndUser(
    input.gameId,
    input.userId,
  );
  if (existing) {
    return {
      gameId: input.gameId,
      userId: input.userId,
      accuracy: existing.accuracy,
      acpl: existing.acpl,
      totalMoves: existing.totalMoves,
      blunderCount: existing.blunderCount,
      mistakeCount: existing.mistakeCount,
      inaccuracyCount: existing.inaccuracyCount,
      brilliantCount: existing.brilliantCount,
      analysisMode: (existing.analysisMode as AnalysisMode | null) ?? "standard",
      analysisDepth: existing.analysisDepth ?? 18,
      skipped: true,
    };
  }

  const game = await gameRepository.findById(input.gameId);
  if (!game || game.status !== "COMPLETED" || game.moves.length === 0) {
    throw new Error("Game is not ready for analysis");
  }

  const analysisMode = input.analysisMode ?? "standard";
  const engine = getStockfishProcessEngine();

  try {
    const result = await analyzeGameMoves({
      moves: game.moves.map((move) => ({
        moveNumber: move.moveNumber,
        san: move.san,
        uci: move.uci,
        fen: move.fen,
        color: move.color,
      })),
      playerColor: input.playerColor,
      engine,
      analysisMode,
    });

    await analysisRepository.upsert(input.gameId, input.userId, {
      accuracy: result.accuracy,
      acpl: result.acpl,
      totalMoves: result.totalMoves,
      blunderCount: result.blunderCount,
      mistakeCount: result.mistakeCount,
      inaccuracyCount: result.inaccuracyCount,
      brilliantCount: result.brilliantCount,
      moveAnalysis: result.moveAnalysis as Prisma.InputJsonValue,
      evalGraph: result.evalGraph as Prisma.InputJsonValue,
      analysisMode: result.analysisMode,
      analysisDepth: result.analysisDepth,
    });

    return {
      gameId: input.gameId,
      userId: input.userId,
      accuracy: result.accuracy,
      acpl: result.acpl,
      totalMoves: result.totalMoves,
      blunderCount: result.blunderCount,
      mistakeCount: result.mistakeCount,
      inaccuracyCount: result.inaccuracyCount,
      brilliantCount: result.brilliantCount,
      analysisMode: result.analysisMode,
      analysisDepth: result.analysisDepth,
      skipped: false,
    };
  } finally {
    engine.destroy();
  }
}
