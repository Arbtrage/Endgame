import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { BezelCard } from "@/shared/components/bezel-card";
import { Eyebrow } from "@/shared/components/eyebrow";
import { cn } from "@/shared/lib/utils";
import { iconClass } from "@/shared/components/icon";

type FeaturePageProps = {
  children: ReactNode;
  className?: string;
};

export function FeaturePage({ children, className }: FeaturePageProps) {
  return (
    <div className={cn("mx-auto flex w-full max-w-7xl flex-col gap-6 md:gap-8", className)}>
      {children}
    </div>
  );
}

type FeatureHeroProps = {
  icon: PhosphorIcon;
  eyebrow?: string;
  title: string;
  description: string;
  hint?: string;
  action?: ReactNode;
};

export function FeatureHero({
  icon: Icon,
  eyebrow,
  title,
  description,
  hint,
  action,
}: FeatureHeroProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-6 pb-2">
      <div className="max-w-2xl space-y-4">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/25">
            <Icon className={iconClass("md")} weight="light" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {title}
            </h1>
            <p className="max-w-prose text-pretty text-muted-foreground">
              {description}
            </p>
            {hint ? (
              <p className="text-xs text-muted-foreground/80">{hint}</p>
            ) : null}
          </div>
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

type FeaturePanelProps = {
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  bodyClassName?: string;
};

export function FeaturePanel({
  children,
  footer,
  className,
  bodyClassName,
}: FeaturePanelProps) {
  return (
    <BezelCard padding="md" className={className} innerClassName={bodyClassName}>
      {children}
      {footer ? (
        <div className="mt-6 border-t border-white/10 pt-4">{footer}</div>
      ) : null}
    </BezelCard>
  );
}

type FeatureSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
};

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
        <div className="space-y-1">
          <h2 className="font-display text-lg font-semibold">{title}</h2>
          {description ? (
            <p className="max-w-prose text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
