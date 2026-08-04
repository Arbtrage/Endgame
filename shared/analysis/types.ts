import type { MoveClassification } from "@/shared/engine/classification";

export type AnalysisMoveInput = {
  moveNumber: number;
  san: string;
  uci: string;
  fen: string;
  color: string;
};

export type AnalyzedMove = {
  moveNumber: number;
  san: string;
  uci: string;
  fen: string;
  color: "white" | "black";
  evalBefore: number;
  evalAfter: number;
  bestMove: string;
  classification: MoveClassification;
  cpLoss: number;
  isUserMove: boolean;
};

export type EvalGraphPoint = {
  moveNumber: number;
  eval: number;
};

export type AnalysisProgress = {
  current: number;
  total: number;
  phase: "analyzing" | "complete" | "cancelled" | "error";
  message?: string;
};

export type AnalyzeGameMovesResult = {
  accuracy: number;
  acpl: number;
  totalMoves: number;
  blunderCount: number;
  mistakeCount: number;
  inaccuracyCount: number;
  brilliantCount: number;
  moveAnalysis: AnalyzedMove[];
  evalGraph: EvalGraphPoint[];
  analysisMode: import("./profiles").AnalysisMode;
  analysisDepth: number;
};
