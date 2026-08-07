import { cn } from "@/shared/lib/utils"

type StatTileProps = {
  label: string
  value: React.ReactNode
  hint?: string
  className?: string
}

export function StatTile({ label, value, hint, className }: StatTileProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/50 bg-muted/15 px-3 py-2.5 transition-colors duration-200 hover:bg-muted/25",
        className,
      )}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-lg font-semibold tabular-nums tracking-tight">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground/80">{hint}</p>
      ) : null}
    </div>
  )
}

type StatGridProps = {
  children: React.ReactNode
  columns?: 2 | 3 | 4
  className?: string
}

export function StatGrid({
  children,
  columns = 3,
  className,
}: StatGridProps) {
  const cols =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 4
        ? "sm:grid-cols-2 xl:grid-cols-4"
        : "sm:grid-cols-3"

  return (
    <div className={cn("grid gap-3", cols, className)}>{children}</div>
  )
}
