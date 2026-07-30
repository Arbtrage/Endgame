"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BarChart3, Bot, GraduationCap } from "lucide-react";
import { APP_NAME, APP_TAGLINE } from "@/shared/constants/brand";
import { LandingHero3D } from "@/shared/three/landing-hero-3d";

const features = [
  {
    icon: Bot,
    title: "AI opponents with personality",
    description: "Play against coaches that feel human, aggressive, or legendary.",
  },
  {
    icon: GraduationCap,
    title: "Coach mode while you play",
    description: "Get explanations at the moments that actually matter.",
  },
  {
    icon: BarChart3,
    title: "Engine truth, AI narrative",
    description: "Engine accuracy with AI-powered teaching.",
  },
];

export function LandingPageContent() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="relative mx-auto grid min-h-[70vh] max-w-6xl items-center gap-10 px-6 py-20 lg:grid-cols-2">
          <div className="relative z-10">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="text-sm font-medium uppercase tracking-wider text-primary"
            >
              {APP_NAME}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl"
            >
              {APP_TAGLINE}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mt-4 max-w-xl text-lg text-muted-foreground"
            >
              Play, analyze, and train with engine precision and AI coaching in a
              premium, modern experience.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link
                href="/auth/sign-up"
                className="rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Get started
              </Link>
              <Link
                href="/demo"
                className="rounded-lg border border-border px-5 py-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                Try demo
              </Link>
            </motion.div>
          </div>
          <div className="relative h-[320px] overflow-hidden rounded-2xl border border-border bg-card/30 lg:h-[420px]">
            <LandingHero3D />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              className="rounded-xl border border-border bg-card/40 p-6"
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="size-5" />
              </div>
              <h3 className="text-lg font-medium">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
