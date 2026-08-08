"use client";

import { useQuery } from "@tanstack/react-query";
import { OnboardingWizard } from "@/features/auth/components/onboarding-wizard";
import { DashboardHero } from "@/features/dashboard/components/dashboard-hero";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { RecentGames } from "@/features/dashboard/components/recent-games";
import { ActiveLessonsWidget } from "@/features/dashboard/components/active-lessons-widget";
import { WeeklyReportCard } from "@/features/dashboard/components/weekly-report-card";
import { getProfile } from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import { BentoCell, BentoGrid } from "@/shared/components/bento-grid";
import { BezelCard } from "@/shared/components/bezel-card";
import { FeatureSection } from "@/shared/components/feature-page";
import { useQueryClient } from "@tanstack/react-query";

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: queryKeys.user.profile,
    queryFn: getProfile,
  });

  const showOnboarding = profile && !profile.onboardingComplete;

  return (
    <>
      <BentoGrid className="gap-5">
        <BentoCell span={8} rowSpan={2}>
          <DashboardHero />
        </BentoCell>
        <BentoCell span={4}>
          <WeeklyReportCard />
        </BentoCell>
        <BentoCell span={4}>
          <ActiveLessonsWidget />
        </BentoCell>
        <BentoCell span={5}>
          <BezelCard padding="md" className="h-full">
            <FeatureSection title="Quick start" description="Pick a mode">
              <QuickActions />
            </FeatureSection>
          </BezelCard>
        </BentoCell>
        <BentoCell span={7}>
          <BezelCard padding="md" className="h-full" innerClassName="flex min-h-[280px] flex-col">
            <FeatureSection title="Recent games" description="Replay or analyze">
              <RecentGames />
            </FeatureSection>
          </BezelCard>
        </BentoCell>
      </BentoGrid>

      <OnboardingWizard
        open={!!showOnboarding}
        onComplete={() => {
          void queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
        }}
      />
    </>
  );
}
