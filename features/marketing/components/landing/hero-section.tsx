"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SplineScene } from "@/features/marketing/components/landing/spline-scene";
import { APP_NAME, APP_TAGLINE } from "@/shared/constants/brand";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
};

export function HeroSection() {
  return (
    <section className="relative h-dvh overflow-hidden bg-[#08080c] text-foreground">
      {/* Ambient glow behind the pieces */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.1),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(34,197,94,0.05),transparent_50%)]" />

      {/* Spline scene — centered, interactive */}
      <div className="absolute inset-0">
        <SplineScene />
      </div>

      {/* Edge vignette to frame the corners */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(5,5,8,0.85)_100%)]" />

      {/* Top-left: brand */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.4 }}
        className="pointer-events-auto absolute left-6 top-6 sm:left-10 sm:top-8"
      >
        <Link
          href="/"
          className="text-lg font-bold uppercase tracking-[0.35em] text-foreground"
        >
          {APP_NAME}
        </Link>
      </motion.div>

      {/* Top-right: auth */}
      <motion.div
        {...fadeUp}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="pointer-events-auto absolute right-6 top-6 flex items-center gap-4 sm:right-10 sm:top-8"
      >
        <Link
          href="/auth/sign-in"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Sign in
        </Link>
        <Link
          href="/auth/sign-up"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Play now
        </Link>
      </motion.div>

      {/* Bottom-left: headline + CTAs */}
      <div className="pointer-events-none absolute bottom-8 left-6 max-w-md sm:bottom-12 sm:left-10">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground"
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
          className="mt-4 text-3xl font-bold leading-tight tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] sm:text-4xl lg:text-5xl"
        >
          {APP_TAGLINE}
        </motion.h1>
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.45, delay: 0.25 }}
          className="pointer-events-auto mt-6 flex flex-wrap gap-3"
        >
          <Link
            href="/auth/sign-up"
            className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Get started
          </Link>
          <Link
            href="/demo"
            className="rounded-lg border border-border/70 bg-background/40 px-6 py-3 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-muted/60"
          >
            Try demo
          </Link>
        </motion.div>
      </div>

      {/* Bottom-right: feature chips */}
      <motion.ul
        {...fadeUp}
        transition={{ duration: 0.45, delay: 0.3 }}
        className="pointer-events-none absolute bottom-24 right-6 hidden flex-col items-end gap-2 text-right sm:right-10 md:flex"
      >
        {[
          ["AI opponents", "personalities that feel human"],
          ["Coach mode", "explanations that matter"],
          ["Engine truth", "accuracy with AI narrative"],
        ].map(([title, sub]) => (
          <li
            key={title}
            className="rounded-lg border border-border/40 bg-background/35 px-4 py-2 backdrop-blur-sm"
          >
            <span className="text-sm font-semibold">{title}</span>
            <span className="ml-2 text-xs text-muted-foreground">{sub}</span>
          </li>
        ))}
      </motion.ul>
    </section>
  );
}
