"use client";

import type { AnalysisResult } from "../types";

type AnalysisSummaryProps = {
  analysis: Pick<
    AnalysisResult,
    | "accuracy"
    | "acpl"
    | "blunderCount"
    | "mistakeCount"
    | "inaccuracyCount"
    | "brilliantCount"
  >;
};

export function AnalysisSummary({ analysis }: AnalysisSummaryProps) {
  const stats = [
    { label: "Accuracy", value: `${analysis.accuracy}%` },
    { label: "ACPL", value: String(analysis.acpl) },
    { label: "Brilliant", value: String(analysis.brilliantCount) },
    { label: "Blunders", value: String(analysis.blunderCount) },
    { label: "Mistakes", value: String(analysis.mistakeCount) },
    { label: "Inaccuracies", value: String(analysis.inaccuracyCount) },
  ];

  return (
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
  );
}
