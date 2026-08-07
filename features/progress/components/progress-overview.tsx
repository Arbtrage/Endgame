"use client";

import type { ProgressOverview } from "@/shared/api/fetcher";
import { StatGrid, StatTile } from "@/shared/components/stat-tile";

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
    <StatGrid columns={4}>
      {stats.map((stat) => (
        <StatTile key={stat.label} label={stat.label} value={stat.value} />
      ))}
    </StatGrid>
  );
}
