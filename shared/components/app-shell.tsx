"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { PvpInviteNotifications } from "@/features/pvp/components/pvp-invite-notifications";
import { Sidebar } from "@/shared/components/sidebar";
import { APP_NAME } from "@/shared/constants/brand";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { useUIStore } from "@/shared/hooks/use-ui-store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const pathname = usePathname();
  const isPlayRoute = pathname?.startsWith("/play") ?? false;
  const isActiveGame = /^\/play\/[^/]+$/.test(pathname ?? "");

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <PvpInviteNotifications />
      <div className="hidden lg:block">
        <Sidebar className="fixed inset-y-0 left-0 z-40" />
      </div>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <Sidebar className="relative z-10 h-full shadow-xl" />
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:pl-60">
        <header
          className={cn(
            "flex shrink-0 items-center border-b border-border px-4 lg:hidden",
            isActiveGame ? "h-12" : "h-14",
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open navigation"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          <Link href="/dashboard" className="ml-3 text-lg font-semibold">
            {APP_NAME}
          </Link>
        </header>
        <main
          className={cn(
            "min-h-0 flex-1 overflow-hidden",
            isPlayRoute
              ? "px-2 py-2 sm:px-4 lg:px-8 lg:py-5"
              : "px-4 py-4 sm:px-6 lg:py-5 lg:px-8",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
