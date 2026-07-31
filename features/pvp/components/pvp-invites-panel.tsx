"use client";

import { useEffect, useRef, useState } from "react";
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
import type { PvpActiveGame, PvpInvite } from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

function ActiveGameCard({ game }: { game: PvpActiveGame }) {
  const label = game.opponent.name ?? game.opponent.email;

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
      <p className="font-medium">Game ready vs {label}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Your opponent accepted — join the live game.
      </p>
      <Button
        render={<Link href={`/play/${game.gameId}`} />}
        nativeButton={false}
        size="sm"
        className="mt-3 w-full sm:w-auto"
      >
        Join game
      </Button>
    </div>
  );
}

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
        {variant === "outgoing"
          ? `Waiting for acceptance · expires ${new Date(invite.expiresAt).toLocaleString()}`
          : `Expires ${new Date(invite.expiresAt).toLocaleString()}`}
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
  const router = useRouter();
  const [tab, setTab] = useState<"incoming" | "outgoing">("incoming");
  const seenActiveRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.pvp.invites,
    queryFn: listPvpInvites,
    refetchInterval: (query) => {
      const invites = query.state.data;
      if (invites?.outgoing.length) return 2000;
      return false;
    },
  });

  useEffect(() => {
    if (!data?.active.length) {
      if (data && !initializedRef.current) initializedRef.current = true;
      return;
    }

    if (!initializedRef.current) {
      for (const game of data.active) {
        seenActiveRef.current.add(game.gameId);
      }
      initializedRef.current = true;
      return;
    }

    for (const game of data.active) {
      if (seenActiveRef.current.has(game.gameId)) continue;
      seenActiveRef.current.add(game.gameId);
      toast.success(
        `${game.opponent.name ?? game.opponent.email} accepted — joining game`,
      );
      router.push(`/play/${game.gameId}`);
      return;
    }
  }, [data, router]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading invites…</p>;
  }

  const incoming = data?.incoming ?? [];
  const outgoing = data?.outgoing ?? [];
  const active = data?.active ?? [];
  const list = tab === "incoming" ? incoming : outgoing;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold">PvP invites</h1>
          <p className="text-sm text-muted-foreground">
            Join active games or manage pending challenges.
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

      {active.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-medium">Ready to play</h2>
          {active.map((game) => (
            <ActiveGameCard key={game.gameId} game={game} />
          ))}
        </section>
      ) : null}

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
