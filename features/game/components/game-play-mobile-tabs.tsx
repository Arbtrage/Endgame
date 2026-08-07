"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

type MobileTab = "moves" | "chat" | "coach" | "actions";

type GamePlayMobileTabsProps = {
  movesSlot: ReactNode;
  actionsSlot: ReactNode;
  chatSlot?: ReactNode;
  coachSlot?: ReactNode;
  focusActions?: boolean;
};

export function GamePlayMobileTabs({
  movesSlot,
  actionsSlot,
  chatSlot,
  coachSlot,
  focusActions = false,
}: GamePlayMobileTabsProps) {
  const [activeTab, setActiveTab] = useState<MobileTab>("moves");

  useEffect(() => {
    if (focusActions) {
      setActiveTab("actions");
    }
  }, [focusActions]);

  const tabs: { id: MobileTab; label: string }[] = [
    { id: "moves", label: "Moves" },
    ...(chatSlot ? [{ id: "chat" as const, label: "Chat" }] : []),
    ...(coachSlot ? [{ id: "coach" as const, label: "Coach" }] : []),
    { id: "actions", label: "Actions" },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:hidden">
      <div
        className="flex shrink-0 gap-1 border-t border-border/60 bg-muted/30 p-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]"
        role="tablist"
        aria-label="Game panels"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={cn(
              "min-h-11 flex-1 rounded-md px-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm ring-1 ring-primary/20"
                : "text-muted-foreground hover:bg-muted/30 hover:text-foreground",
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        className="min-h-0 flex-1 overflow-y-auto"
        role="tabpanel"
        aria-label={
          activeTab === "moves"
            ? "Moves"
            : activeTab === "chat"
              ? "Chat"
              : activeTab === "coach"
                ? "Coach"
                : "Actions"
        }
      >
        {activeTab === "moves" ? movesSlot : null}
        {activeTab === "chat" && chatSlot ? chatSlot : null}
        {activeTab === "coach" && coachSlot ? coachSlot : null}
        {activeTab === "actions" ? actionsSlot : null}
      </div>
    </div>
  );
}
