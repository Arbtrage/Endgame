import { tasks } from "@trigger.dev/sdk/v3";
import type { analyzeGameTask } from "@/trigger/analyze-game";
import type { AnalysisMode } from "@/shared/analysis/profiles";
import { prisma } from "@/shared/db/prisma";
import { analysisRepository } from "@/server/repositories/analysis.repository";
import {
  analysisJobRepository,
} from "@/server/repositories/analysis-job.repository";

export type ScheduleAnalysisJobInput = {
  gameId: string;
  userId: string;
  playerColor: "white" | "black";
  analysisMode?: AnalysisMode;
  sendEmail?: boolean;
};

export async function scheduleAnalysisJob(
  input: ScheduleAnalysisJobInput,
): Promise<{ scheduled: boolean; reason?: string }> {
  if (!process.env.TRIGGER_SECRET_KEY) {
    console.warn("[analysis] TRIGGER_SECRET_KEY not configured; skipping job");
    return { scheduled: false, reason: "Trigger.dev not configured" };
  }

  const existingAnalysis = await analysisRepository.findByGameAndUser(
    input.gameId,
    input.userId,
  );
  if (existingAnalysis) {
    return { scheduled: false, reason: "Analysis already exists" };
  }

  const existingJob = await analysisJobRepository.findByGameAndUser(
    input.gameId,
    input.userId,
  );
  if (
    existingJob &&
    analysisJobRepository.isActiveStatus(existingJob.status)
  ) {
    return { scheduled: false, reason: "Analysis job already active" };
  }

  const analysisMode = input.analysisMode ?? "standard";
  await analysisJobRepository.upsertPending(
    input.gameId,
    input.userId,
    analysisMode,
  );

  const handle = await tasks.trigger<typeof analyzeGameTask>("analyze-game", {
    gameId: input.gameId,
    userId: input.userId,
    playerColor: input.playerColor,
    analysisMode,
    sendEmail: input.sendEmail ?? true,
  });

  if (handle?.id) {
    await prisma.analysisJob.update({
      where: { gameId_userId: { gameId: input.gameId, userId: input.userId } },
      data: { triggerRunId: handle.id },
    });
  }

  return { scheduled: true };
}

export async function scheduleAnalysisJobs(
  jobs: ScheduleAnalysisJobInput[],
): Promise<{ scheduled: number; skipped: number }> {
  let scheduled = 0;
  let skipped = 0;

  for (const job of jobs) {
    const result = await scheduleAnalysisJob(job);
    if (result.scheduled) {
      scheduled += 1;
    } else {
      skipped += 1;
    }
  }

  return { scheduled, skipped };
}
