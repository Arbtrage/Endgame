import { task } from "@trigger.dev/sdk/v3";
import { prisma } from "@/shared/db/prisma";
import {
  formatGameMode,
  formatGameResult,
  resolveOpponentName,
} from "@/server/analysis/game-participants";
import { runGameAnalysis } from "@/server/analysis/run-game-analysis";
import { sendAnalysisCompleteEmail } from "@/server/email/send-analysis-complete-email";
import { analysisJobRepository } from "@/server/repositories/analysis-job.repository";
import type { AnalysisMode } from "@/shared/analysis/profiles";

export type AnalyzeGamePayload = {
  gameId: string;
  userId: string;
  playerColor: "white" | "black";
  analysisMode?: AnalysisMode;
  sendEmail?: boolean;
};

export const analyzeGameTask = task({
  id: "analyze-game",
  queue: {
    concurrencyLimit: 2,
  },
  retry: {
    maxAttempts: 2,
  },
  maxDuration: 1800,
  run: async (payload: AnalyzeGamePayload, { ctx }) => {
    const analysisMode = payload.analysisMode ?? "standard";
    const sendEmail = payload.sendEmail ?? true;

    await analysisJobRepository.markRunning(
      payload.gameId,
      payload.userId,
      ctx.run.id,
    );

    try {
      const result = await runGameAnalysis({
        gameId: payload.gameId,
        userId: payload.userId,
        playerColor: payload.playerColor,
        analysisMode,
      });

      if (sendEmail && !result.skipped) {
        const [user, game] = await Promise.all([
          prisma.user.findUnique({
            where: { id: payload.userId },
            select: { email: true, name: true },
          }),
          prisma.game.findUnique({
            where: { id: payload.gameId },
            include: {
              whiteUser: { select: { id: true, name: true, email: true } },
              blackUser: { select: { id: true, name: true, email: true } },
            },
          }),
        ]);

        if (user?.email && game) {
          await sendAnalysisCompleteEmail({
            toEmail: user.email,
            toName: user.name ?? "Player",
            gameId: payload.gameId,
            gameMode: formatGameMode(game.mode),
            opponentName: resolveOpponentName(game, payload.userId),
            resultLabel: formatGameResult(game.result, payload.playerColor),
            completedAt: game.completedAt,
            analysisMode,
            accuracy: result.accuracy,
            acpl: result.acpl,
            blunderCount: result.blunderCount,
            mistakeCount: result.mistakeCount,
            inaccuracyCount: result.inaccuracyCount,
            brilliantCount: result.brilliantCount,
            totalMoves: result.totalMoves,
          });
        }
      }

      await analysisJobRepository.markCompleted(payload.gameId, payload.userId);

      return {
        gameId: payload.gameId,
        userId: payload.userId,
        skipped: result.skipped,
        accuracy: result.accuracy,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown analysis error";
      await analysisJobRepository.markFailed(
        payload.gameId,
        payload.userId,
        message,
      );
      throw error;
    }
  },
});
