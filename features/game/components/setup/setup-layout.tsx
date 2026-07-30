import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { FeaturePanel } from "@/shared/components/feature-page";

type SetupShellProps = {
  children: ReactNode;
  footer: ReactNode;
};

/** Full-height setup panel with sticky start action. */
export function SetupShell({ children, footer }: SetupShellProps) {
  return (
    <FeaturePanel footer={footer} bodyClassName="flex min-h-0 flex-1 flex-col p-0">
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </FeaturePanel>
  );
}

type SetupSplitLayoutProps = {
  sidebar: ReactNode;
  children: ReactNode;
};

/** Sidebar + form — used by Villain and Coach modes. */
export function SetupSplitLayout({ sidebar, children }: SetupSplitLayoutProps) {
  return (
    <div className="flex min-h-0 flex-col lg:flex-row">
      <aside className="shrink-0 border-b border-border/60 bg-muted/15 p-5 lg:w-72 lg:border-b-0 lg:border-r xl:w-80">
        {sidebar}
      </aside>
      <div className="flex min-h-0 flex-1 flex-col gap-6 p-5 sm:p-6">{children}</div>
    </div>
  );
}

type SetupSidebarProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  badges?: string[];
  tips: string[];
};

export function SetupSidebar({
  icon: Icon,
  title,
  description,
  badges,
  tips,
}: SetupSidebarProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" aria-hidden />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-sm font-semibold leading-snug">{title}</h2>
          <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>

      {badges?.length ? (
        <div className="flex flex-wrap gap-1.5">
          {badges.map((name) => (
            <span
              key={name}
              className="rounded-md border border-border/60 bg-background/80 px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              {name}
            </span>
          ))}
        </div>
      ) : null}

      <ul className="space-y-2.5 border-t border-border/50 pt-4">
        {tips.map((tip) => (
          <li key={tip} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type SetupCalloutProps = {
  icon: LucideIcon;
  title: string;
  body: string;
  badges?: string[];
  className?: string;
};

/** Inline info banner — used on Hero setup. */
export function SetupCallout({
  icon: Icon,
  title,
  body,
  badges,
  className,
}: SetupCalloutProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-muted/20 px-4 py-3.5 sm:px-5",
        className,
      )}
    >
      <div className="flex gap-3">
        <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <div className="min-w-0 space-y-2">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-snug">{title}</p>
            <p className="text-xs leading-relaxed text-muted-foreground">{body}</p>
          </div>
          {badges?.length ? (
            <div className="flex flex-wrap gap-1.5">
              {badges.map((name) => (
                <span
                  key={name}
                  className="rounded-md border border-border/60 bg-background/80 px-2 py-0.5 text-[11px] text-muted-foreground"
                >
                  {name}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

type SetupQuickRowProps = {
  children: ReactNode;
};

/** Side-by-side compact options (color + time). */
export function SetupQuickRow({ children }: SetupQuickRowProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">{children}</div>
  );
}
