import Link from "next/link";
import { cn } from "@/shared/lib/utils";

const pillBase =
  "group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-[transform,opacity,background-color] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]";

const variants = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  ghost:
    "bg-white/[0.06] text-foreground ring-1 ring-white/10 hover:bg-white/[0.1]",
};

function PillArrow() {
  return (
    <span className="flex size-8 items-center justify-center rounded-full bg-black/10 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105 dark:bg-white/10">
      <span aria-hidden className="text-xs">
        ↗
      </span>
    </span>
  );
}

type PillCtaProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
  showArrow?: boolean;
};

export function PillCta({
  href,
  children,
  variant = "primary",
  className,
  showArrow = true,
}: PillCtaProps) {
  return (
    <Link href={href} className={cn(pillBase, variants[variant], className)}>
      <span>{children}</span>
      {showArrow ? <PillArrow /> : null}
    </Link>
  );
}

type PillButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
  showArrow?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
};

export function PillButton({
  children,
  variant = "primary",
  className,
  showArrow = false,
  disabled,
  onClick,
  type = "button",
}: PillButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        pillBase,
        variants[variant],
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      <span>{children}</span>
      {showArrow ? <PillArrow /> : null}
    </button>
  );
}
