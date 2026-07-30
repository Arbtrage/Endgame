"use client";

import { Loader2 } from "lucide-react";

type OpponentThinkingProps = {
  label?: string;
};

export function OpponentThinking({
  label = "Opponent is thinking...",
}: OpponentThinkingProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}
