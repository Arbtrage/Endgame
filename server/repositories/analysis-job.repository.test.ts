import { describe, expect, it } from "vitest";
import {
  deriveUnanalyzedParticipants,
} from "@/server/repositories/analysis-job.repository";

describe("deriveUnanalyzedParticipants", () => {
  it("returns solo game participant when no analysis exists", () => {
    const results = deriveUnanalyzedParticipants([
      {
        id: "game-1",
        mode: "COMPUTER",
        userId: "user-1",
        playerColor: "white",
        whiteUserId: null,
        blackUserId: null,
        analyses: [],
        analysisJobs: [],
      } as never,
    ]);

    expect(results).toEqual([
      {
        gameId: "game-1",
        userId: "user-1",
        playerColor: "white",
        analysisMode: "standard",
      },
    ]);
  });

  it("returns both PvP participants when missing analysis", () => {
    const results = deriveUnanalyzedParticipants([
      {
        id: "game-pvp",
        mode: "PVP",
        userId: "user-1",
        playerColor: "white",
        whiteUserId: "user-1",
        blackUserId: "user-2",
        analyses: [],
        analysisJobs: [],
      } as never,
    ]);

    expect(results).toHaveLength(2);
    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ userId: "user-1", playerColor: "white" }),
        expect.objectContaining({ userId: "user-2", playerColor: "black" }),
      ]),
    );
  });

  it("skips users with existing analysis or active jobs", () => {
    const results = deriveUnanalyzedParticipants([
      {
        id: "game-pvp",
        mode: "PVP",
        userId: "user-1",
        playerColor: "white",
        whiteUserId: "user-1",
        blackUserId: "user-2",
        analyses: [{ userId: "user-1" }],
        analysisJobs: [{ userId: "user-2", status: "RUNNING" }],
      } as never,
    ]);

    expect(results).toEqual([]);
  });
});
