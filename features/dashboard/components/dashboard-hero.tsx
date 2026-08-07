"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import { useSession } from "@/shared/auth/auth-client";
import { StreakBadge } from "@/features/dashboard/components/streak-badge";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

export function DashboardHero() {
  const { data: session } = useSession();
  const { data: profile, isLoading } = useQuery({
    queryKey: queryKeys.user.profile,
    queryFn: getProfile,
    enabled: !!session,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
    );
  }

  const name = profile?.name ?? session?.user.name ?? "Player";

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border/50 bg-card/40 px-4 py-4 sm:px-5">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Hi, {name}
          </h1>
          <StreakBadge />
        </div>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          Continue with coach mode or review your last game while it&apos;s still
          fresh.
        </p>
      </div>
      <Button render={<Link href="/play/coach" />} nativeButton={false}>
        Start coach game
      </Button>
    </div>
  );
}
