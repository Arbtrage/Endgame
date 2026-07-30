"use client";

import { cn } from "@/shared/lib/utils";

type StrengthSliderProps = {
  id: string;
  value: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
};

export function StrengthSlider({
  id,
  value,
  onChange,
  label,
  min = 1,
  max = 20,
}: StrengthSliderProps) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <span className="rounded-md bg-background px-2 py-0.5 font-mono text-sm tabular-nums">
          {value}/{max}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
        style={{
          background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${percent}%, var(--border) ${percent}%, var(--border) 100%)`,
        }}
      />
      <div className="flex justify-between text-[11px] uppercase tracking-wide text-muted-foreground">
        <span>Easier</span>
        <span>Stronger</span>
      </div>
    </div>
  );
}
