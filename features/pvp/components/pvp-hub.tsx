"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { GameCard } from "@/features/game/components/game-card";
import { PvpChallengeForm } from "@/features/pvp/components/pvp-challenge-form";
import {
  acceptPvpInvite,
  cancelPvpInvite,
  declinePvpInvite,
  listGames,
  listPvpInvites,
} from "@/shared/api/fetcher";
import type { PvpActiveGame, PvpInvite } from "@/shared/api/fetcher";
import { queryKeys } from "@/shared/api/query-keys";
import { EmptyState } from "@/shared/components/empty-state";
import { InlineEmpty } from "@/shared/components/inline-empty";
import {
  FeatureHero,
  FeaturePage,
  FeaturePanel,
  FeatureSection,
} from "@/shared/components/feature-page";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";

function ActiveGameCard({ game }: { game: PvpActiveGame }) {
  const label = game.opponent.name ?? game.opponent.email;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium">Ready vs {label}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Your opponent accepted — jump into the live game.
        </p>
      </div>
      <Button
        render={<Link href={`/play/${game.gameId}`} />}
        nativeButton={false}
        size="sm"
        className="w-full shrink-0 sm:w-auto"
      >
        Join game
      </Button>
    </div>
  );
}

function InviteRow({
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
      void queryClient.invalidateQueries({
        queryKey: queryKeys.games.list({ mode: "PVP" }),
      });
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

  const other = variant === "incoming" ? invite.inviter : invite.invitee;
  const label = other.name ?? other.email;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate font-medium">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {variant === "outgoing"
            ? `Waiting for acceptance · expires ${new Date(invite.expiresAt).toLocaleString()}`
            : `Expires ${new Date(invite.expiresAt).toLocaleString()}`}
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:shrink-0">
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

export function PvpHub() {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inviteTab, setInviteTab] = useState<"incoming" | "outgoing">("incoming");
  const seenActiveRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);

  const {
    data: invites,
    isLoading: invitesLoading,
  } = useQuery({
    queryKey: queryKeys.pvp.invites,
    queryFn: listPvpInvites,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.outgoing.length) return 2000;
      return false;
    },
  });

  const { data: games, isLoading: gamesLoading } = useQuery({
    queryKey: queryKeys.games.list({ mode: "PVP", pageSize: 20 }),
    queryFn: () => listGames({ mode: "PVP", pageSize: 20 }),
  });

  useEffect(() => {
    if (!invites?.active.length) {
      if (invites && !initializedRef.current) initializedRef.current = true;
      return;
    }

    if (!initializedRef.current) {
      for (const game of invites.active) {
        seenActiveRef.current.add(game.gameId);
      }
      initializedRef.current = true;
      return;
    }

    for (const game of invites.active) {
      if (seenActiveRef.current.has(game.gameId)) continue;
      seenActiveRef.current.add(game.gameId);
      toast.success(
        `${game.opponent.name ?? game.opponent.email} accepted — joining game`,
      );
      router.push(`/play/${game.gameId}`);
      return;
    }
  }, [invites, router]);

  const incoming = invites?.incoming ?? [];
  const outgoing = invites?.outgoing ?? [];
  const active = invites?.active ?? [];
  const pendingList = inviteTab === "incoming" ? incoming : outgoing;

  const activeGameIds = new Set(active.map((game) => game.gameId));
  const inProgress =
    games?.filter(
      (game) =>
        game.status === "IN_PROGRESS" && !activeGameIds.has(game.id),
    ) ?? [];
  const completed =
    games?.filter((game) => game.status === "COMPLETED") ?? [];
  const pendingCount = incoming.length + outgoing.length;
  const isLoading = invitesLoading || gamesLoading;

  return (
    <FeaturePage>
      <FeatureHero
        icon={Users}
        title="vs Friend"
        description="Challenge registered players, manage invites, and replay past human games — all in one place."
        hint="Live moves sync over WebSocket. Email invites work when Resend is configured."
      />

      <FeaturePanel
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {pendingCount > 0
                ? `${pendingCount} pending invite${pendingCount === 1 ? "" : "s"}`
                : "Send a challenge to start a live game."}
            </p>
            <Button onClick={() => setDialogOpen(true)} className="w-full sm:w-auto">
              <Plus className="mr-2 size-4" />
              New challenge
            </Button>
          </div>
        }
      >
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : (
          <div className="space-y-8">
            {active.length > 0 ? (
              <FeatureSection
                title="Ready to play"
                description="Accepted challenges waiting for you to join."
              >
                <div className="space-y-2">
                  {active.map((game) => (
                    <ActiveGameCard key={game.gameId} game={game} />
                  ))}
                </div>
              </FeatureSection>
            ) : null}

            {inProgress.length > 0 ? (
              <FeatureSection
                title="In progress"
                description="Resume games already underway."
              >
                <div className="space-y-2">
                  {inProgress.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
              </FeatureSection>
            ) : null}

            <FeatureSection
              title="Invites"
              description="Pending challenges you've sent or received."
            >
              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    inviteTab === "incoming"
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                  onClick={() => setInviteTab("incoming")}
                >
                  Received ({incoming.length})
                </button>
                <button
                  type="button"
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    inviteTab === "outgoing"
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-muted",
                  )}
                  onClick={() => setInviteTab("outgoing")}
                >
                  Sent ({outgoing.length})
                </button>
              </div>

              {pendingList.length > 0 ? (
                <div className="space-y-2">
                  {pendingList.map((invite) => (
                    <InviteRow
                      key={invite.id}
                      invite={invite}
                      variant={inviteTab}
                    />
                  ))}
                </div>
              ) : (
                <InlineEmpty
                  title={`No ${inviteTab === "incoming" ? "incoming" : "outgoing"} invites`}
                  description="Challenge a friend or wait for a response to an open invite."
                  className="py-6"
                />
              )}
            </FeatureSection>

            <FeatureSection
              title="Past games"
              description="Replay finished matches against friends."
            >
              {completed.length > 0 ? (
                <div className="space-y-2">
                  {completed.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No PvP games yet"
                  description="Challenge a friend to start your head-to-head history."
                  action={
                    <Button onClick={() => setDialogOpen(true)}>
                      <Plus className="mr-2 size-4" />
                      New challenge
                    </Button>
                  }
                />
              )}
            </FeatureSection>
          </div>
        )}
      </FeaturePanel>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[min(90vh,720px)] gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="border-b px-5 py-4">
            <DialogTitle>Challenge a friend</DialogTitle>
            <DialogDescription>
              Pick an opponent, color preference, and time control.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[min(70vh,560px)] overflow-y-auto px-5 py-4">
            <PvpChallengeForm onSuccess={() => setDialogOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </FeaturePage>
  );
}
