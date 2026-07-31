"use client";

import type { ProgressOverview } from "@/shared/api/fetcher";

type AccuracyChartProps = {
  trend: ProgressOverview["accuracyTrend"];
};

export function AccuracyChart({ trend }: AccuracyChartProps) {
  if (trend.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Play and analyze games to see your accuracy trend.
      </p>
    );
  }

  const width = 400;
  const height = 140;
  const padding = { top: 12, right: 12, bottom: 24, left: 32 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const maxAcc = 100;
  const minAcc = Math.min(...trend.map((t) => t.accuracy), 50);

  const points = trend.map((t, i) => ({
    x: padding.left + (i / Math.max(trend.length - 1, 1)) * innerW,
    y:
      padding.top +
      innerH -
      ((t.accuracy - minAcc) / (maxAcc - minAcc)) * innerH,
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Accuracy trend">
      <path d={pathD} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} />
    </svg>
  );
}
