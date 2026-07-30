import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

type ViewportPageProps = {
  children: ReactNode;
  className?: string;
};

/** Fills the app main area without causing document scroll. */
export function ViewportPage({ children, className }: ViewportPageProps) {
  return (
    <div
      className={cn(
        "mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col overflow-hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}

type ViewportPageSectionProps = {
  children: ReactNode;
  className?: string;
  scrollable?: boolean;
  fill?: boolean;
};

export function ViewportPageSection({
  children,
  className,
  scrollable = false,
  fill = false,
}: ViewportPageSectionProps) {
  return (
    <div
      className={cn(
        "min-h-0",
        scrollable && "flex-1 overflow-y-auto",
        fill && "flex flex-1 flex-col",
        !scrollable && !fill && "shrink-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
