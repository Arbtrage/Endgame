"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";

type GameSummaryPanelProps = {
  summary: string | null;
  loading?: boolean;
  onGenerate?: () => void;
};

export function GameSummaryPanel({
  summary,
  loading,
  onGenerate,
}: GameSummaryPanelProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-4 text-sm">
        <Loader2 className="size-4 animate-spin" />
        Generating AI summary…
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
        <p className="text-sm text-muted-foreground">
          Get an AI narrative overview of this game.
        </p>
        {onGenerate ? (
          <Button type="button" size="sm" className="mt-3" onClick={onGenerate}>
            Generate summary
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
      <h3 className="mb-2 text-sm font-medium">Game summary</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
    </div>
  );
}
