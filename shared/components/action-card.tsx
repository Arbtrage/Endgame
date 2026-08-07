import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/shared/lib/utils"

type ActionCardProps = {
  href: string
  title: string
  description: string
  icon: LucideIcon
  footer?: React.ReactNode
  className?: string
}

export function ActionCard({
  href,
  title,
  description,
  icon: Icon,
  footer,
  className,
}: ActionCardProps) {
  return (
    <Link href={href} className={cn("group block h-full", className)}>
      <div className="flex h-full flex-col rounded-xl border border-border/50 bg-card/60 p-4 shadow-elevated transition-[box-shadow,background-color,border-color] duration-200 hover:border-primary/30 hover:bg-muted/20 hover:shadow-elevated-hover">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
          <Icon className="size-4" aria-hidden />
        </div>
        <div className="mt-3 min-h-0 flex-1 space-y-1.5">
          <h3 className="text-sm font-semibold leading-snug">{title}</h3>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        {footer ? (
          <div className="mt-4 shrink-0 text-xs font-medium text-primary">
            {footer}
          </div>
        ) : (
          <div className="mt-4 shrink-0 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            Open →
          </div>
        )}
      </div>
    </Link>
  )
}

type ActionCardGridProps = {
  children: React.ReactNode
  className?: string
}

export function ActionCardGrid({ children, className }: ActionCardGridProps) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2", className)}>
      {children}
    </div>
  )
}
