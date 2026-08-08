"use client";

import type { ReactNode } from "react";
import { BezelCard } from "@/shared/components/bezel-card";
import { Eyebrow } from "@/shared/components/eyebrow";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { cn } from "@/shared/lib/utils";

type SetupModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function SetupModal({
  open,
  onOpenChange,
  eyebrow = "New match",
  title,
  description,
  children,
  className,
}: SetupModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "w-[calc(100%-1.25rem)] max-w-lg gap-0 border-0 bg-transparent p-0 shadow-none",
          "sm:max-w-xl",
          className,
        )}
      >
        <BezelCard
          padding="lg"
          className="glass-surface max-h-[min(92dvh,720px)]"
          innerClassName="flex max-h-[inherit] flex-col overflow-y-auto overscroll-contain"
        >
          <DialogHeader className="shrink-0 space-y-2 text-left">
            <Eyebrow>{eyebrow}</Eyebrow>
            <DialogTitle className="font-display text-xl tracking-tight sm:text-2xl">
              {title}
            </DialogTitle>
            {description ? (
              <DialogDescription className="text-pretty">
                {description}
              </DialogDescription>
            ) : null}
          </DialogHeader>
          <div className="mt-5 min-w-0">{children}</div>
        </BezelCard>
      </DialogContent>
    </Dialog>
  );
}
