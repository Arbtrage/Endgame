"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
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

export function CoachGameSetup() {
  const router = useRouter();
  const { data: settings } = useQuery({
    queryKey: queryKeys.user.settings,
    queryFn: getSettings,
  });

  const [color, setColor] = useState<PlayerColor | "random">("white");
  const [stockfishLevel, setStockfishLevel] = useState<number | null>(null);
  const [timeControl, setTimeControl] =
    useState<TimeControlPreset>("unlimited");

  const effectiveStrength =
    stockfishLevel ?? settings?.defaultStockfishLevel ?? 5;

  const mutation = useMutation({
    mutationFn: createGame,
    onSuccess: (game) => {
      router.push(`/play/${game.id}`);
    },
    onError: () => toast.error("Unable to start game"),
  });

  const preset = TIME_CONTROL_PRESETS[timeControl];

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Coach Mode</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Play against a Marvel villain while your AI coach explains key moments.
        </p>

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

        <div className="space-y-2">
          <Label htmlFor="coach-strength">
            Opponent threat level: {effectiveStrength}/20
          </Label>
          <input
            id="coach-strength"
            type="range"
            min={1}
            max={20}
            value={effectiveStrength}
            onChange={(event) => setStockfishLevel(Number(event.target.value))}
            className="w-full"
          />
        </div>

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
              mode: "COACH",
              color,
              stockfishLevel: effectiveStrength,
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
          {mutation.isPending ? "Starting..." : "Start coached game"}
        </Button>
      </CardContent>
    </Card>
  );
}
