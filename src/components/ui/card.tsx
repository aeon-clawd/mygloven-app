import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "raised" | "flat";
}

export function Card({ className, variant = "default", ...props }: CardProps) {
  return (
    <div
      className={cn("card", variant !== "default" && variant, className)}
      {...props}
    />
  );
}
