"use client";

import type { ReactNode } from "react";
import { GamePlayMobileTabs } from "@/features/game/components/game-play-mobile-tabs";
import {
  GameSidebarActionsSection,
  GameSidebarMovesSection,
  GameSidebarPanel,
  type GameSidebarPanelProps,
} from "@/features/game/components/game-sidebar-panel";
import { cn } from "@/shared/lib/utils";

type GamePlayLayoutProps = {
  header: ReactNode;
  board: ReactNode;
  panel?: GameSidebarPanelProps;
  sidebar?: ReactNode;
  extraColumn?: ReactNode;
  banner?: ReactNode;
  variant?: "standard" | "coach";
};

export function GamePlayLayout({
  header,
  board,
  panel,
  sidebar,
  extraColumn,
  banner,
  variant = "standard",
}: GamePlayLayoutProps) {
  const shouldFocusActions =
    !!panel?.topSlot && !panel.drawOfferPending && !panel.isFinished;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0">{header}</div>
      {banner ? <div className="mt-2 shrink-0 sm:mt-3">{banner}</div> : null}

      <div
        className={cn(
          "mt-3 flex min-h-0 flex-1 flex-col overflow-hidden sm:mt-4",
          "lg:grid lg:gap-5",
          "lg:grid-cols-[minmax(0,1fr)_minmax(200px,280px)]",
          variant === "coach" &&
            "xl:grid-cols-[minmax(0,1fr)_minmax(200px,280px)_minmax(160px,300px)]",
        )}
      >
        <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:h-full">
          {board}
        </div>

        {panel ? (
          <>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:hidden">
              <GamePlayMobileTabs
                focusActions={shouldFocusActions}
                movesSlot={
                  <GameSidebarMovesSection
                    moves={panel.moves}
                    activeIndex={panel.activeIndex}
                    onSelectMove={panel.onSelectMove}
                    onGoLive={panel.onGoLive}
                    isFinished={panel.isFinished}
                  />
                }
                chatSlot={
                  panel.bottomSlot ? (
                    <div className="p-3 sm:p-4">{panel.bottomSlot}</div>
                  ) : undefined
                }
                actionsSlot={
                  <GameSidebarActionsSection
                    onResign={panel.onResign}
                    onFlipBoard={panel.onFlipBoard}
                    onOfferDraw={panel.onOfferDraw}
                    disabled={panel.disabled}
                    isFinished={panel.isFinished}
                    drawOfferPending={panel.drawOfferPending}
                    bannerSlot={panel.topSlot}
                  />
                }
              />
            </div>
            <div className="hidden min-h-0 min-w-0 flex-col overflow-hidden lg:flex lg:h-full">
              <GameSidebarPanel {...panel} />
            </div>
          </>
        ) : sidebar ? (
          <div className="mt-3 min-h-0 flex-1 overflow-hidden lg:mt-0 lg:h-full">
            {sidebar}
          </div>
        ) : null}

        {extraColumn ? (
          <div
            className={cn(
              "hidden min-h-0 min-w-0 flex-col xl:flex",
              variant === "coach" && "col-span-2 xl:col-span-1",
            )}
          >
            {extraColumn}
          </div>
        ) : null}
      </div>
    </div>
  );
}
