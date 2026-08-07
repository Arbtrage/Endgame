"use client";

type OpponentThinkingProps = {
  label?: string;
};

export function OpponentThinking({
  label = "Opponent is thinking…",
}: OpponentThinkingProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
      <span className="relative flex size-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40" />
        <span className="relative inline-flex size-2 rounded-full bg-primary/70" />
      </span>
      {label}
    </div>
  );
}
