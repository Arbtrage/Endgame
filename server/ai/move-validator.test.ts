import { describe, expect, it } from "vitest";
import {
  getLegalMoves,
  pickRandomLegalMove,
  validateUciMove,
} from "@/server/ai/move-validator";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

describe("move-validator", () => {
  it("returns legal opening moves", () => {
    const moves = getLegalMoves(START_FEN, []);
    expect(moves).toContain("e2e4");
    expect(moves).toContain("d2d4");
    expect(moves.length).toBe(20);
  });

  it("validates legal UCI move", () => {
    const result = validateUciMove(START_FEN, [], "e2e4");
    expect(result.valid).toBe(true);
    expect(result.san).toBe("e4");
    expect(result.uci).toBe("e2e4");
  });

  it("rejects illegal UCI move", () => {
    const result = validateUciMove(START_FEN, [], "e2e5");
    expect(result.valid).toBe(false);
  });

  it("validates move after history", () => {
    const result = validateUciMove(START_FEN, ["e4"], "e7e5");
    expect(result.valid).toBe(true);
    expect(result.san).toBe("e5");
  });

  it("picks random legal move", () => {
    const uci = pickRandomLegalMove(START_FEN, []);
    const result = validateUciMove(START_FEN, [], uci);
    expect(result.valid).toBe(true);
  });
});
