"use client";

import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import { useSession } from "@/shared/auth/auth-client";
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
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
    );
  }

  const name = profile?.name ?? session?.user.name ?? "Player";

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Ready for your next game on Endgame.
      </p>
    </div>
  );
}
