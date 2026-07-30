"use client";

import { AlertTriangle } from "lucide-react";

type CheckBannerProps = {
  variant: "player" | "opponent";
};

export function CheckBanner({ variant }: CheckBannerProps) {
  const message =
    variant === "player"
      ? "You're in check — protect your king!"
      : "Check!";

  return (
    <div
      role="status"
      className="flex items-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/15 px-3 py-2 text-sm font-medium text-amber-800 dark:text-amber-200"
    >
      <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
      {message}
    </div>
  );
}
