"use client";

import { cn } from "@/shared/lib/utils";
import type { PersonalityConfig } from "@/shared/ai/personalities";

type PersonalityCardProps = {
  personality: PersonalityConfig;
  selected: boolean;
  onSelect: () => void;
};

export function PersonalityCard({
  personality,
  selected,
  onSelect,
}: PersonalityCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "rounded-lg border p-4 text-left transition-colors",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border hover:border-primary/50 hover:bg-muted/40",
      )}
    >
      <div className="font-medium">{personality.name}</div>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
        {personality.description}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        ~{personality.skillRange} Elo
      </p>
    </button>
  );
}
