"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ColorPicker } from "@/features/game/components/setup/color-picker";
import { TimeControlPicker } from "@/features/game/components/setup/time-control-picker";
import { SetupSection } from "@/features/game/components/setup/setup-section";
import { UserSearchCombobox } from "@/features/pvp/components/user-search-combobox";
import {
  TIME_CONTROL_PRESETS,
  type PlayerColor,
  type TimeControlPreset,
} from "@/features/game/types";
import { createPvpInvite } from "@/shared/api/fetcher";
import type { UserSearchResult } from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import { PillButton } from "@/shared/components/pill-cta";

type PvpChallengeFormProps = {
  onSuccess?: () => void;
};

export function PvpChallengeForm({ onSuccess }: PvpChallengeFormProps) {
  const queryClient = useQueryClient();
  const [opponent, setOpponent] = useState<UserSearchResult | null>(null);
  const [color, setColor] = useState<PlayerColor | "random">("random");
  const [timeControl, setTimeControl] = useState<TimeControlPreset>("rapid");

  const mutation = useMutation({
    mutationFn: createPvpInvite,
    onSuccess: () => {
      toast.success("Challenge sent");
      void queryClient.invalidateQueries({ queryKey: queryKeys.pvp.invites });
      setOpponent(null);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const preset = TIME_CONTROL_PRESETS[timeControl];

  return (
    <div className="space-y-5">
      <SetupSection title="Opponent" description="Search by name or email">
        <UserSearchCombobox value={opponent} onChange={setOpponent} />
      </SetupSection>
      <SetupSection title="Your color" description="Side you prefer.">
        <ColorPicker value={color} onChange={setColor} />
      </SetupSection>
      <SetupSection title="Time control" description="Clock for both players.">
        <TimeControlPicker value={timeControl} onChange={setTimeControl} />
      </SetupSection>
      <PillButton
        className="w-full justify-center"
        disabled={!opponent || mutation.isPending}
        onClick={() => {
          if (!opponent) return;
          mutation.mutate({
            inviteeId: opponent.id,
            inviterColor: color,
            timeControl:
              preset.initial !== null
                ? { initial: preset.initial, increment: preset.increment ?? 0 }
                : undefined,
          });
        }}
      >
        {mutation.isPending ? "Sending…" : "Send challenge"}
      </PillButton>
    </div>
  );
}
