import type { IconProps } from "@phosphor-icons/react";
import { cn } from "@/shared/lib/utils";

export type { IconProps };

export function iconClass(size: "sm" | "md" | "lg" = "md") {
  return cn(
    size === "sm" && "size-4",
    size === "md" && "size-5",
    size === "lg" && "size-6",
  );
}

export const iconDefaults: Pick<IconProps, "weight"> = {
  weight: "light",
};
