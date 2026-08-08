import { BezelCard } from "@/shared/components/bezel-card";
import { Reveal } from "@/shared/components/reveal";

export function SocialProofSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <Reveal>
          <BezelCard padding="lg">
            <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-center">
              <blockquote className="font-display text-2xl font-medium leading-snug tracking-tight sm:text-3xl">
                &ldquo;Finally a chess app that explains why a move works — not
                just whether it was good.&rdquo;
              </blockquote>
              <div className="space-y-6 border-t border-white/10 pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                <p className="text-sm text-muted-foreground">
                  Priya M. · club player · 1470 rapid
                </p>
                <dl className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Coach sessions", value: "2.4k+" },
                    { label: "Games analyzed", value: "18k+" },
                    { label: "Accuracy gain", value: "+6.2%" },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <dt className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                        {stat.label}
                      </dt>
                      <dd className="mt-1 font-display text-xl font-semibold tabular-nums">
                        {stat.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </BezelCard>
        </Reveal>
      </div>
    </section>
  );
}
