import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

export type PillVariant = "default" | "success" | "warning" | "error" | "accent";

interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: PillVariant;
  dot?: boolean;
}

export function Pill({
  className,
  variant = "default",
  dot,
  children,
  ...props
}: PillProps) {
  return (
    <span
      className={cn("pill", variant !== "default" && variant, className)}
      {...props}
    >
      {dot && <span className="dot" />}
      {children}
    </span>
  );
}

/* Backwards-compat alias */
export const Badge = Pill;
