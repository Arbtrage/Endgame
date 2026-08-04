import { describe, expect, it } from "vitest";
import {
  buildAnalysisCompleteEmailHtml,
  buildAnalysisCompleteEmailSubject,
} from "@/server/email/templates/analysis-complete-email";

describe("analysis-complete email template", () => {
  it("includes metrics and analysis link", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://endgame.example";

    const html = buildAnalysisCompleteEmailHtml({
      toName: "Alex",
      gameId: "game-123",
      gameMode: "Computer",
      opponentName: "Stockfish level 5",
      resultLabel: "Win",
      completedAt: new Date("2026-08-05T12:00:00Z"),
      analysisMode: "standard",
      accuracy: 87.4,
      acpl: 42.2,
      blunderCount: 1,
      mistakeCount: 2,
      inaccuracyCount: 3,
      brilliantCount: 1,
      totalMoves: 38,
    });

    expect(html).toContain("87.4%");
    expect(html).toContain("Blunders");
    expect(html).toContain("https://endgame.example/analyze/game-123");
    expect(html).toContain("View full analysis");
    expect(buildAnalysisCompleteEmailSubject(87.4)).toContain("87%");
  });
});
