import type { GameMove } from "@/shared/api/fetcher";
import { analyzeGameMoves } from "@/shared/analysis/analyze-game-moves";
import {
  ANALYSIS_PROFILES,
  type AnalysisMode,
} from "@/shared/analysis/profiles";
import { getStockfishEngine } from "@/shared/engine/stockfish-engine";
import type {
  AnalysisProgress,
  AnalysisResult,
} from "../types";

export type { AnalysisMode };
export { ANALYSIS_PROFILES };

export type AnalyzeGameOptions = {
  moves: GameMove[];
  playerColor: "white" | "black";
  onProgress?: (progress: AnalysisProgress) => void;
  signal?: AbortSignal;
  analysisMode?: AnalysisMode;
  depth?: number;
};

function isMobileViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 768px)").matches;
}

export function getAnalysisDepthForMode(mode: AnalysisMode = "standard"): number {
  const profile = ANALYSIS_PROFILES[mode];
  return isMobileViewport() ? profile.mobileDepth : profile.desktopDepth;
}

export async function analyzeGame(
  options: AnalyzeGameOptions,
): Promise<AnalysisResult & { analysisMode: AnalysisMode; analysisDepth: number }> {
  const analysisMode = options.analysisMode ?? "standard";
  const depth = options.depth ?? getAnalysisDepthForMode(analysisMode);
  const engine = getStockfishEngine();

  return analyzeGameMoves({
    moves: options.moves,
    playerColor: options.playerColor,
    engine,
    onProgress: options.onProgress,
    signal: options.signal,
    analysisMode,
    depth,
  });
}
