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
    <div className="grid grid-cols-1 gap-2">
      {PRESETS.map((option) => {
        const selected = value === option;
        const preset = TIME_CONTROL_PRESETS[option];
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "w-full rounded-xl border px-4 py-3 text-left transition-all",
              selected
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border bg-card hover:border-primary/40 hover:bg-muted/30",
            )}
          >
            <span className="font-medium leading-snug">{preset.label}</span>
          </button>
        );
      })}
    </div>
  );
}
