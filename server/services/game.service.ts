import { ApiError } from "@/server/api/response";
import { gameRepository } from "@/server/repositories/game.repository";
import type { GameMode, GameResult } from "@prisma/client";
import { resolvePlayerColor } from "@/features/game/types";
import { Prisma } from "@prisma/client";

function mapGame(game: Awaited<ReturnType<typeof gameRepository.findById>>) {
  if (!game) return null;
  return {
    id: game.id,
    mode: game.mode,
    status: game.status,
    result: game.result,
    resultReason: game.resultReason,
    playerColor: game.playerColor,
    stockfishLevel: game.stockfishLevel,
    aiPersonality: game.aiPersonality,
    moveCount: game.moveCount,
    pgn: game.pgn,
    finalFen: game.finalFen,
    timeControlInitial: game.timeControlInitial,
    timeControlIncrement: game.timeControlIncrement,
    createdAt: game.createdAt.toISOString(),
    completedAt: game.completedAt?.toISOString() ?? null,
    moves: game.moves.map((move) => ({
      moveNumber: move.moveNumber,
      san: move.san,
      uci: move.uci,
      fen: move.fen,
      color: move.color,
    })),
  };
}

export const gameService = {
  async createGame(
    userId: string,
    input:
      | {
          mode: "COMPUTER";
          color: "white" | "black" | "random";
          stockfishLevel: number;
          timeControl?: { initial: number; increment: number };
        }
      | {
          mode: "AI_OPPONENT";
          color: "white" | "black" | "random";
          aiPersonality: string;
          timeControl?: { initial: number; increment: number };
        }
      | {
          mode: "COACH";
          color: "white" | "black" | "random";
          stockfishLevel: number;
          timeControl?: { initial: number; increment: number };
        },
  ) {
    const playerColor = resolvePlayerColor(input.color);

    const game = await gameRepository.create({
      userId,
      mode: input.mode as GameMode,
      playerColor,
      stockfishLevel:
        input.mode === "AI_OPPONENT" ? null : input.stockfishLevel,
      aiPersonality:
        input.mode === "AI_OPPONENT" ? input.aiPersonality : null,
      timeControlInitial: input.timeControl?.initial ?? null,
      timeControlIncrement: input.timeControl?.increment ?? null,
    });

    return {
      id: game.id,
      mode: game.mode,
      status: game.status,
      playerColor: game.playerColor,
      stockfishLevel: game.stockfishLevel,
      aiPersonality: game.aiPersonality,
      timeControlInitial: game.timeControlInitial,
      timeControlIncrement: game.timeControlIncrement,
      createdAt: game.createdAt.toISOString(),
    };
  },

  async listGames(
    userId: string,
    filters: {
      mode?: GameMode;
      status?: "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
      page: number;
      pageSize: number;
    },
  ) {
    const [games, total] = await gameRepository.findByUser(userId, filters);

    return {
      data: games.map((game) => ({
        id: game.id,
        mode: game.mode,
        status: game.status,
        result: game.result,
        resultReason: game.resultReason,
        playerColor: game.playerColor,
        stockfishLevel: game.stockfishLevel,
        aiPersonality: game.aiPersonality,
        moveCount: game.moveCount,
        createdAt: game.createdAt.toISOString(),
        completedAt: game.completedAt?.toISOString() ?? null,
      })),
      meta: {
        page: filters.page,
        pageSize: filters.pageSize,
        total,
      },
    };
  },

  async getGame(userId: string, gameId: string) {
    const game = await gameRepository.findById(gameId);
    if (!game || game.userId !== userId) {
      throw new ApiError("NOT_FOUND", "Game not found", 404);
    }
    return mapGame(game);
  },

  async recordMove(
    userId: string,
    gameId: string,
    input: { san: string; uci: string; fen: string },
  ) {
    const game = await gameRepository.findById(gameId);
    if (!game || game.userId !== userId) {
      throw new ApiError("NOT_FOUND", "Game not found", 404);
    }
    if (game.status !== "IN_PROGRESS") {
      throw new ApiError("CONFLICT", "Game is not in progress", 409);
    }

    const moveNumber = game.moveCount + 1;
    const color = moveNumber % 2 === 1 ? "white" : "black";

    const existing = game.moves.find((move) => move.moveNumber === moveNumber);
    if (existing) {
      if (existing.uci === input.uci && existing.fen === input.fen) {
        return { moveNumber, san: existing.san, valid: true };
      }
      throw new ApiError(
        "CONFLICT",
        "A different move is already recorded for this ply",
        409,
      );
    }

    try {
      await gameRepository.addMove({
        gameId,
        moveNumber,
        san: input.san,
        uci: input.uci,
        fen: input.fen,
        color,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const duplicate = await gameRepository.findMoveByNumber(
          gameId,
          moveNumber,
        );
        if (
          duplicate &&
          duplicate.uci === input.uci &&
          duplicate.fen === input.fen
        ) {
          return { moveNumber, san: duplicate.san, valid: true };
        }
      }
      throw error;
    }

    return { moveNumber, san: input.san, valid: true };
  },

  async completeGame(
    userId: string,
    gameId: string,
    input: {
      result: GameResult;
      resultReason: string;
      pgn: string;
      finalFen: string;
    },
  ) {
    const game = await gameRepository.findById(gameId);
    if (!game || game.userId !== userId) {
      throw new ApiError("NOT_FOUND", "Game not found", 404);
    }
    if (game.status !== "IN_PROGRESS") {
      throw new ApiError("CONFLICT", "Game is not in progress", 409);
    }

    const updated = await gameRepository.complete(gameId, {
      ...input,
      moveCount: game.moveCount,
    });

    return mapGame({ ...updated, moves: game.moves });
  },

  async resignGame(userId: string, gameId: string) {
    const game = await gameRepository.findById(gameId);
    if (!game || game.userId !== userId) {
      throw new ApiError("NOT_FOUND", "Game not found", 404);
    }
    if (game.status !== "IN_PROGRESS") {
      throw new ApiError("CONFLICT", "Game is not in progress", 409);
    }

    const result: GameResult =
      game.playerColor === "white" ? "BLACK_WIN" : "WHITE_WIN";

    const updated = await gameRepository.resign(gameId, {
      result,
      resultReason: "resignation",
    });

    return mapGame({ ...updated, moves: game.moves });
  },

  async deleteGame(userId: string, gameId: string) {
    const game = await gameRepository.findById(gameId);
    if (!game || game.userId !== userId) {
      throw new ApiError("NOT_FOUND", "Game not found", 404);
    }
    await gameRepository.delete(gameId);
    return { deleted: true };
  },
};
