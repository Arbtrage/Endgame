"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, ChevronRight } from "lucide-react";
import { getWeeklyReport } from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import { InlineEmpty } from "@/shared/components/inline-empty";
import { Skeleton } from "@/shared/ui/skeleton";

export function WeeklyReportCard() {
  const { data: report, isLoading } = useQuery({
    queryKey: queryKeys.progress.weeklyReport,
    queryFn: getWeeklyReport,
  });

  if (isLoading) {
    return <Skeleton className="h-20 w-full rounded-xl" />;
  }

  if (!report) {
    return (
      <InlineEmpty
        icon={<CalendarDays className="size-4" />}
        title="Your first weekly report is on the way"
        description="Play a few games this week — we'll summarize accuracy, patterns, and training suggestions every Monday."
        action={
          <Link href="/progress" className="text-xs font-medium text-primary hover:underline">
            View progress →
          </Link>
        }
        className="py-6"
      />
    );
  }

  return (
    <Link
      href="/progress"
      className="block rounded-xl border border-border/50 bg-card/60 px-4 py-3 shadow-elevated transition-[box-shadow,background-color] duration-200 hover:bg-muted/15 hover:shadow-elevated-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold">Weekly report</p>
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {report.narrative}
          </p>
        </div>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </div>
    </Link>
  );
}
