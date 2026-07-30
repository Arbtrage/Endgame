import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

type SetupAsideProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  bullets: string[];
  className?: string;
};

export function SetupAside({
  icon: Icon,
  title,
  description,
  bullets,
  className,
}: SetupAsideProps) {
  return (
    <Card
      className={cn(
        "h-fit border-border/60 bg-gradient-to-b from-muted/30 to-card",
        className,
      )}
    >
      <CardHeader className="gap-4">
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="space-y-2">
          <CardTitle className="text-lg leading-snug">{title}</CardTitle>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2.5 text-sm leading-relaxed text-muted-foreground">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
