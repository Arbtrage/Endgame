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
import { cn } from "@/shared/lib/utils";

const skillLevels = [
  { value: 900, label: "Beginner", hint: "~900 · learning the basics" },
  { value: 1200, label: "Casual", hint: "~1200 · know the rules well" },
  { value: 1600, label: "Club", hint: "~1600 · regular tournament play" },
  { value: 2000, label: "Advanced", hint: "~2000 · deep opening prep" },
];

const goals = [
  { id: "coach", label: "Get coached while I play", href: "/play/coach" },
  { id: "analyze", label: "Review my games deeply", href: "/analyze" },
  { id: "train", label: "Fix specific weaknesses", href: "/train" },
];

export function OnboardingWizard({
  open,
  onComplete,
}: {
  open: boolean;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(0);
  const [skillEstimate, setSkillEstimate] = useState<number | null>(null);
  const [recommendedHref, setRecommendedHref] = useState("/play/coach");
  const [loading, setLoading] = useState(false);

  async function finish(onboarding: {
    skillEstimate?: number;
    onboardingComplete: boolean;
  }) {
    setLoading(true);
    try {
      await completeOnboarding(onboarding);
      onComplete();
    } catch {
      toast.error("Unable to save onboarding preferences");
    } finally {
      setLoading(false);
    }
  }

  async function completeFlow() {
    await finish({
      skillEstimate: skillEstimate ?? undefined,
      onboardingComplete: true,
    });
  }

  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false} className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === 0
              ? "What's your rating range?"
              : step === 1
                ? "What do you want to work on?"
                : "You're set"}
          </DialogTitle>
          <DialogDescription>
            {step === 0
              ? "The coach adjusts explanation depth based on your level."
              : step === 1
                ? "We'll suggest a starting point — you can change it anytime."
                : "Your preferences are saved. Start with the mode that fits your goal."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                index <= step ? "bg-primary" : "bg-muted",
              )}
            />
          ))}
        </div>

        {step === 0 ? (
          <div className="grid gap-2">
            {skillLevels.map((level) => (
              <button
                key={level.value}
                type="button"
                disabled={loading}
                onClick={() => {
                  setSkillEstimate(level.value);
                  setStep(1);
                }}
                className={cn(
                  "rounded-xl border border-border/50 px-4 py-3 text-left transition-colors hover:border-primary/30 hover:bg-muted/20",
                  skillEstimate === level.value && "border-primary/40 bg-primary/5",
                )}
              >
                <p className="text-sm font-semibold">{level.label}</p>
                <p className="text-xs text-muted-foreground">{level.hint}</p>
              </button>
            ))}
            <Button
              variant="ghost"
              disabled={loading}
              onClick={() => setStep(1)}
            >
              Skip for now
            </Button>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid gap-2">
            {goals.map((goal) => (
              <button
                key={goal.id}
                type="button"
                disabled={loading}
                onClick={() => {
                  setRecommendedHref(goal.href);
                  setStep(2);
                }}
                className="rounded-xl border border-border/50 px-4 py-3 text-left text-sm font-medium transition-colors hover:border-primary/30 hover:bg-muted/20"
              >
                {goal.label}
              </button>
            ))}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-border/50 bg-muted/10 p-4">
              <p className="text-sm font-medium">Recommended starting point</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {recommendedHref === "/play/coach"
                  ? "Coach mode — explanations while you play"
                  : recommendedHref === "/analyze"
                    ? "Analysis hub — review finished games"
                    : "Training — puzzles from your weaknesses"}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button disabled={loading} onClick={completeFlow} className="flex-1">
                {loading ? "Saving..." : "Go to dashboard"}
              </Button>
              <Button
                variant="outline"
                disabled={loading}
                className="flex-1"
                onClick={() => {
                  void completeFlow().then(() => {
                    window.location.href = recommendedHref;
                  });
                }}
              >
                Start now
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
