"use client";

import { useQuery } from "@tanstack/react-query";
import { OnboardingWizard } from "@/features/auth/components/onboarding-wizard";
import { DashboardHero } from "@/features/dashboard/components/dashboard-hero";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { getProfile } from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import { RecentGames } from "@/features/dashboard/components/recent-games";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { useQueryClient } from "@tanstack/react-query";

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: queryKeys.user.profile,
    queryFn: getProfile,
  });

  const showOnboarding = profile && !profile.onboardingComplete;

  return (
    <div className="space-y-8">
      <DashboardHero />
      <QuickActions />
      <Card>
        <CardHeader>
          <CardTitle>Recent games</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentGames />
        </CardContent>
      </Card>
      <OnboardingWizard
        open={!!showOnboarding}
        onComplete={() =>
          queryClient.invalidateQueries({ queryKey: queryKeys.user.profile })
        }
      />
    </div>
  );
}
