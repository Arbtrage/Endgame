import { describe, expect, it } from "vitest";
import {
  calculateCpLoss,
  calculateEvalGain,
  classifyMove,
} from "./classification";

describe("classifyMove", () => {
  it("classifies brilliant moves", () => {
    expect(
      classifyMove({ cpLoss: 0, isBestMove: true, evalGain: 200 }),
    ).toBe("brilliant");
  });

  it("classifies best moves", () => {
    expect(
      classifyMove({ cpLoss: 5, isBestMove: true, evalGain: 20 }),
    ).toBe("best");
    expect(
      classifyMove({ cpLoss: 10, isBestMove: false, evalGain: 0 }),
    ).toBe("best");
  });

  it("classifies great and good moves", () => {
    expect(
      classifyMove({ cpLoss: 15, isBestMove: false, evalGain: 0 }),
    ).toBe("great");
    expect(
      classifyMove({ cpLoss: 25, isBestMove: false, evalGain: 0 }),
    ).toBe("good");
  });

  it("classifies inaccuracies, mistakes, and blunders", () => {
    expect(
      classifyMove({ cpLoss: 45, isBestMove: false, evalGain: 0 }),
    ).toBe("inaccuracy");
    expect(
      classifyMove({ cpLoss: 80, isBestMove: false, evalGain: 0 }),
    ).toBe("mistake");
    expect(
      classifyMove({ cpLoss: 150, isBestMove: false, evalGain: 0 }),
    ).toBe("blunder");
  });
});

describe("calculateCpLoss", () => {
  it("computes loss from white perspective", () => {
    expect(calculateCpLoss(200, 150, "white")).toBe(50);
  });

  it("computes loss from black perspective", () => {
    expect(calculateCpLoss(-100, -50, "black")).toBe(50);
  });
});

describe("calculateEvalGain", () => {
  it("returns positive gain for improving moves", () => {
    expect(calculateEvalGain(100, 250, "white")).toBe(150);
  });

  it("returns zero when position worsens", () => {
    expect(calculateEvalGain(200, 100, "white")).toBe(0);
  });
});
