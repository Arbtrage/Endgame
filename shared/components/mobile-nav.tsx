"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  GraduationCap,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Swords,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

const primaryItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/play/coach", label: "Play", icon: Swords },
  { href: "/analyze", label: "Analyze", icon: BarChart3 },
  { href: "/train", label: "Train", icon: GraduationCap },
];

const moreItems = [
  { href: "/play/computer", label: "Vs villains" },
  { href: "/play/ai", label: "Vs heroes" },
  { href: "/play/pvp", label: "Vs friend" },
  { href: "/progress", label: "Progress" },
  { href: "/coach", label: "Coach chat" },
  { href: "/settings", label: "Settings" },
];

export function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const isActiveGame = /^\/play\/[^/]+$/.test(pathname ?? "");

  if (isActiveGame) return null;

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-md lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href === "/play/coach" && pathname.startsWith("/play"));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[10px] font-medium text-muted-foreground"
          >
            <MoreHorizontal className="size-5" />
            More
          </button>
        </div>
      </nav>

      {moreOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/50"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-border/60 bg-background p-4 pb-8">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">More</p>
              <Button variant="ghost" size="icon-sm" onClick={() => setMoreOpen(false)}>
                <Menu className="size-4" />
              </Button>
            </div>
            <div className="grid gap-1">
              {moreItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm transition-colors hover:bg-muted/40"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
