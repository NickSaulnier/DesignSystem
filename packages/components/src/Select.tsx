import {
  forwardRef,
  useId,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import clsx from "clsx";

export type SelectSize = "sm" | "md" | "lg";

export interface SelectOption {
  value:    string;
  label:    string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?:       ReactNode;
  hint?:        ReactNode;
  error?:       ReactNode;
  size?:        SelectSize;
  invalid?:     boolean;
  /** Inline placeholder rendered as a disabled, selected-by-default option. */
  placeholder?: string;
  /**
   * Optional list of options. If provided, renders them inline. You can also
   * pass plain `<option>` children — useful for grouping with `<optgroup>` or
   * conditional rendering.
   */
  options?:     SelectOption[];
}

/**
 * Styled wrapper over the native `<select>`. We keep the underlying element
 * native so screen readers, mobile keyboards, and OS-level pickers all work
 * out of the box — only the trigger appearance is restyled.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    hint,
    error,
    size = "md",
    invalid,
    placeholder,
    options,
    className,
    id,
    children,
    value,
    defaultValue,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const selectId  = id ?? generatedId;
  const hintId    = `${selectId}-hint`;
  const errorId   = `${selectId}-error`;
  const isInvalid = invalid ?? Boolean(error);

  const describedBy = [
    hint  ? hintId  : null,
    error ? errorId : null,
  ].filter(Boolean).join(" ") || undefined;

  // If a placeholder is provided and no value/defaultValue, fall back to "".
  // The placeholder option has an empty value so a required submission catches it.
  const fallbackValue =
    placeholder && value === undefined && defaultValue === undefined
      ? ""
      : undefined;

  return (
    <div className={clsx("ds-field", "ds-select-field")}>
      {label && (
        <label htmlFor={selectId} className="ds-field__label">
          {label}
        </label>
      )}
      <div className={clsx("ds-select", `ds-select--${size}`, isInvalid && "ds-select--invalid")}>
        <select
          ref={ref}
          id={selectId}
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedBy}
          className={clsx("ds-select__control", className)}
          value={value ?? fallbackValue}
          defaultValue={defaultValue}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
          {children}
        </select>
        <span className="ds-select__chevron" aria-hidden="true">▾</span>
      </div>
      {hint && !error && (
        <span id={hintId} className="ds-field__hint">
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className="ds-field__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
});
