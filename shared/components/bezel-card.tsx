import { cn } from "@/shared/lib/utils";

type BezelCardProps = {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  padding?: "none" | "sm" | "md" | "lg";
};

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

export function BezelCard({
  children,
  className,
  innerClassName,
  padding = "md",
}: BezelCardProps) {
  return (
    <div className={cn("bezel-outer transition-spring", className)}>
      <div
        className={cn(
          "bezel-inner glass-surface",
          paddingMap[padding],
          innerClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}

type BezelPanelProps = BezelCardProps & {
  scrollable?: boolean;
};

export function BezelPanel({
  children,
  className,
  innerClassName,
  padding = "none",
  scrollable = true,
}: BezelPanelProps) {
  return (
    <BezelCard
      className={cn("flex h-full min-h-0 flex-col", className)}
      padding={padding}
      innerClassName={cn(
        "flex min-h-0 flex-1 flex-col",
        scrollable && "overflow-y-auto",
        innerClassName,
      )}
    >
      {children}
    </BezelCard>
  );
}
