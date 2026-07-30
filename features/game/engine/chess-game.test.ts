import { describe, expect, it } from "vitest";
import { ChessGame } from "@/features/game/engine/chess-game";

describe("ChessGame", () => {
  it("plays legal opening moves", () => {
    const game = new ChessGame();
    const move = game.makeMove("e2", "e4");
    expect(move?.san).toBe("e4");
    expect(game.getHistory()).toEqual(["e4"]);
  });

  it("rejects illegal moves", () => {
    const game = new ChessGame();
    expect(game.makeMove("e2", "e5")).toBeNull();
  });

  it("detects checkmate in fools mate", () => {
    const game = new ChessGame();
    game.makeMove("f2", "f3");
    game.makeMove("e7", "e5");
    game.makeMove("g2", "g4");
    game.makeMove("d8", "h4");
    expect(game.isCheckmate()).toBe(true);
    expect(game.isGameOver()).toBe(true);
    expect(game.isCheck()).toBe(true);
    expect(game.getKingSquare()).toBe("e1");
  });

  it("detects insufficient material draw", () => {
    const game = new ChessGame("k7/8/1K6/8/8/8/8/8 w - - 0 1");
    expect(game.isInsufficientMaterial()).toBe(true);
    expect(game.isDraw()).toBe(true);
  });

  it("generates pgn", () => {
    const game = new ChessGame();
    game.makeMove("e2", "e4");
    game.makeMove("e7", "e5");
    expect(game.getPgn()).toContain("1. e4 e5");
  });

  it("supports castling", () => {
    const game = new ChessGame(
      "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1",
    );
    const move = game.makeMove("e1", "g1");
    expect(move?.san).toBe("O-O");
  });
});
