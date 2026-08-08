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

const optionClass = (selected: boolean) =>
  cn(
    "w-full rounded-2xl border px-4 py-3 text-left transition-spring",
    selected
      ? "border-primary/50 bg-primary/10 ring-1 ring-primary/40"
      : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]",
  );

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-3">
      {OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={optionClass(selected)}
          >
            <span className="block text-sm font-medium leading-snug">
              {option.label}
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
              {option.hint}
            </span>
          </button>
        );
      })}
    </div>
  );
}
