type LessonProgressBarProps = {
  current: number;
  total: number;
};

export function LessonProgressBar({ current, total }: LessonProgressBarProps) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="flex min-w-[140px] flex-col gap-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          {current} / {total}
        </span>
        <span>{percent}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
