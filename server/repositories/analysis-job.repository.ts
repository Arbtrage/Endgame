import { prisma } from "@/shared/db/prisma";
import type { AnalysisJobStatus } from "@prisma/client";

export const analysisJobRepository = {
  findByGameAndUser(gameId: string, userId: string) {
    return prisma.analysisJob.findUnique({
      where: { gameId_userId: { gameId, userId } },
    });
  },

  upsertPending(
    gameId: string,
    userId: string,
    analysisMode = "standard",
  ) {
    return prisma.analysisJob.upsert({
      where: { gameId_userId: { gameId, userId } },
      create: {
        gameId,
        userId,
        status: "PENDING",
        analysisMode,
      },
      update: {
        status: "PENDING",
        analysisMode,
        errorMessage: null,
        completedAt: null,
      },
    });
  },

  markRunning(gameId: string, userId: string, triggerRunId?: string) {
    return prisma.analysisJob.update({
      where: { gameId_userId: { gameId, userId } },
      data: {
        status: "RUNNING",
        triggerRunId: triggerRunId ?? null,
        errorMessage: null,
      },
    });
  },

  markCompleted(gameId: string, userId: string) {
    return prisma.analysisJob.update({
      where: { gameId_userId: { gameId, userId } },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        errorMessage: null,
      },
    });
  },

  markFailed(gameId: string, userId: string, errorMessage: string) {
    return prisma.analysisJob.update({
      where: { gameId_userId: { gameId, userId } },
      data: {
        status: "FAILED",
        errorMessage,
        completedAt: new Date(),
      },
    });
  },

  isActiveStatus(status: AnalysisJobStatus) {
    return status === "PENDING" || status === "RUNNING";
  },

  findUnanalyzedParticipants(options?: { userId?: string; limit?: number }) {
    return prisma.game.findMany({
      where: {
        status: "COMPLETED",
        moveCount: { gt: 0 },
        ...(options?.userId
          ? {
              OR: [
                { userId: options.userId, mode: { not: "PVP" } },
                { whiteUserId: options.userId },
                { blackUserId: options.userId },
              ],
            }
          : {}),
      },
      include: {
        analyses: { select: { userId: true } },
        analysisJobs: {
          select: { userId: true, status: true },
        },
      },
      orderBy: { completedAt: "desc" },
      ...(options?.limit ? { take: options.limit } : {}),
    });
  },
};

export type UnanalyzedParticipant = {
  gameId: string;
  userId: string;
  playerColor: "white" | "black";
  analysisMode: "standard";
};

export function deriveUnanalyzedParticipants(
  games: Awaited<ReturnType<typeof analysisJobRepository.findUnanalyzedParticipants>>,
): UnanalyzedParticipant[] {
  const results: UnanalyzedParticipant[] = [];

  for (const game of games) {
    const analyzedUserIds = new Set(game.analyses.map((a) => a.userId));
    const activeJobUserIds = new Set(
      game.analysisJobs
        .filter((job) =>
          analysisJobRepository.isActiveStatus(job.status),
        )
        .map((job) => job.userId),
    );

    const participants =
      game.mode === "PVP"
        ? [
            game.whiteUserId
              ? { userId: game.whiteUserId, playerColor: "white" as const }
              : null,
            game.blackUserId
              ? { userId: game.blackUserId, playerColor: "black" as const }
              : null,
          ].filter(Boolean)
        : [{ userId: game.userId, playerColor: game.playerColor as "white" | "black" }];

    for (const participant of participants) {
      if (!participant) continue;
      if (analyzedUserIds.has(participant.userId)) continue;
      if (activeJobUserIds.has(participant.userId)) continue;

      results.push({
        gameId: game.id,
        userId: participant.userId,
        playerColor: participant.playerColor,
        analysisMode: "standard",
      });
    }
  }

  return results;
}
