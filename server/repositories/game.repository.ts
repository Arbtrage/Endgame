import { prisma } from "@/shared/db/prisma";
import type { GameMode, GameResult, GameStatus } from "@prisma/client";

export const gameRepository = {
  create(data: {
    userId: string;
    mode: GameMode;
    playerColor: string;
    stockfishLevel?: number | null;
    aiPersonality?: string | null;
    timeControlInitial?: number | null;
    timeControlIncrement?: number | null;
  }) {
    return prisma.game.create({ data });
  },

  findById(id: string) {
    return prisma.game.findUnique({
      where: { id },
      include: {
        moves: {
          orderBy: { moveNumber: "asc" },
        },
      },
    });
  },

  findByUser(
    userId: string,
    filters: {
      mode?: GameMode;
      status?: GameStatus;
      page: number;
      pageSize: number;
    },
  ) {
    const where = {
      userId,
      ...(filters.mode ? { mode: filters.mode } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    };

    return Promise.all([
      prisma.game.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      prisma.game.count({ where }),
    ]);
  },

  addMove(data: {
    gameId: string;
    moveNumber: number;
    san: string;
    uci: string;
    fen: string;
    color: string;
  }) {
    return prisma.$transaction([
      prisma.move.create({ data }),
      prisma.game.update({
        where: { id: data.gameId },
        data: { moveCount: data.moveNumber },
      }),
    ]);
  },

  findMoveByNumber(gameId: string, moveNumber: number) {
    return prisma.move.findUnique({
      where: {
        gameId_moveNumber: { gameId, moveNumber },
      },
    });
  },

  complete(
    gameId: string,
    data: {
      result: GameResult;
      resultReason: string;
      pgn: string;
      finalFen: string;
      moveCount: number;
    },
  ) {
    return prisma.game.update({
      where: { id: gameId },
      data: {
        status: "COMPLETED",
        result: data.result,
        resultReason: data.resultReason,
        pgn: data.pgn,
        finalFen: data.finalFen,
        moveCount: data.moveCount,
        completedAt: new Date(),
      },
    });
  },

  resign(gameId: string, data: { result: GameResult; resultReason: string }) {
    return prisma.game.update({
      where: { id: gameId },
      data: {
        status: "COMPLETED",
        result: data.result,
        resultReason: data.resultReason,
        completedAt: new Date(),
      },
    });
  },

  delete(gameId: string) {
    return prisma.game.delete({ where: { id: gameId } });
  },
};
