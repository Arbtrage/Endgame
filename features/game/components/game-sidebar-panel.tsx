"use client";

import type { ReactNode } from "react";
import { GameControls } from "@/features/game/components/game-controls";
import { GameReplayControls } from "@/features/game/components/game-replay-controls";
import { MoveList } from "@/features/game/components/move-list";
import type { GameMove } from "@/features/game/types";

export type GameSidebarPanelProps = {
  moves: GameMove[];
  activeIndex: number | null;
  onSelectMove: (index: number) => void;
  onResign: () => void;
  onFlipBoard: () => void;
  onOfferDraw?: () => void;
  onGoLive?: () => void;
  disabled?: boolean;
  isFinished?: boolean;
  drawOfferPending?: boolean;
  topSlot?: ReactNode;
  bottomSlot?: ReactNode;
};

function getMovesDescription(
  moves: GameMove[],
  activeIndex: number | null,
  isFinished: boolean,
): string {
  const movePairs = Math.ceil(moves.length / 2);

  if (moves.length === 0) {
    return isFinished
      ? "Replay the game move by move"
      : "Make the first move on the board";
  }

  if (activeIndex !== null) {
    return "Reviewing — use arrows or click a move · Live to resume";
  }

  if (isFinished) {
    return "Replay the game move by move";
  }

  return `${movePairs} full ${movePairs === 1 ? "move" : "moves"} · ← → to step`;
}

type GameSidebarMovesSectionProps = Pick<
  GameSidebarPanelProps,
  "moves" | "activeIndex" | "onSelectMove" | "onGoLive" | "isFinished"
> & {
  showHeader?: boolean;
  className?: string;
};

export function GameSidebarMovesSection({
  moves,
  activeIndex,
  onSelectMove,
  onGoLive,
  isFinished = false,
  showHeader = true,
  className,
}: GameSidebarMovesSectionProps) {
  return (
    <div className={className ?? "flex min-h-0 flex-1 flex-col overflow-hidden"}>
      {showHeader ? (
        <div className="shrink-0 border-b px-3 py-3 sm:px-4">
          <p className="text-base font-semibold">Moves</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {getMovesDescription(moves, activeIndex, isFinished)}
          </p>
        </div>
      ) : null}

      {moves.length > 0 ? (
        <GameReplayControls
          moveCount={moves.length}
          activeIndex={activeIndex}
          onSelectMove={onSelectMove}
          onGoLive={onGoLive ?? (() => onSelectMove(moves.length - 1))}
        />
      ) : null}

      <div className="min-h-0 flex-1 overflow-hidden">
        <MoveList
          moves={moves}
          activeIndex={activeIndex}
          onSelectMove={onSelectMove}
        />
      </div>
    </div>
  );
}

type GameSidebarActionsSectionProps = Pick<
  GameSidebarPanelProps,
  | "onResign"
  | "onFlipBoard"
  | "onOfferDraw"
  | "disabled"
  | "isFinished"
  | "drawOfferPending"
> & {
  bannerSlot?: ReactNode;
  className?: string;
};

export function GameSidebarActionsSection({
  onResign,
  onFlipBoard,
  onOfferDraw,
  disabled = false,
  isFinished = false,
  drawOfferPending = false,
  bannerSlot,
  className,
}: GameSidebarActionsSectionProps) {
  return (
    <div className={className ?? "flex flex-col gap-3 p-3 sm:p-4"}>
      {bannerSlot ? <div className="shrink-0">{bannerSlot}</div> : null}
      <GameControls
        onResign={onResign}
        onFlipBoard={onFlipBoard}
        onOfferDraw={onOfferDraw}
        disabled={disabled}
        hideResign={isFinished}
        hideDrawOffer={isFinished}
        drawOfferPending={drawOfferPending}
      />
    </div>
  );
}

export function GameSidebarPanel({
  moves,
  activeIndex,
  onSelectMove,
  onResign,
  onFlipBoard,
  onOfferDraw,
  onGoLive,
  disabled = false,
  isFinished = false,
  drawOfferPending = false,
  topSlot,
  bottomSlot,
}: GameSidebarPanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="shrink-0 border-b border-white/10 px-4 py-3">
        <p className="text-base font-semibold">Moves</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {getMovesDescription(moves, activeIndex, isFinished)}
        </p>
      </div>

      {moves.length > 0 ? (
        <GameReplayControls
          moveCount={moves.length}
          activeIndex={activeIndex}
          onSelectMove={onSelectMove}
          onGoLive={onGoLive ?? (() => onSelectMove(moves.length - 1))}
        />
      ) : null}

      {topSlot ? (
        <div className="shrink-0 border-b border-white/10 px-3 py-2.5 sm:px-4 sm:py-3">
          {topSlot}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-hidden p-0">
        <MoveList
          moves={moves}
          activeIndex={activeIndex}
          onSelectMove={onSelectMove}
        />
      </div>

      {bottomSlot ? (
        <div className="shrink-0 border-t border-white/10 px-3 py-2.5 sm:px-4 sm:py-3">
          {bottomSlot}
        </div>
      ) : null}

      <div className="shrink-0 flex-col gap-2 border-t border-white/10 p-4">
        <GameControls
          onResign={onResign}
          onFlipBoard={onFlipBoard}
          onOfferDraw={onOfferDraw}
          disabled={disabled}
          hideResign={isFinished}
          hideDrawOffer={isFinished}
          drawOfferPending={drawOfferPending}
        />
      </div>
    </div>
  );
}
