"use client";

import { cn } from "@/shared/lib/utils";
import type { PlayerColor } from "@/features/game/types";

type ColorPickerProps = {
  value: PlayerColor | "random";
  onChange: (value: PlayerColor | "random") => void;
};

const OPTIONS = [
  { value: "white" as const, label: "White", hint: "Move first" },
  { value: "black" as const, label: "Black", hint: "Respond" },
  { value: "random" as const, label: "Random", hint: "Surprise me" },
];

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "w-full rounded-xl border px-4 py-3 text-left transition-all",
              selected
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border bg-card hover:border-primary/40 hover:bg-muted/30",
            )}
          >
            <span className="block font-medium leading-snug">{option.label}</span>
            <span className="mt-1.5 block text-xs leading-relaxed text-muted-foreground">
              {option.hint}
            </span>
          </button>
        );
      })}
    </div>
  );
}
