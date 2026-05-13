import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import clsx from "clsx";

export type SliderSize = "sm" | "md" | "lg";

export interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "value" | "defaultValue" | "onChange"> {
  /** Controlled value. Use `defaultValue` for uncontrolled. */
  value?:        number;
  defaultValue?: number;
  /** Called with the parsed number on every input change. */
  onChange?:     (value: number) => void;
  min?:          number;
  max?:          number;
  step?:         number;
  size?:         SliderSize;
  label?:        ReactNode;
  hint?:         ReactNode;
  /** When true, render the current value next to the track. Default true. */
  showValue?:    boolean;
  /** Format the displayed value (e.g. percentages, units). */
  formatValue?:  (value: number) => string;
}

/**
 * Styled native range slider. Keeps `<input type="range">` so it inherits
 * keyboard navigation (arrow keys, Home/End, PageUp/PageDown) for free.
 */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {
    value,
    defaultValue,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    size = "md",
    label,
    hint,
    showValue = true,
    formatValue,
    disabled,
    className,
    id,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const sliderId  = id ?? generatedId;
  const hintId    = `${sliderId}-hint`;

  // Effective current value — for the live display, prefer controlled value,
  // then defaultValue, then min.
  const display = value ?? defaultValue ?? min;
  const formatted = formatValue ? formatValue(display) : String(display);

  // Compute fill % for the filled-track background.
  const range = max - min;
  const pct   = range > 0 ? ((display - min) / range) * 100 : 0;

  return (
    <div className={clsx("ds-field", "ds-slider-field")}>
      {(label || showValue) && (
        <div className="ds-slider__label-row">
          {label && (
            <label htmlFor={sliderId} className="ds-field__label">
              {label}
            </label>
          )}
          {showValue && (
            <span className="ds-slider__value" aria-hidden="true">
              {formatted}
            </span>
          )}
        </div>
      )}
      <input
        ref={ref}
        type="range"
        id={sliderId}
        min={min}
        max={max}
        step={step}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        aria-describedby={hint ? hintId : undefined}
        onChange={(e) => onChange?.(Number(e.target.value))}
        className={clsx("ds-slider", `ds-slider--${size}`, className)}
        style={{ "--ds-slider-pct": `${pct}%` } as React.CSSProperties}
        {...rest}
      />
      {hint && (
        <span id={hintId} className="ds-field__hint">
          {hint}
        </span>
      )}
    </div>
  );
});
