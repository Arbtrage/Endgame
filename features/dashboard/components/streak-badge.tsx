"use client";

import { Fire } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { getProgress } from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import { iconClass } from "@/shared/components/icon";

export function StreakBadge() {
  const { data } = useQuery({
    queryKey: queryKeys.progress.overview,
    queryFn: getProgress,
  });

  if (!data?.streak) return null;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-white/10"
      style={{
        backgroundColor: "color-mix(in oklch, var(--streak) 15%, transparent)",
        color: "var(--streak)",
      }}
    >
      <Fire className={iconClass("sm")} weight="light" aria-hidden />
      {data.streak}-day streak
    </span>
  );
}
