import type { MoveClassification } from "./classification";

export type MoveAnalysisInput = {
  cpLoss: number;
  classification: MoveClassification;
  isUserMove: boolean;
};

export function calculateAccuracy(moves: MoveAnalysisInput[]): number {
  const userMoves = moves.filter((m) => m.isUserMove);
  if (userMoves.length === 0) {
    return 0;
  }
  const goodMoves = userMoves.filter((m) => m.cpLoss <= 30);
  return Math.round((goodMoves.length / userMoves.length) * 1000) / 10;
}

export function calculateACPL(moves: MoveAnalysisInput[]): number {
  const userMoves = moves.filter((m) => m.isUserMove);
  if (userMoves.length === 0) {
    return 0;
  }
  const totalLoss = userMoves.reduce((sum, m) => sum + m.cpLoss, 0);
  return Math.round((totalLoss / userMoves.length) * 10) / 10;
}

export function countByClassification(
  moves: MoveAnalysisInput[],
  classification: MoveClassification,
): number {
  return moves.filter(
    (m) => m.isUserMove && m.classification === classification,
  ).length;
}

export function summarizeAnalysis(moves: MoveAnalysisInput[]) {
  return {
    accuracy: calculateAccuracy(moves),
    acpl: calculateACPL(moves),
    blunderCount: countByClassification(moves, "blunder"),
    mistakeCount: countByClassification(moves, "mistake"),
    inaccuracyCount: countByClassification(moves, "inaccuracy"),
    brilliantCount: countByClassification(moves, "brilliant"),
    totalUserMoves: moves.filter((m) => m.isUserMove).length,
  };
}
