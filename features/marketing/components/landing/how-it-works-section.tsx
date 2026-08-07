const steps = [
  {
    step: "01",
    title: "Play a game",
    description: "Pick a mode — coach, AI opponent, or engine — and start in two clicks.",
  },
  {
    step: "02",
    title: "Review with the engine",
    description: "Post-game analysis runs in the background with accuracy and key moments.",
  },
  {
    step: "03",
    title: "Train on what you missed",
    description: "Get lessons built from your blunders and recurring patterns.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="border-t border-border/60 bg-muted/10 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-xl">
          <h2 className="text-balance text-3xl font-bold tracking-tight">
            From first move to improvement plan
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground">
            Three steps. No setup rabbit holes.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((item) => (
            <div
              key={item.step}
              className="relative rounded-xl border border-border/50 bg-card/60 p-6 shadow-elevated"
            >
              <span className="font-mono text-xs font-semibold text-primary">
                {item.step}
              </span>
              <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
