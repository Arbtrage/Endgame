"use client";

import Link from "next/link";
import { useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import type { NavGroup, NavLink } from "@/shared/lib/nav-config";

type NavOverlayProps = {
  open: boolean;
  onClose: () => void;
  groups?: NavGroup[];
  links?: NavLink[];
  activeHref?: string;
  footer?: React.ReactNode;
  variant?: "app" | "marketing";
};

function withStaggerDelays(items: NavLink[], startIndex = 0) {
  return items.map((item, offset) => ({
    item,
    delay: (startIndex + offset) * 0.04,
  }));
}

function flattenGroupsWithDelays(groups: NavGroup[]) {
  let index = 0;
  return groups.map((group) => {
    const items = group.items.map((item) => {
      const delay = index * 0.04;
      index += 1;
      return { item, delay };
    });
    return { group, items };
  });
}

export function NavOverlay({
  open,
  onClose,
  groups,
  links,
  activeHref,
  footer,
  variant = "marketing",
}: NavOverlayProps) {
  const reduceMotion = useReducedMotion();
  const isApp = variant === "app" && !!groups;
  const flatLinks = withStaggerDelays(links ?? []);
  const groupedLinks = groups ? flattenGroupsWithDelays(groups) : null;

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="fixed inset-0 z-50 overflow-hidden bg-black/85 backdrop-blur-3xl"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
        >
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0"
            onClick={onClose}
          />

          {isApp && groupedLinks ? (
            <div className="relative mx-auto flex h-dvh w-full max-w-lg flex-col overflow-hidden px-4 pb-5 pt-[5.5rem] sm:max-w-xl sm:px-6 sm:pb-6">
              <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-2.5 sm:gap-3">
                {groupedLinks.map(({ group, items }) => (
                  <div
                    key={group.label}
                    className="flex min-h-0 flex-col overflow-hidden rounded-2xl glass-surface p-3 ring-1 ring-white/10 sm:p-3.5"
                  >
                    <p className="mb-1.5 shrink-0 text-[9px] font-semibold uppercase tracking-[0.22em] text-muted-foreground sm:text-[10px]">
                      {group.label}
                    </p>
                    <ul className="min-h-0 space-y-0.5 overflow-hidden">
                      {items.map(({ item, delay }) => (
                        <NavOverlayLink
                          key={item.href}
                          item={item}
                          active={item.href === activeHref}
                          delay={delay}
                          onClose={onClose}
                          reduceMotion={!!reduceMotion}
                          compact
                        />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {footer ? (
                <div className="relative z-10 mt-3 shrink-0 rounded-2xl glass-surface px-3 py-2 ring-1 ring-white/10 sm:px-4 sm:py-2.5">
                  {footer}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="relative mx-auto flex h-dvh w-full max-w-lg flex-col overflow-hidden px-6 pb-8 pt-28 sm:px-8">
              <div className="min-h-0 flex-1 overflow-hidden">
                {groupedLinks ? (
                  <div className="space-y-6">
                    {groupedLinks.map(({ group, items }) => (
                      <div key={group.label}>
                        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                          {group.label}
                        </p>
                        <ul className="space-y-0.5">
                          {items.map(({ item, delay }) => (
                            <NavOverlayLink
                              key={item.href}
                              item={item}
                              active={item.href === activeHref}
                              delay={delay}
                              onClose={onClose}
                              reduceMotion={!!reduceMotion}
                            />
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {flatLinks.map(({ item, delay }) => (
                      <NavOverlayLink
                        key={item.href}
                        item={item}
                        active={item.href === activeHref}
                        delay={delay}
                        onClose={onClose}
                        reduceMotion={!!reduceMotion}
                        large
                      />
                    ))}
                  </ul>
                )}
              </div>

              {footer ? (
                <div className="relative z-10 mt-4 shrink-0 border-t border-white/10 pt-4">
                  {footer}
                </div>
              ) : null}
            </div>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function NavOverlayLink({
  item,
  active,
  delay,
  onClose,
  reduceMotion,
  large = false,
  compact = false,
}: {
  item: NavLink;
  active: boolean;
  delay: number;
  onClose: () => void;
  reduceMotion: boolean;
  large?: boolean;
  compact?: boolean;
}) {
  const content = (
    <Link
      href={item.href}
      onClick={onClose}
      className={cn(
        "block rounded-lg font-display transition-spring hover:bg-white/6",
        compact
          ? "truncate px-2 py-1.5 text-[13px] font-medium leading-tight sm:text-sm"
          : large
            ? "rounded-2xl px-4 py-3 text-2xl font-semibold tracking-tight sm:text-3xl"
            : "rounded-xl px-3 py-2 text-base font-medium sm:text-[17px]",
        active ? "bg-white/8 text-primary" : "text-foreground",
      )}
    >
      {item.label}
    </Link>
  );

  if (reduceMotion) return <li>{content}</li>;

  return (
    <motion.li
      initial={{ opacity: 0, y: compact ? 8 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: compact ? 0.35 : 0.45,
        delay: 0.04 + delay,
        ease: [0.32, 0.72, 0, 1],
      }}
    >
      {content}
    </motion.li>
  );
}
