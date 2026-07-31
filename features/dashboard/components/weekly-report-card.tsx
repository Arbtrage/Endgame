"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getWeeklyReport } from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import { ChevronRight } from "lucide-react";

export function WeeklyReportCard() {
  const { data: report } = useQuery({
    queryKey: queryKeys.progress.weeklyReport,
    queryFn: getWeeklyReport,
  });

  if (!report) return null;

  return (
    <Link
      href="/progress"
      className="block rounded-xl border border-border/60 bg-card px-4 py-3 transition-colors hover:bg-muted/20"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium">Weekly report</p>
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {report.narrative}
          </p>
        </div>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </div>
    </Link>
  );
}
