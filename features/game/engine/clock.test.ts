import { describe, expect, it, vi } from "vitest";
import { formatClock, GameClock } from "@/features/game/engine/clock";

describe("GameClock", () => {
  it("formats clock values", () => {
    expect(formatClock(125000)).toBe("2:05");
  });

  it("fires timeout for active color", () => {
    vi.useFakeTimers();
    const onTimeout = vi.fn();
    const clock = new GameClock({ initialSeconds: 1, incrementSeconds: 0 });
    clock.setOnTimeout(onTimeout);
    clock.start("white");
    vi.advanceTimersByTime(1100);
    expect(onTimeout).toHaveBeenCalledWith("white");
    vi.useRealTimers();
  });
});
