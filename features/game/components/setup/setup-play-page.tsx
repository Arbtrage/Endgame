import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { FeaturePage } from "@/shared/components/feature-page";
import { ViewportPageSection } from "@/shared/components/viewport-page";

type SetupPlayPageProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
};

export function SetupPlayPage({
  icon: Icon,
  title,
  description,
  children,
}: SetupPlayPageProps) {
  return (
    <FeaturePage>
      <ViewportPageSection>
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" aria-hidden />
          </div>
          <div className="min-w-0 space-y-0.5">
            <h1 className="text-lg font-semibold leading-tight tracking-tight sm:text-xl">
              {title}
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
      </ViewportPageSection>
      <ViewportPageSection scrollable fill className="min-h-0">
        {children}
      </ViewportPageSection>
    </FeaturePage>
  );
}
