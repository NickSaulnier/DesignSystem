import {
  forwardRef,
  type HTMLAttributes,
  type TableHTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from "react";
import clsx from "clsx";

export type TableDensity = "compact" | "comfortable";

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  density?:  TableDensity;
  /** Zebra-striped rows on alternating index. */
  striped?:  boolean;
  /** Highlight the row under the cursor. */
  hoverable?: boolean;
  /** Add a sticky-header behavior (requires the table to live in a scrolling container). */
  stickyHeader?: boolean;
}

export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { density = "comfortable", striped, hoverable, stickyHeader, className, children, ...rest },
  ref,
) {
  return (
    <div className="ds-table__wrap">
      <table
        ref={ref}
        className={clsx(
          "ds-table",
          `ds-table--${density}`,
          striped       && "ds-table--striped",
          hoverable     && "ds-table--hoverable",
          stickyHeader  && "ds-table--sticky-header",
          className,
        )}
        {...rest}
      >
        {children}
      </table>
    </div>
  );
});

// Thin wrappers — they exist mainly so consumers can write component-style
// composition without dropping into raw HTML, and for any future style hooks.

export function TableHead({ className, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={clsx("ds-table__head", className)} {...rest} />;
}

export function TableBody({ className, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={clsx("ds-table__body", className)} {...rest} />;
}

export function TableFoot({ className, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tfoot className={clsx("ds-table__foot", className)} {...rest} />;
}

export function TableRow({ className, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={clsx("ds-table__row", className)} {...rest} />;
}

export type TableSortDirection = "asc" | "desc";

export interface TableHeadCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  /** When set, the cell renders a sort indicator and applies `aria-sort`. */
  sortDirection?: TableSortDirection;
  align?:         "left" | "center" | "right";
}

export function TableHeadCell({
  sortDirection,
  align = "left",
  className,
  children,
  ...rest
}: TableHeadCellProps) {
  const ariaSort =
    sortDirection === "asc"  ? "ascending"
    : sortDirection === "desc" ? "descending"
    : undefined;

  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className={clsx(
        "ds-table__head-cell",
        `ds-table__cell--align-${align}`,
        sortDirection && "ds-table__head-cell--sorted",
        className,
      )}
      {...rest}
    >
      <span className="ds-table__head-cell-inner">
        {children}
        {sortDirection && (
          <span aria-hidden="true" className="ds-table__sort-indicator">
            {sortDirection === "asc" ? "↑" : "↓"}
          </span>
        )}
      </span>
    </th>
  );
}

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  align?: "left" | "center" | "right";
}

export function TableCell({ align = "left", className, ...rest }: TableCellProps) {
  return (
    <td
      className={clsx("ds-table__cell", `ds-table__cell--align-${align}`, className)}
      {...rest}
    />
  );
}
