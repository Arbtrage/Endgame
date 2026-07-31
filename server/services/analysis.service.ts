import { ApiError } from "@/server/api/response";
import { analysisRepository } from "@/server/repositories/analysis.repository";
import { gameRepository } from "@/server/repositories/game.repository";
import { Chess } from "chess.js";
import type { Prisma } from "@prisma/client";

export type SaveAnalysisInput = {
  accuracy: number;
  acpl: number;
  totalMoves: number;
  blunderCount: number;
  mistakeCount: number;
  inaccuracyCount: number;
  brilliantCount: number;
  moveAnalysis: unknown;
  evalGraph: unknown;
  summary?: string;
  keyMoments?: unknown;
};

function mapAnalysis(
  analysis: NonNullable<Awaited<ReturnType<typeof analysisRepository.findByGameId>>>,
) {
  return {
    id: analysis.id,
    gameId: analysis.gameId,
    accuracy: analysis.accuracy,
    acpl: analysis.acpl,
    totalMoves: analysis.totalMoves,
    blunderCount: analysis.blunderCount,
    mistakeCount: analysis.mistakeCount,
    inaccuracyCount: analysis.inaccuracyCount,
    brilliantCount: analysis.brilliantCount,
    moveAnalysis: analysis.moveAnalysis,
    evalGraph: analysis.evalGraph,
    summary: analysis.summary,
    keyMoments: analysis.keyMoments,
    createdAt: analysis.createdAt.toISOString(),
    updatedAt: analysis.updatedAt.toISOString(),
  };
}

export const analysisService = {
  async getAnalysis(userId: string, gameId: string) {
    const game = await gameRepository.findById(gameId);
    if (!game || game.userId !== userId) {
      throw new ApiError("NOT_FOUND", "Game not found", 404);
    }

    const analysis = await analysisRepository.findByGameId(gameId);
    if (!analysis) {
      return null;
    }

    return mapAnalysis(analysis);
  },

  async saveAnalysis(userId: string, gameId: string, input: SaveAnalysisInput) {
    const game = await gameRepository.findById(gameId);
    if (!game || game.userId !== userId) {
      throw new ApiError("NOT_FOUND", "Game not found", 404);
    }
    if (game.status !== "COMPLETED") {
      throw new ApiError("CONFLICT", "Only completed games can be analyzed", 409);
    }

    const analysis = await analysisRepository.upsert(gameId, {
      accuracy: input.accuracy,
      acpl: input.acpl,
      totalMoves: input.totalMoves,
      blunderCount: input.blunderCount,
      mistakeCount: input.mistakeCount,
      inaccuracyCount: input.inaccuracyCount,
      brilliantCount: input.brilliantCount,
      moveAnalysis: input.moveAnalysis as Prisma.InputJsonValue,
      evalGraph: input.evalGraph as Prisma.InputJsonValue,
      summary: input.summary ?? null,
      keyMoments: (input.keyMoments ?? null) as Prisma.InputJsonValue,
    });

    return mapAnalysis(analysis);
  },

  async importPgn(userId: string, pgn: string) {
    const chess = new Chess();
    try {
      chess.loadPgn(pgn.trim());
    } catch {
      throw new ApiError("VALIDATION_ERROR", "Invalid PGN", 400);
    }

    if (chess.history().length === 0) {
      throw new ApiError("VALIDATION_ERROR", "PGN contains no moves", 400);
    }

    const temp = new Chess();
    const verbose = chess.history({ verbose: true });
    const moves: Array<{
      moveNumber: number;
      san: string;
      uci: string;
      fen: string;
      color: string;
    }> = [];

    verbose.forEach((move, index) => {
      temp.move(move);
      moves.push({
        moveNumber: index + 1,
        san: move.san,
        uci: `${move.from}${move.to}${move.promotion ?? ""}`,
        fen: temp.fen(),
        color: move.color === "w" ? "white" : "black",
      });
    });

    const headers = chess.header();
    const playerColor =
      headers.White?.toLowerCase().includes("endgame") ||
      headers.White?.toLowerCase().includes("player")
        ? "white"
        : "white";

    const game = await gameRepository.create({
      userId,
      mode: "COMPUTER",
      playerColor,
    });

    for (const move of moves) {
      await gameRepository.addMove({ gameId: game.id, ...move });
    }

    const result = chess.isCheckmate()
      ? chess.turn() === "w"
        ? "BLACK_WIN"
        : "WHITE_WIN"
      : chess.isDraw()
        ? "DRAW"
        : "DRAW";

    await gameRepository.complete(game.id, {
      result: result as "WHITE_WIN" | "BLACK_WIN" | "DRAW",
      resultReason: chess.isCheckmate()
        ? "checkmate"
        : chess.isStalemate()
          ? "stalemate"
          : "import",
      pgn: pgn.trim(),
      finalFen: chess.fen(),
      moveCount: moves.length,
    });

    return { gameId: game.id, moveCount: moves.length };
  },

  async listAnalyzedGames(userId: string) {
    const analyses = await analysisRepository.findByUserId(userId);
    return analyses.map((a) => ({
      analysisId: a.id,
      gameId: a.gameId,
      accuracy: a.accuracy,
      acpl: a.acpl,
      game: {
        ...a.game,
        completedAt: a.game.completedAt?.toISOString() ?? null,
        createdAt: a.game.createdAt.toISOString(),
      },
    }));
  },
};
