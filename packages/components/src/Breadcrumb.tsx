import {
  Children,
  Fragment,
  forwardRef,
  isValidElement,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import clsx from "clsx";

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  /** Separator rendered between items. Default `›`. Pass any ReactNode. */
  separator?:  ReactNode;
  /** Accessible label for the nav. Default "Breadcrumb". */
  ariaLabel?:  string;
}

export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb(
  { separator = "›", ariaLabel = "Breadcrumb", className, children, ...rest },
  ref,
) {
  const items = Children.toArray(children).filter(isValidElement);

  return (
    <nav
      ref={ref}
      aria-label={ariaLabel}
      className={clsx("ds-breadcrumb", className)}
      {...rest}
    >
      <ol className="ds-breadcrumb__list">
        {items.map((child, i) => {
          const isLast = i === items.length - 1;
          return (
            <Fragment key={i}>
              <li className="ds-breadcrumb__item">{child}</li>
              {!isLast && (
                <li className="ds-breadcrumb__separator" aria-hidden="true">
                  {separator}
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
});

export interface BreadcrumbItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * Mark this item as the current page. Renders as a non-link `<span>` and
   * sets `aria-current="page"` per WAI-ARIA conventions.
   */
  current?: boolean;
}

export function BreadcrumbItem({
  current,
  className,
  children,
  href,
  ...rest
}: BreadcrumbItemProps) {
  if (current) {
    return (
      <span
        aria-current="page"
        className={clsx("ds-breadcrumb__link", "ds-breadcrumb__link--current", className)}
      >
        {children}
      </span>
    );
  }
  return (
    <a
      href={href}
      className={clsx("ds-breadcrumb__link", className)}
      {...rest}
    >
      {children}
    </a>
  );
}
