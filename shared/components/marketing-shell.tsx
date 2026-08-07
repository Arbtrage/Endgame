"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { APP_NAME } from "@/shared/constants/brand";
import { cn } from "@/shared/lib/utils";

export function MarketingShell({
  children,
  className,
  overlay = false,
}: {
  children: React.ReactNode;
  className?: string;
  overlay?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!overlay) return;
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);

  return (
    <div className={cn("min-h-screen bg-background text-foreground", className)}>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          overlay
            ? scrolled
              ? "border-b border-border/60 bg-background/80 backdrop-blur-md"
              : "border-b border-transparent bg-transparent"
            : "relative border-b border-border/60 bg-background",
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            {APP_NAME}
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/sign-in"
              className={cn(
                "text-sm transition-colors hover:text-foreground",
                overlay && !scrolled
                  ? "text-muted-foreground"
                  : "text-muted-foreground",
              )}
            >
              Sign in
            </Link>
            <Link
              href="/auth/sign-up"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              Start playing
            </Link>
          </div>
        </div>
      </header>
      <main className={overlay ? "pt-0" : undefined}>{children}</main>
    </div>
  );
}
