import { describe, expect, it } from "vitest";
import {
  getMarvelVillainForGame,
  getVillainThinkingLabel,
  MARVEL_VILLAINS,
} from "@/features/game/constants/marvel-villains";

describe("getMarvelVillainForGame", () => {
  it("returns a known marvel villain", () => {
    const villain = getMarvelVillainForGame("game-abc-123");
    expect(MARVEL_VILLAINS).toContain(villain);
  });

  it("is stable for the same game id", () => {
    expect(getMarvelVillainForGame("same-id")).toBe(
      getMarvelVillainForGame("same-id"),
    );
  });

  it("builds thinking label from villain name", () => {
    expect(getVillainThinkingLabel("Thanos")).toBe("Thanos is thinking…");
  });
});
