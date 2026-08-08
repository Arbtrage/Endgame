"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SplineScene } from "@/features/marketing/components/landing/spline-scene";
import { APP_TAGLINE } from "@/shared/constants/brand";
import { Eyebrow } from "@/shared/components/eyebrow";
import { PillCta } from "@/shared/components/pill-cta";
import { Reveal } from "@/shared/components/reveal";

export function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] overflow-hidden">
      <div className="absolute inset-0">
        <SplineScene />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/40" />

      <div className="relative mx-auto grid min-h-[100dvh] max-w-7xl items-end gap-10 px-4 pb-20 pt-32 md:grid-cols-2 md:items-center md:px-8 md:pb-24 md:pt-36">
        <Reveal className="pointer-events-auto max-w-xl">
          <Eyebrow className="mb-6">AI coach online</Eyebrow>
          <h1 className="font-display text-4xl font-bold leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
            {APP_TAGLINE}
          </h1>
          <p className="mt-6 max-w-md text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Play against AI personalities, get coached in real time, and turn
            every game into a lesson you can review.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <PillCta href="/auth/sign-up">Start playing</PillCta>
            <Link
              href="/demo"
              className="text-sm font-medium text-muted-foreground transition-spring hover:text-foreground"
            >
              Try the demo →
            </Link>
          </div>
        </Reveal>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
          className="pointer-events-none hidden md:block"
        />
      </div>
    </section>
  );
}
