"use client";

import { Label } from "@/shared/ui/label";
import { PersonalityCard } from "@/features/coaching/components/personality-card";
import { PERSONALITIES } from "@/features/coaching/types/personalities";

type PersonalitySelectorProps = {
  value: string;
  onChange: (personalityId: string) => void;
  label?: string;
  showLabel?: boolean;
};

export function PersonalitySelector({
  value,
  onChange,
  label = "Playing style",
  showLabel = true,
}: PersonalitySelectorProps) {
  return (
    <div className="space-y-3">
      {showLabel ? <Label>{label}</Label> : null}
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
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
