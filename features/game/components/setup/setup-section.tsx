import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

type SetupSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function SetupSection({
  title,
  description,
  children,
  className,
}: SetupSectionProps) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="space-y-1.5">
        <h3 className="text-sm font-medium leading-snug">{title}</h3>
        {description ? (
          <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
