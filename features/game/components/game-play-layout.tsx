"use client";

import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

type GamePlayLayoutProps = {
  header: ReactNode;
  board: ReactNode;
  sidebar: ReactNode;
  extraColumn?: ReactNode;
  banner?: ReactNode;
  variant?: "standard" | "coach";
};

export function GamePlayLayout({
  header,
  board,
  sidebar,
  extraColumn,
  banner,
  variant = "standard",
}: GamePlayLayoutProps) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0">{header}</div>
      {banner ? <div className="mt-3 shrink-0">{banner}</div> : null}

      <div
        className={cn(
          "mt-4 grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(140px,280px)] gap-3 sm:gap-4 lg:gap-5",
          variant === "coach" &&
            "xl:grid-cols-[minmax(0,1fr)_minmax(140px,280px)_minmax(160px,300px)]",
        )}
      >
        <div className="flex h-full min-h-0 min-w-0 flex-col">{board}</div>
        <div className="flex min-h-0 min-w-0 flex-col">{sidebar}</div>
        {extraColumn ? (
          <div
            className={cn(
              "hidden min-h-0 min-w-0 flex-col xl:flex",
              variant === "coach" && "col-span-2 xl:col-span-1",
            )}
          >
            {extraColumn}
          </div>
        ) : null}
      </div>
    </div>
  );
}
