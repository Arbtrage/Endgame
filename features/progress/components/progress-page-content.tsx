"use client";

import { useQuery } from "@tanstack/react-query";
import { TrendUp } from "@phosphor-icons/react";
import { AccuracyChart } from "@/features/progress/components/accuracy-chart";
import { GameHistoryTable } from "@/features/progress/components/game-history-table";
import { ProgressOverviewCards } from "@/features/progress/components/progress-overview";
import { WeaknessTags } from "@/features/progress/components/weakness-tags";
import { WeeklyReport } from "@/features/progress/components/weekly-report";
import { getProgress, getWeeklyReport } from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import {
  FeatureHero,
  FeaturePage,
  FeaturePanel,
  FeatureSection,
} from "@/shared/components/feature-page";
import { Skeleton } from "@/shared/ui/skeleton";

export function ProgressPageContent() {
  const { data: progress, isLoading } = useQuery({
    queryKey: queryKeys.progress.overview,
    queryFn: getProgress,
  });

  const { data: weeklyReport } = useQuery({
    queryKey: queryKeys.progress.weeklyReport,
    queryFn: getWeeklyReport,
  });

  return (
    <FeaturePage>
      <FeatureHero
        icon={TrendUp}
        title="Progress"
        description="Accuracy trends, weakness patterns, and weekly coaching reports."
      />

      <FeaturePanel>
        {isLoading || !progress ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div className="space-y-8">
            <FeatureSection title="Overview">
              <ProgressOverviewCards data={progress} />
            </FeatureSection>

            <FeatureSection title="Accuracy trend">
              <AccuracyChart trend={progress.accuracyTrend} />
            </FeatureSection>

            <FeatureSection title="Weaknesses">
              <WeaknessTags tags={progress.weaknessTags} />
            </FeatureSection>

            <FeatureSection title="Weekly report">
              <WeeklyReport report={weeklyReport ?? null} />
            </FeatureSection>

            <FeatureSection title="Game history">
              <GameHistoryTable games={progress.games} />
            </FeatureSection>
          </div>
        )}
      </FeaturePanel>
    </FeaturePage>
  );
}
