import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

export type ProgressSize = "sm" | "md" | "lg";
export type ProgressTone = "primary" | "success" | "warning" | "error";

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * Current progress as a number between 0 and `max`. When undefined, the
   * component renders an indeterminate animation.
   */
  value?:  number;
  max?:    number;
  size?:   ProgressSize;
  tone?:   ProgressTone;
  /** Visible label rendered above the bar. */
  label?:  ReactNode;
  /** Show the current percentage on the right of the label row. */
  showValue?: boolean;
  /** Format the percentage display. */
  formatValue?: (value: number, max: number) => string;
}

/**
 * Linear progress bar. Native `<progress>` accessibility (without its quirky
 * platform styling) — implemented as a div with the appropriate ARIA roles so
 * we can drive presentation purely from CSS variables.
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  {
    value,
    max = 100,
    size = "md",
    tone = "primary",
    label,
    showValue = false,
    formatValue,
    className,
    ...rest
  },
  ref,
) {
  const indeterminate = value === undefined;
  const safeValue     = indeterminate ? 0 : Math.max(0, Math.min(value, max));
  const pct           = max > 0 ? (safeValue / max) * 100 : 0;
  const formatted     = formatValue
    ? formatValue(safeValue, max)
    : `${Math.round(pct)}%`;

  return (
    <div
      ref={ref}
      className={clsx("ds-progress", `ds-progress--${size}`, `ds-progress--${tone}`, className)}
      {...rest}
    >
      {(label || showValue) && (
        <div className="ds-progress__label-row">
          {label && <span className="ds-progress__label">{label}</span>}
          {showValue && !indeterminate && (
            <span className="ds-progress__value" aria-hidden="true">
              {formatted}
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={indeterminate ? undefined : safeValue}
        aria-valuetext={indeterminate ? "Loading" : formatted}
        className={clsx(
          "ds-progress__track",
          indeterminate && "ds-progress__track--indeterminate",
        )}
      >
        <div
          className="ds-progress__bar"
          style={indeterminate ? undefined : { width: `${pct}%` }}
        />
      </div>
    </div>
  );
});
