"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { completeOnboarding } from "@/shared/api/fetcher";
import { BezelCard } from "@/shared/components/bezel-card";
import { Eyebrow } from "@/shared/components/eyebrow";
import { PillButton } from "@/shared/components/pill-cta";
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
      <DialogContent
        showCloseButton={false}
        className="max-w-xl border-0 bg-transparent p-0 shadow-none"
      >
        <BezelCard padding="lg" className="glass-surface">
          <DialogHeader className="text-left">
            <Eyebrow className="mb-3">Welcome</Eyebrow>
            <DialogTitle className="font-display text-2xl tracking-tight">
              {step === 0
                ? "What's your rating range?"
                : step === 1
                  ? "What do you want to work on?"
                  : "You're set"}
            </DialogTitle>
            <DialogDescription className="text-pretty">
              {step === 0
                ? "The coach adjusts explanation depth based on your level."
                : step === 1
                  ? "We'll suggest a starting point — you can change it anytime."
                  : "Your preferences are saved. Start with the mode that fits your goal."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 flex gap-2">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={cn(
                  "h-1 flex-1 rounded-full transition-spring",
                  index <= step ? "bg-primary" : "bg-white/10",
                )}
              />
            ))}
          </div>

          {step === 0 ? (
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
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
                    "rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left transition-spring hover:border-primary/30 hover:bg-white/[0.06]",
                    skillEstimate === level.value &&
                      "border-primary/40 bg-primary/10",
                  )}
                >
                  <p className="text-sm font-semibold">{level.label}</p>
                  <p className="text-xs text-muted-foreground">{level.hint}</p>
                </button>
              ))}
              <button
                type="button"
                disabled={loading}
                onClick={() => setStep(1)}
                className="col-span-full text-sm text-muted-foreground hover:text-foreground"
              >
                Skip for now
              </button>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="mt-6 grid gap-2">
              {goals.map((goal) => (
                <button
                  key={goal.id}
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setRecommendedHref(goal.href);
                    setStep(2);
                  }}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-left text-sm font-medium transition-spring hover:border-primary/30 hover:bg-white/[0.06]"
                >
                  {goal.label}
                </button>
              ))}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
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
                <PillButton
                  disabled={loading}
                  onClick={completeFlow}
                  className="flex-1 justify-center"
                >
                  {loading ? "Saving..." : "Go to dashboard"}
                </PillButton>
                <Link
                  href={recommendedHref}
                  onClick={(e) => {
                    e.preventDefault();
                    void completeFlow().then(() => {
                      window.location.href = recommendedHref;
                    });
                  }}
                  className="flex flex-1 items-center justify-center rounded-full border border-white/10 px-6 py-3 text-sm font-medium transition-spring hover:bg-white/[0.06]"
                >
                  Start now
                </Link>
              </div>
            </div>
          ) : null}
        </BezelCard>
      </DialogContent>
    </Dialog>
  );
}
