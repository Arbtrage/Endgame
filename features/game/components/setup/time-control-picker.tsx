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
    <div className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-3">
      {PRESETS.map((option) => {
        const selected = value === option;
        const preset = TIME_CONTROL_PRESETS[option];
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "w-full rounded-2xl border px-4 py-3 text-left transition-spring",
              selected
                ? "border-primary/50 bg-primary/10 ring-1 ring-primary/40"
                : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]",
            )}
          >
            <span className="text-sm font-medium leading-snug">{preset.label}</span>
          </button>
        );
      })}
    </div>
  );
}
