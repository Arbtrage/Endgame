"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  acceptPvpInvite,
  cancelPvpInvite,
  declinePvpInvite,
  listPvpInvites,
} from "@/shared/api/fetcher";
import type { PvpInvite } from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

function InviteCard({
  invite,
  variant,
}: {
  invite: PvpInvite;
  variant: "incoming" | "outgoing";
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const acceptMutation = useMutation({
    mutationFn: () => acceptPvpInvite(invite.id),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.pvp.invites });
      router.push(`/play/${data.game.id}`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const declineMutation = useMutation({
    mutationFn: () => declinePvpInvite(invite.id),
    onSuccess: () => {
      toast.success("Invite declined");
      void queryClient.invalidateQueries({ queryKey: queryKeys.pvp.invites });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelPvpInvite(invite.id),
    onSuccess: () => {
      toast.success("Invite cancelled");
      void queryClient.invalidateQueries({ queryKey: queryKeys.pvp.invites });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const other =
    variant === "incoming" ? invite.inviter : invite.invitee;
  const label = other.name ?? other.email;

  return (
    <div className="rounded-lg border border-border/60 bg-card p-4">
      <p className="font-medium">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Expires {new Date(invite.expiresAt).toLocaleString()}
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        {variant === "incoming" ? (
          <>
            <Button
              size="sm"
              className="w-full sm:w-auto"
              disabled={acceptMutation.isPending}
              onClick={() => acceptMutation.mutate()}
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full sm:w-auto"
              disabled={declineMutation.isPending}
              onClick={() => declineMutation.mutate()}
            >
              Decline
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="w-full sm:w-auto"
            disabled={cancelMutation.isPending}
            onClick={() => cancelMutation.mutate()}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

export function PvpInvitesPanel() {
  const [tab, setTab] = useState<"incoming" | "outgoing">("incoming");
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.pvp.invites,
    queryFn: listPvpInvites,
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading invites…</p>;
  }

  const incoming = data?.incoming ?? [];
  const outgoing = data?.outgoing ?? [];
  const list = tab === "incoming" ? incoming : outgoing;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold">Pending invites</h1>
          <p className="text-sm text-muted-foreground">
            Accept challenges or manage invites you sent.
          </p>
        </div>
        <Button
          render={<Link href="/play/pvp" />}
          nativeButton={false}
          size="sm"
          className="w-full shrink-0 sm:w-auto"
        >
          New challenge
        </Button>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            tab === "incoming"
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:bg-muted",
          )}
          onClick={() => setTab("incoming")}
        >
          Received ({incoming.length})
        </button>
        <button
          type="button"
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            tab === "outgoing"
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:bg-muted",
          )}
          onClick={() => setTab("outgoing")}
        >
          Sent ({outgoing.length})
        </button>
      </div>

      <div className="space-y-3">
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No {tab === "incoming" ? "incoming" : "outgoing"} invites.
          </p>
        ) : (
          list.map((invite) => (
            <InviteCard
              key={invite.id}
              invite={invite}
              variant={tab}
            />
          ))
        )}
      </div>
    </div>
  );
}
