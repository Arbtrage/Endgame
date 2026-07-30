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
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
    );
  }

  const name = profile?.name ?? session?.user.name ?? "Player";

  return (
    <div className="rounded-xl border border-border/60 bg-gradient-to-br from-muted/40 via-background to-background px-4 py-3 sm:px-5 sm:py-4">
      <div className="space-y-1.5">
        <h1 className="text-xl font-semibold leading-tight tracking-tight sm:text-2xl">
          Welcome back, {name}
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          Pick a mode below or replay a finished game to study your moves.
        </p>
      </div>
    </div>
  );
}
