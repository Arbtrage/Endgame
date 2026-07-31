"use client";

import type { ReactNode } from "react";
import { BoardSizeContainer } from "@/features/game/components/board-size-container";
import { ChessPlayerBar } from "@/features/game/components/chess-player-bar";
import { ENGINE_LOADING_LABEL } from "@/features/game/constants/marvel-villains";
import type { PlayerColor } from "@/features/game/types";

function oppositeColor(color: PlayerColor): PlayerColor {
  return color === "white" ? "black" : "white";
}

type ChessPlayAreaProps = {
  board: ReactNode;
  playerName: string;
  playerColor: PlayerColor;
  orientation: "white" | "black";
  opponentName: string;
  opponentSubtitle?: string;
  playerSubtitle?: string;
  isPlayerTurn: boolean;
  inCheck: boolean;
  opponentThinking: boolean;
  thinkingLabel?: string;
  engineLoading?: boolean;
  whiteClockMs?: number | null;
  blackClockMs?: number | null;
  showClocks?: boolean;
};

export function ChessPlayArea({
  board,
  playerName,
  playerColor,
  orientation,
  opponentName,
  opponentSubtitle,
  playerSubtitle,
  isPlayerTurn,
  inCheck,
  opponentThinking,
  thinkingLabel = "Thinking…",
  engineLoading = false,
  whiteClockMs = null,
  blackClockMs = null,
  showClocks = false,
}: ChessPlayAreaProps) {
  const bottomColor = orientation;
  const topColor = oppositeColor(bottomColor);
  const activeColor = isPlayerTurn ? playerColor : oppositeColor(playerColor);

  const topIsYou = topColor === playerColor;
  const bottomIsYou = bottomColor === playerColor;

  const topThinking =
    !topIsYou && (opponentThinking || (engineLoading && !isPlayerTurn));
  const bottomThinking =
    !bottomIsYou && (opponentThinking || (engineLoading && !isPlayerTurn));

  const topThinkingLabel =
    engineLoading && !opponentThinking ? ENGINE_LOADING_LABEL : thinkingLabel;

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="flex h-full min-h-0 flex-col rounded-xl shadow-lg ring-1 ring-border/60">
        <ChessPlayerBar
          position="top"
          color={topColor}
          name={topIsYou ? playerName : opponentName}
          subtitle={topIsYou ? playerSubtitle : opponentSubtitle}
          isYou={topIsYou}
          isActive={activeColor === topColor}
          inCheck={inCheck && activeColor === topColor}
          thinking={topThinking}
          thinkingLabel={topThinkingLabel}
          clockMs={topColor === "white" ? whiteClockMs : blackClockMs}
          showClock={showClocks}
        />

        <div className="flex min-h-0 flex-1 border-x border-border/70 bg-muted/30">
          <BoardSizeContainer>{board}</BoardSizeContainer>
        </div>

        <ChessPlayerBar
          position="bottom"
          color={bottomColor}
          name={bottomIsYou ? playerName : opponentName}
          subtitle={bottomIsYou ? playerSubtitle : opponentSubtitle}
          isYou={bottomIsYou}
          isActive={activeColor === bottomColor}
          inCheck={inCheck && activeColor === bottomColor}
          thinking={bottomThinking}
          thinkingLabel={topThinkingLabel}
          clockMs={bottomColor === "white" ? whiteClockMs : blackClockMs}
          showClock={showClocks}
        />
      </div>
    </div>
  );
}
