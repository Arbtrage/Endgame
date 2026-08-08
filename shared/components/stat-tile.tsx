import { cn } from "@/shared/lib/utils";

type StatTileProps = {
  label: string;
  value: React.ReactNode;
  hint?: string;
  className?: string;
};

export function StatTile({ label, value, hint, className }: StatTileProps) {
  return (
    <div className={cn("bezel-outer", className)}>
      <div className="bezel-inner glass-surface px-4 py-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-2 font-display text-2xl font-semibold tabular-nums tracking-tight">
          {value}
        </p>
        {hint ? (
          <p className="mt-1 text-xs text-muted-foreground/80">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}

export function StatGrid({
  children,
  columns = 3,
  className,
}: {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const cols =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 4
        ? "sm:grid-cols-2 xl:grid-cols-4"
        : "sm:grid-cols-3";

  return <div className={cn("grid gap-4", cols, className)}>{children}</div>;
}
