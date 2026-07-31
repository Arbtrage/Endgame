"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";
import type { SpectatorGame } from "@/shared/api/fetcher";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

const MODE_LABELS: Record<string, string> = {
  COMPUTER: "vs Villains",
  AI_OPPONENT: "vs Heroes",
  COACH: "Coach Mode",
};

type SpectatorHeaderProps = {
  game: SpectatorGame;
  isLive: boolean;
};

export function SpectatorHeader({ game, isLive }: SpectatorHeaderProps) {
  const [copied, setCopied] = useState(false);
  const playerLabel = game.player.name ?? game.player.email;
  const modeLabel = MODE_LABELS[game.mode] ?? game.mode;

  async function copyGameId() {
    await navigator.clipboard.writeText(game.id);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              Live
            </span>
          ) : (
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {game.status === "COMPLETED" ? "Completed" : game.status}
            </span>
          )}
          <span className="text-sm text-muted-foreground">{modeLabel}</span>
        </div>
        <p className="text-sm">
          <span className="text-muted-foreground">Player:</span>{" "}
          <span className="font-medium">{playerLabel}</span>
          <span className="text-muted-foreground"> · playing {game.playerColor}</span>
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono">{game.id}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Copy game ID"
            onClick={copyGameId}
          >
            {copied ? (
              <Check className="size-3.5 text-primary" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </Button>
          <span>·</span>
          <span>{game.moveCount} moves</span>
          {game.result ? (
            <>
              <span>·</span>
              <span className={cn(game.result === "DRAW" && "text-muted-foreground")}>
                {game.result.replace("_", " ")}
                {game.resultReason ? ` (${game.resultReason.replace(/_/g, " ")})` : ""}
              </span>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
