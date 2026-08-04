import { ApiError } from "@/server/api/response";
import { analysisRepository } from "@/server/repositories/analysis.repository";
import { analysisJobRepository } from "@/server/repositories/analysis-job.repository";
import { gameRepository } from "@/server/repositories/game.repository";
import {
  getParticipantColor,
  isGameParticipant,
} from "@/server/services/game-participant";
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
  analysisMode?: "fast" | "standard";
  analysisDepth?: number;
};

function mapAnalysis(
  analysis: NonNullable<
    Awaited<ReturnType<typeof analysisRepository.findByGameAndUser>>
  >,
) {
  return {
    id: analysis.id,
    gameId: analysis.gameId,
    userId: analysis.userId,
    analysisMode: analysis.analysisMode,
    analysisDepth: analysis.analysisDepth,
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

function resolveViewerPlayerColor(
  game: NonNullable<Awaited<ReturnType<typeof gameRepository.findById>>>,
  userId: string,
): string {
  if (game.mode === "PVP") {
    return getParticipantColor(game, userId) ?? game.playerColor;
  }
  return game.playerColor;
}

export const analysisService = {
  async getAnalysis(userId: string, gameId: string) {
    const game = await gameRepository.findById(gameId);
    if (!game || !isGameParticipant(game, userId)) {
      throw new ApiError("NOT_FOUND", "Game not found", 404);
    }

    const analysis = await analysisRepository.findByGameAndUser(gameId, userId);
    if (!analysis) {
      return null;
    }

    return mapAnalysis(analysis);
  },

  async saveAnalysis(userId: string, gameId: string, input: SaveAnalysisInput) {
    const game = await gameRepository.findById(gameId);
    if (!game || !isGameParticipant(game, userId)) {
      throw new ApiError("NOT_FOUND", "Game not found", 404);
    }
    if (game.status !== "COMPLETED") {
      throw new ApiError("CONFLICT", "Only completed games can be analyzed", 409);
    }

    resolveViewerPlayerColor(game, userId);

    const analysis = await analysisRepository.upsert(gameId, userId, {
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
      analysisMode: input.analysisMode ?? null,
      analysisDepth: input.analysisDepth ?? null,
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
      analysisMode: a.analysisMode,
      game: {
        ...a.game,
        playerColor:
          a.game.mode === "PVP"
            ? a.game.whiteUserId === userId
              ? "white"
              : a.game.blackUserId === userId
                ? "black"
                : a.game.playerColor
            : a.game.playerColor,
        completedAt: a.game.completedAt?.toISOString() ?? null,
        createdAt: a.game.createdAt.toISOString(),
      },
    }));
  },

  async getAnalysisJobStatus(userId: string, gameId: string) {
    const game = await gameRepository.findById(gameId);
    if (!game || !isGameParticipant(game, userId)) {
      throw new ApiError("NOT_FOUND", "Game not found", 404);
    }

    const analysis = await analysisRepository.findByGameAndUser(gameId, userId);
    if (analysis) {
      return { status: "done" as const, analysis: mapAnalysis(analysis) };
    }

    const job = await analysisJobRepository.findByGameAndUser(gameId, userId);
    if (!job) {
      return { status: "idle" as const };
    }

    switch (job.status) {
      case "PENDING":
        return { status: "pending" as const };
      case "RUNNING":
        return { status: "running" as const };
      case "FAILED":
        return { status: "failed" as const, errorMessage: job.errorMessage };
      case "COMPLETED":
        return { status: "done" as const };
      default:
        return { status: "idle" as const };
    }
  },
};
