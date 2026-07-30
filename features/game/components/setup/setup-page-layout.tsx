import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

type SetupPageLayoutProps = {
  children: ReactNode;
  aside?: ReactNode;
  className?: string;
};

export function SetupPageLayout({
  children,
  aside,
  className,
}: SetupPageLayoutProps) {
  return (
    <div
      className={cn(
        "mx-auto grid h-full min-h-0 w-full gap-4 lg:gap-5",
        aside ? "max-w-5xl lg:grid-cols-[minmax(0,1fr)_240px]" : "max-w-3xl",
        className,
      )}
    >
      {children}
      {aside ? <div className="hidden min-h-0 lg:block">{aside}</div> : null}
    </div>
  );
}
