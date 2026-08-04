export type AnalysisMode = "fast" | "standard";

export const ANALYSIS_PROFILES: Record<
  AnalysisMode,
  { desktopDepth: number; mobileDepth: number; maxMoveTimeMs: number }
> = {
  standard: { desktopDepth: 18, mobileDepth: 15, maxMoveTimeMs: 3000 },
  fast: { desktopDepth: 12, mobileDepth: 10, maxMoveTimeMs: 1500 },
};

export function getDesktopDepthForMode(mode: AnalysisMode = "standard"): number {
  return ANALYSIS_PROFILES[mode].desktopDepth;
}
