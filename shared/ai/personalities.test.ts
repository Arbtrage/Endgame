import { describe, expect, it } from "vitest";
import {
  listPersonalities,
  PERSONALITY_IDS,
  personalities,
} from "@/shared/ai/personalities";

describe("personalities", () => {
  it("defines all 11 personalities", () => {
    expect(PERSONALITY_IDS).toHaveLength(11);
    expect(listPersonalities()).toHaveLength(11);
  });

  it("has required fields for each personality", () => {
    for (const id of PERSONALITY_IDS) {
      const p = personalities[id];
      expect(p.id).toBe(id);
      expect(p.name).toBeTruthy();
      expect(p.description).toBeTruthy();
      expect(p.mistakeRate).toBeGreaterThan(0);
      expect(p.commentStyle).toBeTruthy();
      expect(p.skillRange).toBeTruthy();
    }
  });
});
