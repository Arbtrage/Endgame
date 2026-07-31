"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Shuffle, Swords } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ColorPicker } from "@/features/game/components/setup/color-picker";
import {
  SetupShell,
  SetupSidebar,
  SetupSplitLayout,
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

  return (
    <SetupShell
      footer={
        <Button
          className="h-10 w-full text-base sm:max-w-xs"
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
          <Swords className="mr-2 size-4" />
          {mutation.isPending ? "Starting match..." : "Start match"}
        </Button>
      }
    >
      <SetupSplitLayout
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
      </SetupSplitLayout>
    </SetupShell>
  );
}
