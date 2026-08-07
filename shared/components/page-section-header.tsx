import { cn } from "@/shared/lib/utils"

type PageSectionHeaderProps = {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function PageSectionHeader({
  title,
  description,
  action,
  className,
}: PageSectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-3",
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        <h2 className="text-sm font-semibold leading-snug">{title}</h2>
        {description ? (
          <p className="max-w-prose text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
