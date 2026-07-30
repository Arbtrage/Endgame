import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

type SetupCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function SetupCard({
  title,
  description,
  children,
  footer,
  className,
}: SetupCardProps) {
  return (
    <Card
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden border-border/60 shadow-sm",
        className,
      )}
    >
      <CardHeader className="shrink-0 gap-2 border-b border-border/60 bg-muted/20">
        <CardTitle className="text-lg leading-snug">{title}</CardTitle>
        {description ? (
          <CardDescription className="leading-relaxed">{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-5">
        {children}
      </CardContent>
      {footer ? (
        <CardFooter className="shrink-0 border-t border-border/60 bg-muted/10 p-4 sm:p-5">
          {footer}
        </CardFooter>
      ) : null}
    </Card>
  );
}
