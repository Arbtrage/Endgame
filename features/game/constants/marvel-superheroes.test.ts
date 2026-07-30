import { describe, expect, it } from "vitest";
import {
  getHeroThinkingLabel,
  getMarvelSuperheroForGame,
  MARVEL_SUPERHEROES,
} from "@/features/game/constants/marvel-superheroes";

describe("getMarvelSuperheroForGame", () => {
  it("returns a known marvel superhero", () => {
    const hero = getMarvelSuperheroForGame("ai-game-123");
    expect(MARVEL_SUPERHEROES).toContain(hero);
  });

  it("is stable for the same game id", () => {
    expect(getMarvelSuperheroForGame("same-id")).toBe(
      getMarvelSuperheroForGame("same-id"),
    );
  });

  it("builds thinking label from hero name", () => {
    expect(getHeroThinkingLabel("Iron Man")).toBe("Iron Man is thinking…");
  });
});
