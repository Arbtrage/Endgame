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
        "w-full rounded-2xl border p-3 text-left transition-spring sm:p-4",
        selected
          ? "border-primary/50 bg-primary/10 ring-1 ring-primary/40"
          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]",
      )}
    >
      <div className="text-sm font-medium leading-snug">{personality.name}</div>
      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {personality.description}
      </p>
      <p className="mt-1.5 text-[11px] text-muted-foreground">
        ~{personality.skillRange} Elo
      </p>
    </button>
  );
}
