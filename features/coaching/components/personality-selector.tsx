"use client";

import { Label } from "@/shared/ui/label";
import { PersonalityCard } from "@/features/coaching/components/personality-card";
import { PERSONALITIES } from "@/features/coaching/types/personalities";

type PersonalitySelectorProps = {
  value: string;
  onChange: (personalityId: string) => void;
};

export function PersonalitySelector({
  value,
  onChange,
}: PersonalitySelectorProps) {
  return (
    <div className="space-y-2">
      <Label>AI personality</Label>
      <div className="grid gap-3 sm:grid-cols-2">
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
