import { type ReactNode } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: ReactNode;
  /** Target node. Defaults to document.body. */
  container?: HTMLElement | null;
}

/**
 * Render children into a DOM node outside the React tree. Returns null in
 * non-DOM environments (e.g. server-side rendering) so SSR doesn't crash.
 *
 * Synchronous on the client — children mount in the same commit as the parent,
 * which is required for portal-dependent effects (focus traps, measuring, etc.)
 * to find their content on first render.
 */
export function Portal({ children, container }: PortalProps) {
  if (typeof document === "undefined") return null;
  const target = container ?? document.body;
  return createPortal(children, target);
}
