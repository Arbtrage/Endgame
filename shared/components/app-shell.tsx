"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Menu } from "lucide-react";
import { PvpInviteNotifications } from "@/features/pvp/components/pvp-invite-notifications";
import { MobileNav } from "@/shared/components/mobile-nav";
import { PageBreadcrumb } from "@/shared/components/page-breadcrumb";
import { Sidebar } from "@/shared/components/sidebar";
import { APP_NAME } from "@/shared/constants/brand";
import { useUIStore } from "@/shared/hooks/use-ui-store";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed } = useUIStore();
  const pathname = usePathname();
  const isPlayRoute = pathname?.startsWith("/play") ?? false;
  const isActiveGame = /^\/play\/[^/]+$/.test(pathname ?? "");
  const sidebarOffset = sidebarCollapsed ? "lg:pl-[4.5rem]" : "lg:pl-60";

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
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
          <Sidebar className="relative z-10 h-full shadow-elevated-hover" />
        </div>
      ) : null}

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden transition-[padding] duration-200",
          sidebarOffset,
        )}
      >
        <header
          className={cn(
            "flex shrink-0 items-center gap-2 border-b border-border/60 px-4 lg:hidden",
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
          {isActiveGame ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="size-4" />
              Exit game
            </Link>
          ) : (
            <Link href="/dashboard" className="text-lg font-semibold">
              {APP_NAME}
            </Link>
          )}
        </header>

        {!isActiveGame ? (
          <div className="hidden border-b border-border/40 px-6 py-2 lg:block">
            <PageBreadcrumb />
          </div>
        ) : null}

        <main
          id="main-content"
          className={cn(
            "min-h-0 flex-1 overflow-hidden pb-16 lg:pb-0",
            isPlayRoute
              ? "px-2 py-2 sm:px-4 lg:px-8 lg:py-5"
              : "px-4 py-4 sm:px-6 lg:px-8 lg:py-5",
          )}
        >
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
