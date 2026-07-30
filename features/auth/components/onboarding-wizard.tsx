"use client";

import { useState } from "react";
import { toast } from "sonner";
import { completeOnboarding } from "@/shared/api/fetcher";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

const skillLevels = [
  { value: 900, label: "Beginner (~900)" },
  { value: 1200, label: "Casual (~1200)" },
  { value: 1600, label: "Club (~1600)" },
  { value: 2000, label: "Advanced (~2000)" },
];

export function OnboardingWizard({
  open,
  onComplete,
}: {
  open: boolean;
  onComplete: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function selectLevel(skillEstimate: number) {
    setLoading(true);
    try {
      await completeOnboarding({ skillEstimate, onboardingComplete: true });
      onComplete();
    } catch {
      toast.error("Unable to save onboarding preferences");
    } finally {
      setLoading(false);
    }
  }

  async function skip() {
    setLoading(true);
    try {
      await completeOnboarding({ onboardingComplete: true });
      onComplete();
    } catch {
      toast.error("Unable to skip onboarding");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>What&apos;s your chess level?</DialogTitle>
          <DialogDescription>
            This helps the AI coach tailor explanations to you. You can change this later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          {skillLevels.map((level) => (
            <Button
              key={level.value}
              variant="outline"
              disabled={loading}
              onClick={() => selectLevel(level.value)}
            >
              {level.label}
            </Button>
          ))}
          <Button variant="ghost" disabled={loading} onClick={skip}>
            Skip for now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
