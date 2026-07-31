"use client";

import { Label } from "@/shared/ui/label";
import { PersonalityCard } from "@/features/coaching/components/personality-card";
import { PERSONALITIES } from "@/features/coaching/types/personalities";
import { cn } from "@/shared/lib/utils";

type PersonalitySelectorProps = {
  value: string;
  onChange: (personalityId: string) => void;
  label?: string;
  showLabel?: boolean;
  stacked?: boolean;
};

export function PersonalitySelector({
  value,
  onChange,
  label = "Playing style",
  showLabel = true,
  stacked = false,
}: PersonalitySelectorProps) {
  return (
    <div className="space-y-3">
      {showLabel ? <Label>{label}</Label> : null}
      <div
        className={cn(
          "grid grid-cols-1 gap-2",
          !stacked && "sm:grid-cols-2 xl:grid-cols-3",
        )}
      >
        {PERSONALITIES.map((personality) => (
          <PersonalityCard
            key={personality.id}
            personality={personality}
            selected={value === personality.id}
            onSelect={() => onChange(personality.id)}
          />
        ))}
      </div>
    </div>
  );
}
