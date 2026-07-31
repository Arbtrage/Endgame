import { prisma } from "@/shared/db/prisma";
import type { Prisma } from "@prisma/client";

export const analysisRepository = {
  findByGameId(gameId: string) {
    return prisma.analysis.findUnique({ where: { gameId } });
  },

  upsert(
    gameId: string,
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
    },
  ) {
    return prisma.analysis.upsert({
      where: { gameId },
      create: { gameId, ...data },
      update: data,
    });
  },

  updateSummary(gameId: string, summary: string) {
    return prisma.analysis.update({
      where: { gameId },
      data: { summary },
    });
  },

  findByUserId(userId: string, limit = 50) {
    return prisma.analysis.findMany({
      where: { game: { userId } },
      include: {
        game: {
          select: {
            id: true,
            mode: true,
            result: true,
            playerColor: true,
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
      where: { game: { userId, status: "COMPLETED" } },
      select: {
        moveAnalysis: true,
        game: { select: { playerColor: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  },
};
