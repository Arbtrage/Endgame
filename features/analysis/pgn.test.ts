import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";

describe("PGN parsing", () => {
  it("loads valid PGN", () => {
    const chess = new Chess();
    const pgn = `[Event "Test"]

1. e4 e5 2. Nf3 Nc6 *`;
    expect(() => chess.loadPgn(pgn)).not.toThrow();
    expect(chess.history().length).toBe(4);
  });

  it("rejects invalid PGN", () => {
    const chess = new Chess();
    expect(() => chess.loadPgn("not a pgn !!!")).toThrow();
  });
});
