"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Swords } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PersonalitySelector } from "@/features/coaching/components/personality-selector";
import { ColorPicker } from "@/features/game/components/setup/color-picker";
import {
  SetupCallout,
  SetupQuickRow,
  SetupShell,
} from "@/features/game/components/setup/setup-layout";
import { SetupSection } from "@/features/game/components/setup/setup-section";
import {
  HERO_CALLOUT,
  SAMPLE_HEROES,
} from "@/features/game/components/setup/setup-hints";
import { TimeControlPicker } from "@/features/game/components/setup/time-control-picker";
import {
  TIME_CONTROL_PRESETS,
  type PlayerColor,
  type TimeControlPreset,
} from "@/features/game/types";
import { createGame, getSettings } from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import { Button } from "@/shared/ui/button";

type AiGameSetupProps = {
  onSuccess?: (gameId: string) => void;
};

export function AiGameSetup({ onSuccess }: AiGameSetupProps = {}) {
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
      if (onSuccess) {
        onSuccess(game.id);
      } else {
        router.push(`/play/${game.id}`);
      }
    },
    onError: () => toast.error("Unable to start game"),
  });

  const preset = TIME_CONTROL_PRESETS[timeControl];

  return (
    <SetupShell
      footer={
        <Button
          className="h-10 w-full text-base sm:max-w-xs"
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
          <Swords className="mr-2 size-4" />
          {mutation.isPending ? "Summoning hero..." : "Start hero match"}
        </Button>
      }
    >
      <div className="flex flex-col gap-6 p-5 sm:p-6">
        <SetupQuickRow>
          <SetupSection title="Your color" description="Side you control.">
            <ColorPicker value={color} onChange={setColor} />
          </SetupSection>

          <SetupSection title="Time control" description="Optional clock.">
            <TimeControlPicker value={timeControl} onChange={setTimeControl} />
          </SetupSection>
        </SetupQuickRow>

        <SetupCallout
          icon={HERO_CALLOUT.icon}
          title={HERO_CALLOUT.title}
          body={HERO_CALLOUT.body}
          badges={[...SAMPLE_HEROES]}
        />

        <SetupSection
          title="Playing style"
          description="Difficulty and personality — pick how your hero approaches the game."
        >
          <PersonalitySelector
            value={effectivePersonality}
            onChange={setPersonality}
            showLabel={false}
          />
        </SetupSection>
      </div>
    </SetupShell>
  );
}
