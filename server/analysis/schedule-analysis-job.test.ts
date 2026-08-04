import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@trigger.dev/sdk/v3", () => ({
  tasks: {
    trigger: vi.fn().mockResolvedValue({ id: "run_123" }),
  },
}));

vi.mock("@/server/repositories/analysis.repository", () => ({
  analysisRepository: {
    findByGameAndUser: vi.fn(),
  },
}));

vi.mock("@/server/repositories/analysis-job.repository", () => ({
  analysisJobRepository: {
    findByGameAndUser: vi.fn(),
    upsertPending: vi.fn().mockResolvedValue({ id: "job-1" }),
    isActiveStatus: (status: string) => status === "PENDING" || status === "RUNNING",
  },
}));

vi.mock("@/shared/db/prisma", () => ({
  prisma: {
    analysisJob: {
      update: vi.fn().mockResolvedValue({}),
    },
  },
}));

import { tasks } from "@trigger.dev/sdk/v3";
import { scheduleAnalysisJob } from "@/server/analysis/schedule-analysis-job";
import { analysisRepository } from "@/server/repositories/analysis.repository";
import { analysisJobRepository } from "@/server/repositories/analysis-job.repository";

describe("scheduleAnalysisJob", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TRIGGER_SECRET_KEY = "tr_dev_test";
  });

  it("skips when analysis already exists", async () => {
    vi.mocked(analysisRepository.findByGameAndUser).mockResolvedValue({
      id: "analysis-1",
    } as never);

    const result = await scheduleAnalysisJob({
      gameId: "game-1",
      userId: "user-1",
      playerColor: "white",
    });

    expect(result.scheduled).toBe(false);
    expect(tasks.trigger).not.toHaveBeenCalled();
  });

  it("skips when an active job already exists", async () => {
    vi.mocked(analysisRepository.findByGameAndUser).mockResolvedValue(null);
    vi.mocked(analysisJobRepository.findByGameAndUser).mockResolvedValue({
      status: "RUNNING",
    } as never);

    const result = await scheduleAnalysisJob({
      gameId: "game-1",
      userId: "user-1",
      playerColor: "white",
    });

    expect(result.scheduled).toBe(false);
    expect(tasks.trigger).not.toHaveBeenCalled();
  });

  it("creates pending job and triggers task", async () => {
    vi.mocked(analysisRepository.findByGameAndUser).mockResolvedValue(null);
    vi.mocked(analysisJobRepository.findByGameAndUser).mockResolvedValue(null);

    const result = await scheduleAnalysisJob({
      gameId: "game-1",
      userId: "user-1",
      playerColor: "white",
    });

    expect(result.scheduled).toBe(true);
    expect(analysisJobRepository.upsertPending).toHaveBeenCalledWith(
      "game-1",
      "user-1",
      "standard",
    );
    expect(tasks.trigger).toHaveBeenCalledWith("analyze-game", {
      gameId: "game-1",
      userId: "user-1",
      playerColor: "white",
      analysisMode: "standard",
      sendEmail: true,
    });
  });
});
