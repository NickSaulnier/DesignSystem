import {
  forwardRef,
  useEffect,
  useRef,
  type HTMLAttributes,
} from "react";
import clsx from "clsx";
import { Portal } from "./internal/Portal.js";
import { useFocusTrap } from "./internal/useFocusTrap.js";

export type ModalSize = "sm" | "md" | "lg" | "xl";

export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Whether the modal is currently open. Drives mounting and animation. */
  open: boolean;
  /** Called when the user requests dismissal (Esc key, backdrop click, or close button). */
  onClose: () => void;
  /** Max-width preset. Default `md`. */
  size?: ModalSize;
  /** Close when the backdrop is clicked. Default true. */
  dismissOnBackdrop?: boolean;
  /** Close when Esc is pressed. Default true. */
  dismissOnEsc?: boolean;
  /** Accessible label for the dialog. Use `title` for visible heading. */
  ariaLabel?: string;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal(
  {
    open,
    onClose,
    size = "md",
    dismissOnBackdrop = true,
    dismissOnEsc = true,
    ariaLabel,
    className,
    children,
    ...rest
  },
  ref,
) {
  const contentRef = useRef<HTMLDivElement | null>(null);

  useFocusTrap(contentRef, open);

  useEffect(() => {
    if (!open || !dismissOnEsc) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, dismissOnEsc, onClose]);

  useEffect(() => {
    if (!open) return;
    // Prevent body scroll while the modal is open.
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, [open]);

  if (!open) return null;

  return (
    <Portal>
      <div
        className="ds-modal__backdrop"
        onClick={dismissOnBackdrop ? onClose : undefined}
      >
        <div
          ref={(node) => {
            contentRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
          }}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          className={clsx("ds-modal", `ds-modal--${size}`, className)}
          onClick={(e) => e.stopPropagation()}
          {...rest}
        >
          {children}
        </div>
      </div>
    </Portal>
  );
});

// ----- Subcomponents --------------------------------------------------------

export interface ModalSectionProps extends HTMLAttributes<HTMLDivElement> {}

export function ModalHeader({ className, children, ...rest }: ModalSectionProps) {
  return (
    <div className={clsx("ds-modal__header", className)} {...rest}>
      {children}
    </div>
  );
}

export function ModalBody({ className, children, ...rest }: ModalSectionProps) {
  return (
    <div className={clsx("ds-modal__body", className)} {...rest}>
      {children}
    </div>
  );
}

export function ModalFooter({ className, children, ...rest }: ModalSectionProps) {
  return (
    <div className={clsx("ds-modal__footer", className)} {...rest}>
      {children}
    </div>
  );
}

export interface ModalTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4";
}

export function ModalTitle({ as: Tag = "h2", className, children, ...rest }: ModalTitleProps) {
  return (
    <Tag className={clsx("ds-modal__title", className)} {...rest}>
      {children}
    </Tag>
  );
}

export function ModalDescription({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={clsx("ds-modal__description", className)} {...rest}>
      {children}
    </p>
  );
}

/**
 * Convenience close button — typed as a button with `aria-label="Close"`.
 * Render in `ModalHeader` for the standard top-right dismiss affordance.
 */
export function ModalCloseButton({
  className,
  onClick,
  ...rest
}: HTMLAttributes<HTMLButtonElement> & { onClick: () => void }) {
  return (
    <button
      type="button"
      className={clsx("ds-modal__close", className)}
      aria-label="Close"
      onClick={onClick}
      {...rest}
    >
      ×
    </button>
  );
}

