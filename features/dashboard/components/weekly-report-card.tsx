"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CalendarDots } from "@phosphor-icons/react";
import { getWeeklyReport } from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import { BezelCard } from "@/shared/components/bezel-card";
import { iconClass } from "@/shared/components/icon";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";

type WeeklyReportCardProps = {
  className?: string;
};

export function WeeklyReportCard({ className }: WeeklyReportCardProps) {
  const { data: report, isLoading } = useQuery({
    queryKey: queryKeys.progress.weeklyReport,
    queryFn: getWeeklyReport,
  });

  if (isLoading) {
    return (
      <Skeleton
        className={cn("h-full min-h-[140px] w-full rounded-[2rem]", className)}
      />
    );
  }

  if (!report) {
    return (
      <BezelCard
        padding="md"
        className={cn("h-full", className)}
        innerClassName="flex h-full flex-col justify-between"
      >
        <div>
          <div className="flex size-10 items-center justify-center rounded-full bg-white/[0.06] ring-1 ring-white/10">
            <CalendarDots className={iconClass("sm")} weight="light" />
          </div>
          <p className="mt-4 font-display text-sm font-semibold">
            Your first weekly report is on the way
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Play a few games this week — we summarize patterns every Monday.
          </p>
        </div>
        <Link
          href="/progress"
          className="mt-6 inline-block text-xs font-medium text-primary hover:underline"
        >
          View progress →
        </Link>
      </BezelCard>
    );
  }

  return (
    <Link href="/progress" className={cn("block h-full min-h-0", className)}>
      <BezelCard
        padding="md"
        className="h-full transition-spring hover:ring-white/20"
        innerClassName="flex h-full flex-col justify-between"
      >
        <div>
          <div className="flex size-10 items-center justify-center rounded-full bg-white/[0.06] ring-1 ring-white/10">
            <CalendarDots className={iconClass("sm")} weight="light" />
          </div>
          <p className="mt-4 font-display text-sm font-semibold">Weekly report</p>
          <p className="mt-2 line-clamp-[8] text-xs leading-relaxed text-muted-foreground">
            {report.narrative}
          </p>
        </div>
        <span className="mt-6 inline-block text-xs font-medium text-primary">
          View progress →
        </span>
      </BezelCard>
    </Link>
  );
}
