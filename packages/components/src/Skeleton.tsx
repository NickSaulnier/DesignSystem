import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";
import clsx from "clsx";

export type SkeletonShape = "text" | "rect" | "circle";

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  shape?:  SkeletonShape;
  /** CSS width — number is treated as px. Defaults: text=100%, rect=100%, circle=2.5rem. */
  width?:  string | number;
  /** CSS height — number is treated as px. Defaults: text=1em, rect=4rem, circle=2.5rem. */
  height?: string | number;
  /** Disable the shimmer animation. */
  static?: boolean;
}

const DEFAULTS: Record<SkeletonShape, { width: string; height: string }> = {
  text:   { width: "100%",   height: "1em"     },
  rect:   { width: "100%",   height: "4rem"    },
  circle: { width: "2.5rem", height: "2.5rem"  },
};

/**
 * Loading placeholder with a subtle shimmer animation. Use sparingly — a skeleton
 * is most effective when it roughly mirrors the shape of the content it replaces.
 */
export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(function Skeleton(
  { shape = "text", width, height, static: isStatic, className, style, ...rest },
  ref,
) {
  const defaults = DEFAULTS[shape];
  const w = width  ?? defaults.width;
  const h = height ?? defaults.height;

  const inlineStyle: CSSProperties = {
    width:  typeof w === "number" ? `${w}px` : w,
    height: typeof h === "number" ? `${h}px` : h,
    ...style,
  };

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={clsx(
        "ds-skeleton",
        `ds-skeleton--${shape}`,
        !isStatic && "ds-skeleton--shimmer",
        className,
      )}
      style={inlineStyle}
      {...rest}
    />
  );
});
