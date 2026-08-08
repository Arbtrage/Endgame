"use client";

import { BezelCard } from "@/shared/components/bezel-card";
import { Eyebrow } from "@/shared/components/eyebrow";
import { Reveal, RevealStagger, RevealItem } from "@/shared/components/reveal";

const steps = [
  {
    step: "01",
    title: "Play a game",
    description: "Pick coach, AI, or engine — start in two clicks.",
    rotate: 0,
  },
  {
    step: "02",
    title: "Review with the engine",
    description: "Background analysis with accuracy and key moments.",
    rotate: 2,
  },
  {
    step: "03",
    title: "Train on what you missed",
    description: "Lessons built from your blunders and patterns.",
    rotate: -1.5,
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <Reveal className="mb-12 max-w-xl">
          <Eyebrow className="mb-4">Flow</Eyebrow>
          <h2 className="font-display text-3xl font-bold tracking-tight">
            From first move to improvement plan
          </h2>
        </Reveal>

        <RevealStagger className="flex flex-col gap-4 md:-space-y-4">
          {steps.map((item, index) => (
            <RevealItem
              key={item.step}
              className={index % 2 === 1 ? "md:ml-auto md:max-w-md" : "md:max-w-md"}
            >
              <div
                className="transition-spring md:hover:z-10 md:hover:scale-[1.02]"
                style={{ transform: `rotate(${item.rotate}deg)` }}
              >
                <BezelCard>
                  <span className="font-mono text-xs font-semibold text-primary">
                    {item.step}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-semibold">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </BezelCard>
              </div>
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}
