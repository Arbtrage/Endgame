export type MoveClassification =
  | "brilliant"
  | "best"
  | "great"
  | "good"
  | "inaccuracy"
  | "mistake"
  | "blunder";

export type ClassifyMoveInput = {
  cpLoss: number;
  isBestMove: boolean;
  evalGain: number;
};

export function classifyMove(input: ClassifyMoveInput): MoveClassification {
  const { cpLoss, isBestMove, evalGain } = input;

  if (isBestMove && evalGain >= 150) {
    return "brilliant";
  }
  if (isBestMove || cpLoss <= 10) {
    return "best";
  }
  if (cpLoss <= 20) {
    return "great";
  }
  if (cpLoss <= 30) {
    return "good";
  }
  if (cpLoss <= 60) {
    return "inaccuracy";
  }
  if (cpLoss <= 100) {
    return "mistake";
  }
  return "blunder";
}

export function sideEval(whiteCp: number, color: "white" | "black"): number {
  return color === "white" ? whiteCp : -whiteCp;
}

export function calculateCpLoss(
  whiteEvalBest: number,
  whiteEvalAfter: number,
  color: "white" | "black",
): number {
  const bestSide = sideEval(whiteEvalBest, color);
  const afterSide = sideEval(whiteEvalAfter, color);
  return Math.max(0, bestSide - afterSide);
}

export function calculateEvalGain(
  whiteEvalBefore: number,
  whiteEvalAfter: number,
  color: "white" | "black",
): number {
  const beforeSide = sideEval(whiteEvalBefore, color);
  const afterSide = sideEval(whiteEvalAfter, color);
  const gain = afterSide - beforeSide;
  return gain > 0 ? gain : 0;
}

export const CLASSIFICATION_LABELS: Record<MoveClassification, string> = {
  brilliant: "Brilliant",
  best: "Best",
  great: "Great",
  good: "Good",
  inaccuracy: "Inaccuracy",
  mistake: "Mistake",
  blunder: "Blunder",
};
