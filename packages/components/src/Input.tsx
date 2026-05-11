import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

export type InputSize = "sm" | "md" | "lg";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?:    ReactNode;
  hint?:     ReactNode;
  error?:    ReactNode;
  size?:     InputSize;
  invalid?:  boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, size = "md", invalid, className, id, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId  = id ?? generatedId;
  const hintId   = `${inputId}-hint`;
  const errorId  = `${inputId}-error`;
  const isInvalid = invalid ?? Boolean(error);

  const describedBy = [
    hint  ? hintId  : null,
    error ? errorId : null,
  ].filter(Boolean).join(" ") || undefined;

  return (
    <div className="ds-field">
      {label && (
        <label htmlFor={inputId} className="ds-field__label">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={isInvalid || undefined}
        aria-describedby={describedBy}
        className={clsx(
          "ds-input",
          `ds-input--${size}`,
          isInvalid && "ds-input--invalid",
          className,
        )}
        {...rest}
      />
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
