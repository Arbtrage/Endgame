"use client";

import { useQuery } from "@tanstack/react-query";
import { OnboardingWizard } from "@/features/auth/components/onboarding-wizard";
import { DashboardHero } from "@/features/dashboard/components/dashboard-hero";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { RecentGames } from "@/features/dashboard/components/recent-games";
import { getProfile } from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import { PageHeader } from "@/shared/components/page-header";
import {
  ViewportPage,
  ViewportPageSection,
} from "@/shared/components/viewport-page";
import { useQueryClient } from "@tanstack/react-query";

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: queryKeys.user.profile,
    queryFn: getProfile,
  });

  const showOnboarding = profile && !profile.onboardingComplete;

  return (
    <ViewportPage className="gap-4 lg:gap-5">
      <ViewportPageSection>
        <DashboardHero />
      </ViewportPageSection>

      <ViewportPageSection>
        <div className="space-y-3">
          <PageHeader
            size="section"
            title="Play"
            description="Jump into a new match or open a recent game to replay it."
            className="mb-0 gap-0 border-0 pb-2"
          />
          <QuickActions />
        </div>
      </ViewportPageSection>

      <ViewportPageSection scrollable fill className="flex min-h-0 flex-col">
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <PageHeader
            size="section"
            title="Recent games"
            description="Finished games open directly in replay mode."
            className="mb-0 shrink-0 gap-0 border-0 pb-0"
          />
          <RecentGames />
        </div>
      </ViewportPageSection>

      <OnboardingWizard
        open={!!showOnboarding}
        onComplete={() =>
          queryClient.invalidateQueries({ queryKey: queryKeys.user.profile })
        }
      />
    </ViewportPage>
  );
}
