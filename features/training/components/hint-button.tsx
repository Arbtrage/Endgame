"use client";

import { useState } from "react";
import { Lightbulb } from "lucide-react";
import { requestHint } from "@/shared/api/fetcher";
import { Button } from "@/shared/ui/button";
import { toast } from "sonner";

type HintButtonProps = {
  lessonId: string;
  exerciseIndex: number;
};

export function HintButton({ lessonId, exerciseIndex }: HintButtonProps) {
  const [hintLevel, setHintLevel] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [solution, setSolution] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleHint() {
    if (hintLevel >= 3) return;
    setLoading(true);
    try {
      const nextLevel = hintLevel + 1;
      const result = await requestHint(lessonId, {
        exerciseIndex,
        hintLevel: nextLevel,
      });
      setHintLevel(nextLevel);
      setHint(result.hint);
      if (result.showSolution && result.solution) {
        setSolution(result.solution);
      }
    } catch {
      toast.error("Could not load hint");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2 text-center">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={loading || hintLevel >= 3}
        onClick={handleHint}
      >
        <Lightbulb className="size-4" />
        Hint ({hintLevel}/3)
      </Button>
      {hint ? (
        <p className="max-w-sm text-sm text-muted-foreground">{hint}</p>
      ) : null}
      {solution ? (
        <p className="text-sm font-medium text-primary">Solution: {solution}</p>
      ) : null}
    </div>
  );
}
