import {
  cloneElement,
  isValidElement,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import clsx from "clsx";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  /** The content shown inside the tooltip bubble. */
  content: ReactNode;
  /** Single React element to attach the tooltip to. */
  children: ReactElement;
  /** Side of the trigger to render on. Default `top`. */
  placement?: TooltipPlacement;
  /** Delay before opening, in ms. Default 200. */
  openDelay?: number;
  /** Force the tooltip open (useful for testing). */
  open?: boolean;
}

/**
 * Lightweight CSS-positioned tooltip. Wraps a single trigger element and
 * positions itself relative to that trigger using `position: absolute`.
 *
 * Opens on hover and focus (for keyboard a11y). Closes on mouseleave/blur.
 * Connected to the trigger via `aria-describedby` when visible.
 */
export function Tooltip({
  content,
  children,
  placement = "top",
  openDelay = 200,
  open: controlledOpen,
}: TooltipProps) {
  const id = useId();
  const timer = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);
  const isOpen = controlledOpen ?? visible;

  if (!isValidElement(children)) {
    throw new Error("Tooltip expects a single React element as its child.");
  }

  const clearTimer = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const handleEnter = () => {
    if (controlledOpen !== undefined) return;
    clearTimer();
    timer.current = window.setTimeout(() => setVisible(true), openDelay);
  };

  const handleLeave = () => {
    if (controlledOpen !== undefined) return;
    clearTimer();
    setVisible(false);
  };

  // Compose handlers — wrap rather than replace so the user's own props still fire.
  const childProps = children.props as Record<string, unknown>;
  const trigger = cloneElement(children as ReactElement<Record<string, unknown>>, {
    onMouseEnter: chain(childProps.onMouseEnter, handleEnter),
    onMouseLeave: chain(childProps.onMouseLeave, handleLeave),
    onFocus:      chain(childProps.onFocus,      handleEnter),
    onBlur:       chain(childProps.onBlur,       handleLeave),
    "aria-describedby": isOpen ? id : undefined,
  });

  return (
    <span className="ds-tooltip">
      {trigger}
      <span
        id={id}
        role="tooltip"
        className={clsx(
          "ds-tooltip__bubble",
          `ds-tooltip__bubble--${placement}`,
          isOpen && "ds-tooltip__bubble--visible",
        )}
        aria-hidden={!isOpen}
      >
        {content}
      </span>
    </span>
  );
}

// Compose two event handlers. The first handler from props wins on early-return,
// but our internal handler always fires (we don't short-circuit on default-prevented).
function chain<T extends (...args: never[]) => void>(
  ours: unknown,
  theirs: T,
): T {
  return ((...args: Parameters<T>) => {
    if (typeof ours === "function") (ours as T)(...args);
    theirs(...args);
  }) as T;
}
