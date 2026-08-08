"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import { useSession } from "@/shared/auth/auth-client";
import { StreakBadge } from "@/features/dashboard/components/streak-badge";
import { PillCta } from "@/shared/components/pill-cta";
import { BezelCard } from "@/shared/components/bezel-card";
import { Eyebrow } from "@/shared/components/eyebrow";
import { Skeleton } from "@/shared/ui/skeleton";

export function DashboardHero() {
  const { data: session } = useSession();
  const { data: profile, isLoading } = useQuery({
    queryKey: queryKeys.user.profile,
    queryFn: getProfile,
    enabled: !!session,
  });

  if (isLoading) {
    return <Skeleton className="h-32 w-full rounded-[2rem]" />;
  }

  const name = profile?.name ?? session?.user.name ?? "Player";

  return (
    <BezelCard padding="lg" className="h-full w-full">
      <Eyebrow className="mb-4">Today</Eyebrow>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Hi, {name}
          </h1>
          <p className="mt-3 max-w-lg text-pretty text-muted-foreground">
            Continue with coach mode or review your last game while it&apos;s
            still fresh.
          </p>
          <div className="mt-4">
            <StreakBadge />
          </div>
        </div>
        <PillCta href="/play/coach">Start coach game</PillCta>
      </div>
    </BezelCard>
  );
}
