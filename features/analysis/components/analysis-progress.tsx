"use client";

import { Loader2, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import type { AnalysisProgress } from "../types";

type AnalysisProgressProps = {
  progress: AnalysisProgress;
  onCancel?: () => void;
};

export function AnalysisProgressBar({
  progress,
  onCancel,
}: AnalysisProgressProps) {
  const percent =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border/60 bg-card p-8 text-center">
      <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
      <div className="w-full max-w-sm space-y-2">
        <p className="text-sm font-medium">
          {progress.message ?? "Analyzing game…"}
        </p>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {progress.current} / {progress.total} moves ({percent}%)
        </p>
      </div>
      {onCancel ? (
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          <X className="size-4" />
          Cancel
        </Button>
      ) : null}
    </div>
  );
}
