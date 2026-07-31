import { describe, expect, it } from "vitest";
import {
  calculateACPL,
  calculateAccuracy,
  summarizeAnalysis,
} from "./accuracy";
import type { MoveAnalysisInput } from "./accuracy";

const sampleMoves: MoveAnalysisInput[] = [
  { cpLoss: 5, classification: "best", isUserMove: true },
  { cpLoss: 0, classification: "best", isUserMove: false },
  { cpLoss: 25, classification: "good", isUserMove: true },
  { cpLoss: 0, classification: "best", isUserMove: false },
  { cpLoss: 120, classification: "blunder", isUserMove: true },
  { cpLoss: 0, classification: "best", isUserMove: false },
];

describe("calculateAccuracy", () => {
  it("returns percentage of good user moves", () => {
    expect(calculateAccuracy(sampleMoves)).toBe(66.7);
  });

  it("returns 0 when no user moves", () => {
    expect(calculateAccuracy([])).toBe(0);
  });
});

describe("calculateACPL", () => {
  it("returns average centipawn loss for user moves", () => {
    expect(calculateACPL(sampleMoves)).toBe(50);
  });
});

describe("summarizeAnalysis", () => {
  it("aggregates classification counts", () => {
    const summary = summarizeAnalysis(sampleMoves);
    expect(summary.accuracy).toBe(66.7);
    expect(summary.acpl).toBe(50);
    expect(summary.blunderCount).toBe(1);
    expect(summary.totalUserMoves).toBe(3);
  });
});
