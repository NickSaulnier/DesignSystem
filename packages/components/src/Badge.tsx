import { forwardRef, type HTMLAttributes } from "react";
import clsx from "clsx";

export type BadgeVariant = "solid" | "soft" | "outline";
export type BadgeTone    = "neutral" | "primary" | "secondary" | "success" | "warning" | "error" | "info";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  tone?:    BadgeTone;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = "soft", tone = "neutral", className, children, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      className={clsx("ds-badge", `ds-badge--${variant}`, `ds-badge--${tone}`, className)}
      {...rest}
    >
      {children}
    </span>
  );
});
