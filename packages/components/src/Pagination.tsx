import { forwardRef, type HTMLAttributes } from "react";
import clsx from "clsx";

export type PaginationSize = "sm" | "md";

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  /** Current 1-based page index. */
  page:        number;
  /** Total number of pages. */
  totalPages:  number;
  onChange:    (page: number) => void;
  /** How many neighbors to show on each side of the current page. Default 1. */
  siblingCount?: number;
  /** Always show first/last page even when ellipsised. Default true. */
  boundaryCount?: number;
  size?:        PaginationSize;
  /** Accessible label for the nav. Default "Pagination". */
  ariaLabel?:   string;
}

type PageItem = number | "ellipsis-start" | "ellipsis-end";

export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  {
    page,
    totalPages,
    onChange,
    siblingCount = 1,
    boundaryCount = 1,
    size = "md",
    ariaLabel = "Pagination",
    className,
    ...rest
  },
  ref,
) {
  const items = buildItems(page, totalPages, siblingCount, boundaryCount);
  const atStart = page <= 1;
  const atEnd   = page >= totalPages;

  return (
    <nav
      ref={ref}
      aria-label={ariaLabel}
      className={clsx("ds-pagination", `ds-pagination--${size}`, className)}
      {...rest}
    >
      <button
        type="button"
        className="ds-pagination__btn"
        aria-label="Previous page"
        disabled={atStart}
        onClick={() => onChange(page - 1)}
      >
        ‹
      </button>

      {items.map((item, i) =>
        item === "ellipsis-start" || item === "ellipsis-end" ? (
          <span key={`${item}-${i}`} className="ds-pagination__ellipsis" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={clsx(
              "ds-pagination__btn",
              item === page && "ds-pagination__btn--current",
            )}
            aria-current={item === page ? "page" : undefined}
            aria-label={`Page ${item}`}
            onClick={() => onChange(item)}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        className="ds-pagination__btn"
        aria-label="Next page"
        disabled={atEnd}
        onClick={() => onChange(page + 1)}
      >
        ›
      </button>
    </nav>
  );
});

/**
 * Build the visible page items, inserting ellipses to keep the row compact.
 *
 * For total <= boundary*2 + sibling*2 + 3 we just show every page.
 * Otherwise: [1..boundaryCount] [...] [siblings around current] [...] [N-boundary..N]
 */
function buildItems(
  page: number,
  total: number,
  siblings: number,
  boundary: number,
): PageItem[] {
  const totalPageNumbers = boundary * 2 + siblings * 2 + 3; // boundaries + siblings + current + 2 ellipses
  if (total <= totalPageNumbers) {
    return range(1, total);
  }

  const leftSibling  = Math.max(page - siblings, boundary + 2);
  const rightSibling = Math.min(page + siblings, total - boundary - 1);

  const showLeftEllipsis  = leftSibling  > boundary + 2;
  const showRightEllipsis = rightSibling < total - boundary - 1;

  const items: PageItem[] = [];

  // Left boundary.
  items.push(...range(1, boundary));

  if (showLeftEllipsis) {
    items.push("ellipsis-start");
  } else {
    items.push(...range(boundary + 1, leftSibling - 1));
  }

  // Middle.
  items.push(...range(leftSibling, rightSibling));

  if (showRightEllipsis) {
    items.push("ellipsis-end");
  } else {
    items.push(...range(rightSibling + 1, total - boundary));
  }

  // Right boundary.
  items.push(...range(total - boundary + 1, total));

  return items;
}

function range(start: number, end: number): number[] {
  if (end < start) return [];
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
