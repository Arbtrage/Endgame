"use client";

import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/shared/lib/utils";
import type { NavGroup, NavLink } from "@/shared/lib/nav-config";

type NavOverlayProps = {
  open: boolean;
  onClose: () => void;
  groups?: NavGroup[];
  links?: NavLink[];
  activeHref?: string;
};

function withStaggerDelays(items: NavLink[], startIndex = 0) {
  return items.map((item, offset) => ({
    item,
    delay: (startIndex + offset) * 0.05,
  }));
}

function flattenGroupsWithDelays(groups: NavGroup[]) {
  let index = 0;
  return groups.map((group) => {
    const items = group.items.map((item) => {
      const delay = index * 0.05;
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
}: NavOverlayProps) {
  const reduceMotion = useReducedMotion();
  const flatLinks = withStaggerDelays(links ?? []);
  const groupedLinks = groups ? flattenGroupsWithDelays(groups) : null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-3xl"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        >
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0"
            onClick={onClose}
          />
          <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col justify-center px-8 py-24">
            {groupedLinks
              ? groupedLinks.map(({ group, items }) => (
                  <div key={group.label} className="mb-10">
                    <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                      {group.label}
                    </p>
                    <ul className="space-y-1">
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
                ))
              : (
                <ul className="space-y-2">
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
}: {
  item: NavLink;
  active: boolean;
  delay: number;
  onClose: () => void;
  reduceMotion: boolean;
  large?: boolean;
}) {
  const content = (
    <Link
      href={item.href}
      onClick={onClose}
      className={cn(
        "block rounded-2xl px-4 py-3 font-display transition-spring hover:bg-white/[0.06]",
        large ? "text-3xl font-semibold tracking-tight" : "text-xl font-medium",
        active ? "text-primary" : "text-foreground",
      )}
    >
      {item.label}
    </Link>
  );

  if (reduceMotion) return <li>{content}</li>;

  return (
    <motion.li
      initial={{ opacity: 0, y: 48 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.1 + delay, ease: [0.32, 0.72, 0, 1] }}
    >
      {content}
    </motion.li>
  );
}
