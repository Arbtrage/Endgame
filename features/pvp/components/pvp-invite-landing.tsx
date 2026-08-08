"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  acceptPvpInvite,
  declinePvpInvite,
  getPvpInviteByToken,
} from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import { BezelCard } from "@/shared/components/bezel-card";
import { Eyebrow } from "@/shared/components/eyebrow";
import { PillButton } from "@/shared/components/pill-cta";
import { Skeleton } from "@/shared/ui/skeleton";

export function PvpInviteLanding({ token }: { token: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: invite, isLoading, error } = useQuery({
    queryKey: ["pvp", "invite-token", token],
    queryFn: () => getPvpInviteByToken(token),
  });

  const acceptMutation = useMutation({
    mutationFn: () => acceptPvpInvite(invite!.id),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.pvp.invites });
      router.push(`/play/${data.game.id}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const declineMutation = useMutation({
    mutationFn: () => declinePvpInvite(invite!.id),
    onSuccess: () => {
      toast.success("Invite declined");
      router.push("/play/pvp");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-md space-y-4 py-2">
        <Skeleton className="h-8 w-48 rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-[2rem]" />
      </div>
    );
  }

  if (error || !invite) {
    return (
      <BezelCard padding="lg" className="mx-auto w-full max-w-md text-center">
        <p className="text-sm text-destructive">Invite not found or expired.</p>
        <Link
          href="/play/pvp"
          className="mt-4 inline-block text-sm text-primary hover:underline"
        >
          View invites →
        </Link>
      </BezelCard>
    );
  }

  const inviterLabel = invite.inviter.name ?? invite.inviter.email;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-6">
      <BezelCard padding="lg">
        <Eyebrow>Challenge</Eyebrow>
        <h1 className="mt-3 font-display text-2xl font-bold tracking-tight">
          Chess challenge
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {inviterLabel} invited you to a game. Accept to start playing live.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <PillButton
            className="flex-1 justify-center"
            disabled={acceptMutation.isPending}
            onClick={() => acceptMutation.mutate()}
          >
            Accept & play
          </PillButton>
          <button
            type="button"
            disabled={declineMutation.isPending}
            onClick={() => declineMutation.mutate()}
            className="flex flex-1 items-center justify-center rounded-full border border-white/10 px-6 py-3 text-sm font-medium transition-spring hover:bg-white/[0.06]"
          >
            Decline
          </button>
        </div>
      </BezelCard>
    </div>
  );
}
