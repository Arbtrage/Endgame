"use client";

import { motion } from "framer-motion";
import { BarChart3, GraduationCap, Sparkles } from "lucide-react";

const features = [
  {
    icon: GraduationCap,
    title: "Coach mode",
    description:
      "Stockfish finds the truth. Your AI coach explains the why — in plain language, move by move.",
    align: "left" as const,
  },
  {
    icon: BarChart3,
    title: "Post-game analysis",
    description:
      "Accuracy scores, eval graphs, and move classifications turn finished games into actionable feedback.",
    align: "right" as const,
  },
  {
    icon: Sparkles,
    title: "Personalized training",
    description:
      "Lessons generated from your weaknesses — puzzles with hints, not generic drills.",
    align: "left" as const,
  },
];

export function FeaturesSection() {
  return (
    <section className="border-t border-border/60 bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">How Endgame helps</p>
          <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            A full learning loop, not just a chess board
          </h2>
          <p className="mt-4 max-w-prose text-pretty text-muted-foreground">
            Most chess apps stop at the game. Endgame connects play, coaching,
            analysis, and training into one workflow.
          </p>
        </div>

        <div className="mt-16 space-y-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const reversed = feature.align === "right";

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`grid items-center gap-10 lg:grid-cols-2 ${
                  reversed ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="space-y-4">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <h3 className="text-2xl font-semibold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="max-w-prose text-pretty leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
                <div className="surface-grain relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/50 bg-muted/20 shadow-elevated">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,oklch(0.62_0.14_145_/_0.12),transparent_60%)]" />
                  <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-px p-6 opacity-30">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div
                        key={i}
                        className={
                          (Math.floor(i / 8) + i) % 2 === 0
                            ? "bg-muted/40"
                            : "bg-background/20"
                        }
                      />
                    ))}
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 rounded-xl border border-border/40 bg-background/70 p-4 backdrop-blur-sm">
                    <p className="font-mono text-xs text-muted-foreground">
                      {feature.title}
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      {index === 0
                        ? "Nf3 develops with tempo and controls e5."
                        : index === 1
                          ? "Accuracy 78.4% · 2 blunders · ACPL 42"
                          : "Weakness: back-rank tactics · 3 exercises ready"}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
