"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react";
import { PvpInviteNotifications } from "@/features/pvp/components/pvp-invite-notifications";
import { IslandNav } from "@/shared/components/island-nav";
import { appNavGroups } from "@/shared/lib/nav-config";
import { cn } from "@/shared/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPlayRoute = pathname?.startsWith("/play") ?? false;
  const isActiveGame = /^\/play\/[^/]+$/.test(pathname ?? "");

  return (
    <div
      className={cn(
        "relative flex flex-col bg-background",
        isActiveGame ? "h-dvh overflow-hidden" : "min-h-dvh",
      )}
    >
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <PvpInviteNotifications />

      {isActiveGame ? (
        <header className="fixed left-4 top-6 z-40">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full glass-surface px-4 py-2 text-sm font-medium transition-spring hover:bg-white/[0.08] active:scale-[0.98]"
          >
            <ArrowLeft className="size-4" weight="light" />
            Exit game
          </Link>
        </header>
      ) : (
        <IslandNav groups={appNavGroups} showCta={false} />
      )}

      <main
        id="main-content"
        className={cn(
          "relative z-10 mx-auto flex w-full max-w-7xl flex-col",
          isActiveGame
            ? "min-h-0 flex-1 px-2 py-2 pt-16 sm:px-4"
            : cn(
                "px-4 pb-16 pt-28 md:px-8 md:pb-24",
                isPlayRoute ? "md:pt-24" : "md:pt-32",
              ),
        )}
      >
        {children}
      </main>
    </div>
  );
}
