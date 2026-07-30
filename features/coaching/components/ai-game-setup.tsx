"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PersonalitySelector } from "@/features/coaching/components/personality-selector";
import {
  TIME_CONTROL_PRESETS,
  type PlayerColor,
  type TimeControlPreset,
} from "@/features/game/types";
import { createGame, getSettings } from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";

export function AiGameSetup() {
  const router = useRouter();
  const { data: settings } = useQuery({
    queryKey: queryKeys.user.settings,
    queryFn: getSettings,
  });

  const [color, setColor] = useState<PlayerColor | "random">("white");
  const [personality, setPersonality] = useState<string>("intermediate");
  const [timeControl, setTimeControl] =
    useState<TimeControlPreset>("unlimited");

  const effectivePersonality =
    personality || settings?.defaultAiPersonality || "intermediate";

  const mutation = useMutation({
    mutationFn: createGame,
    onSuccess: (game) => {
      router.push(`/play/${game.id}`);
    },
    onError: () => toast.error("Unable to start game"),
  });

  const preset = TIME_CONTROL_PRESETS[timeControl];

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Play vs AI</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Your color</Label>
          <div className="flex flex-wrap gap-2">
            {(["white", "black", "random"] as const).map((option) => (
              <Button
                key={option}
                type="button"
                variant={color === option ? "default" : "outline"}
                onClick={() => setColor(option)}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <PersonalitySelector
          value={effectivePersonality}
          onChange={setPersonality}
        />

        <div className="space-y-2">
          <Label>Time control</Label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(TIME_CONTROL_PRESETS) as TimeControlPreset[]).map(
              (option) => (
                <Button
                  key={option}
                  type="button"
                  variant={timeControl === option ? "default" : "outline"}
                  onClick={() => setTimeControl(option)}
                >
                  {TIME_CONTROL_PRESETS[option].label}
                </Button>
              ),
            )}
          </div>
        </div>

        <Button
          className="w-full"
          disabled={mutation.isPending}
          onClick={() =>
            mutation.mutate({
              mode: "AI_OPPONENT",
              color,
              aiPersonality: effectivePersonality,
              ...(preset.initial !== null
                ? {
                    timeControl: {
                      initial: preset.initial,
                      increment: preset.increment ?? 0,
                    },
                  }
                : {}),
            })
          }
        >
          {mutation.isPending ? "Starting..." : "Start game"}
        </Button>
      </CardContent>
    </Card>
  );
}
