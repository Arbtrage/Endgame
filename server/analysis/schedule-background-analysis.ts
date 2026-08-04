import { getGameParticipants } from "@/server/analysis/game-participants";
import { scheduleAnalysisJobs } from "@/server/analysis/schedule-analysis-job";
import { gameRepository } from "@/server/repositories/game.repository";

export async function scheduleBackgroundAnalysisForGame(gameId: string) {
  const game = await gameRepository.findById(gameId);
  if (!game || game.status !== "COMPLETED" || game.moves.length === 0) {
    return { scheduled: 0, skipped: 0 };
  }

  const participants = getGameParticipants(game);
  return scheduleAnalysisJobs(
    participants.map((participant) => ({
      gameId,
      userId: participant.userId,
      playerColor: participant.playerColor,
      analysisMode: "standard",
      sendEmail: true,
    })),
  );
}
