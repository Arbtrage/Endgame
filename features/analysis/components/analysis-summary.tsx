"use client";

import type { AnalysisMode } from "@/features/analysis/engine/analysis-engine";

type AnalysisSummaryProps = {
  analysis: {
    accuracy: number;
    acpl: number;
    blunderCount: number;
    mistakeCount: number;
    inaccuracyCount: number;
    brilliantCount: number;
  };
  analysisMode?: AnalysisMode | null;
};

export function AnalysisSummary({ analysis, analysisMode }: AnalysisSummaryProps) {
  const stats = [
    { label: "Accuracy", value: `${analysis.accuracy}%` },
    { label: "ACPL", value: String(analysis.acpl) },
    { label: "Brilliant", value: String(analysis.brilliantCount) },
    { label: "Blunders", value: String(analysis.blunderCount) },
    { label: "Mistakes", value: String(analysis.mistakeCount) },
    { label: "Inaccuracies", value: String(analysis.inaccuracyCount) },
  ];

  return (
    <div className="space-y-3">
      {analysisMode ? (
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {analysisMode === "fast" ? "Fast analysis" : "Standard analysis"}
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5"
          >
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-lg font-semibold tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
