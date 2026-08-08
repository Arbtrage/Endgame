"use client";

import { IslandNav } from "@/shared/components/island-nav";
import { marketingNavLinks } from "@/shared/lib/nav-config";
import { cn } from "@/shared/lib/utils";

export function MarketingShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative min-h-[100dvh] bg-background", className)}>
      <IslandNav links={marketingNavLinks} />
      <main className="relative z-10">{children}</main>
    </div>
  );
}
