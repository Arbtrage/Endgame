import { describe, expect, it } from "vitest";
import { calculateStreak } from "./report.service.helpers";

describe("calculateStreak", () => {
  it("counts consecutive days including today", () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    expect(calculateStreak([today, yesterday])).toBe(2);
  });

  it("returns 0 when no dates", () => {
    expect(calculateStreak([])).toBe(0);
  });
});
