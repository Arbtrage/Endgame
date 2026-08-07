import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/shared/lib/utils"
import {
  ViewportPage,
  ViewportPageSection,
} from "@/shared/components/viewport-page"

type FeaturePageProps = {
  children: ReactNode
  className?: string
}

export function FeaturePage({ children, className }: FeaturePageProps) {
  return (
    <ViewportPage className={cn("gap-4", className)}>
      {children}
    </ViewportPage>
  )
}

type FeatureHeroProps = {
  icon: LucideIcon
  title: string
  description: string
  hint?: string
  action?: ReactNode
  variant?: "default" | "compact" | "split" | "inline"
}

export function FeatureHero({
  icon: Icon,
  title,
  description,
  hint,
  action,
  variant = "default",
}: FeatureHeroProps) {
  if (variant === "inline") {
    return (
      <ViewportPageSection>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-1.5">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {title}
            </h1>
            <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
            {hint ? (
              <p className="text-xs text-muted-foreground/80">{hint}</p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </ViewportPageSection>
    )
  }

  if (variant === "compact") {
    return (
      <ViewportPageSection>
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </ViewportPageSection>
    )
  }

  if (variant === "split") {
    return (
      <ViewportPageSection>
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border/50 bg-card/40 px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" aria-hidden />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {title}
              </h1>
              <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
              {hint ? (
                <p className="text-xs text-muted-foreground/80">{hint}</p>
              ) : null}
            </div>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </ViewportPageSection>
    )
  }

  return (
    <ViewportPageSection>
      <div className="surface-grain rounded-xl border border-border/50 bg-card/40 px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="space-y-1.5">
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {title}
              </h1>
              <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
            {hint ? (
              <p className="text-xs leading-relaxed text-muted-foreground/80">
                {hint}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </div>
    </ViewportPageSection>
  )
}

type FeaturePanelProps = {
  children: ReactNode
  footer?: ReactNode
  className?: string
  bodyClassName?: string
  scrollable?: boolean
}

export function FeaturePanel({
  children,
  footer,
  className,
  bodyClassName,
  scrollable = true,
}: FeaturePanelProps) {
  return (
    <ViewportPageSection scrollable fill className={className}>
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border/50 bg-card/40 shadow-elevated">
        <div
          className={cn(
            "min-h-0 flex-1",
            scrollable && "overflow-y-auto",
            bodyClassName ?? "p-5 sm:p-6",
          )}
        >
          {children}
        </div>
        {footer ? (
          <div className="shrink-0 border-t border-border/50 bg-muted/15 px-5 py-4 sm:px-6">
            <div className="mx-auto w-full">{footer}</div>
          </div>
        ) : null}
      </div>
    </ViewportPageSection>
  )
}

type FeatureSectionProps = {
  title: string
  description?: string
  children: ReactNode
  action?: ReactNode
  className?: string
}

export function FeatureSection({
  title,
  description,
  children,
  action,
  className,
}: FeatureSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1.5">
          <h2 className="text-sm font-semibold leading-snug">{title}</h2>
          {description ? (
            <p className="max-w-prose text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  )
}
