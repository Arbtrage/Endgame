"use client";

import {
  ChartLineUp,
  GraduationCap,
  Sparkle,
} from "@phosphor-icons/react";
import { BezelCard } from "@/shared/components/bezel-card";
import { BentoCell, BentoGrid } from "@/shared/components/bento-grid";
import { Eyebrow } from "@/shared/components/eyebrow";
import { Reveal, RevealItem, RevealStagger } from "@/shared/components/reveal";
import { iconClass } from "@/shared/components/icon";

const features = [
  {
    icon: GraduationCap,
    title: "Coach mode",
    description:
      "Stockfish finds the truth. Your AI coach explains the why — move by move.",
    span: 8 as const,
    tall: true,
  },
  {
    icon: ChartLineUp,
    title: "Post-game analysis",
    description: "Accuracy, eval graphs, and move classifications.",
    span: 4 as const,
    tall: false,
  },
  {
    icon: Sparkle,
    title: "Personalized training",
    description: "Lessons from your weaknesses — puzzles with hints.",
    span: 12 as const,
    tall: false,
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <Reveal className="mb-12 max-w-2xl md:mb-16">
          <Eyebrow className="mb-4">Platform</Eyebrow>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            A full learning loop, not just a board
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground">
            Play, coach, analyze, and train in one coherent workflow.
          </p>
        </Reveal>

        <RevealStagger>
          <BentoGrid>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <BentoCell
                  key={feature.title}
                  span={feature.span}
                  rowSpan={feature.tall ? 2 : 1}
                >
                  <RevealItem>
                    <BezelCard
                      padding="lg"
                      className="h-full"
                      innerClassName="flex h-full flex-col justify-between"
                    >
                      <div>
                        <div className="mb-6 flex size-12 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/20">
                          <Icon className={iconClass("md")} weight="light" />
                        </div>
                        <h3 className="font-display text-2xl font-semibold">
                          {feature.title}
                        </h3>
                        <p className="mt-3 max-w-prose text-pretty leading-relaxed text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                      <p className="mt-8 font-mono text-xs text-muted-foreground">
                        {index === 0
                          ? "Nf3 · develops with tempo"
                          : index === 1
                            ? "78.4% accuracy · 2 blunders"
                            : "Back-rank tactics · 3 exercises"}
                      </p>
                    </BezelCard>
                  </RevealItem>
                </BentoCell>
              );
            })}
          </BentoGrid>
        </RevealStagger>
      </div>
    </section>
  );
}
