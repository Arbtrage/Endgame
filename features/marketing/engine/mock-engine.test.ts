import { describe, expect, it } from "vitest";
import { Chess } from "chess.js";
import { MockEngine } from "./mock-engine";

describe("MockEngine", () => {
  it("returns a legal UCI move", async () => {
    const engine = new MockEngine(0, 0);
    const fen =
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const uci = await engine.getMove(fen);
    expect(uci).toMatch(/^[a-h][1-8][a-h][1-8][qrbn]?$/);

    const chess = new Chess(fen);
    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    const promotion = uci.length > 4 ? uci[4] : undefined;
    const move = chess.move({ from, to, promotion });
    expect(move).not.toBeNull();
  });
});
