"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { PvpInviteNotifications } from "@/features/pvp/components/pvp-invite-notifications";
import { Sidebar } from "@/shared/components/sidebar";
import { APP_NAME } from "@/shared/constants/brand";
import { Button } from "@/shared/ui/button";
import { useUIStore } from "@/shared/hooks/use-ui-store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

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
        <header className="flex h-14 shrink-0 items-center border-b border-border px-4 lg:hidden">
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
        <main className="min-h-0 flex-1 overflow-hidden px-4 py-4 sm:px-6 lg:py-5 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
