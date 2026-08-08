"use client";

import Link from "next/link";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { cn } from "@/shared/lib/utils";
import { iconClass } from "@/shared/components/icon";

type ActionCardProps = {
  href: string;
  title: string;
  description: string;
  icon: PhosphorIcon;
  footer?: React.ReactNode;
  className?: string;
};

export function ActionCard({
  href,
  title,
  description,
  icon: Icon,
  footer,
  className,
}: ActionCardProps) {
  return (
    <Link href={href} className={cn("group block h-full", className)}>
      <div className="bezel-outer h-full transition-spring group-hover:ring-white/20">
        <div className="bezel-inner glass-surface flex h-full flex-col p-5">
          <div className="flex size-11 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/20 transition-spring group-hover:scale-105">
            <Icon className={iconClass("md")} weight="light" />
          </div>
          <div className="mt-4 min-h-0 flex-1 space-y-2">
            <h3 className="font-display text-base font-semibold">{title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
          {footer ? (
            <div className="mt-4 shrink-0 text-xs font-medium text-primary">
              {footer}
            </div>
          ) : (
            <div className="mt-4 shrink-0 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
              Open ↗
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ActionCardGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>{children}</div>
  );
}
