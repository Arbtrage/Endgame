import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import {
  ViewportPage,
  ViewportPageSection,
} from "@/shared/components/viewport-page";

type FeaturePageProps = {
  children: ReactNode;
  className?: string;
};

export function FeaturePage({ children, className }: FeaturePageProps) {
  return (
    <ViewportPage className={cn("gap-4", className)}>
      {children}
    </ViewportPage>
  );
}

type FeatureHeroProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  hint?: string;
};

export function FeatureHero({
  icon: Icon,
  title,
  description,
  hint,
}: FeatureHeroProps) {
  return (
    <ViewportPageSection>
      <div className="rounded-xl border border-border/60 bg-gradient-to-br from-muted/40 via-background to-background px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 space-y-2">
            <div className="space-y-1.5">
              <h1 className="text-xl font-semibold leading-tight tracking-tight sm:text-2xl">
                {title}
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
            {hint ? (
              <p className="text-xs leading-relaxed text-muted-foreground/80">
                {hint}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </ViewportPageSection>
  );
}

type FeaturePanelProps = {
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  bodyClassName?: string;
  scrollable?: boolean;
};

export function FeaturePanel({
  children,
  footer,
  className,
  bodyClassName,
  scrollable = true,
}: FeaturePanelProps) {
  return (
    <ViewportPageSection scrollable fill className={className}>
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border/60 bg-card/40">
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
          <div className="shrink-0 border-t border-border/60 bg-muted/20 px-5 py-4 sm:px-6">
            <div className="mx-auto w-full">{footer}</div>
          </div>
        ) : null}
      </div>
    </ViewportPageSection>
  );
}

type FeatureSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function FeatureSection({
  title,
  description,
  children,
  className,
}: FeatureSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="space-y-1.5">
        <h2 className="text-sm font-medium leading-snug">{title}</h2>
        {description ? (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
