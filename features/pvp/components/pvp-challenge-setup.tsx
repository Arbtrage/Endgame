"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Swords } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ColorPicker } from "@/features/game/components/setup/color-picker";
import { TimeControlPicker } from "@/features/game/components/setup/time-control-picker";
import {
  SetupShell,
  SetupSidebar,
  SetupSplitLayout,
} from "@/features/game/components/setup/setup-layout";
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
import { Button } from "@/shared/ui/button";

export function PvpChallengeSetup() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [opponent, setOpponent] = useState<UserSearchResult | null>(null);
  const [color, setColor] = useState<PlayerColor | "random">("random");
  const [timeControl, setTimeControl] = useState<TimeControlPreset>("rapid");

  const mutation = useMutation({
    mutationFn: createPvpInvite,
    onSuccess: () => {
      toast.success("Challenge sent");
      void queryClient.invalidateQueries({ queryKey: queryKeys.pvp.invites });
      router.push("/pvp/invites");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const preset = TIME_CONTROL_PRESETS[timeControl];

  return (
    <SetupShell
      footer={
        <div className="space-y-2">
          <Button
            className="h-11 w-full text-base"
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
            <Swords className="mr-2 size-4" />
            {mutation.isPending ? "Sending…" : "Send challenge"}
          </Button>
          <Button
            render={<Link href="/pvp/invites" />}
            nativeButton={false}
            variant="outline"
            className="w-full"
          >
            View pending invites
          </Button>
        </div>
      }
    >
      <SetupSplitLayout
        sidebar={
          <SetupSidebar
            icon={Swords}
            title="Live PvP"
            description="Challenge a friend and play in real time."
            tips={[
              "Search by name or email",
              "Invite arrives by email and in-app",
              "Moves sync instantly via WebSocket",
            ]}
          />
        }
      >
        <SetupSection title="Opponent" description="Find a registered player">
          <UserSearchCombobox value={opponent} onChange={setOpponent} />
        </SetupSection>
        <SetupSection title="Your color">
          <ColorPicker value={color} onChange={setColor} />
        </SetupSection>
        <SetupSection title="Time control">
          <TimeControlPicker value={timeControl} onChange={setTimeControl} />
        </SetupSection>
      </SetupSplitLayout>
    </SetupShell>
  );
}
