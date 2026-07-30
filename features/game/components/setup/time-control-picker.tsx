"use client";

import { cn } from "@/shared/lib/utils";
import type { TimeControlPreset } from "@/features/game/types";
import { TIME_CONTROL_PRESETS } from "@/features/game/types";

type TimeControlPickerProps = {
  value: TimeControlPreset;
  onChange: (value: TimeControlPreset) => void;
};

const PRESETS = Object.keys(TIME_CONTROL_PRESETS) as TimeControlPreset[];

export function TimeControlPicker({ value, onChange }: TimeControlPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRESETS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
            value === option
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background hover:border-primary/40 hover:bg-muted/40",
          )}
        >
          {TIME_CONTROL_PRESETS[option].label}
        </button>
      ))}
    </div>
  );
}
