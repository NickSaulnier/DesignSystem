import { forwardRef, useId, type ButtonHTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

export type ToggleSize = "sm" | "md";

export interface ToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "type"> {
  checked:      boolean;
  onChange:     (checked: boolean) => void;
  size?:        ToggleSize;
  label?:       ReactNode;
  labelPosition?: "before" | "after";
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  { checked, onChange, size = "md", label, labelPosition = "after", className, disabled, id, ...rest },
  ref,
) {
  const generatedId = useId();
  const buttonId    = id ?? generatedId;

  const button = (
    <button
      ref={ref}
      id={buttonId}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={clsx("ds-toggle", `ds-toggle--${size}`, checked && "ds-toggle--on", className)}
      {...rest}
    >
      <span className="ds-toggle__thumb" aria-hidden="true" />
    </button>
  );

  if (!label) return button;

  return (
    <span className={clsx("ds-toggle-field", `ds-toggle-field--${labelPosition}`)}>
      {labelPosition === "before" && (
        <label htmlFor={buttonId} className="ds-toggle__label">{label}</label>
      )}
      {button}
      {labelPosition === "after" && (
        <label htmlFor={buttonId} className="ds-toggle__label">{label}</label>
      )}
    </span>
  );
});
