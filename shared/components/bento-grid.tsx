import { cn } from "@/shared/lib/utils";

type BentoGridProps = {
  children: React.ReactNode;
  className?: string;
};

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5 lg:gap-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

type BentoCellProps = {
  children: React.ReactNode;
  className?: string;
  span?: 4 | 5 | 6 | 7 | 8 | 12;
  rowSpan?: 1 | 2;
};

const spanMap: Record<number, string> = {
  4: "md:col-span-4",
  5: "md:col-span-5",
  6: "md:col-span-6",
  7: "md:col-span-7",
  8: "md:col-span-8",
  12: "md:col-span-12",
};

export function BentoCell({
  children,
  className,
  span = 12,
  rowSpan = 1,
}: BentoCellProps) {
  return (
    <div
      className={cn(
        "min-h-0 min-w-0",
        spanMap[span],
        rowSpan === 2 && "md:row-span-2",
        className,
      )}
    >
      {children}
    </div>
  );
}
