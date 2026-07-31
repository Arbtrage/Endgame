"use client";

import { Flame } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProgress } from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";

export function StreakBadge() {
  const { data } = useQuery({
    queryKey: queryKeys.progress.overview,
    queryFn: getProgress,
  });

  if (!data?.streak) return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-xs font-medium text-orange-700 dark:text-orange-300">
      <Flame className="size-3.5" aria-hidden />
      {data.streak}-day streak
    </span>
  );
}
