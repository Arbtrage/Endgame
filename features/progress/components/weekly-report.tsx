type WeeklyReportProps = {
  report: {
    narrative: string;
    gamesPlayed: number;
    lessonsCompleted: number;
    avgAccuracy: number | null;
    weaknessTags: string[];
    weekStart: string;
    weekEnd: string;
  } | null;
};

export function WeeklyReport({ report }: WeeklyReportProps) {
  if (!report) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 p-6 text-center">
        <p className="text-sm font-medium">No weekly report yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Reports are generated every Monday.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium">Weekly report</h3>
        <p className="text-xs text-muted-foreground">
          {new Date(report.weekStart).toLocaleDateString()} –{" "}
          {new Date(report.weekEnd).toLocaleDateString()}
        </p>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {report.narrative}
      </p>
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span>{report.gamesPlayed} games</span>
        <span>{report.lessonsCompleted} lessons</span>
        {report.avgAccuracy != null ? (
          <span>{Math.round(report.avgAccuracy)}% avg accuracy</span>
        ) : null}
      </div>
    </div>
  );
}
