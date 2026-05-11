import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

export type AlertTone = "info" | "success" | "warning" | "error";

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  tone?:        AlertTone;
  title?:       ReactNode;
  icon?:        ReactNode;
  onDismiss?:   () => void;
  dismissLabel?: string;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { tone = "info", title, icon, onDismiss, dismissLabel = "Dismiss", className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="alert"
      className={clsx("ds-alert", `ds-alert--${tone}`, className)}
      {...rest}
    >
      {icon && <span className="ds-alert__icon" aria-hidden="true">{icon}</span>}
      <div className="ds-alert__content">
        {title && <div className="ds-alert__title">{title}</div>}
        {children && <div className="ds-alert__description">{children}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          className="ds-alert__dismiss"
          onClick={onDismiss}
          aria-label={dismissLabel}
        >
          ×
        </button>
      )}
    </div>
  );
});
