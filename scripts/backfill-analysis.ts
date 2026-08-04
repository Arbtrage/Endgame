import "dotenv/config";

import {
  analysisJobRepository,
  deriveUnanalyzedParticipants,
} from "@/server/repositories/analysis-job.repository";
import { scheduleAnalysisJob } from "@/server/analysis/schedule-analysis-job";

type CliOptions = {
  dryRun: boolean;
  limit?: number;
  userId?: string;
};

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { dryRun: false };

  for (const arg of argv) {
    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg.startsWith("--limit=")) {
      options.limit = Number(arg.split("=")[1]);
    } else if (arg.startsWith("--user-id=")) {
      options.userId = arg.split("=")[1];
    }
  }

  return options;
}

function groupByUser(
  items: ReturnType<typeof deriveUnanalyzedParticipants>,
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item.userId, (counts.get(item.userId) ?? 0) + 1);
  }
  return counts;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!options.dryRun && !process.env.TRIGGER_SECRET_KEY) {
    console.error("TRIGGER_SECRET_KEY is required unless running with --dry-run");
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const games = await analysisJobRepository.findUnanalyzedParticipants({
    userId: options.userId,
    limit: options.limit,
  });
  const participants = deriveUnanalyzedParticipants(games);
  const byUser = groupByUser(participants);

  console.log(`Found ${participants.length} unanalyzed game(s) across ${byUser.size} user(s).`);

  for (const [userId, count] of byUser.entries()) {
    console.log(`  - ${userId}: ${count}`);
  }

  if (participants.length > 0) {
    console.log("\nSample jobs:");
    for (const item of participants.slice(0, 10)) {
      console.log(
        `  game=${item.gameId} user=${item.userId} color=${item.playerColor}`,
      );
    }
  }

  if (options.dryRun) {
    console.log("\nDry run complete. No jobs were triggered.");
    return;
  }

  let scheduled = 0;
  let skipped = 0;

  for (const item of participants) {
    const result = await scheduleAnalysisJob({
      gameId: item.gameId,
      userId: item.userId,
      playerColor: item.playerColor,
      analysisMode: item.analysisMode,
      sendEmail: true,
    });
    if (result.scheduled) {
      scheduled += 1;
    } else {
      skipped += 1;
    }
  }

  console.log(`\nTriggered ${scheduled} job(s), skipped ${skipped}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
