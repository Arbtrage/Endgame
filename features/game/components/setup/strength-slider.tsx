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
    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 font-mono text-sm tabular-nums ring-1 ring-white/10">
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
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-primary"
        style={{
          background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${percent}%, rgba(255,255,255,0.1) ${percent}%, rgba(255,255,255,0.1) 100%)`,
        }}
      />
      <div className="flex justify-between text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        <span>Easier</span>
        <span>Stronger</span>
      </div>
    </div>
  );
}
