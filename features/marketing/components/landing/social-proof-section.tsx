export function SocialProofSection() {
  return (
    <section className="border-t border-border/60 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center">
          <blockquote className="text-balance text-2xl font-medium leading-snug tracking-tight sm:text-3xl">
            &ldquo;Finally a chess app that explains why a move works — not just
            whether it was good.&rdquo;
          </blockquote>
          <div className="space-y-4 border-l border-border/60 pl-6 md:pl-8">
            <p className="text-sm text-muted-foreground">
              Priya M., club player · 1470 rapid
            </p>
            <dl className="grid grid-cols-3 gap-4">
              {[
                { label: "Coach sessions", value: "2.4k+" },
                { label: "Games analyzed", value: "18k+" },
                { label: "Avg accuracy gain", value: "+6.2%" },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="text-xs text-muted-foreground">{stat.label}</dt>
                  <dd className="mt-1 font-mono text-lg font-semibold tabular-nums">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
