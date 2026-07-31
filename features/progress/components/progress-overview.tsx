"use client";

import type { ProgressOverview } from "@/shared/api/fetcher";

type ProgressOverviewCardsProps = {
  data: ProgressOverview;
};

export function ProgressOverviewCards({ data }: ProgressOverviewCardsProps) {
  const stats = [
    { label: "Games played", value: data.gamesPlayed },
    { label: "Analyzed", value: data.analyzedGames },
    {
      label: "Avg accuracy",
      value: data.avgAccuracy != null ? `${data.avgAccuracy}%` : "—",
    },
    { label: "Streak", value: `${data.streak} days` },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
