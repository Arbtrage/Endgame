"use client";

import type { AnalysisMode } from "@/features/analysis/engine/analysis-engine";
import { StatGrid, StatTile } from "@/shared/components/stat-tile";

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
        <p className="text-xs font-medium text-muted-foreground">
          {analysisMode === "fast" ? "Fast analysis" : "Standard analysis"}
        </p>
      ) : null}
      <StatGrid columns={3}>
        {stats.map((stat) => (
          <StatTile key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </StatGrid>
    </div>
  );
}
