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
import { Button } from "@/shared/ui/button";
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
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="mx-auto w-full max-w-md py-2 text-center">
        <p className="text-sm text-destructive">Invite not found or expired.</p>
        <Button
          render={<Link href="/play/pvp" />}
          nativeButton={false}
          variant="outline"
          className="mt-4"
        >
          View invites
        </Button>
      </div>
    );
  }

  const inviterLabel = invite.inviter.name ?? invite.inviter.email;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-6">
      <div className="space-y-6 rounded-xl border border-border/60 bg-card/40 p-5 sm:p-6">
        <div>
          <h1 className="text-xl font-semibold">Chess challenge</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {inviterLabel} invited you to a game. Accept to start playing live.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            className="w-full sm:flex-1"
            disabled={acceptMutation.isPending}
            onClick={() => acceptMutation.mutate()}
          >
            Accept & play
          </Button>
          <Button
            variant="outline"
            className="w-full sm:flex-1"
            disabled={declineMutation.isPending}
            onClick={() => declineMutation.mutate()}
          >
            Decline
          </Button>
        </div>
      </div>
    </div>
  );
}
