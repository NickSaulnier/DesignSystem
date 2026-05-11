import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

export type CardElevation = "flat" | "elevated" | "floating";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevation?:   CardElevation;
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { elevation = "elevated", interactive = false, className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={clsx(
        "ds-card",
        `ds-card--${elevation}`,
        interactive && "ds-card--interactive",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});

export interface CardSectionProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function CardHeader({ className, children, ...rest }: CardSectionProps) {
  return (
    <div className={clsx("ds-card__header", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...rest }: CardSectionProps) {
  return (
    <div className={clsx("ds-card__body", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...rest }: CardSectionProps) {
  return (
    <div className={clsx("ds-card__footer", className)} {...rest}>
      {children}
    </div>
  );
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export function CardTitle({ as: Tag = "h3", className, children, ...rest }: CardTitleProps) {
  return (
    <Tag className={clsx("ds-card__title", className)} {...rest}>
      {children}
    </Tag>
  );
}

export function CardDescription({ className, children, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={clsx("ds-card__description", className)} {...rest}>
      {children}
    </p>
  );
}
