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
    whiteUserId?: string | null;
    blackUserId?: string | null;
  }) {
    return prisma.game.create({ data });
  },

  createPvp(data: {
    userId: string;
    playerColor: string;
    whiteUserId: string;
    blackUserId: string;
    timeControlInitial: number | null;
    timeControlIncrement: number | null;
  }) {
    return prisma.game.create({
      data: {
        userId: data.userId,
        mode: "PVP",
        status: "IN_PROGRESS",
        playerColor: data.playerColor,
        whiteUserId: data.whiteUserId,
        blackUserId: data.blackUserId,
        timeControlInitial: data.timeControlInitial,
        timeControlIncrement: data.timeControlIncrement,
      },
    });
  },

  findById(id: string) {
    return prisma.game.findUnique({
      where: { id },
      include: {
        moves: {
          orderBy: { moveNumber: "asc" },
        },
        whiteUser: { select: { id: true, name: true, email: true, image: true } },
        blackUser: { select: { id: true, name: true, email: true, image: true } },
      },
    });
  },

  findByIdWithUser(id: string) {
    return prisma.game.findUnique({
      where: { id },
      include: {
        moves: {
          orderBy: { moveNumber: "asc" },
        },
        user: {
          select: { id: true, name: true, email: true },
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
    const where =
      filters.mode === "PVP"
        ? {
            mode: "PVP" as const,
            OR: [
              { whiteUserId: userId },
              { blackUserId: userId },
              { userId },
            ],
            ...(filters.status ? { status: filters.status } : {}),
          }
        : {
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
        data: {
          moveCount: data.moveNumber,
          pendingDrawOfferUserId: null,
          pendingDrawOfferAt: null,
        },
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
        pendingDrawOfferUserId: null,
        pendingDrawOfferAt: null,
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
        pendingDrawOfferUserId: null,
        pendingDrawOfferAt: null,
      },
    });
  },

  setDrawOffer(gameId: string, userId: string) {
    return prisma.game.update({
      where: { id: gameId },
      data: {
        pendingDrawOfferUserId: userId,
        pendingDrawOfferAt: new Date(),
      },
    });
  },

  clearDrawOffer(gameId: string) {
    return prisma.game.update({
      where: { id: gameId },
      data: {
        pendingDrawOfferUserId: null,
        pendingDrawOfferAt: null,
      },
    });
  },

  delete(gameId: string) {
    return prisma.game.delete({ where: { id: gameId } });
  },
};
