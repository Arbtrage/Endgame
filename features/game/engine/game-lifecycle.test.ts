import { describe, expect, it } from "vitest";
import {
  getResultLabel,
  resolveGameResult,
} from "@/features/game/engine/game-lifecycle";

describe("game lifecycle", () => {
  it("resolves resignation for white player", () => {
    const state = resolveGameResult("white", "resignation");
    expect(state.result).toBe("BLACK_WIN");
    expect(state.phase).toBe("game_over");
  });

  it("labels win and loss from player perspective", () => {
    expect(getResultLabel("WHITE_WIN", "white")).toBe("Win");
    expect(getResultLabel("WHITE_WIN", "black")).toBe("Loss");
    expect(getResultLabel("DRAW", "white")).toBe("Draw");
  });
});
