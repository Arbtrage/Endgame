"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Shuffle, Sword } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ColorPicker } from "@/features/game/components/setup/color-picker";
import {
  SetupShell,
  SetupSidebar,
  SetupSplitLayout,
  SetupQuickRow,
} from "@/features/game/components/setup/setup-layout";
import { SetupSection } from "@/features/game/components/setup/setup-section";
import {
  SAMPLE_VILLAINS,
  VILLAIN_SIDEBAR,
} from "@/features/game/components/setup/setup-hints";
import { StrengthSlider } from "@/features/game/components/setup/strength-slider";
import { TimeControlPicker } from "@/features/game/components/setup/time-control-picker";
import {
  TIME_CONTROL_PRESETS,
  type PlayerColor,
  type TimeControlPreset,
} from "@/features/game/types";
import { createGame, getSettings } from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import { PillButton } from "@/shared/components/pill-cta";
import { Button } from "@/shared/ui/button";

type GameSetupProps = {
  onSuccess?: (gameId: string) => void;
};

export function GameSetup({ onSuccess }: GameSetupProps = {}) {
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
      if (onSuccess) {
        onSuccess(game.id);
      } else {
        router.push(`/play/${game.id}`);
      }
    },
    onError: () => toast.error("Unable to start game"),
  });

  const preset = TIME_CONTROL_PRESETS[timeControl];
  const embedded = Boolean(onSuccess);

  const startButton = (
    <PillButton
      className="w-full justify-center"
      disabled={mutation.isPending}
      onClick={() =>
        mutation.mutate({
          mode: "COMPUTER",
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
      {mutation.isPending ? "Starting match..." : "Start match"}
    </PillButton>
  );

  return (
    <SetupShell
      embedded={embedded}
      footer={
        embedded ? (
          startButton
        ) : (
          <Button
            className="h-11 w-full text-base"
            disabled={mutation.isPending}
            onClick={() =>
              mutation.mutate({
                mode: "COMPUTER",
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
            <Sword className="mr-2 size-4" weight="light" />
            {mutation.isPending ? "Starting match..." : "Start match"}
          </Button>
        )
      }
    >
      <SetupSplitLayout
        embedded={embedded}
        sidebar={
          <SetupSidebar
            icon={Shuffle}
            title={VILLAIN_SIDEBAR.title}
            description={VILLAIN_SIDEBAR.description}
            badges={[...SAMPLE_VILLAINS]}
            tips={[...VILLAIN_SIDEBAR.tips]}
          />
        }
      >
        {embedded ? (
          <>
            <SetupQuickRow>
              <SetupSection
                title="Your color"
                description="Which side you play."
              >
                <ColorPicker value={color} onChange={setColor} />
              </SetupSection>
              <SetupSection title="Time control" description="Optional clock.">
                <TimeControlPicker value={timeControl} onChange={setTimeControl} />
              </SetupSection>
            </SetupQuickRow>
            <SetupSection
              title="Villain threat level"
              description="How sharp the engine plays."
            >
              <StrengthSlider
                id="strength"
                label="Level"
                value={effectiveStrength}
                onChange={setStockfishLevel}
              />
            </SetupSection>
          </>
        ) : (
          <>
            <SetupSection
              title="Your color"
              description="Which side of the board you play."
            >
              <ColorPicker value={color} onChange={setColor} />
            </SetupSection>

            <SetupSection
              title="Villain threat level"
              description="How sharp the engine plays."
            >
              <StrengthSlider
                id="strength"
                label="Level"
                value={effectiveStrength}
                onChange={setStockfishLevel}
              />
            </SetupSection>

            <SetupSection
              title="Time control"
              description="Leave unlimited if you're still learning."
            >
              <TimeControlPicker value={timeControl} onChange={setTimeControl} />
            </SetupSection>
          </>
        )}
      </SetupSplitLayout>
    </SetupShell>
  );
}
