import { describe, expect, it } from "vitest";
import {
  coordsToSquare,
  parseFenPieces,
  squareToCoords,
  squareToPosition,
} from "./square-utils";

describe("square-utils", () => {
  it("maps square to coords and back", () => {
    expect(squareToCoords("e4")).toEqual({ file: 4, rank: 3 });
    expect(coordsToSquare(4, 3)).toBe("e4");
  });

  it("maps square to world position", () => {
    const pos = squareToPosition("a1");
    expect(pos.x).toBe(-3.5);
    expect(pos.z).toBe(3.5);
  });

  it("parses starting FEN", () => {
    const fen =
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const pieces = parseFenPieces(fen);
    expect(pieces).toHaveLength(32);
    expect(pieces.find((p) => p.square === "e1")).toEqual({
      square: "e1",
      kind: "k",
      color: "w",
    });
  });
});
