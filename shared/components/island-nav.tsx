"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SignOut } from "@phosphor-icons/react";
import { APP_NAME } from "@/shared/constants/brand";
import { NavOverlay } from "@/shared/components/nav-overlay";
import { iconClass } from "@/shared/components/icon";
import { useSession } from "@/shared/auth/auth-client";
import { cn } from "@/shared/lib/utils";
import type { NavGroup, NavLink } from "@/shared/lib/nav-config";

type IslandNavProps = {
  groups?: NavGroup[];
  links?: NavLink[];
  className?: string;
  showCta?: boolean;
  ctaHref?: string;
  ctaLabel?: string;
  footer?: React.ReactNode | ((helpers: { close: () => void }) => React.ReactNode);
};

export function IslandNav({
  groups,
  links,
  className,
  showCta = true,
  ctaHref = "/auth/sign-up",
  ctaLabel = "Start playing",
  footer,
}: IslandNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const flatLinks = links ?? groups?.flatMap((g) => g.items) ?? [];
  const activeHref = flatLinks.find(
    (link) => pathname === link.href || pathname.startsWith(`${link.href}/`),
  )?.href;
  const isAppNav = !!groups && !links;

  return (
    <>
      <header
        className={cn(
          "pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-6",
          className,
        )}
      >
        <nav
          aria-label="Main"
          className="pointer-events-auto flex w-full max-w-3xl items-center justify-between gap-3 rounded-full glass-surface px-3 py-2 pl-5 shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
        >
          <Link
            href="/"
            className="font-display text-sm font-semibold tracking-tight"
          >
            {APP_NAME}
          </Link>

          <div className="hidden items-center gap-1 sm:flex">
            {flatLinks.slice(0, 3).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-spring",
                  pathname === link.href || pathname.startsWith(`${link.href}/`)
                    ? "bg-white/10 text-foreground"
                    : "text-muted-foreground hover:bg-white/6 hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {showCta ? (
              <Link
                href={ctaHref}
                className="hidden rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-spring hover:opacity-90 active:scale-[0.98] sm:inline-flex"
              >
                {ctaLabel}
              </Link>
            ) : null}
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
              className="relative flex size-10 items-center justify-center rounded-full bg-white/6 ring-1 ring-white/10 transition-spring hover:bg-white/10 active:scale-[0.98]"
            >
              <span
                className={cn(
                  "absolute block h-0.5 w-4 rounded-full bg-foreground transition-spring",
                  open ? "translate-y-0 rotate-45" : "-translate-y-1",
                )}
              />
              <span
                className={cn(
                  "absolute block h-0.5 w-4 rounded-full bg-foreground transition-spring",
                  open ? "translate-y-0 -rotate-45" : "translate-y-1",
                )}
              />
            </button>
          </div>
        </nav>
      </header>

      <NavOverlay
        open={open}
        onClose={() => setOpen(false)}
        groups={groups}
        links={links}
        activeHref={activeHref}
        variant={isAppNav ? "app" : "marketing"}
        footer={
          typeof footer === "function"
            ? footer({ close: () => setOpen(false) })
            : footer
        }
      />
    </>
  );
}

type AppNavSignOutProps = {
  onSignOut: () => void | Promise<void>;
};

export function AppNavSignOutFooter({ onSignOut }: AppNavSignOutProps) {
  const { data: session } = useSession();
  const email = session?.user?.email;
  const name = session?.user?.name;

  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        {name || email ? (
          <p className="truncate text-xs text-muted-foreground">
            {name ?? email}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => void onSignOut()}
        className="inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-spring hover:bg-white/6"
      >
        <SignOut className={iconClass("sm")} weight="light" />
        Sign out
      </button>
    </div>
  );
}
