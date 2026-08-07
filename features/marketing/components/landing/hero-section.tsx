"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SplineScene } from "@/features/marketing/components/landing/spline-scene";
import { APP_TAGLINE } from "@/shared/constants/brand";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

export function HeroSection() {
  return (
    <section className="relative min-h-dvh overflow-hidden bg-[#08080c] text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.08),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(34,197,94,0.04),transparent_50%)]" />

      <div className="absolute inset-0">
        <SplineScene />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(5,5,8,0.85)_100%)]" />

      <div className="relative mx-auto flex min-h-dvh max-w-6xl flex-col justify-end px-6 pb-16 pt-28 sm:pb-20 sm:pt-32">
        <div className="max-w-xl">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex items-center gap-2 text-xs font-medium text-muted-foreground"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            AI coach online
          </motion.div>
          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="mt-4 text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          >
            {APP_TAGLINE}
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base"
          >
            Play against AI personalities, get coached in real time, and turn
            every game into a lesson you can review.
          </motion.p>
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.45, delay: 0.25 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Link
              href="/auth/sign-up"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              Start playing
            </Link>
            <Link
              href="/demo"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Try the demo →
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
