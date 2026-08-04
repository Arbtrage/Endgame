import { prisma } from "@/shared/db/prisma";
import type { Prisma } from "@prisma/client";

export const analysisRepository = {
  findByGameAndUser(gameId: string, userId: string) {
    return prisma.analysis.findUnique({
      where: { gameId_userId: { gameId, userId } },
    });
  },

  upsert(
    gameId: string,
    userId: string,
    data: {
      accuracy: number;
      acpl: number;
      totalMoves: number;
      blunderCount: number;
      mistakeCount: number;
      inaccuracyCount: number;
      brilliantCount: number;
      moveAnalysis: Prisma.InputJsonValue;
      evalGraph: Prisma.InputJsonValue;
      summary?: string | null;
      keyMoments?: Prisma.InputJsonValue;
      analysisMode?: string | null;
      analysisDepth?: number | null;
    },
  ) {
    return prisma.analysis.upsert({
      where: { gameId_userId: { gameId, userId } },
      create: { gameId, userId, ...data },
      update: data,
    });
  },

  updateSummary(gameId: string, userId: string, summary: string) {
    return prisma.analysis.update({
      where: { gameId_userId: { gameId, userId } },
      data: { summary },
    });
  },

  findByUserId(userId: string, limit = 50) {
    return prisma.analysis.findMany({
      where: { userId },
      include: {
        game: {
          select: {
            id: true,
            mode: true,
            result: true,
            playerColor: true,
            whiteUserId: true,
            blackUserId: true,
            moveCount: true,
            completedAt: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  aggregateWeaknesses(userId: string, minGames = 5) {
    return prisma.analysis.findMany({
      where: {
        userId,
        game: { status: "COMPLETED" },
      },
      select: {
        moveAnalysis: true,
        game: {
          select: {
            playerColor: true,
            whiteUserId: true,
            blackUserId: true,
            mode: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  },
};
