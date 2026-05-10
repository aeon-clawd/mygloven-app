import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

export type ButtonVariant = "default" | "primary" | "ghost" | "danger" | "secondary";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  default: "",
  primary: "primary",
  ghost: "ghost",
  danger: "danger",
  // legacy alias mapped to default surface look
  secondary: "",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "default", size = "md", full, type = "button", ...props },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "btn",
        VARIANT_CLASS[variant],
        size === "lg" && "lg",
        full && "full",
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";

/* Backwards-compat alias used in design code */
export const Btn = Button;
