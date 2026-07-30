import { cn } from "@/shared/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  size?: "page" | "section" | "setup";
};

export function PageHeader({
  title,
  description,
  actions,
  className,
  size = "page",
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl space-y-2">
        <h1
          className={cn(
            "font-semibold leading-tight tracking-tight",
            size === "page" && "text-3xl",
            size === "section" && "text-xl",
            size === "setup" && "text-2xl",
          )}
        >
          {title}
        </h1>
        {description ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
